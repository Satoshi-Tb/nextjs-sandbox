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

// ハイライト設定
const highlightSettings = [
  { keyword: "gpt", color: "yellow" },
  { keyword: "Gpt", color: "red" },
];

// テキストノードをハイライトする関数
const highlightText = (text: string, keyword: string, color: string) => {
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(
    regex,
    (match) =>
      `<span style="background-color: ${color}; font-weight: bold;">${match}</span>`
  );
};

// オプションサンプル：タグ除去
const optTagStrip: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    console.dir(domNode, { depth: null });
    // DOMNodeがElement（タグ）である場合、nullを返して無視する
    if (domNode instanceof Element && domNode.type === "tag") {
      // 再帰的に子要素を処理する
      return <>{domToReact(domNode.children, optTagStrip)}</>;
    }
    return;
  },
};

const HighLightSample4 = () => {
  const htmlString = `
  <p>
  <b>ChatGPT</b>（チャットジーピーティー、英語: Chat Generative Pre-trained Transformer）[1]は、OpenAIが2022年11月に公開した人工知能チャットボットであり、生成AIの一種。
  GPTの原語のGenerative Pre-trained Transformerとは、「生成可能な事前学習済み変換器」という意味である[2]。OpenAIの<a href="/wiki/GPT-3" title="GPT-3">GPT-3</a>ファミリーの大規模な言語モデルに基づいて構築されており、教師あり学習と強化学習の両方の手法を使って転移学習され、機械学習のサブセットである深層学習を使って開発されている[3]。
  <img src="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/150px-ChatGPT_logo.svg.png" decoding="async" width="150" height="150" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/225px-ChatGPT_logo.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/300px-ChatGPT_logo.svg.png 2x" data-file-width="512" data-file-height="512">
  </p>
    `;

  // HTML文字列をパースしてから処理
  const parsedHtml = parse(htmlString, optTagStrip);

  return (
    <div>
      <div style={{ textDecoration: "underline" }}>オリジナルHTML</div>
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
            <div style={{ padding: "5px" }}>{htmlString}</div>
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
            <div style={{ padding: "5px" }}>{parse(htmlString)}</div>
          </div>
        </div>
      </div>
      <hr />
      <div style={{ textDecoration: "underline" }}>タグ除去</div>
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
            <div style={{ padding: "5px" }}>
              {renderToString(parsedHtml as ReactElement)}
            </div>
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
            <div style={{ padding: "5px" }}>{parsedHtml}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ marginTop: "20px" }}>
          <Link href="/">Homeに戻る</Link>
        </div>
      </div>
    </div>
  );
};

export default HighLightSample4;
