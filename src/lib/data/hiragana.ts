import type { KanaChar } from "@/types/learn";

export const HIRAGANA_BASIC: ReadonlyArray<KanaChar> = [
  // A row
  { char: "あ", romaji: "a", row: "a", type: "basic" },
  { char: "い", romaji: "i", row: "a", type: "basic" },
  { char: "う", romaji: "u", row: "a", type: "basic" },
  { char: "え", romaji: "e", row: "a", type: "basic" },
  { char: "お", romaji: "o", row: "a", type: "basic" },
  // Ka row
  { char: "か", romaji: "ka", row: "ka", type: "basic" },
  { char: "き", romaji: "ki", row: "ka", type: "basic" },
  { char: "く", romaji: "ku", row: "ka", type: "basic" },
  { char: "け", romaji: "ke", row: "ka", type: "basic" },
  { char: "こ", romaji: "ko", row: "ka", type: "basic" },
  // Sa row
  { char: "さ", romaji: "sa", row: "sa", type: "basic" },
  { char: "し", romaji: "shi", row: "sa", type: "basic" },
  { char: "す", romaji: "su", row: "sa", type: "basic" },
  { char: "せ", romaji: "se", row: "sa", type: "basic" },
  { char: "そ", romaji: "so", row: "sa", type: "basic" },
  // Ta row
  { char: "た", romaji: "ta", row: "ta", type: "basic" },
  { char: "ち", romaji: "chi", row: "ta", type: "basic" },
  { char: "つ", romaji: "tsu", row: "ta", type: "basic" },
  { char: "て", romaji: "te", row: "ta", type: "basic" },
  { char: "と", romaji: "to", row: "ta", type: "basic" },
  // Na row
  { char: "な", romaji: "na", row: "na", type: "basic" },
  { char: "に", romaji: "ni", row: "na", type: "basic" },
  { char: "ぬ", romaji: "nu", row: "na", type: "basic" },
  { char: "ね", romaji: "ne", row: "na", type: "basic" },
  { char: "の", romaji: "no", row: "na", type: "basic" },
  // Ha row
  { char: "は", romaji: "ha", row: "ha", type: "basic" },
  { char: "ひ", romaji: "hi", row: "ha", type: "basic" },
  { char: "ふ", romaji: "fu", row: "ha", type: "basic" },
  { char: "へ", romaji: "he", row: "ha", type: "basic" },
  { char: "ほ", romaji: "ho", row: "ha", type: "basic" },
  // Ma row
  { char: "ま", romaji: "ma", row: "ma", type: "basic" },
  { char: "み", romaji: "mi", row: "ma", type: "basic" },
  { char: "む", romaji: "mu", row: "ma", type: "basic" },
  { char: "め", romaji: "me", row: "ma", type: "basic" },
  { char: "も", romaji: "mo", row: "ma", type: "basic" },
  // Ya row
  { char: "や", romaji: "ya", row: "ya", type: "basic" },
  { char: "ゆ", romaji: "yu", row: "ya", type: "basic" },
  { char: "よ", romaji: "yo", row: "ya", type: "basic" },
  // Ra row
  { char: "ら", romaji: "ra", row: "ra", type: "basic" },
  { char: "り", romaji: "ri", row: "ra", type: "basic" },
  { char: "る", romaji: "ru", row: "ra", type: "basic" },
  { char: "れ", romaji: "re", row: "ra", type: "basic" },
  { char: "ろ", romaji: "ro", row: "ra", type: "basic" },
  // Wa row
  { char: "わ", romaji: "wa", row: "wa", type: "basic" },
  { char: "を", romaji: "wo", row: "wa", type: "basic" },
  // N
  { char: "ん", romaji: "n", row: "n", type: "basic" },
];

export const HIRAGANA_DAKUTEN: ReadonlyArray<KanaChar> = [
  { char: "が", romaji: "ga", row: "ga", type: "dakuten" },
  { char: "ぎ", romaji: "gi", row: "ga", type: "dakuten" },
  { char: "ぐ", romaji: "gu", row: "ga", type: "dakuten" },
  { char: "げ", romaji: "ge", row: "ga", type: "dakuten" },
  { char: "ご", romaji: "go", row: "ga", type: "dakuten" },
  { char: "ざ", romaji: "za", row: "za", type: "dakuten" },
  { char: "じ", romaji: "ji", row: "za", type: "dakuten" },
  { char: "ず", romaji: "zu", row: "za", type: "dakuten" },
  { char: "ぜ", romaji: "ze", row: "za", type: "dakuten" },
  { char: "ぞ", romaji: "zo", row: "za", type: "dakuten" },
  { char: "だ", romaji: "da", row: "da", type: "dakuten" },
  { char: "ぢ", romaji: "di", row: "da", type: "dakuten" },
  { char: "づ", romaji: "du", row: "da", type: "dakuten" },
  { char: "で", romaji: "de", row: "da", type: "dakuten" },
  { char: "ど", romaji: "do", row: "da", type: "dakuten" },
  { char: "ば", romaji: "ba", row: "ba", type: "dakuten" },
  { char: "び", romaji: "bi", row: "ba", type: "dakuten" },
  { char: "ぶ", romaji: "bu", row: "ba", type: "dakuten" },
  { char: "べ", romaji: "be", row: "ba", type: "dakuten" },
  { char: "ぼ", romaji: "bo", row: "ba", type: "dakuten" },
];

export const HIRAGANA_HANDAKUTEN: ReadonlyArray<KanaChar> = [
  { char: "ぱ", romaji: "pa", row: "pa", type: "handakuten" },
  { char: "ぴ", romaji: "pi", row: "pa", type: "handakuten" },
  { char: "ぷ", romaji: "pu", row: "pa", type: "handakuten" },
  { char: "ぺ", romaji: "pe", row: "pa", type: "handakuten" },
  { char: "ぽ", romaji: "po", row: "pa", type: "handakuten" },
];

export const ALL_HIRAGANA: ReadonlyArray<KanaChar> = [
  ...HIRAGANA_BASIC,
  ...HIRAGANA_DAKUTEN,
  ...HIRAGANA_HANDAKUTEN,
];
