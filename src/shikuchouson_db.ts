import fs from "node:fs";
import { parse } from "csv-parse";

type ShikuchosonDB = { [key: string]: {
  todofuken: string
  shikuchouson: string
} }

export async function loadShikuchosonDB(): Promise<ShikuchosonDB> {
  const csvIn = fs.createReadStream('./data/csv/shikuchouson_code.csv', 'utf8');
  const out: ShikuchosonDB = {};
  const csvParser = csvIn.pipe(parse());
  for await (const record of csvParser) {
    out[(record[0] as string).slice(0, 5)] = {
      todofuken: record[1],
      shikuchouson: record[2],
    };
  }
  return out;
}
