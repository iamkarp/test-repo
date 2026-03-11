import os
import random
import yaml
import numpy as np
import torch
from sklearn.metrics import roc_auc_score


def set_seed(seed=42):
    """Set random seed for reproducibility."""
    random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def load_config(config_path):
    """Load YAML configuration file."""
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)
    return config


def macro_auc(y_true, y_pred):
    """Compute macro-averaged ROC-AUC, skipping classes with no positive labels."""
    aucs = []
    for i in range(y_true.shape[1]):
        if y_true[:, i].sum() > 0:
            try:
                auc = roc_auc_score(y_true[:, i], y_pred[:, i])
                aucs.append(auc)
            except ValueError:
                continue
    return np.mean(aucs) if aucs else 0.0


def get_device():
    """Get the best available device."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


class AverageMeter:
    """Computes and stores the average and current value."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.val = 0
        self.avg = 0
        self.sum = 0
        self.count = 0

    def update(self, val, n=1):
        self.val = val
        self.sum += val * n
        self.count += n
        self.avg = self.sum / self.count
