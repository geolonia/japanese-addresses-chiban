# Geolonia 地番住所データ (実験版)

法務省からの登記所備付地図データを利用した、地番住所マスターAPI、及び作成ツールとなります。

## 必須要件

### ローカル環境利用時

- Bash
- Node.js >= 22.13
- Python >= 3.10
- GDAL >= 3.4

### Docker環境利用時

- Docker
- Docker Compose

## インストール・ビルド

```sh
npm install
npm run build
```

## 使い方

G空間情報センターからダウンロードした法務省データ(Zip形式)を `./data/moj_data/` フォルダ内に配置し、
以下のいずれかを実行すると、 `api` フォルダ配下に地番住所マスターAPI用データが出力されます。

### ローカル環境利用時

1. Pythonの仮想環境を構築し、mojxml2pythonをインストールします
    ```sh
    python3 -m venv .venv
    source .venv/bin/activate
    pip install git+https://github.com/digital-go-jp/mojxml2geojson.git
    ```
2. 法務省データを地番住所マスターAPI用データに変換します
    ```sh
    npm run convert
    ```

### Docker環境利用時

1. Dockerイメージをビルドします
    ```sh
    npm run build:image
    ```
2. 法務省データを地番住所マスターAPI用データに変換します
    ```sh
    npm run run:image
    ```

## 参考リンク

`scripts` フォルダ内のスクリプトは、以下のGist「keichan34/README.md - 法務省データもろもろ」を参考にさせて頂きました。
* https://gist.github.com/keichan34/d6e8f283bb5810d6f4aa8d941f9a824c

## ライセンス

- ソースコードのライセンスは MIT ライセンスです。
- [`./data/moj_data`](./data/moj_data) フォルダに含まれるZIPファイルは、「登記所備付地図データ」（法務省）を、登記所備付地図データ利用規約に基づいて複製したものです。
