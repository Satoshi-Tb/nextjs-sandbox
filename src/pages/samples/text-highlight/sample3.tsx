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
// TODO 全角カナ、記号対応
// ・カナ、記号を含めると、対応は難しい。変換用のコードマップ作成が必要
// https://qiita.com/spm84/items/4ea8c53ac3aafcd4d66c
// ・濁点・半濁点付きカナ（パ⇔ﾊﾟ、バ⇔ﾊﾞなど）は、半角⇔全角で文字数が変わるので、置換に対応できない。ﾊﾞ⇔ハ"みたいな感じで分割状態での全角半角にしないと厳しい
const toHalfWidth = (str: string) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 指定された文字列に基づいてHTMLテキストをハイライトする関数
const highlightText = (text: string) => {
  let highlightedText = text;

  // ハイライト設定分、テキストを置換
  // TODO 複数適用すると、2回目のループでハイライト用の<span>タグが置換対象になってしまう。
  // この単純なやり方で実施する場合、ハイライトタグ名は検索対象外の文字列にしないとダメ。
  // 例えばハイライトキーワードの最低文字数を3文字にし、ハイライトタグ（コンポーネント）の名前を、適当な2文字以下の名前にするなど
  highlightSettings.forEach(({ text: searchText, color }) => {
    const normalizedSearchText = toHalfWidth(searchText).toLowerCase(); // キーワードのノーマライズ
    const normalizedInputText = toHalfWidth(highlightedText).toLowerCase(); // 対象文字列のノーマライズ

    const regex = new RegExp(`(${normalizedSearchText})`, "g"); // 正規表現構築

    let match;
    let resultStr = "";
    let ptr = 0;
    const matchResult: { index: number; len: number }[] = []; // 検索結果(検索ヒット位置と、キーワード文字数)
    console.log("target", highlightedText);
    console.log("search key", normalizedSearchText);

    // ノーマライズ結果に対して、全ての検索ヒット位置を取得
    while ((match = regex.exec(normalizedInputText)) !== null) {
      console.log(
        `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
      );
      matchResult.push({
        index: match.index,
        len: normalizedSearchText.length,
      });
    }

    matchResult.forEach((m, i) => {
      resultStr += highlightedText.slice(ptr, m.index);
      resultStr +=
        `<span style="background-color: ${color}; font-weight: bold;">` +
        highlightedText.slice(m.index, m.index + m.len) +
        "</span>";
      ptr = m.index + m.len;
    });

    resultStr += highlightedText.slice(ptr);
    console.log("match result", matchResult);
    console.log("highlight result", resultStr);
    highlightedText = resultStr;
    // highlightedText = normalizedInputText.replace(regex, (match, args) => {
    //   console.log("regex.lastIndex", regex.lastIndex);
    //   // 元の文字列のマッチ部分を取得
    //   // これだと不完全。マッチ部分の正確なインデックスを取得する必要がある。
    //   const originalMatch = highlightedText.slice(
    //     normalizedInputText.indexOf(match),
    //     normalizedInputText.indexOf(match) + match.length
    //   );
    //   return `<span style="background-color: ${color}; font-weight: bold;">${originalMatch}</span>`;
    // });
  });
  return highlightedText;
};

const HighLightSample3 = () => {
  const htmlString = `
    <div>
      <h1>Hello, World!</h1>
      <p>
      This is a sample HTML string with some text to <u>highlight</u>. Let's highlight the words 'highlight' and 'ハイライト' and 'version'.<br/>Ignore upper/lower case: Version, VERSION, ｖｅｒｓｉｏｎ, ＶerＳION
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
