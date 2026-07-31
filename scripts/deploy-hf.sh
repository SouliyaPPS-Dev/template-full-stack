#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

HF_REMOTE="${HF_REMOTE:-hf}"
HF_SSH_KEY="${HF_SSH_KEY:-$HOME/.ssh/id_ed25519_template}"
BUCKET="${HF_BUCKET:-souliya/template-storage}"
MSG="${1:-chore: deploy web build + API to HF Space}"

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

echo -e "${G}==> 4/4 Pushing minimal Space snapshot to $HF_REMOTE...${NC}"
if ! git remote get-url "$HF_REMOTE" >/dev/null 2>&1; then
  echo -e "${R}No git remote named '$HF_REMOTE'.${NC}"
  echo -e "${Y}Add it with:${NC}"
  echo "  git remote add $HF_REMOTE git@hf.co:spaces/souliya/template"
  exit 1
fi

SSH_CMD="ssh -i $HF_SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
TMP="$(mktemp -d)"
git worktree add -q --detach "$TMP" HEAD
(
  cd "$TMP"
  git checkout -q --orphan hf-deploy
  git rm -rf -q . 2>/dev/null || true
  git clean -q -fdx
  cp "$DIR/app.py" "$DIR/requirements.txt" "$DIR/README.md" "$DIR/.gitattributes" "$DIR/.gitignore" .
  cp -R "$DIR/dist" dist
  git add -A
  git add -f dist
  git commit -q -m "$MSG"
  GIT_SSH_COMMAND="$SSH_CMD" git push "$HF_REMOTE" hf-deploy:main --force
)
cd "$DIR"
git worktree remove "$TMP" --force
git branch -D hf-deploy 2>/dev/null || true

echo ""
echo -e "${G}Deployed!${NC}"
echo -e "  Space:   https://huggingface.co/spaces/souliya/template"
echo -e "  Web app: https://souliya-template.hf.space"
echo -e "  API:     https://souliya-template.hf.space/api/v1"
