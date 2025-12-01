#!/usr/bin/env bash
set -e

SCRIPT_DIR=$(cd $(dirname $0); pwd)
# DATA_DIR="$1"
DATA_DIR="./data"

MAX_JOBS=$(nproc)

ORG_ZIP_DIR="$DATA_DIR/moj_data"
TMP_DIR="$DATA_DIR/tmp"

mkdir -p "$TMP_DIR"

process_city() {
  local city_code="$1"
  local tmp_zip_dir="$TMP_DIR/$city_code"
  mkdir -p "$tmp_zip_dir"
  for city_zip_file in $(find "$ORG_ZIP_DIR" -name "${city_code}*.zip" | sort); do
    echo "Processing: $city_zip_file"
    local geojson_file="$tmp_zip_dir/$(basename "${city_zip_file%.zip}").geojson"
    ./bin/mojxml-rs -a "$geojson_file" "$city_zip_file"
    local ndgeojson_file="$tmp_zip_dir/$(basename "${city_zip_file%.zip}").ndgeojson"
    mv "$geojson_file" "$ndgeojson_file"
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
