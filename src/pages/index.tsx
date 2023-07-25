import React, { useState } from "react";
import parse from "html-react-parser";

const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
  `;

function Home() {
  const highlightColors = ["yellow", "lime", "red"];
  const highlightColorNames = ["黄色", "緑色", "赤色"];

  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const highlighColor = (e.target as HTMLButtonElement).name;
    applyHighlight(highlighColor);
  };

  const handleOnDeleteClick = () => {
    removeAllHighlights();
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) {
      setSelectedRange(null);
      return;
    }
    if (selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0));
    }
  };

  //TODO このやり方はReactとして適切ではない可能性あり
  const applyHighlight = (color: string) => {
    if (selectedRange) {
      const rangeContents = selectedRange.extractContents();
      Array.from(rangeContents.querySelectorAll(".highlight")).forEach(
        (highlightEl) => {
          const parent = highlightEl.parentNode;
          if (!parent) return;
          while (highlightEl.firstChild) {
            parent.insertBefore(highlightEl.firstChild, highlightEl);
          }
          parent.removeChild(highlightEl);
        }
      );

      const newNode = document.createElement("span");
      newNode.setAttribute("class", "highlight");
      newNode.style.backgroundColor = color;
      newNode.appendChild(rangeContents);
      selectedRange.insertNode(newNode);
      setSelectedRange(null);
    }
  };

  //TODO このやり方はReactとして適切ではない可能性あり

  const removeAllHighlights = () => {
    Array.from(document.querySelectorAll(".highlight")).forEach(
      (highlightEl) => {
        const parent = highlightEl.parentNode;
        if (!parent) return;
        while (highlightEl.firstChild) {
          parent.insertBefore(highlightEl.firstChild, highlightEl);
        }
        parent.removeChild(highlightEl);
      }
    );
  };

  return (
    <div>
      <div
        style={{
          border: "1px solid black",
          width: "500px",
          background: "white",
          margin: "10px",
        }}
        onMouseUp={handleMouseUp}
      >
        <p>{parse(sampleText)}</p>
      </div>

      <div
        style={{
          margin: "10px",
          justifyContent: "space-around",
        }}
      >
        <p>■マーカー色</p>
        {highlightColors.map((c, i) => (
          <button
            style={{ margin: "5px", paddingRight: "5px", paddingLeft: "5px" }}
            onClick={handleOnClick}
            key={i}
            name={c}
          >
            {highlightColorNames[i]}
          </button>
        ))}
        <button
          style={{ margin: "5px", paddingRight: "5px", paddingLeft: "5px" }}
          onClick={handleOnDeleteClick}
        >
          クリア
        </button>
      </div>
    </div>
  );
}

export default Home;
