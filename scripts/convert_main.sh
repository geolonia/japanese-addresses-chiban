#!/bin/bash -e
set -ex

# 参考リンク: https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c

DATA_DIR="$1"
# DATA_DIR="/data"

MAX_JOBS=$(nproc)

ORG_ZIP_DIR="$DATA_DIR/moj_data"
ALL_ZIPS_DIR="$DATA_DIR/all_zips"
IGNORE_DIR="$DATA_DIR/ignore"
NDGEOJSONS_DIR="$DATA_DIR/ndgeojsons"

mkdir -p $ALL_ZIPS_DIR
find $ORG_ZIP_DIR -maxdepth 1 -name '*.zip' | xargs -P $MAX_JOBS -I '{}' unzip -f '{}' -d $ALL_ZIPS_DIR

find $ALL_ZIPS_DIR -name '*.zip' | xargs -P $MAX_JOBS zgrep -l '<座標系>任意座標系</座標系>' > $DATA_DIR/ninni_zahyou.txt

mkdir -p $IGNORE_DIR
cat $DATA_DIR/ninni_zahyou.txt | xargs mv -t $IGNORE_DIR/

ls $ALL_ZIPS_DIR | wc -l
ls $IGNORE_DIR | wc -l

mkdir -p $NDGEOJSONS_DIR

. .venv/bin/activate

find $ALL_ZIPS_DIR -name '*.zip' -print0 | parallel -0 -j $MAX_JOBS ./convert_in_place.sh
mv $ALL_ZIPS_DIR/*.ndgeojson $NDGEOJSONS_DIR/

find $IGNORE_DIR -name '*.zip' -print0 | parallel -0 -j $MAX_JOBS ./convert_in_place.sh
mv $IGNORE_DIR/*.ndgeojson $NDGEOJSONS_DIR/
