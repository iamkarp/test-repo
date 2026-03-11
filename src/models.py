import timm
import torch
import torch.nn as nn
import torch.nn.functional as F


class AttentionHead(nn.Module):
    """Attention-based pooling head for Sound Event Detection."""

    def __init__(self, in_features, num_classes):
        super().__init__()
        self.attention = nn.Sequential(
            nn.Linear(in_features, in_features),
            nn.Tanh(),
            nn.Linear(in_features, 1),
        )
        self.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        # x: (batch, time, features)
        attn_weights = self.attention(x)  # (batch, time, 1)
        attn_weights = F.softmax(attn_weights, dim=1)
        x = (x * attn_weights).sum(dim=1)  # (batch, features)
        return self.fc(x)


class BirdModel(nn.Module):
    """Sound Event Detection model for BirdCLEF."""

    def __init__(self, backbone_name="tf_efficientnet_b0_ns", pretrained=True,
                 num_classes=206, in_channels=1):
        super().__init__()
        self.backbone = timm.create_model(
            backbone_name,
            pretrained=pretrained,
            in_chans=in_channels,
            features_only=False,
            num_classes=0,  # Remove classifier
        )
        # Get feature dimensions from backbone
        with torch.no_grad():
            dummy = torch.randn(1, in_channels, 128, 500)
            features = self.backbone(dummy)
            if features.dim() == 2:
                self.feature_dim = features.shape[1]
                self.use_attention = False
            else:
                # If backbone returns spatial features, use adaptive pooling
                self.feature_dim = features.shape[1]
                self.use_attention = False

        self.head = nn.Sequential(
            nn.Linear(self.feature_dim, self.feature_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(self.feature_dim // 2, num_classes),
        )

    def forward(self, x):
        # x: (batch, 1, n_mels, time)
        features = self.backbone(x)  # (batch, feature_dim)
        logits = self.head(features)  # (batch, num_classes)
        return logits


class FocalBCELoss(nn.Module):
    """Focal Binary Cross-Entropy Loss with label smoothing."""

    def __init__(self, gamma=2.0, alpha=0.25, label_smoothing=0.01):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha
        self.label_smoothing = label_smoothing

    def forward(self, logits, targets):
        if self.label_smoothing > 0:
            targets = targets * (1 - self.label_smoothing) + 0.5 * self.label_smoothing

        probs = torch.sigmoid(logits)
        bce = F.binary_cross_entropy_with_logits(logits, targets, reduction="none")

        p_t = probs * targets + (1 - probs) * (1 - targets)
        focal_weight = (1 - p_t) ** self.gamma

        if self.alpha is not None:
            alpha_t = self.alpha * targets + (1 - self.alpha) * (1 - targets)
            focal_weight = alpha_t * focal_weight

        loss = focal_weight * bce
        return loss.mean()
