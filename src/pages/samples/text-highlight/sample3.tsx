import React from "react";
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact,
} from "html-react-parser";
import Link from "next/link";
import { normalizeForHighlight } from "@/utils/stringUtil";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

type HighlightSetting = {
  keyword: string;
  color: string;
  enable?: boolean; // キーワードごとにON/OFFしたい場合など
};

// ハイライト設定
const sampleHighlightSettings: HighlightSetting[] = [
  { keyword: "highlight", color: "yellow" },
  { keyword: "ハイライト", color: "green" },
  { keyword: "high", color: "red" },
  { keyword: "version", color: "lightblue" },
  { keyword: "span", color: "lime" },
  { keyword: "style", color: "lime" },
];

// 指定されたテキストのキーワード文言に、ハイライトタグ（spanタグ）を設定する
// TODO <>のハイライトができない。&lt;、&gt;でもダメ。記号も全角変換したほうがよいか。その場合、"や\の扱いどうするか要検討
const applyHighlight = (keyword: string, color: string, text: string) => {
  const normalizedKeyword = normalizeForHighlight(keyword); // キーワードのノーマライズ
  const normalizedInputText = normalizeForHighlight(text); // 対象文字列のノーマライズ

  const regex = new RegExp(
    `(${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, // 正規表現構築時に、特殊文字をエスケープする
    "g"
  ); // 正規表現構築

  let match;
  let resultStr = "";
  let ptr = 0;

  // ノーマライズ結果に対して、全ての検索ヒット位置を取得
  while ((match = regex.exec(normalizedInputText)) !== null) {
    // console.log(
    //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
    // );
    resultStr += text.slice(ptr, match.index);
    resultStr +=
      `<span style="background-color: ${color}; font-weight: bold;">` +
      text.slice(match.index, match.index + normalizedKeyword.length) +
      "</span>";
    ptr = match.index + normalizedKeyword.length;
  }

  resultStr += text.slice(ptr);
  return resultStr;
};

const applyHighlightNode = (keyword: string, color: string, text: string) => {
  const normalizedKeyword = normalizeForHighlight(keyword); // キーワードのノーマライズ
  const normalizedInputText = normalizeForHighlight(text); // 対象文字列のノーマライズ

  const regex = new RegExp(
    `(${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, // 正規表現構築時に、特殊文字をエスケープする
    "g"
  ); // 正規表現構築

  let match;
  let resultStr = "";
  let ptr = 0;

  const jsxElements: (string | JSX.Element)[] = [];
  // ノーマライズ結果に対して、全ての検索ヒット位置を取得
  while ((match = regex.exec(normalizedInputText)) !== null) {
    // console.log(
    //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
    // );
    jsxElements.push(text.slice(ptr, match.index));
    jsxElements.push(
      <span style={{ backgroundColor: color, fontWeight: "bold" }}>
        {text.slice(match.index, match.index + normalizedKeyword.length)}
      </span>
    );
    ptr = match.index + normalizedKeyword.length;
  }

  jsxElements.push(text.slice(ptr));
  return jsxElements;
};

// 特定の文字列をハイライトするためのカスタム変換関数
const optHighlightSample = (
  settings: HighlightSetting[]
): HTMLReactParserOptions => {
  return {
    replace: (domNode) => {
      console.log("domNode", domNode);
      if (domNode instanceof Text) {
        let highlightedText = domNode.data;

        // ハイライト設定分、テキストを置換
        settings.forEach(({ keyword: searchText, color }) => {
          console.log("highlightedText", {
            org: highlightedText,
            splited: highlightedText.split(/(<[^>]+>)/),
          });
          highlightedText = highlightedText
            .split(/(<[^>]+>)/) // HTMLタグごとに文字列分割
            .filter(Boolean)
            .map((chunk) => {
              if (chunk.includes("<")) return chunk; // タグは処理しない
              return applyHighlight(searchText, color, chunk); // テキストにはハイライト用タグをセット
            })
            .join("");
        });

        return <>{parse(highlightedText)}</>; // 再帰的に変換するために再度parseを呼び出す
      }
    },
  };
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

const HighLightSample3 = () => {
  const htmlString = `
    <div>
      <h1>Hello, World!</h1>
      <p>
      This is a sample HTML string with some text to <u>highlight</u>. Let's highlight the words 'highlight' and 'ハイライト' and 'version'.<br/>Ignore upper/lower case: Version, VERSION, ｖｅｒｓｉｏｎ, ＶerＳION
      <img src="https://www.j-platpat.inpit.go.jp/gazette_work/domestic/A/419289000/419289100/419289140/419289141/7239EB7A6A04F265EADF0B7910FBA631E4E0BFE2EACC7203C2F97822A65C5B3A/text/JPA 419289141_i_000004.jpg?version=202408280639"></img>
      タグ文字列、例えば<span style="text-decoration: underline;">&amp;lt;span&amp;gt;や&amp;lt;style&amp;gt;といった文字列はハイライト対象から無視されます</span><br/>
      タグ括弧の中身のテスト<ハイライト><br />
      エスケープ文字のテスト&lt;ハイライト&gt;
      </p>
    </div>
  `;

  const testString1 =
    "ロボット/ロボツト/ロホット/ろぼっと/ろぼつと/ろほっと/ﾛﾎﾞｯﾄ/ﾛﾎﾞﾂﾄ/ﾛﾎｯﾄ";
  const testSettings1: HighlightSetting[] = [
    { keyword: "ロボット", color: "yellow" },
    { keyword: "ロボツト", color: "yellow" },
    { keyword: "ロホット", color: "yellow" },
    { keyword: "ろぼっと", color: "yellow" },
    { keyword: "ろぼつと", color: "yellow" },
    { keyword: "ろほっと", color: "yellow" },
    { keyword: "ﾛﾎﾞｯﾄ", color: "yellow" },
    { keyword: "ﾛﾎﾞﾂﾄ", color: "yellow" },
    { keyword: "ﾛﾎｯﾄ", color: "yellow" },
  ];

  const testString2 = "ABC!\\ /abc!\\ /Abc!\\ /ａｂｃ！￥　/ＡＢＣ！／　";
  const testSettings2: HighlightSetting[] = [
    { keyword: "ABC!\\ ", color: "yellow" },
    { keyword: "abc!\\ ", color: "yellow" },
    { keyword: "abC!\\ ", color: "yellow" },
    { keyword: "ＡＢＣ！￥　", color: "yellow" },
    { keyword: "ａｂｃ！／ ", color: "yellow" },
    { keyword: "ａｂｃ!\\　", color: "yellow" },
    { keyword: "ABC！￥ ", color: "yellow" },
  ];

  const alphaNumTest = [
    "a",
    "b",
    "c",
    "A",
    "B",
    "C",
    "ｂ",
    "ｃ",
    "0",
    "1",
    "０",
    "１",
  ];

  const symbolTest = [
    "　",
    "！",
    "”",
    "“",
    "＃",
    "＄",
    "％",
    "＆",
    "’",
    "（",
    "）",
    "＊",
    "＋",
    "，",
    "－",
    "．",
    "￥",
    "／",
    "；",
    "＜",
    "＝",
    "＞",
    "？",
    "＠",
    "［",
    "＼",
    "］",
    "＾",
    "＿",
    "‘",
    "｛",
    "｜",
    "｝",
    "～",
    " ",
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "\\",
    ";",
    //    ">",
    //    "<",
    "=",
    "?",
    "@",
    "[",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
    // "&lt;",
    // "&gt;",
  ];
  const symbolTestString = symbolTest.join(" ");

  // 結論：半角タグ文字はマッチに使えない。がんばったら、&lt;をマッチ文字にできるが、ややこしいから禁止にした方がよい

  // ケース1:対象文字列中にタグ文字で囲まれた文字列がある場合、タグ文字を含めて、タグ内部の文言はハイライト対象にできない
  // 理由：タグ文字含めて、HTMLタグ解釈されるため。タグ分解の正規表現の精度を上げれば回避できるが、一律NGにした方がよい。
  //  そもそも生のタグ文字はデータに含まれていないはず。-> 入力チェック制限にした方が良い
  const symbolTest2String =
    "タグの前<タグ内部>タグの外　imgタグの前<img src='imgタグ内部'/>imgタグの外"; // タグ付き
  const tagSymbolTest: HighlightSetting[] = [
    { keyword: "<", color: "yellow" },
    { keyword: ">", color: "yellow" },
    { keyword: "&lt;", color: "yellow" },
    { keyword: "&gt;", color: "yellow" },
    { keyword: "&amp;lt;", color: "yellow" },
    { keyword: "&amp;gt;", color: "yellow" },
    { keyword: "タグ内部", color: "yellow" },
  ];

  // ケース2:タグ文字で囲んだ場合と結果は同様。parseライブラリの仕様のため、加工処理の段階でエスケープ文字は対応する記号に変換される
  const symbolTest3String =
    "エスケープ文字を利用したタグの前&lt;タグ内部&gt;タグの外　imgタグの前&lt;img src='imgタグ内部'/&gt;imgタグの外"; // タグ付き

  // ケース3:エスケープ文字(&)もエスケープする場合。parseライブラリのエスケープ解決は1段階まで。つまり&amp;→&変換まで。
  // ゆえに、&文字のエスケープまで行わないと、厳密にXSSのガードにならない
  const symbolTest4String =
    "エスケープ文字を利用(＆もエスケープ）したタグの前&amp;lt;タグ内部&amp;gt;タグの外　imgタグの前&amp;lt;img src='imgタグ内部'/&amp;gt;imgタグの外"; // タグ付き

  return (
    <>
      <h2>html-react-parseのテスト</h2>
      <h4>ハイライト設定</h4>
      {sampleHighlightSettings.map((item, i) => (
        <div>
          {i}:{item.keyword}, {item.color}
        </div>
      ))}
      <br />
      <DisplayCard key={1} title="原文" planeHtml={htmlString} />
      <hr />
      <DisplayCard
        key={2}
        title="タグ削除"
        planeHtml={htmlString}
        parseOptions={optTagStrip}
      />
      <hr />
      <DisplayCard
        key={3}
        title="ハイライト化（文字列置換）"
        planeHtml={htmlString}
        parseOptions={optHighlightSample(sampleHighlightSettings)}
      />
      <h4>別のやり方</h4>
      <h4>原文：{htmlString}</h4>
      <HighlightKeywords2
        text={htmlString}
        settings={sampleHighlightSettings}
        enableHighlight={true}
      />
      {symbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s}</h4>
          <HighlightKeywords
            key={i}
            text={symbolTestString}
            settings={[{ keyword: s, color: "yellow" }]}
          />
        </>
      ))}
      <h4>原文：{symbolTest2String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          ハイライト結果：
          <HighlightKeywords key={i} text={symbolTest2String} settings={[s]} />
        </>
      ))}
      <h4>原文：{symbolTest3String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          ハイライト結果：
          <HighlightKeywords key={i} text={symbolTest3String} settings={[s]} />
        </>
      ))}
      <h4>原文：{symbolTest4String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          <HighlightKeywords key={i} text={symbolTest4String} settings={[s]} />
        </>
      ))}
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
      </div>
    </>
  );
};

// ハイライトコンポーネントサンプル
type HighlightKeywordsProps = {
  text: string;
  settings?: HighlightSetting[];
  enableHighlight?: boolean;
};
/**
 * ハイライト用コンポーネントサンプル。parseを利用するため、すべてのタグ文字列がHTMLタグとして解釈される点に注意
 */
const HighlightKeywords = ({
  text,
  settings = [],
  enableHighlight = true,
}: HighlightKeywordsProps) => {
  return (
    <>{enableHighlight ? parse(text, optHighlightSample(settings)) : text}</>
  );
};

/**
 * または関数のみ
 * こちらのほうがparse利用が分かりやすい。こちらの方がよいか
 */
const parseAndHighlight = (
  text: string,
  settings: HighlightSetting[],
  hilightEnable: boolean = true
) => {
  return hilightEnable ? parse(text, optHighlightSample(settings)) : text;
};

/**
 * 別のやり方。
 * 文字列→ハイライトタグ付与→parse→文字列→ハイライトタグ付与→parse…を繰り返す方法
 * このやり方だと、HTMLタグ内の文字列も置換対象にできる。
 */
const HighlightKeywords2 = ({
  text,
  settings = [],
  enableHighlight = true,
}: HighlightKeywordsProps) => {
  if (!enableHighlight) return text;
  const result = settings.reduce((prevText, s, idx) => {
    console.log(`parse ${idx + 1} start`, {
      initialText: prevText,
      setting: s,
    });
    const jsx = parse(prevText, {
      replace: (domNode) => {
        if (domNode instanceof Text) {
          return <>{applyHighlightNode(s.keyword, s.color, domNode.data)}</>;
        }
      },
    });
    return renderToStaticMarkup(<>{jsx}</>);
  }, text);
  return parse(result);
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
export default HighLightSample3;
