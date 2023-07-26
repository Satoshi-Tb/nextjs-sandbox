import React, { useState } from "react";
import parse from "html-react-parser";

/** ラジオボタン設定 */
interface Radio {
  label: string;
  value: string;
}

const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、
サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
`;

function Marker() {
  const highlightColors = ["yellow", "lime", "red"];
  const highlightColorNames = ["黄色", "緑色", "赤色"];
  const [editMode, setEditMode] = useState(false);
  const [enableSelect, setEnableSelect] = useState(false);

  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const highlighColor = (e.target as HTMLButtonElement).name;
    applyHighlight(highlighColor);
  };

  const handleOnClickDelete = () => {
    removeAllHighlights();
  };

  const handleOnChangeEditMode = () => {
    setEditMode((prev) => {
      //set関数のネストはOKか？
      setEnableSelect(!prev);
      return !prev;
    });
  };

  const [selectedHightlightColor, setSelectedHighlightColor] =
    useState("yellow");

  const changeValue = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedHighlightColor(event.target.value);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) {
      setSelectedRange(null);
      return;
    }
    if (selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0));
    }
    if (editMode) {
      //TODO うまくいかない
      console.log(selectedHightlightColor);
      applyHighlight(selectedHightlightColor);
    }
  };

  //TODO このやり方はReactとして適切ではない可能性あり
  const applyHighlight = (color: string) => {
    console.log(selectedRange);
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
        <div>
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
            onClick={handleOnClickDelete}
          >
            クリア
          </button>
        </div>
        <hr></hr>
        <div style={{ display: "flex" }}>
          <input
            type="checkbox"
            checked={editMode}
            onChange={handleOnChangeEditMode}
            id="checkEditMode"
            name="checkEditMode"
            style={{ marginLeft: "5px" }}
          />
          <label htmlFor="checkEditMode">ライン編集</label>
          {highlightColors.map((color, i) => {
            return (
              <div>
                {/* checked属性に式を定義する */}
                <input
                  type="radio"
                  name={`highlightColor-${color}`}
                  value={color}
                  checked={color === selectedHightlightColor}
                  onChange={changeValue}
                  key={color}
                  id={`highlightColor-${color}`}
                  style={{ marginLeft: "5px" }}
                  disabled={!enableSelect}
                />
                <label htmlFor={`highlightColor-${color}`}>
                  {highlightColorNames[i]}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Marker;
