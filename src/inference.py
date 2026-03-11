import os
import glob
import argparse
import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from tqdm import tqdm

from src.utils import load_config, get_device
from src.dataset import SoundscapeDataset
from src.models import BirdModel


def load_ensemble(config, species_list, device):
    """Load trained models from all folds."""
    models = []
    checkpoint_dir = config["paths"]["checkpoint_dir"]

    for fold in range(config["training"]["n_folds"]):
        model = BirdModel(
            backbone_name=config["model"]["backbone"],
            pretrained=False,
            num_classes=len(species_list),
            in_channels=config["model"]["in_channels"],
        ).to(device)

        ckpt_path = os.path.join(checkpoint_dir, f"fold{fold}_best.pt")
        model.load_state_dict(torch.load(ckpt_path, map_location=device))
        model.eval()
        models.append(model)
        print(f"Loaded fold {fold} from {ckpt_path}")

    return models


@torch.no_grad()
def predict_soundscapes(models, loader, device):
    """Run inference on soundscapes with model ensemble."""
    results = {}

    for mel_spec, filepaths, offsets in tqdm(loader, desc="Inference"):
        mel_spec = mel_spec.to(device)

        # Ensemble predictions
        preds = []
        for model in models:
            logits = model(mel_spec)
            preds.append(torch.sigmoid(logits).cpu().numpy())
        avg_preds = np.mean(preds, axis=0)

        # Aggregate per file (max over windows)
        for i in range(len(filepaths)):
            fp = filepaths[i]
            basename = os.path.basename(fp)
            if basename not in results:
                results[basename] = []
            results[basename].append(avg_preds[i])

    # Max-pool over windows for each file
    aggregated = {}
    for basename, pred_list in results.items():
        aggregated[basename] = np.max(pred_list, axis=0)

    return aggregated


def create_submission(predictions, species_list, output_path):
    """Create submission CSV in the expected format."""
    rows = []
    for filename, preds in sorted(predictions.items()):
        file_id = os.path.splitext(filename)[0]
        for i, species in enumerate(species_list):
            row_id = f"{file_id}_{species}"
            rows.append({"row_id": row_id, "target": preds[i]})

    submission = pd.DataFrame(rows)
    submission.to_csv(output_path, index=False)
    print(f"Submission saved to {output_path} ({len(submission)} rows)")
    return submission


def main():
    parser = argparse.ArgumentParser(description="BirdCLEF Inference")
    parser.add_argument("--config", type=str, default="configs/default.yaml")
    args = parser.parse_args()

    config = load_config(args.config)
    device = get_device()
    print(f"Using device: {device}")

    # Load species list from training metadata
    train_df = pd.read_csv(config["paths"]["train_csv"])
    species_list = sorted(train_df["primary_label"].unique().tolist())
    config["model"]["num_classes"] = len(species_list)
    print(f"Number of species: {len(species_list)}")

    # Load models
    models = load_ensemble(config, species_list, device)

    # Get test soundscape files
    test_dir = config["paths"]["test_soundscapes"]
    test_files = sorted(glob.glob(os.path.join(test_dir, "*.ogg")))
    print(f"Found {len(test_files)} test soundscapes")

    # Create dataset and loader
    test_dataset = SoundscapeDataset(test_files, config)
    test_loader = DataLoader(
        test_dataset,
        batch_size=config["inference"]["batch_size"],
        shuffle=False,
        num_workers=4,
        pin_memory=True,
    )

    # Run inference
    predictions = predict_soundscapes(models, test_loader, device)

    # Create submission
    output_dir = config["paths"]["output_dir"]
    os.makedirs(output_dir, exist_ok=True)
    create_submission(predictions, species_list, os.path.join(output_dir, "submission.csv"))


if __name__ == "__main__":
    main()
