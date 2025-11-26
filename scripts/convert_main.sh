#!/bin/bash -e

# 参考リンク: https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c

SCRIPT_DIR=$(cd $(dirname $0); pwd)
DATA_DIR="$1"
# DATA_DIR="/data"

MAX_JOBS=$(nproc)

ORG_ZIP_DIR="$DATA_DIR/moj_data"
TMP_DIR="$DATA_DIR/tmp"

mkdir -p "$TMP_DIR"

. .venv/bin/activate

process_zip() {
  local org_zip_file="$1"
  local tmp_zip_dir=$TMP_DIR/$(basename "$org_zip_file" .zip)
  mkdir -p "$tmp_zip_dir"
  unzip -qq -o "$org_zip_file" -d "$tmp_zip_dir"
  for zip_file in $(find $tmp_zip_dir -name '*.zip' | sort); do
    "$SCRIPT_DIR/convert_in_place.sh" "$zip_file"
  done
  node build/index.js "$tmp_zip_dir"
  rm -rf "$tmp_zip_dir"
}

for org_zip_file in $(find $ORG_ZIP_DIR -maxdepth 1 -name '*.zip' | sort); do
  process_zip "$org_zip_file" &
  if [[ $(jobs -r -p | wc -l) -ge $MAX_JOBS ]]; then
    wait -n
  fi
done
wait
