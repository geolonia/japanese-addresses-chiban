import path from "node:path";
import fs from "node:fs";

import glob from "glob";
import { number2kanji } from "@geolonia/japanese-numeral";

import { loadShikuchosonDB } from "./shikuchouson_db";
import { ndGeoJSONReader } from "./ndgeojson_reader";

const BANCHI_FILTERS = [
  /^長狭物不明-/,
  /^地区外-/,
  /^別図-/,
  /^無地番-/,
  /^筆界未定地-/,
  /^(道|水)-/,
];

function translateChomeStr(input: string | null) {
  if (!input) return '';
  return input.replace(/[０-９]/g, function(s) {
    return number2kanji(
      parseInt(String.fromCharCode(s.charCodeAt(0) - 0xFEE0), 10)
    )
  });
}

interface SingleChiban {
  banchi: string
  lat?: string
  lng?: string
}

async function main() {
  const ndgeojson_dir = process.argv[2];
  const ndgeojsons = glob.sync(path.join(ndgeojson_dir, "*.ndgeojson"));
  const sdb = await loadShikuchosonDB();
  // console.log(sdb);

  const out: {
    [key: string]: { // 都道府県
      [key: string]: { // 市区町村
        [key: string]: { // 大字・丁目
          chibans: SingleChiban[]
        }
      }
    }
  } = {};
  for (const ndgeojson of ndgeojsons) {
    const reader = ndGeoJSONReader(ndgeojson);
    for await (const addr of reader) {
      const shikuchouson_data = sdb[addr.properties.市区町村コード];
      // console.log(shikuchouson_data, addr.properties);

      const chome_ja_int = translateChomeStr(addr.properties.丁目名);
      if (addr.properties.大字名 === null) {
        continue;
      }
      const oaza_chome_name = `${addr.properties.大字名}${chome_ja_int}`

      out[shikuchouson_data.todofuken] ||= {};
      const shikuchosons = out[shikuchouson_data.todofuken];
      shikuchosons[shikuchouson_data.shikuchouson] ||= {};
      const oaza_chomes = shikuchosons[shikuchouson_data.shikuchouson];
      oaza_chomes[oaza_chome_name] ||= {
        chibans: [],
      };
      const oaza_chome = oaza_chomes[oaza_chome_name];

      const banchi = addr.properties.地番;

      if (BANCHI_FILTERS.findIndex((filter) => filter.test(banchi)) >= 0) {
        continue;
      }
      const chiban: SingleChiban = {
        banchi,
      }
      if (addr.properties.座標系 !== '任意座標系') {
        chiban.lat = addr.properties.代表点緯度.toString();
        chiban.lng = addr.properties.代表点経度.toString();
      }
      oaza_chome.chibans.push(chiban);

      console.log(`${shikuchouson_data.todofuken} ${shikuchouson_data.shikuchouson} ${oaza_chome_name} ${chiban.banchi}`);
    }
  }

  for (const [todofuken, shikuchousons] of Object.entries(out)) {
    for (const [shikuchouson, oaza_chomes] of Object.entries(shikuchousons)) {
      for (const [oaza_chome, data] of Object.entries(oaza_chomes)) {
        const out_dir = path.join('public', 'api', 'ja', todofuken, shikuchouson, oaza_chome);
        await fs.promises.mkdir(out_dir, { recursive: true });
        await fs.promises.writeFile(path.join(out_dir, '地番.json'), JSON.stringify(data.chibans));
      }
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
