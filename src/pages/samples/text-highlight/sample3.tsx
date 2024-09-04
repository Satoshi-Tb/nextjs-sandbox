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

type HighlightSetting = {
  keyword: string;
  color: string;
};

// ハイライト設定
const highlightSettings: HighlightSetting[] = [
  { keyword: "highlight", color: "yellow" },
  { keyword: "ハイライト", color: "green" },
  { keyword: "high", color: "red" },
  { keyword: "version", color: "lightblue" },
  { keyword: "span", color: "lime" },
  { keyword: "style", color: "lime" },
];

// 指定されたテキストのキーワード文言に、ハイライトタグ（spanタグ）を設定する
const applyHighlight = (keyword: string, color: string, text: string) => {
  const normalizedSearchText = normalizeForHighlight(keyword); // キーワードのノーマライズ
  const normalizedInputText = normalizeForHighlight(text); // 対象文字列のノーマライズ

  const regex = new RegExp(
    `(${normalizedSearchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, // 正規表現構築時に、特殊文字をエスケープする
    "g"
  ); // 正規表現構築

  let match;
  let resultStr = "";
  let ptr = 0;
  const matchResult: { index: number; len: number }[] = []; // 検索結果(検索ヒット位置と、キーワード文字数)
  // console.log("target", target);
  // console.log("search key", normalizedSearchText);

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

  matchResult.forEach((m, i) => {
    resultStr += text.slice(ptr, m.index);
    resultStr +=
      `<span style="background-color: ${color}; font-weight: bold;">` +
      text.slice(m.index, m.index + m.len) +
      "</span>";
    ptr = m.index + m.len;
  });

  resultStr += text.slice(ptr);
  return resultStr;
};

// 特定の文字列をハイライトするためのカスタム変換関数
const optHighlightSample = (
  settings: HighlightSetting[]
): HTMLReactParserOptions => {
  return {
    replace: (domNode) => {
      if (domNode instanceof Text) {
        let highlightedText = domNode.data;

        // ハイライト設定分、テキストを置換
        settings.forEach(({ keyword: searchText, color }) => {
          //console.log("split!", highlightedText.split(/(<[^>]+>)/));
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
      タグ文字列、例えば<span style="text-decoration: underline;">&amp;lt;span&amp;gt;や&amp;lt;style&amp;gt;といった文字列はハイライト対象から無視されます</span>
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
    "<",
    "=",
    ">",
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
    "&lt;",
    "&gt;",
  ];
  const symbolTestString = symbolTest.join(" ");

  return (
    <>
      <h2>html-react-parseのテスト</h2>
      <h4>ハイライト設定</h4>
      {highlightSettings.map((item, i) => (
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
        parseOptions={optHighlightSample(highlightSettings)}
      />
      {testSettings1.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          <Highlight key={i} text={testString1} settings={[s]} />
        </>
      ))}
      {testSettings2.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          <Highlight key={i} text={testString2} settings={[s]} />
        </>
      ))}
      {symbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s}</h4>
          <Highlight
            key={i}
            text={symbolTestString}
            settings={[{ keyword: s, color: "yellow" }]}
          />
        </>
      ))}
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
      </div>
    </>
  );
};

// ハイライトコンポーネントサンプル
type HighlighteComponentProps = {
  text: string;
  settings?: HighlightSetting[];
  enableHighlight?: boolean;
};
const Highlight = ({
  text,
  settings = [],
  enableHighlight = true,
}: HighlighteComponentProps) => {
  return (
    <>{enableHighlight ? parse(text, optHighlightSample(settings)) : text}</>
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
export default HighLightSample3;
