#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

HF_REMOTE="${HF_REMOTE:-hf}"
BUCKET="${HF_BUCKET:-souliya/api-template-storage}"
MSG="${1:-chore: deploy web build + seed data to HF Space}"

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'

echo -e "${G}==> 1/4 Building web for production...${NC}"
cd apps/web
if command -v bun >/dev/null 2>&1; then
  bun install --frozen-lockfile >/dev/null 2>&1 || true
  bun run build
else
  npm ci >/dev/null 2>&1 || true
  npm run build
fi
cd "$DIR"

echo -e "${G}==> 2/4 Syncing build to dist/ (served by HF app.py)...${NC}"
rm -rf dist
cp -R apps/web/dist dist

echo -e "${G}==> 3/4 Uploading seed data to HF bucket: $BUCKET...${NC}"
if command -v hf >/dev/null 2>&1 && hf auth whoami >/dev/null 2>&1; then
  hf buckets cp database/seeds/seed.sql "hf://buckets/$BUCKET/seeds/seed.sql" || true
  hf buckets cp database/seeds/seed.json "hf://buckets/$BUCKET/seeds/seed.json" || true
  hf buckets cp database/schema.sql "hf://buckets/$BUCKET/schema.sql" || true
  echo "    done."
else
  echo -e "${Y}    hf CLI not authenticated - skipped (run: ./run seed or hf auth login)${NC}"
fi

echo -e "${G}==> 4/4 Pushing to HuggingFace Space...${NC}"
if ! git remote get-url "$HF_REMOTE" >/dev/null 2>&1; then
  echo -e "${R}No git remote named '$HF_REMOTE'.${NC}"
  echo -e "${Y}Add it with:${NC}"
  echo "  git remote add $HF_REMOTE https://huggingface.co/spaces/souliya/template"
  exit 1
fi

git add -A
git add -f dist
if git diff --cached --quiet; then
  echo -e "${Y}    nothing to commit (already up to date)${NC}"
else
  git commit -m "$MSG"
fi
git push "$HF_REMOTE" HEAD:main

echo ""
echo -e "${G}Deployed!${NC}"
echo -e "  Space:   https://huggingface.co/spaces/souliya/template"
echo -e "  Web app: https://souliya-template.hf.space"
echo -e "  API:     https://souliya-template.hf.space/api/v1"
