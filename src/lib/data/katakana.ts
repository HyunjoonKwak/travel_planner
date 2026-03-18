import type { KanaChar } from "@/types/learn";

export const KATAKANA_BASIC: ReadonlyArray<KanaChar> = [
  // A row
  { char: "ア", romaji: "a", row: "a", type: "basic" },
  { char: "イ", romaji: "i", row: "a", type: "basic" },
  { char: "ウ", romaji: "u", row: "a", type: "basic" },
  { char: "エ", romaji: "e", row: "a", type: "basic" },
  { char: "オ", romaji: "o", row: "a", type: "basic" },
  // Ka row
  { char: "カ", romaji: "ka", row: "ka", type: "basic" },
  { char: "キ", romaji: "ki", row: "ka", type: "basic" },
  { char: "ク", romaji: "ku", row: "ka", type: "basic" },
  { char: "ケ", romaji: "ke", row: "ka", type: "basic" },
  { char: "コ", romaji: "ko", row: "ka", type: "basic" },
  // Sa row
  { char: "サ", romaji: "sa", row: "sa", type: "basic" },
  { char: "シ", romaji: "shi", row: "sa", type: "basic" },
  { char: "ス", romaji: "su", row: "sa", type: "basic" },
  { char: "セ", romaji: "se", row: "sa", type: "basic" },
  { char: "ソ", romaji: "so", row: "sa", type: "basic" },
  // Ta row
  { char: "タ", romaji: "ta", row: "ta", type: "basic" },
  { char: "チ", romaji: "chi", row: "ta", type: "basic" },
  { char: "ツ", romaji: "tsu", row: "ta", type: "basic" },
  { char: "テ", romaji: "te", row: "ta", type: "basic" },
  { char: "ト", romaji: "to", row: "ta", type: "basic" },
  // Na row
  { char: "ナ", romaji: "na", row: "na", type: "basic" },
  { char: "ニ", romaji: "ni", row: "na", type: "basic" },
  { char: "ヌ", romaji: "nu", row: "na", type: "basic" },
  { char: "ネ", romaji: "ne", row: "na", type: "basic" },
  { char: "ノ", romaji: "no", row: "na", type: "basic" },
  // Ha row
  { char: "ハ", romaji: "ha", row: "ha", type: "basic" },
  { char: "ヒ", romaji: "hi", row: "ha", type: "basic" },
  { char: "フ", romaji: "fu", row: "ha", type: "basic" },
  { char: "ヘ", romaji: "he", row: "ha", type: "basic" },
  { char: "ホ", romaji: "ho", row: "ha", type: "basic" },
  // Ma row
  { char: "マ", romaji: "ma", row: "ma", type: "basic" },
  { char: "ミ", romaji: "mi", row: "ma", type: "basic" },
  { char: "ム", romaji: "mu", row: "ma", type: "basic" },
  { char: "メ", romaji: "me", row: "ma", type: "basic" },
  { char: "モ", romaji: "mo", row: "ma", type: "basic" },
  // Ya row
  { char: "ヤ", romaji: "ya", row: "ya", type: "basic" },
  { char: "ユ", romaji: "yu", row: "ya", type: "basic" },
  { char: "ヨ", romaji: "yo", row: "ya", type: "basic" },
  // Ra row
  { char: "ラ", romaji: "ra", row: "ra", type: "basic" },
  { char: "リ", romaji: "ri", row: "ra", type: "basic" },
  { char: "ル", romaji: "ru", row: "ra", type: "basic" },
  { char: "レ", romaji: "re", row: "ra", type: "basic" },
  { char: "ロ", romaji: "ro", row: "ra", type: "basic" },
  // Wa row
  { char: "ワ", romaji: "wa", row: "wa", type: "basic" },
  { char: "ヲ", romaji: "wo", row: "wa", type: "basic" },
  // N
  { char: "ン", romaji: "n", row: "n", type: "basic" },
];

export const KATAKANA_DAKUTEN: ReadonlyArray<KanaChar> = [
  { char: "ガ", romaji: "ga", row: "ga", type: "dakuten" },
  { char: "ギ", romaji: "gi", row: "ga", type: "dakuten" },
  { char: "グ", romaji: "gu", row: "ga", type: "dakuten" },
  { char: "ゲ", romaji: "ge", row: "ga", type: "dakuten" },
  { char: "ゴ", romaji: "go", row: "ga", type: "dakuten" },
  { char: "ザ", romaji: "za", row: "za", type: "dakuten" },
  { char: "ジ", romaji: "ji", row: "za", type: "dakuten" },
  { char: "ズ", romaji: "zu", row: "za", type: "dakuten" },
  { char: "ゼ", romaji: "ze", row: "za", type: "dakuten" },
  { char: "ゾ", romaji: "zo", row: "za", type: "dakuten" },
  { char: "ダ", romaji: "da", row: "da", type: "dakuten" },
  { char: "ヂ", romaji: "di", row: "da", type: "dakuten" },
  { char: "ヅ", romaji: "du", row: "da", type: "dakuten" },
  { char: "デ", romaji: "de", row: "da", type: "dakuten" },
  { char: "ド", romaji: "do", row: "da", type: "dakuten" },
  { char: "バ", romaji: "ba", row: "ba", type: "dakuten" },
  { char: "ビ", romaji: "bi", row: "ba", type: "dakuten" },
  { char: "ブ", romaji: "bu", row: "ba", type: "dakuten" },
  { char: "ベ", romaji: "be", row: "ba", type: "dakuten" },
  { char: "ボ", romaji: "bo", row: "ba", type: "dakuten" },
];

export const KATAKANA_HANDAKUTEN: ReadonlyArray<KanaChar> = [
  { char: "パ", romaji: "pa", row: "pa", type: "handakuten" },
  { char: "ピ", romaji: "pi", row: "pa", type: "handakuten" },
  { char: "プ", romaji: "pu", row: "pa", type: "handakuten" },
  { char: "ペ", romaji: "pe", row: "pa", type: "handakuten" },
  { char: "ポ", romaji: "po", row: "pa", type: "handakuten" },
];

export const ALL_KATAKANA: ReadonlyArray<KanaChar> = [
  ...KATAKANA_BASIC,
  ...KATAKANA_DAKUTEN,
  ...KATAKANA_HANDAKUTEN,
];
