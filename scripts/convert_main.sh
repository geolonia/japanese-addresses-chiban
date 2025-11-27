#!/usr/bin/env bash
set -e

# 参考リンク: https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c

SCRIPT_DIR=$(cd $(dirname $0); pwd)
# DATA_DIR="$1"
DATA_DIR="./data"

MAX_JOBS=$(nproc)

ORG_ZIP_DIR="$DATA_DIR/moj_data"
TMP_DIR="$DATA_DIR/tmp"

mkdir -p "$TMP_DIR"

. .venv/bin/activate

process_city() {
  local city_code="$1"
  local tmp_zip_dir="$TMP_DIR/$city_code"
  mkdir -p "$tmp_zip_dir"
  for city_zip_file in $(find "$ORG_ZIP_DIR" -name "${city_code}*.zip" | sort); do
    echo "Processing: $city_zip_file"
    unzip -qq -o "$city_zip_file" -d "$tmp_zip_dir"
  done
  for zip_file in $(find "$tmp_zip_dir" -name '*.zip' | sort); do
    "$SCRIPT_DIR/convert_in_place.sh" "$zip_file"
  done
  node build/index.js "$tmp_zip_dir"
  rm -rf "$tmp_zip_dir"
}

for city_code in $(find "$ORG_ZIP_DIR" -maxdepth 1 -name '*.zip' \
    | xargs -I{} basename {} \
    | cut -c 1-5 \
    | sort -u); do
  process_city "$city_code" &
  if [[ $(jobs -r -p | wc -l) -ge $MAX_JOBS ]]; then
    wait -n
  fi
done
wait
