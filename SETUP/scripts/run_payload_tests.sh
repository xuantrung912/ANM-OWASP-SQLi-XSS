#!/usr/bin/env bash
# Chay tu dong bo payload SQLi/XSS qua PROXY (khong goi thang webapp) o TRANG THAI HIEN TAI,
# ghi ket qua ra THESIS/logs/. Dung lai 3 lan ung voi 3 trang thai S1/S2/S3 (xem bao cao muc 3.3).
#
# Dung: ./run_payload_tests.sh <ten_trang_thai, vd: S1_vulnerable_off | S2_vulnerable_block | S3_secure_block_csp>
set -uo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a   # doc PUBLIC_PORT, MODE... tu .env
TAG=${1:?"Thieu nhan trang thai, vd: S1_vulnerable_off"}
BASE="http://localhost:${PUBLIC_PORT:-8080}"
OUT="../THESIS/logs/payload_test_${TAG}.log"
mkdir -p "$(dirname "$OUT")"

echo "=== Payload test run: $TAG ($(date '+%Y-%m-%d %H:%M:%S')) ===" > "$OUT"
echo "--- .env hien hanh ---" >> "$OUT"
grep -E "^(MODE|WAF_ENGINE|CSP_ENABLED)" .env | sed "s/ *#.*//" >> "$OUT"
echo >> "$OUT"

hit () { # hit "mo-ta" "METHOD" "url" ["data-json"]
  local desc="$1" method="$2" url="$3" data="${4:-}"
  echo "### $desc" >> "$OUT"
  echo "-> $method $url" >> "$OUT"
  if [[ -n "$data" ]]; then
    code=$(curl -s -o /tmp/body.$$ -w "%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
  else
    code=$(curl -s -o /tmp/body.$$ -w "%{http_code}" -X "$method" "$url")
  fi
  echo "HTTP $code" >> "$OUT"
  head -c 300 /tmp/body.$$ >> "$OUT"; echo >> "$OUT"
  [[ "$code" == "403" ]] && echo "=> BI CHAN (403, nghi ngo WAF)" >> "$OUT"
  echo >> "$OUT"; rm -f /tmp/body.$$
}

# --- SQLi (du lieu lay dung tu sqli_payloads.txt / payload_authbypass.json) ---
hit "SQLi Auth Bypass (payload_authbypass.json)" POST "$BASE/api/auth/login" "$(cat ../SOURCE/exploits/payload_authbypass.json)"
hit "SQLi UNION - doan so cot" GET "$BASE/api/products/search?q=%25%27%20ORDER%20BY%205--%20"
hit "SQLi UNION - lay users.password_hash" GET "$BASE/api/products/search?q=%25%27%20UNION%20SELECT%20id%2C%20username%2C%20password_hash%2C%200%20FROM%20users--%20"
hit "SQLi UNION - lay credit_cards" GET "$BASE/api/products/search?q=%25%27%20UNION%20SELECT%20id%2C%20card_number%2C%20expiry%2C%200%20FROM%20credit_cards--%20"
hit "SQLi Blind (qua q, vi /:id da bi chan bang regex - xem ghi chu)" GET "$BASE/api/products/search?q=a%27%20AND%201%3D1--%20"
hit "SQLi Blind doi chung (ky vong khac ket qua tren)" GET "$BASE/api/products/search?q=a%27%20AND%201%3D2--%20"

# --- XSS (du lieu lay tu payload_xss.json) ---
hit "XSS Reflected (/search)" GET "$BASE/search?q=%3Cscript%3Ealert('XSS_Reflected')%3C%2Fscript%3E"
hit "XSS Stored (review)" POST "$BASE/api/reviews" '{"product_id":1,"author":"tester","rating":5,"comment":"<img src=x onerror=alert(1)>"}'
hit "XSS DOM hash (ghi chu: xu ly o client, server luon 200 - xem log trinh duyet)" GET "$BASE/order_track.html#<img src=x onerror=alert(1)>"

echo "=== Ket thuc $TAG ===" >> "$OUT"
echo "Da ghi: $OUT"
