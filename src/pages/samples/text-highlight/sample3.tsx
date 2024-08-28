import React from "react";
import parse, { HTMLReactParserOptions, Text } from "html-react-parser";

// ハイライト設定
const highlightSettings = [
  { text: "highlight", color: "yellow" },
  { text: "ハイライト", color: "green" },
  { text: "high", color: "red" },
  { text: "version", color: "lightblue" },
];

// 半角文字列に変換する関数
const toHalfWidth = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 指定された文字列に基づいてHTMLテキストをハイライトする関数
const highlightText = (text: string) => {
  // 各設定に対して正規表現を作成し、テキストを置換
  let highlightedText = text;
  highlightSettings.forEach(({ text: searchText, color }) => {
    const normalizedSearchText = toHalfWidth(searchText).toLowerCase(); // キーワードの正規化
    const normalizedInputText = toHalfWidth(highlightedText).toLowerCase(); // 対象文字列の正規化

    const regex = new RegExp(`(${normalizedSearchText})`, "gi");

    highlightedText = normalizedInputText.replace(regex, (match) => {
      // 元の文字列のマッチ部分を取得
      // これだと不完全。マッチ部分の正確なインデックスを取得する必要がある。
      const originalMatch = highlightedText.slice(
        normalizedInputText.indexOf(match),
        normalizedInputText.indexOf(match) + match.length
      );
      return `<span style="background-color: ${color}; font-weight: bold;">${originalMatch}</span>`;
    });
  });
  return highlightedText;
};

const HighLightSample3 = () => {
  const htmlString = `
    <div>
      <h1>Hello, World!</h1>
      <p>
      This is a sample HTML string with some text to <u>highlight</u>. Let's highlight the words 'highlight' and 'ハイライト' and 'version'.<br/>
      Ignore upper/lower case: Version, VERSION, ｖｅｒｓｉｏｎ
      <img src="https://www.j-platpat.inpit.go.jp/gazette_work/domestic/A/419289000/419289100/419289140/419289141/7239EB7A6A04F265EADF0B7910FBA631E4E0BFE2EACC7203C2F97822A65C5B3A/text/JPA 419289141_i_000004.jpg?version=202408280639"></img>
      </p>
    </div>
  `;

  // 特定の文字列をハイライトするためのカスタム変換関数
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === "text") {
        const highlightedText = highlightText((domNode as Text).data);
        return <>{parse(highlightedText)}</>; // 再帰的に変換するために再度parseを呼び出す
      }
    },
  };

  return (
    <>
      <h2>ハイライト - タグ内の文字も変換可能</h2>
      <h4>ハイライト設定</h4>
      {highlightSettings.map((item, i) => (
        <div>
          {i}:{item.text}, {item.color}
        </div>
      ))}
      <hr />
      <div>【ハイライト前】</div>
      <div>{htmlString}</div>
      <hr />
      <div>【ハイライト化】</div>
      <div>{parse(htmlString, options)}</div>
    </>
  );
};

export default HighLightSample3;
