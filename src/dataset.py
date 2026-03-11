import os
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from sklearn.model_selection import StratifiedKFold

from src.preprocess import load_audio, audio_to_melspec, apply_time_mask, apply_freq_mask


class BirdCLEFDataset(Dataset):
    """Dataset for BirdCLEF training audio clips."""

    def __init__(self, df, audio_dir, config, species_list, is_train=True):
        self.df = df.reset_index(drop=True)
        self.audio_dir = audio_dir
        self.config = config
        self.species_list = species_list
        self.species_to_idx = {s: i for i, s in enumerate(species_list)}
        self.is_train = is_train
        self.sr = config["audio"]["sample_rate"]
        self.duration = config["audio"]["duration"]

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        filepath = os.path.join(self.audio_dir, row["filename"])

        # Load audio
        audio = load_audio(filepath, sr=self.sr, duration=self.duration)

        # Convert to mel spectrogram
        mel_spec = audio_to_melspec(
            audio,
            sr=self.sr,
            n_mels=self.config["audio"]["n_mels"],
            n_fft=self.config["audio"]["n_fft"],
            hop_length=self.config["audio"]["hop_length"],
            fmin=self.config["audio"]["fmin"],
            fmax=self.config["audio"]["fmax"],
        )

        # Augmentations during training
        if self.is_train:
            aug_cfg = self.config["augmentation"]
            if np.random.rand() < 0.5:
                mel_spec = apply_time_mask(mel_spec, aug_cfg["time_mask_max"])
            if np.random.rand() < 0.5:
                mel_spec = apply_freq_mask(mel_spec, aug_cfg["freq_mask_max"])

        # Create label vector
        label = torch.zeros(len(self.species_list), dtype=torch.float32)
        species = row["primary_label"]
        if species in self.species_to_idx:
            label[self.species_to_idx[species]] = 1.0

        # Handle secondary labels if present
        if "secondary_labels" in row and isinstance(row["secondary_labels"], str):
            for s in eval(row["secondary_labels"]):
                if s in self.species_to_idx:
                    label[self.species_to_idx[s]] = 1.0

        return mel_spec, label


class SoundscapeDataset(Dataset):
    """Dataset for inference on soundscape recordings."""

    def __init__(self, filepaths, config):
        self.config = config
        self.sr = config["audio"]["sample_rate"]
        self.window_size = config["inference"]["window_size"]
        self.hop_size = config["inference"]["hop_size"]

        # Build list of (filepath, offset) pairs
        self.items = []
        for fp in filepaths:
            duration = 60  # soundscapes are 1 minute each
            offset = 0.0
            while offset + self.window_size <= duration + 0.01:
                self.items.append((fp, offset))
                offset += self.hop_size

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        filepath, offset = self.items[idx]

        audio = load_audio(
            filepath, sr=self.sr, duration=self.window_size, offset=offset
        )

        mel_spec = audio_to_melspec(
            audio,
            sr=self.sr,
            n_mels=self.config["audio"]["n_mels"],
            n_fft=self.config["audio"]["n_fft"],
            hop_length=self.config["audio"]["hop_length"],
            fmin=self.config["audio"]["fmin"],
            fmax=self.config["audio"]["fmax"],
        )

        return mel_spec, filepath, offset


def create_folds(df, n_folds=5, seed=42):
    """Create stratified K-fold splits based on primary_label."""
    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=seed)
    df["fold"] = -1
    for fold, (_, val_idx) in enumerate(skf.split(df, df["primary_label"])):
        df.loc[val_idx, "fold"] = fold
    return df
