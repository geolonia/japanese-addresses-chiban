import fs from 'node:fs';
import path from 'node:path';

import { SingleChiban } from '@geolonia/japanese-addresses-v2';

const HEADER_CHUNK_SIZE = 50_000;

export type ChibanApi = {
  machiAzaName: string;
  chibans: SingleChiban[];
}[];

type HeaderRow = {
  name: string;
  offset: number;
  length: number;
}

function serializeApiDataTxt(apiData: ChibanApi): { headerIterations: number, headerData: HeaderRow[], data: Buffer } {
  const outSections: Buffer[] = [];
  for ( const { machiAzaName, chibans } of apiData ) {
    let outSection = `地番,${machiAzaName}\n` +
                     `prc_num1,prc_num2,prc_num3,lng,lat\n`;
    for (const chiban of chibans) {
      outSection += `${chiban.prc_num1},${chiban.prc_num2 || ''},${chiban.prc_num3 || ''},${chiban.point?.[0] || ''},${chiban.point?.[1] || ''}\n`;
    }
    outSections.push(Buffer.from(outSection, 'utf8'));
  }

  const createHeader = (iterations = 1) => {
    let header = '';
    const headerMaxSize = HEADER_CHUNK_SIZE * iterations;
    let lastBytePos = headerMaxSize;
    const headerData: HeaderRow[] = [];
    for (const [index, section] of outSections.entries()) {
      const machiAzaName = apiData[index].machiAzaName;

      header += `${machiAzaName},${lastBytePos},${section.length}\n`;
      headerData.push({
        name: machiAzaName,
        offset: lastBytePos,
        length: section.length,
      });

      lastBytePos += section.length;
    }
    const headerBuf = Buffer.from(header + '=END=\n', 'utf8');
    if (headerBuf.length > headerMaxSize) {
      return createHeader(iterations + 1);
    } else {
      const padding = Buffer.alloc(headerMaxSize - headerBuf.length);
      padding.fill(0x20);
      return {
        iterations,
        data: headerData,
        buffer: Buffer.concat([headerBuf, padding])
      };
    }
  };

  const header = createHeader();
  return {
    headerIterations: header.iterations,
    headerData: header.data,
    data: Buffer.concat([header.buffer, ...outSections]),
  };
}

export async function outputChibanData(outDir: string, outFilename: string, apiData: ChibanApi) {
  if (apiData.length === 0) {
    return;
  }
  // const machiAzaJSON = path.join(outDir, 'ja', outFilename + '.json');
  // await fs.promises.writeFile(outFile, JSON.stringify(apiData, null, 2));

  const outFileTXT = path.join(outDir, 'ja', outFilename + '-地番.txt');
  const txt = serializeApiDataTxt(apiData);
  await fs.promises.mkdir(path.dirname(outFileTXT), { recursive: true });
  await fs.promises.writeFile(outFileTXT, txt.data);

  console.log(`${outFilename}: ${apiData.length.toString(10).padEnd(4, ' ')} 件の町字の地番を出力した`);
}
