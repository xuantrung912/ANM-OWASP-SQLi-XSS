#!/usr/bin/env bash
# Dung: ./set_mode.sh <vulnerable|secure> <off|detect|block> <csp-off|csp-on> [reset]
#   reset = xoa DB (docker compose down -v) de khong con du lieu XSS stored cua lan truoc
# 3 trang thai demo:
#   1) Khong bao ve      : ./set_mode.sh vulnerable off csp-off
#   2) Chi WAF           : ./set_mode.sh vulnerable block csp-off
#   3) Code va + WAF+CSP : ./set_mode.sh secure block csp-on
set -euo pipefail
cd "$(dirname "$0")/.."
APP=${1:-vulnerable}; WAF=${2:-off}; CSP=${3:-csp-off}; RESET=${4:-}

case "$WAF" in off) E=Off;; detect) E=DetectionOnly;; block) E=On;; *) echo "WAF: off|detect|block"; exit 1;; esac
case "$CSP" in csp-on) C=1;; csp-off) C=0;; *) echo "CSP: csp-on|csp-off"; exit 1;; esac
[[ "$APP" =~ ^(vulnerable|secure)$ ]] || { echo "APP: vulnerable|secure"; exit 1; }

# sed -i.bak chay duoc tren Linux, Mac va Git Bash
sed -i.bak "s/^MODE=[^ #]*/MODE=$APP/; s/^WAF_ENGINE=[^ #]*/WAF_ENGINE=$E/; s/^CSP_ENABLED=[^ #]*/CSP_ENABLED=$C/" .env
rm -f .env.bak

if [[ "$RESET" == "reset" ]]; then docker compose down -v; fi
docker compose up -d --build --force-recreate
PORT=$(grep -E '^PUBLIC_PORT=' .env | cut -d= -f2 | cut -d' ' -f1)
echo "Da chuyen: app=$APP, waf=$E, csp=$C  ->  http://localhost:${PORT:-8080}"
