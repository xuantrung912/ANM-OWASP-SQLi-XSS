#!/usr/bin/env bash
# Luu log WAF (gom cac dong bi chan 403) de dua vao THESIS/logs/waf_block_logs.log
cd "$(dirname "$0")/.."
TS=$(date +%Y%m%d_%H%M%S)
docker compose logs --no-color waf > logs/waf_full_$TS.log
grep -E "ModSecurity|403|Inbound Anomaly" logs/waf_full_$TS.log > logs/waf_block_$TS.log || true
echo "Da luu: logs/waf_block_$TS.log"
