import React, { useState } from "react";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Text,
} from "html-react-parser";

/** ラジオボタン設定 */
interface Radio {
  label: string;
  value: string;
}

const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースのWebアプリケーションフレームワークであり、
サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
`;
const highlightColors = ["yellow", "lime", "red"];
const highlightColorNames = ["黄色", "緑色", "赤色"];

function Home() {
  /**マーカー */
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const handleOnClickMarker = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const highlighColor = (e.target as HTMLButtonElement).name;
    applyHighlight(highlighColor);
  };

  const handleOnClickDelete = () => {
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

  //TODO このやり方はReactとして適切ではない
  //それぞれの機能単独では動作するが、組み合わせると動作がおかしくなる。
  //具体的には、マーカー機能→ハイライトの順に利用するとおかしくなる。
  //マーカー機能で、React管理外のNodeが差し込まれることが原因と思われる。
  //マーカー＆削除してから、ハイライトを実施しても、ハイライト動作がおかしくなる
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

  /** キーワードハイライト */
  const [keywd, setKeywd] = useState("");
  const [highlightColor, setHighlightColor] = useState("yellow");

  const handleKeywordInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywd(event.target.value);
  };
  const handleKewdHighlightSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setHighlightColor(event.target.value);
  };
  // 置換オプション
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      console.log(domNode);

      if (domNode.type === "text") {
        const text = (domNode as Text).data;

        if (keywd === "") return <>{text}</>;
        const parts = text.split(keywd);
        const highlighted = parts.reduce((prev, curr, i) => {
          if (i !== 0)
            prev.push(
              <span
                style={{ backgroundColor: highlightColor }}
                key={crypto.randomUUID()}
              >
                {keywd}
              </span>
            );
          prev.push(curr);
          return prev;
        }, [] as (string | JSX.Element)[]);
        return <>{highlighted}</>;
      }
      return <>{domToReact([domNode])}</>;
    },
  };

  return (
    <div>
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
            onMouseUp={handleMouseUp}
          >
            <p style={{ padding: "5px" }}>{parse(sampleText, options)}</p>
          </div>
        </div>
        <div>
          <div>《ハイライトなし》</div>
          <div
            style={{
              border: "1px solid black",
              width: "600px",
              background: "white",
              margin: "10px",
            }}
          >
            <p style={{ padding: "5px" }}>{sampleText}</p>
          </div>
        </div>
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
              onClick={handleOnClickMarker}
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
        <div className="">
          <p>■キーワードハイライト</p>
          <input
            type="text"
            placeholder="検索キーワード"
            value={keywd}
            onChange={handleKeywordInput}
          />
          <select onChange={handleKewdHighlightSelectChange}>
            <option value="yellow">黄色</option>
            <option value="lime">緑色</option>
            <option value="red">赤色</option>
          </select>
        </div>
        <div>
          <p>《メモ》</p>
          <ul>
            <li>
              ・マーカー実施後に、キーワードハイライトすると表示内容がおかしくなる。
            </li>
            <li>
              ・キーワードハイライトはReact対応している（=React制御下）一方、マーカーはDOM直接操作のためReact制御外。そこに問題があると思う。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
