const chibanSortMap: { [key: string]: string } = {};
const digit = 3;
// 数値: 0-9
for (let i = 0; i <= 9; i++) {
  chibanSortMap[`${i}`] = `${i}`.padStart(digit, '0');
}
let offset = Object.keys(chibanSortMap).length;

// 十干: 甲乙丙丁戊己庚辛壬癸
const jikkan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
for (let i = 0; i < jikkan.length; i++) {
  chibanSortMap[jikkan[i]] = (offset + i).toString().padStart(digit, '0');
}
offset = Object.keys(chibanSortMap).length;

// イロハ: イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセスン
const irohaKatakana = [
  'イ','ロ','ハ','ニ','ホ','ヘ','ト','チ','リ','ヌ','ル','ヲ','ワ','カ','ヨ','タ','レ','ソ','ツ','ネ','ナ','ラ','ム','ウ',
  'ヰ','ノ','オ','ク','ヤ','マ','ケ','フ','コ','エ','テ','ア','サ','キ','ユ','メ','ミ','シ','ヱ','ヒ','モ','セ','ス','ン'
];
for (let i = 0; i < irohaKatakana.length; i++) {
  chibanSortMap[irohaKatakana[i]] = (offset + i).toString().padStart(digit, '0');
}
offset = Object.keys(chibanSortMap).length;

// いろは: いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせすん
const irohaHiragana = [
  'い','ろ','は','に','ほ','へ','と','ち','り','ぬ','る','を','わ','か','よ','た','れ','そ','つ','ね','な','ら','む','う',
  'ゐ','の','お','く','や','ま','け','ふ','こ','え','て','あ','さ','き','ゆ','め','み','し','ゑ','ひ','も','せ','す','ん'
];
for (let i = 0; i < irohaHiragana.length; i++) {
  chibanSortMap[irohaHiragana[i]] = (offset + i).toString().padStart(digit, '0');
}
offset = Object.keys(chibanSortMap).length;

// 十二支: 子丑寅卯辰巳午未申酉戌亥
const junishi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
for (let i = 0; i < junishi.length; i++) {
  chibanSortMap[junishi[i]] = (offset + i).toString().padStart(digit, '0');
}
offset = Object.keys(chibanSortMap).length;

// 耕地/東西南北/内外/上中下
const kochi = ['耕','地', '東','西','南','北', '内','外', '上','中','下'];
for (let i = 0; i < kochi.length; i++) {
  chibanSortMap[kochi[i]] = (offset + i).toString().padStart(digit, '0');
}
offset = Object.keys(chibanSortMap).length;

// アルファベット: A-U
const alphabet = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U'
];
for (let i = 0; i < alphabet.length; i++) {
  chibanSortMap[alphabet[i]] = (offset + i).toString().padStart(digit, '0');
}

// console.log(chibanSortMap);
export { chibanSortMap };
