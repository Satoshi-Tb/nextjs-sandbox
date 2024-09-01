import React, { ReactElement, ReactNode } from "react";
import parse, {
  DOMNode,
  HTMLReactParserOptions,
  Text,
  Element,
  domToReact,
} from "html-react-parser";
import Link from "next/link";
import { renderToString } from "react-dom/server";

type HighlightSetting = {
  keyword: string;
  color: string;
};

// オプションサンプル：タグ除去
const optTagStrip: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    // console.dir(domNode, { depth: null });
    // DOMNodeがElement（タグ）である場合、除去(<></>に置換)
    if (domNode instanceof Element && domNode.type === "tag") {
      // 再帰的に子要素を処理する
      return <>{domToReact(domNode.children, optTagStrip)}</>;
    }
    return;
  },
};

// オプションサンプル：タグ置換
// テキストノードをハイライトする関数
const highlightText = (text: string, keyword: string, color: string) => {
  const regexp = new RegExp(`(${keyword})`, "gi");
  return text.replace(
    regexp,
    (match) =>
      `<span style="background-color: ${color}; font-weight: bold;">${match}</span>`
  );
};

// ハイライト設定
const highlightSetting: HighlightSetting = {
  keyword: "GPT",
  color: "yellow",
};
const highlightSettings = [highlightSetting, { keyword: "open", color: "red" }];

// ハイライトサンプル1
const optHighlight1: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    // console.dir(domNode, { depth: null });
    // Textノードを処理
    if (domNode instanceof Text) {
      const text = domNode.data;

      // キーワードで元のtextを分割し、キーワードをハイライトタグでラップしたJSXオブジェクトを追加しながら
      // JSXまたはstringの配列を構築する
      const jsxElements = text
        .split(highlightSetting.keyword)
        .reduce((prev, curr, i) => {
          if (i !== 0) {
            prev.push(
              <span style={{ backgroundColor: highlightSetting.color }}>
                {highlightSetting.keyword}
              </span>
            );
          }
          prev.push(curr);
          return prev;
        }, [] as (string | JSX.Element)[]);

      return <>{jsxElements}</>;
    }
    return;
  },
};

// 英数字全角→半角英数
const toHalfWidth = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 半角英数→全角英数
const toFullWidth = (str: string) =>
  str.replace(/[A-Za-z0-9]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });

// カタカナ→ひらがな
const kanaToHira = (str: string) =>
  str.replace(/[\u30a1-\u30f6]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0x60);
  });

// ひらがな→カタカナ
const hiraToKana = (str: string) =>
  str.replace(/[\u3041-\u3096]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0x60);
  });

// 半角カナ→全角カナ
// キーワード検索処理の都合、濁音、半濁音記号は独立した１文字として変換する（文字数が変わらないようにしたいため）
const kanaHalfToFull = (str: string) => {
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
const normalizeText = (src: string) => {
  let result = src;
  result = toHalfWidth(result);
  result = result.toLowerCase();
  result = kanaHalfToFull(result);
  result = kanaToHira(result);
  return result;
};

// ハイライトサンプル2
const optHighlight2: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    // console.dir(domNode, { depth: null });
    // Textノードを処理
    if (domNode instanceof Text) {
      const textOrg = domNode.data;

      // キーワード検索のため、キーワードと検索対象文字列をノーマライズ
      const normalizedSearchText = normalizeText(highlightSetting.keyword);
      const normalizedInputText = normalizeText(textOrg);

      // キーワードヒット位置を取得
      const regex = new RegExp(`(${normalizedSearchText})`, "g"); // 正規表現構築

      let match;
      const matchResult: { index: number; len: number }[] = []; // 検索結果(検索ヒット位置と、キーワード文字数)

      // ノーマライズ結果に対して、全ての検索ヒット位置を取得
      while ((match = regex.exec(normalizedInputText)) !== null) {
        // console.log(
        //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
        // );
        matchResult.push({
          index: match.index,
          len: normalizedSearchText.length,
        });
      }

      // 元の文書から検索ヒット位置に該当するワードを抽出し、ハイライトタグを付与
      const jsxElements: (string | JSX.Element)[] = [];
      let ptr = 0;
      matchResult.forEach((m) => {
        jsxElements.push(textOrg.slice(ptr, m.index));
        jsxElements.push(
          <span style={{ backgroundColor: highlightSetting.color }}>
            {textOrg.slice(m.index, m.index + m.len)}
          </span>
        );
        ptr = m.index + m.len;
      });
      jsxElements.push(textOrg.slice(ptr));

      return <>{jsxElements}</>;
    }
    return;
  },
};

// mainコンポーネント
const HighLightSample4 = () => {
  // 原文
  const htmlString = `
  <p>
  <b>ChatGPT</b>（チャットジーピーティー、英語: Chat Generative Pre-trained Transformer）[1]は、OpenAIが2022年11月に公開した人工知能チャットボットであり、生成AIの一種。
  GPTの原語のGenerative Pre-trained Transformerとは、「生成可能な事前学習済み変換器」という意味である[2]。OpenAIの<a href="/wiki/GPT-3" title="GPT-3">GPT-3</a>ファミリーの大規模な言語モデルに基づいて構築されており、教師あり学習と強化学習の両方の手法を使って転移学習され、機械学習のサブセットである深層学習を使って開発されている[3]。Gptモデルにはgpt 3.5, ＧＰＴ4等がある。
  <img src="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/150px-ChatGPT_logo.svg.png" decoding="async" width="150" height="150" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/225px-ChatGPT_logo.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/300px-ChatGPT_logo.svg.png 2x" data-file-width="512" data-file-height="512">
  </p>
    `;

  return (
    <div>
      <DisplayCard key={1} title="オリジナルHTML" planeHtml={htmlString} />
      <hr />
      <DisplayCard
        key={2}
        title="タグ除去"
        planeHtml={htmlString}
        parseOptions={optTagStrip}
      />
      <hr />
      <DisplayCard
        key={3}
        title="ハイライトその１"
        description="単一ワードのみ/完全一致（大文字小文字や、全角半角対応なし）"
        planeHtml={htmlString}
        parseOptions={optHighlight1}
      />
      <hr />
      <DisplayCard
        key={4}
        title="ハイライトその２"
        description="単一ワードのみ/大文字小文字、全角半角区別なし"
        planeHtml={htmlString}
        parseOptions={optHighlight2}
      />
      <div style={{ display: "flex" }}>
        <div style={{ marginTop: "20px" }}>
          <Link href="/">Homeに戻る</Link>
        </div>
      </div>
    </div>
  );
};

// 表示用レイアウトコンポーネント
type DisplayCardProps = {
  title: string;
  description?: string;
  planeHtml: string;
  parseOptions?: HTMLReactParserOptions;
};
const DisplayCard = ({
  title,
  description,
  planeHtml,
  parseOptions,
}: DisplayCardProps) => {
  return (
    <>
      <div style={{ textDecoration: "underline" }}>{title}</div>
      {description && <div>{description}</div>}
      <div style={{ display: "flex" }}>
        <div>
          <div style={{ padding: "5px" }}>Plain HTML</div>
          <div
            style={{
              border: "1px solid black",
              width: "700px",
              background: "white",
              margin: "10px",
            }}
          >
            <div style={{ padding: "5px" }}>{planeHtml}</div>
          </div>
        </div>
        <div>
          <div style={{ padding: "5px" }}>HTML</div>
          <div
            style={{
              border: "1px solid black",
              width: "700px",
              background: "white",
              margin: "10px",
            }}
          >
            <div style={{ padding: "5px" }}>
              {parse(planeHtml, parseOptions)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HighLightSample4;
