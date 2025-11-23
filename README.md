# Geolonia 地番住所データ (実験版)

法務省からの登記所備付地図データを利用した、地番住所マスターAPI、及び作成ツールとなります。

## 必須要件

- Node.js >= v22
- Docker
- Docker Compose

## 使い方

1. Dockerイメージをビルドします
    ```sh
    npm run build:image
    ```
2. G空間情報センターからダウンロードした法務省データ(Zip形式)を `./data/moj_data/` フォルダ内に配置します
3. 法務省データを、公共座標系をEPSG:4326に投影した NDGeoJSON に変換します ([参照](https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c))
    ```sh
    npm run prepare:convert
    ```
    - 任意座標系の場合、EPSG:4326に投影できないため、地図XMLに入っている座標をそのまま NDGeoJSON に含めています。
4. NDGeoJSON から地番住所マスターAPI用データを生成します
    ```sh
    npm run convert ./data/ndgeojsons/
    ```
    - `api` フォルダ配下にデータが出力されます。

## ライセンス

- ソースコードのライセンスは MIT ライセンスです。
- [`./data/moj_data`](./data/moj_data) フォルダに含まれるZIPファイルは、「登記所備付地図データ」（法務省）を、登記所備付地図データ利用規約に基づいて複製したものです。
