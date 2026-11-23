#!/usr/bin/env bash
# Dong goi nop bai dung cau truc: MaNhom_TenDeTai.zip
# Chay o THU MUC GOC cua ca nhom (cho SETUP/, SOURCE/, THESIS/, SOFT/, HUONGDAN.PDF nam canh nhau):
#   cd /duong-dan-toi-thu-muc-goc
#   SETUP/scripts/package.sh MaNhom_TenDeTai
set -euo pipefail
NAME=${1:?"Dung: package.sh <MaNhom_TenDeTai>  (vi du: package.sh N05_KhaiThacOWASP)"}

echo "== Kiem tra cau truc truoc khi nen =="
need=(SETUP SOURCE THESIS SOFT HUONGDAN.PDF)
missing=0
for f in "${need[@]}"; do
  if [[ ! -e "$f" ]]; then echo "  [THIEU] $f"; missing=1; else echo "  [OK] $f"; fi
done
if [[ $missing -eq 1 ]]; then
  echo "Dung lai: bo sung cac muc con thieu o tren roi chay lai script nay."
  exit 1
fi

rm -rf "/tmp/$NAME" "$NAME.zip"
mkdir -p "/tmp/$NAME"
cp -r SETUP SOURCE THESIS SOFT HUONGDAN.PDF "/tmp/$NAME/"
# Don dep file rac truoc khi nen
find "/tmp/$NAME" -name "__pycache__" -o -name "*.pyc" -o -name ".DS_Store" -o -name "node_modules" | xargs -r rm -rf

( cd /tmp && zip -r -q "$NAME.zip" "$NAME" )
mv "/tmp/$NAME.zip" "./$NAME.zip"
rm -rf "/tmp/$NAME"

echo
echo "== Da tao: $NAME.zip =="
unzip -l "$NAME.zip" | tail -5
echo
echo "Buoc tiep theo (BAT BUOC truoc khi nop): thu giai nen va chay tren mot may 'sach' khac"
echo "  unzip $NAME.zip && cd $NAME/SETUP && docker compose up -d --build"
