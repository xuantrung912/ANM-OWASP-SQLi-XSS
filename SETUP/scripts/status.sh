#!/usr/bin/env bash
cd "$(dirname "$0")/.."
grep -E "^(MODE|WAF_ENGINE|CSP_ENABLED)" .env
PORT=$(grep -E '^PUBLIC_PORT=' .env | cut -d= -f2 | cut -d' ' -f1)
docker compose ps
echo "--- Headers tra ve:"; curl -sI "http://localhost:${PORT:-8080}" | grep -iE "^(HTTP|content-security|x-frame|x-content|referrer|permissions)"
