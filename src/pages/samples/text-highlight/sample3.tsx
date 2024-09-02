import React from "react";
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact,
} from "html-react-parser";
import Link from "next/link";

// ハイライト設定
const highlightSettings = [
  { text: "highlight", color: "yellow" },
  { text: "ハイライト", color: "green" },
  { text: "high", color: "red" },
  { text: "version", color: "lightblue" },
  { text: "span", color: "lime" },
  { text: "style", color: "lime" },
];

// 半角文字列に変換する関数
// TODO 全角カナ、記号対応
// ・カナ、記号を含めると、対応は難しい。変換用のコードマップ作成が必要
// https://qiita.com/spm84/items/4ea8c53ac3aafcd4d66c
// ・濁点・半濁点付きカナ（パ⇔ﾊﾟ、バ⇔ﾊﾞなど）は、半角⇔全角で文字数が変わるので、置換に対応できない。ﾊﾞ⇔ハ"みたいな感じで分割状態での全角半角にしないと厳しい
const toHalfWidth = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

//
const addHighlight = (keyword: string, color: string, target: string) => {
  const normalizedSearchText = toHalfWidth(keyword).toLowerCase(); // キーワードのノーマライズ
  const normalizedInputText = toHalfWidth(target).toLowerCase(); // 対象文字列のノーマライズ

  const regex = new RegExp(`(${normalizedSearchText})`, "g"); // 正規表現構築

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
    resultStr += target.slice(ptr, m.index);
    resultStr +=
      `<span style="background-color: ${color}; font-weight: bold;">` +
      target.slice(m.index, m.index + m.len) +
      "</span>";
    ptr = m.index + m.len;
  });

  resultStr += target.slice(ptr);
  return resultStr;
};

// 指定された文字列に基づいてHTMLテキストをハイライトする関数
const highlightText = (text: string) => {
  let highlightedText = text;

  // ハイライト設定分、テキストを置換
  highlightSettings.forEach(({ text: searchText, color }) => {
    //console.log("split!", highlightedText.split(/(<[^>]+>)/));
    highlightedText = highlightedText
      .split(/(<[^>]+>)/)
      .filter(Boolean)
      .map((chunk) => {
        if (chunk.includes("<")) return chunk;
        return addHighlight(searchText, color, chunk);
      })
      .join("");
  });
  return highlightedText;
};

// 特定の文字列をハイライトするためのカスタム変換関数
const optHighlighSample: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === "text") {
      const highlightedText = highlightText((domNode as Text).data);
      return <>{parse(highlightedText)}</>; // 再帰的に変換するために再度parseを呼び出す
    }
  },
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

  return (
    <div>
      <h2>html-react-parseのテスト</h2>
      <h4>ハイライト設定</h4>
      {highlightSettings.map((item, i) => (
        <div>
          {i}:{item.text}, {item.color}
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
        parseOptions={optHighlighSample}
      />
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
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
export default HighLightSample3;
