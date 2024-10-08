import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";
import { useState } from "react";
import KeywordHighlighter from "./KeywordHighlighter";
import { useModal } from "../ui/useModal";

const kewdInputCount = 3;

// reactElementをレンダリング
const WordHighLightMulti = () => {
  const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。現在のversionは18。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline black 2px;'>Webアプリケーションフレームワーク</span>であり、サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
<img src="https://www.j-platpat.inpit.go.jp/gazette_work/domestic/A/419289000/419289100/419289140/419289141/7239EB7A6A04F265EADF0B7910FBA631E4E0BFE2EACC7203C2F97822A65C5B3A/text/JPA 419289141_i_000004.jpg?version=202408280639"></img>
  `;

  const { Modal, openModal, closeModal, show } = useModal({});

  const [keywds, setKeywds] = useState(
    [...Array(kewdInputCount)].map((a) => "")
  );

  const [highlightColors, setHighlightColors] = useState(
    [...Array(kewdInputCount)].map((a) => "yellow")
  );

  const setHighlightColor = (idx: number, color: string) => {
    setHighlightColors((prev) => prev.map((v, i) => (i === idx ? color : v)));
  };

  const setKeyword = (idx: number, keywd: string) => {
    setKeywds((prev) => prev.map((v, i) => (i === idx ? keywd : v)));
  };

  // 置換オプションを作成
  const replaceOption: HTMLReactParserOptions = {
    replace: (domNode) => {
      //console.log(domNode);
      console.log(keywds);
      if (domNode.type === "text") {
        const text = (domNode as Text).data;
        let jsxElements: (string | JSX.Element)[] = [text];
        keywds.forEach((key, idx) => {
          if (!text.includes(key)) return;
          jsxElements = jsxElements.flatMap((elem) => {
            if (typeof elem === "string") {
              if (key === "") return elem;
              const parts = elem.split(key);
              const highlighted = parts.reduce((prev, curr, i) => {
                if (i !== 0)
                  prev.push(
                    <span style={{ backgroundColor: highlightColors[idx] }}>
                      {key}
                    </span>
                  );
                prev.push(curr);
                return prev;
              }, [] as (string | JSX.Element)[]);
              return highlighted;
            }
            return elem;
          });
          console.log(jsxElements);
        });
        return <>{jsxElements}</>;
      }
      return <>{domToReact([domNode])}</>;
    },
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <div>
          <div>《ハイライトあり》</div>
          <div
            style={{
              border: "1px solid black",
              width: "600px",
              background: "white",
              margin: "10px",
            }}
          >
            <p>{parse(sampleText, replaceOption)}</p>
          </div>
        </div>
        <div>
          <div>《原文》</div>
          <div
            style={{
              border: "1px solid black",
              width: "600px",
              background: "white",
              margin: "10px",
            }}
          >
            <p>{sampleText}</p>
          </div>
        </div>
      </div>
      {[...Array(kewdInputCount)].map((_, i) => (
        <KeywordHighlighter
          key={i}
          index={i}
          setHighlight={setHighlightColor}
          setKeyword={setKeyword}
        />
      ))}
      <button onClick={openModal}>ダイアログを開く</button>
      <Modal show={show}>
        <div
          style={{
            backgroundColor: "white",
            width: "300px",
            height: "200px",
            padding: "1em",
            borderRadius: "15px",
          }}
        >
          <h2>Content from children</h2>
          <button onClick={closeModal}>閉じる</button>
        </div>
      </Modal>
    </>
  );
};

export default WordHighLightMulti;
