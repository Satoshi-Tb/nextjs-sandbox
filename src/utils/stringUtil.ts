// 英数字全角→半角英数
export const toHalfWidth = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 半角英数→全角英数
export const toFullWidth = (str: string) =>
  str.replace(/[A-Za-z0-9]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });

// 全角記号(ASCII)→半角記号
export const synmbolFullToHalf = (str: string) => {
  const kanaMap: { [key: string]: string } = {
    "　": " ",
    "！": "!",
    "”": '"',
    "“": '"',
    "＃": "#",
    "＄": "$",
    "％": "%",
    "＆": "&",
    "’": "'",
    "（": "(",
    "）": ")",
    "＊": "*",
    "＋": "+",
    "，": ",",
    "－": "-",
    "．": ".",
    "￥": "\\",
    "／": "\\",
    "；": ";",
    "＜": "<",
    "＝": "=",
    "＞": ">",
    "？": "?",
    "＠": "@",
    "［": "[",
    "＼": "\\",
    "］": "]",
    "＾": "^",
    "＿": "_",
    "‘": "`",
    "｛": "{",
    "｜": "|",
    "｝": "}",
    "～": "~",
  };

  const reg = new RegExp("(" + Object.keys(kanaMap).join("|") + ")", "g");
  return str.replace(reg, (match) => kanaMap[match] || match);
};

// カタカナ→ひらがな
export const kanaToHira = (str: string) =>
  str.replace(/[\u30a1-\u30f6]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0x60);
  });

// ひらがな→カタカナ
export const hiraToKana = (str: string) =>
  str.replace(/[\u3041-\u3096]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0x60);
  });

// 半角カナ→全角カナ
// キーワード検索処理の都合、濁音、半濁音記号は独立した１文字として変換する（文字数が変わらないようにしたいため）
export const kanaHalfToFull = (str: string) => {
  const kanaMap: { [key: string]: string } = {
    // ｶﾞ: "カ゛",
    // ｷﾞ: "キ゛",
    // ｸﾞ: "ク゛",
    // ｹﾞ: "ケ゛",
    // ｺﾞ: "コ゛",
    // ｻﾞ: "サ゛",
    // ｼﾞ: "シ゛",
    // ｽﾞ: "ス゛",
    // ｾﾞ: "セ゛",
    // ｿﾞ: "ソ゛",
    // ﾀﾞ: "タ゛",
    // ﾁﾞ: "チ゛",
    // ﾂﾞ: "ツ゛",
    // ﾃﾞ: "テ゛",
    // ﾄﾞ: "ト゛",
    // ﾊﾞ: "ハ゛",
    // ﾋﾞ: "ヒ゛",
    // ﾌﾞ: "フ゛",
    // ﾍﾞ: "ヘ゛",
    // ﾎﾞ: "ホ゛",
    // ﾊﾟ: "ハ゜",
    // ﾋﾟ: "ヒ゜",
    // ﾌﾟ: "フ゜",
    // ﾍﾟ: "ヘ゜",
    // ﾎﾟ: "ホ゜",
    // ｳﾞ: "ウ゛",
    // ﾜﾞ: "ワ゛",
    // ｦﾞ: "ヲ゛",
    ｱ: "ア",
    ｲ: "イ",
    ｳ: "ウ",
    ｴ: "エ",
    ｵ: "オ",
    ｶ: "カ",
    ｷ: "キ",
    ｸ: "ク",
    ｹ: "ケ",
    ｺ: "コ",
    ｻ: "サ",
    ｼ: "シ",
    ｽ: "ス",
    ｾ: "セ",
    ｿ: "ソ",
    ﾀ: "タ",
    ﾁ: "チ",
    ﾂ: "ツ",
    ﾃ: "テ",
    ﾄ: "ト",
    ﾅ: "ナ",
    ﾆ: "ニ",
    ﾇ: "ヌ",
    ﾈ: "ネ",
    ﾉ: "ノ",
    ﾊ: "ハ",
    ﾋ: "ヒ",
    ﾌ: "フ",
    ﾍ: "ヘ",
    ﾎ: "ホ",
    ﾏ: "マ",
    ﾐ: "ミ",
    ﾑ: "ム",
    ﾒ: "メ",
    ﾓ: "モ",
    ﾔ: "ヤ",
    ﾕ: "ユ",
    ﾖ: "ヨ",
    ﾗ: "ラ",
    ﾘ: "リ",
    ﾙ: "ル",
    ﾚ: "レ",
    ﾛ: "ロ",
    ﾜ: "ワ",
    ｦ: "ヲ",
    ﾝ: "ン",
    ｧ: "ァ",
    ｨ: "ィ",
    ｩ: "ゥ",
    ｪ: "ェ",
    ｫ: "ォ",
    ｯ: "ッ",
    ｬ: "ャ",
    ｭ: "ュ",
    ｮ: "ョ",
    "｡": "。",
    "､": "、",
    ｰ: "ー",
    "｢": "「",
    "｣": "」",
    "･": "・",
    ﾞ: "゛",
    ﾟ: "゜",
  };

  const reg = new RegExp("(" + Object.keys(kanaMap).join("|") + ")", "g");
  return str.replace(reg, (match) => kanaMap[match] || match);
};

export const synmbolFullToHalf = (str: string) => {
  const kanaMap: { [key: string]: string } = {
    "　": " ",
    "！": "!",
    "”": '"',
    "“": '"',
    "＃": "#",
    "＄": "$",
    "％": "%",
    "＆": "&",
    "’": "'",
    "（": "(",
    "）": ")",
    "＊": "*",
    "＋": "+",
    "，": ",",
    "－": "-",
    "．": ".",
    "／": "\\",
    "￥": "\\",
    "；": ";",
    "＜": "<",
    "＝": "=",
    "＞": ">",
    "？": "?",
    "＠": "@",
    "［": "[",
    "＼": "\\",
    "］": "]",
    "＾": "^",
    "＿": "_",
    "‘": "`",
    "｛": "{",
    "｜": "|",
    "｝": "}",
    "～": "~",
  };

  const reg = new RegExp("(" + Object.keys(kanaMap).join("|") + ")", "g");
  return str.replace(reg, (match) => kanaMap[match] || match);
};

// ・キーワードハイライト処理用の文字列ノーマライズ関数
//   英数字：大文字→小文字＆全角→半角
//   上記以外（カタカナ、ひらがな、記号）：半角→全角＆カタカナ→ひらがな
//   * 濁音、半濁音のマッチは不可能　ﾊﾞ⇔バ、ﾊﾟ⇔パ等
//   * 拗音、吃音の揺らぎ対応はしない　ぁ⇔あ、っ⇔つ等
// ・ライブラリ利用について
// jaconv 5.3KB
// moji 4.1KB
// snyk adviserでチェックしたが、どちらも差異はないか？
// 気になるのはメンテ名が少ない事（1, 2名）。直近メンテが数年前であること
// https://snyk.io/advisor/
// →ライブラリ容量や、メンテナンス、濁音・半濁音の対応を考えると自作でも良いように思える
// →jaconvはJava版がある。フロントとバックで仕様統一できる。
// →パフォーマンスで参考になることがあれば
export const normalizeForHighlight = (src: string) => {
  let result = src;
  // ASCII文字列は半角
  result = toHalfWidth(result);
  result = synmbolFullToHalf(result);
  result = result.toLowerCase();

  // ASCII以外の文字は全角
  result = kanaHalfToFull(result);
  result = kanaToHira(result);
  return result;
};
