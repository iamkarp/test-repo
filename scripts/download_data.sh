#!/bin/bash
# Download BirdCLEF 2026 competition data from Kaggle
set -e

COMPETITION="birdclef-2026"
DATA_DIR="./data"

echo "Downloading ${COMPETITION} data..."
mkdir -p "${DATA_DIR}"

# Download competition data
kaggle competitions download -c "${COMPETITION}" -p "${DATA_DIR}"

# Unzip
echo "Extracting data..."
cd "${DATA_DIR}"
unzip -o "${COMPETITION}.zip" -d "${COMPETITION}"
rm -f "${COMPETITION}.zip"

echo "Data downloaded and extracted to ${DATA_DIR}/${COMPETITION}/"
echo "Contents:"
ls -la "${COMPETITION}/"
