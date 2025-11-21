# Geolonia 地番住所データ (実験版)

法務省からの登記地番図情報を利用した、地番住所マスターAPI、及び作成ツールとなります。

## 使い方

* まずは法務省データを、公共座標系をEPSG:4326に投影した NDGeoJSON に変換する ([参照](https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c))
  * 任意座標系の場合、EPSG:4326に投影できないため、地図XMLに入っている座標をそのまま NDGeoJSON に入れてください。
  * `convert_in_place.sh` 参照
    ```
    #!/bin/bash -e
    unzip -o "$1" -d "$(dirname "$1")"

    xml_file="${1%.zip}.xml"
    mojxml2geojson "$xml_file"
    rm "$xml_file"
    geojson_file="${1%.zip}.geojson"
    ndgeojson_file="${1%.zip}.ndgeojson"
    jq -cr '.features | .[]' "$geojson_file" > "$ndgeojson_file"
    rm "$geojson_file"
    ```
* `npm run start ./ndgeojsons/`
* `api` にデータ出力されます
