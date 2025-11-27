#!/usr/bin/env bash
set -e

# 参考リンク: https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c

unzip -qq -o "$1" -d "$(dirname "$1")"
xml_file="${1%.zip}.xml"
mojxml2geojson "$xml_file"
rm "$xml_file"
geojson_file="${1%.zip}.geojson"
epsg4326_geojson_file="${1%.zip}.epsg4326geojson"
# generated file is in EPSG:6668, we will convert to 4326 for tippecanoe
ogr2ogr -f GeoJSON "$epsg4326_geojson_file" -t_srs "EPSG:4326" "$geojson_file"
ndgeojson_file="${1%.zip}.ndgeojson"
jq -cr '.features | .[]' "$epsg4326_geojson_file" > "$ndgeojson_file"
rm "$geojson_file" "$epsg4326_geojson_file"
