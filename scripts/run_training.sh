#!/bin/bash
# Run BirdCLEF training pipeline
set -e

CONFIG="${1:-configs/default.yaml}"
FOLD="${2:-}"

echo "BirdCLEF Training Pipeline"
echo "Config: ${CONFIG}"

if [ -n "${FOLD}" ]; then
    echo "Training fold: ${FOLD}"
    python -m src.train --config "${CONFIG}" --fold "${FOLD}"
else
    echo "Training all folds"
    python -m src.train --config "${CONFIG}"
fi

echo "Training complete!"
