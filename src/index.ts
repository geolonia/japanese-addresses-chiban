import path from "node:path";

import { globSync } from "glob";
import { SingleChiban } from '@geolonia/japanese-addresses-v2'
import { normalize } from "@geolonia/normalize-japanese-addresses";

import { loadShikuchosonDB } from "./shikuchouson_db";
import { ndGeoJSONReader } from "./ndgeojson_reader";
import { katakanaMap } from "./katakana_map";
import { ChibanApi, outputChibanData } from "./make_chiban";

async function main() {
  if (process.argv.length < 3) {
    console.error(`Usage: node build/index.js <ndgeojson_dir>`);
    process.exit(1);
  }
  const ndgeojson_dir = process.argv[2];
  const ndgeojsons = globSync(path.join(ndgeojson_dir, "*.ndgeojson")).sort();
  const sdb = await loadShikuchosonDB();
  // console.log(sdb);

  const out: {
    [key: string]: { // 都道府県
      [key: string]: { // 市区町村
        [key: string]: { // 大字・丁目・小字 (=町字)
          machiAzaName: string
          sortKey: string
          chibans: { [key: string]: SingleChiban & { sortKey: string } }
        }
      }
    }
  } = {};
  for (const ndgeojson of ndgeojsons) {
    const reader = ndGeoJSONReader(ndgeojson);
    for await (const row of reader) {
      const shikuchouson_data = sdb[row.properties.市区町村コード];
      // console.log(shikuchouson_data, row.properties);

      const machiazaName = `${row.properties.大字名 || ''}${row.properties.丁目名 || ''}${row.properties.小字名 || ''}`;
      if (machiazaName === '') {
        // 大字・丁目・小字が空の地区外の場合はスキップ
        continue;
      }
      const address = `${shikuchouson_data.todofuken}${shikuchouson_data.shikuchouson}${machiazaName}`;
      const normalizedAddress = await normalize(address);
      const prefName = normalizedAddress.pref;
      const cityName = normalizedAddress.city;
      const townName = normalizedAddress.town;
      if (!prefName || !cityName || !townName) {
        console.warn(`Warning: Incomplete normalization result: ${address} ${JSON.stringify(row)}`);
        continue;
      }

      out[prefName] ||= {};
      const cities = out[prefName];
      cities[cityName] ||= {};
      const machiazas = cities[cityName];
      machiazas[townName] ||= {
        machiAzaName: townName,
        sortKey: normalizedAddress.metadata.machiAza?.machiaza_id || '',
        chibans: {} as { [key: string]: SingleChiban & { sortKey: string } },
      };
      const machiaza = machiazas[townName];

      const orginalBanchi = row.properties.地番;
      let banchi = orginalBanchi;

      // 地番住所かどうか (参考リンク: https://www1.touki.or.jp/pdf/tiban_group.pdf)
      // ※めがね地番、二重地番、分属管理地番は重複してカウント (参考リンク: https://www.moj.go.jp/content/000116464.pdf#page=15)
      const isAddressChiban = (
        (
          banchi.match(/^[-0-9A-Uぁ-んｦ-ﾟヰヱ子丑寅卯辰巳午未申酉戌亥東西南北内外上中下甲乙丙丁戊己庚辛壬癸第号区]+((V|W)\d+|X\(\d+\/\d+\))?$/)
          // 愛媛県の耕地を含む地番を考慮
          || banchi.match(/^[0-9]+-耕地[-0-9A-U甲乙丙丁戊己庚辛壬癸]+((V|W)\d+|X\(\d+\/\d+\))?$/)
        )
        // 先頭・末尾のハイフン、連続ハイフン、同一グループ文字の連続は除外
        && !banchi.match(/(^-|-$|\-{2}|[A-U]{2}|[ぁ-ん]{2}|[ｦ-ﾟヰヱ]{2}|[子丑寅卯辰巳午未申酉戌亥]{2}|[東西南北]{2}|[内外]{2}|[上中下]{2}|[甲乙丙丁戊己庚辛壬癸]{2}|[第号区外]{2})/)
      );

      if (!isAddressChiban) {
        continue;
      }

      // 末尾のV・W・Xを削除
      banchi = banchi.replace(/((V|W)\d+|X\(\d+\/\d+\))$/, '');
      // 末尾の-第・号・区を削除
      banchi = banchi.replace(/-?(第|号|区)$/, '');
      // 数値の間の第・号・区をハイフンに置換
      banchi = banchi.replace(/(\d+)(?:第|号|区)(\d+)/g, '$1-$2');
      // 数値の前の第を削除
      banchi = banchi.replace(/第(\d+)/g, '$1');
      // 半角カタカナを全角カタカナに置換
      banchi = banchi.replace(/([ｦ-ﾟ])/g, (s) => katakanaMap[s] || s);

      const parcelNumbers = banchi.split('-');
      const prc_num1 = parcelNumbers[0];
      const prc_num2 = parcelNumbers.length > 1 ? parcelNumbers[1] : '';
      const prc_num3 = parcelNumbers.length > 2 ? parcelNumbers.slice(2).join('-') : '';
      const point: [number, number] | undefined =
        (row.properties.座標系 !== '任意座標系')
          ? [row.properties.代表点経度, row.properties.代表点緯度]
          : undefined;

      if (machiaza.chibans[banchi]) {
        // 既に登録済みの地番の場合はスキップ
        console.log(`Duplicate chiban found: ${prefName} ${cityName} ${townName} ${orginalBanchi} ${point || '-'}`);
        continue;
      }

      const chiban: SingleChiban & { sortKey: string } = {
        prc_num1: prc_num1,
        prc_num2: prc_num2,
        prc_num3: prc_num3,
        point: point,
        sortKey: `${prc_num1.padStart(10, '0')}${prc_num2.padStart(10, '0')}${prc_num3.padStart(10, '0')}`,
      }

      machiaza.chibans[banchi] = chiban;

      // console.log(`${prefName}/${cityName}/${townName}/${parcelNumbers.join('-')}`);
    }
  }

  for (const [pref, cities] of Object.entries(out)) {
    for (const [city, machiazas] of Object.entries(cities)) {
      const sortedMachiAzas = Object.values(machiazas).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
      const apiData: ChibanApi = [];
      for (const machiaza of sortedMachiAzas) {
        apiData.push({
          machiAzaName: machiaza.machiAzaName,
          chibans: Object.values(machiaza.chibans).sort((a, b) => a.sortKey.localeCompare(b.sortKey)),
        });
      }
      const outDir = path.join('public', 'api');
      const outFilename = path.join(pref, city);
      await outputChibanData(outDir, outFilename, apiData);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
