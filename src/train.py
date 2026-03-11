import os
import argparse
import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts
from tqdm import tqdm

from src.utils import set_seed, load_config, macro_auc, get_device, AverageMeter
from src.dataset import BirdCLEFDataset, create_folds
from src.models import BirdModel, FocalBCELoss


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    loss_meter = AverageMeter()

    for mel_spec, labels in tqdm(loader, desc="Training"):
        mel_spec = mel_spec.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        logits = model(mel_spec)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        loss_meter.update(loss.item(), mel_spec.size(0))

    return loss_meter.avg


@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()
    loss_meter = AverageMeter()
    all_preds = []
    all_targets = []

    for mel_spec, labels in tqdm(loader, desc="Validating"):
        mel_spec = mel_spec.to(device)
        labels = labels.to(device)

        logits = model(mel_spec)
        loss = criterion(logits, labels)

        loss_meter.update(loss.item(), mel_spec.size(0))
        all_preds.append(torch.sigmoid(logits).cpu().numpy())
        all_targets.append(labels.cpu().numpy())

    all_preds = np.concatenate(all_preds, axis=0)
    all_targets = np.concatenate(all_targets, axis=0)
    auc = macro_auc(all_targets, all_preds)

    return loss_meter.avg, auc


def train_fold(config, fold, train_df, species_list, device):
    """Train a single fold."""
    print(f"\n{'='*50}")
    print(f"Training Fold {fold}")
    print(f"{'='*50}")

    # Split data
    train_data = train_df[train_df["fold"] != fold]
    val_data = train_df[train_df["fold"] == fold]
    print(f"Train: {len(train_data)} | Val: {len(val_data)}")

    # Datasets
    train_dataset = BirdCLEFDataset(
        train_data, config["paths"]["train_audio"], config, species_list, is_train=True
    )
    val_dataset = BirdCLEFDataset(
        val_data, config["paths"]["train_audio"], config, species_list, is_train=False
    )

    # Dataloaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=config["training"]["batch_size"],
        shuffle=True,
        num_workers=4,
        pin_memory=True,
        drop_last=True,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=config["training"]["batch_size"] * 2,
        shuffle=False,
        num_workers=4,
        pin_memory=True,
    )

    # Model
    model = BirdModel(
        backbone_name=config["model"]["backbone"],
        pretrained=config["model"]["pretrained"],
        num_classes=config["model"]["num_classes"],
        in_channels=config["model"]["in_channels"],
    ).to(device)

    # Loss, optimizer, scheduler
    criterion = FocalBCELoss(
        gamma=config["loss"]["gamma"],
        alpha=config["loss"]["alpha"],
        label_smoothing=config["training"]["label_smoothing"],
    )
    optimizer = AdamW(
        model.parameters(),
        lr=config["training"]["lr"],
        weight_decay=config["training"]["weight_decay"],
    )
    scheduler = CosineAnnealingWarmRestarts(
        optimizer,
        T_0=config["training"]["epochs"],
        eta_min=1e-6,
    )

    # Training loop
    best_auc = 0
    checkpoint_dir = config["paths"]["checkpoint_dir"]
    os.makedirs(checkpoint_dir, exist_ok=True)

    for epoch in range(config["training"]["epochs"]):
        print(f"\nEpoch {epoch + 1}/{config['training']['epochs']}")

        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_auc = validate(model, val_loader, criterion, device)
        scheduler.step()

        print(f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val AUC: {val_auc:.4f}")

        if val_auc > best_auc:
            best_auc = val_auc
            save_path = os.path.join(checkpoint_dir, f"fold{fold}_best.pt")
            torch.save(model.state_dict(), save_path)
            print(f"Saved best model (AUC: {best_auc:.4f})")

    print(f"\nFold {fold} Best AUC: {best_auc:.4f}")
    return best_auc


def main():
    parser = argparse.ArgumentParser(description="BirdCLEF Training")
    parser.add_argument("--config", type=str, default="configs/default.yaml")
    parser.add_argument("--fold", type=int, default=None, help="Specific fold to train (default: all)")
    args = parser.parse_args()

    config = load_config(args.config)
    set_seed(config["seed"])
    device = get_device()
    print(f"Using device: {device}")

    # Load metadata
    train_df = pd.read_csv(config["paths"]["train_csv"])
    species_list = sorted(train_df["primary_label"].unique().tolist())
    config["model"]["num_classes"] = len(species_list)
    print(f"Number of species: {len(species_list)}")

    # Create folds
    train_df = create_folds(train_df, n_folds=config["training"]["n_folds"], seed=config["seed"])

    # Train
    folds_to_train = [args.fold] if args.fold is not None else range(config["training"]["n_folds"])
    fold_aucs = []

    for fold in folds_to_train:
        auc = train_fold(config, fold, train_df, species_list, device)
        fold_aucs.append(auc)

    print(f"\n{'='*50}")
    print(f"Mean AUC across folds: {np.mean(fold_aucs):.4f}")


if __name__ == "__main__":
    main()
