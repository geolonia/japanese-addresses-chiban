import fs from "node:fs";
import readline from "node:readline";

export type MOJRegDataProperties = {
  "筆ID": string,
  "version": string,
  "座標系":string,
  "測地系判別":string|null,
  "地図名": string,
  "地図番号": string,
  "縮尺分母": string,
  "市区町村コード":string,
  "市区町村名":string,
  "大字コード":string,
  "丁目コード":string,
  "小字コード":string,
  "予備コード":string,
  "大字名":string|null,
  "丁目名":string|null,
  "小字名":string|null,
  "予備名":string|null,
  "地番":string,
  "精度区分":string|null,
  "座標値種別":string,
  "筆界未定構成筆":string,
  "代表点緯度":number,
  "代表点経度":number,
}

export async function *ndGeoJSONReader(inputPath: string) {
  const input = fs.createReadStream(inputPath);
  const lines = readline.createInterface({
    input,
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    const json = JSON.parse(line) as GeoJSON.Feature<GeoJSON.Geometry, MOJRegDataProperties>;
    yield json;
  }
}
