#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUCKET="souliya/api-template-storage"

echo "=== Seeding HF Bucket: $BUCKET ==="
echo "Source: $DIR/database/seeds/"
echo ""

# Check hf CLI
if ! command -v hf &>/dev/null; then
  echo "Error: 'hf' CLI not found. Install from https://huggingface.co/docs/huggingface_hub/en/guides/cli"
  exit 1
fi

# Check auth
hf auth whoami 2>/dev/null || {
  echo "Not logged in to HuggingFace. Run 'hf auth login' first."
  exit 1
}

echo "Uploading seed data..."
hf buckets cp "$DIR/database/seeds/seed.sql" "hf://buckets/$BUCKET/seeds/seed.sql"
hf buckets cp "$DIR/database/seeds/seed.json" "hf://buckets/$BUCKET/seeds/seed.json"
hf buckets cp "$DIR/database/schema.sql" "hf://buckets/$BUCKET/schema.sql"

echo ""
echo "=== Bucket contents ==="
hf buckets ls "$BUCKET" -R

echo ""
echo "Done! Seed data uploaded to hf://buckets/$BUCKET/"
