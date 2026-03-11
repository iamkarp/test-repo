# BirdCLEF 2026 - Bird Sound Classification

Kaggle competition solution for [BirdCLEF 2026](https://www.kaggle.com/competitions/birdclef-2026): identifying bird and wildlife species from audio recordings using deep learning.

## Project Structure

```
├── configs/default.yaml       # Training & inference hyperparameters
├── src/
│   ├── preprocess.py          # Audio → mel spectrogram pipeline
│   ├── dataset.py             # PyTorch datasets & K-fold splits
│   ├── models.py              # SED model with timm backbones
│   ├── train.py               # Training loop with validation
│   ├── inference.py           # Soundscape inference & submission
│   └── utils.py               # Seed, metrics, config loading
├── scripts/
│   ├── download_data.sh       # Download competition data
│   └── run_training.sh        # Launch training
├── notebooks/eda.ipynb        # Exploratory data analysis
└── requirements.txt           # Python dependencies
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Download competition data
bash scripts/download_data.sh

# Train (all folds)
bash scripts/run_training.sh

# Train (single fold)
bash scripts/run_training.sh configs/default.yaml 0

# Inference
python -m src.inference --config configs/default.yaml
```

## Approach

- **Audio preprocessing**: 5-second windows converted to 128-bin mel spectrograms (32kHz, hop=320)
- **Model**: EfficientNet-B0 (timm) with classification head
- **Training**: 5-fold stratified CV, Focal BCE loss, AdamW + cosine LR
- **Augmentation**: Time/frequency masking, mixup
- **Inference**: Sliding window over 1-minute soundscapes, ensemble across folds
- **Metric**: Macro-averaged ROC-AUC

## Configuration

All hyperparameters are in `configs/default.yaml`. Key settings:

| Parameter | Value |
|-----------|-------|
| Sample rate | 32,000 Hz |
| Window duration | 5 seconds |
| Mel bins | 128 |
| Backbone | tf_efficientnet_b0_ns |
| Batch size | 64 |
| Learning rate | 1e-3 |
| Epochs | 50 |
| Folds | 5 |
