import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";
import styles from "@/styles/TextHighlight.module.css";
import { useState } from "react";

// reactElementをレンダリング
const WordHighLight = () => {
  const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
  `;
  const [keywd, setKeywd] = useState("");
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [isHighlight, setIsHighlight] = useState(false);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywd(event.target.value);
  };

  const handleOnClick = () => {
    setIsHighlight(!isHighlight);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //console.log(event);
    setHighlightColor(event.target.value);
  };

  // 置換オプションを作成
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      //console.log(domNode);

      if (domNode.type === "text") {
        const text = (domNode as Text).data;

        if (!isHighlight || keywd === "") return <>{text}</>;
        console.log("replace!");
        const parts = text.split(keywd);
        const highlighted = parts.reduce((prev, curr, i) => {
          if (i !== 0)
            prev.push(
              <span style={{ backgroundColor: highlightColor }}>{keywd}</span>
            );
          prev.push(curr);
          return prev;
        }, [] as (string | JSX.Element)[]);
        return <>{highlighted}</>;
      }
      return <>{domToReact([domNode])}</>;

      // if (domNode instanceof Element && domNode.type === "tag") {
      //   const children = domNode.children ?? [];
      //   return (
      //     <p>
      //       {children.map((child, i) => {
      //         if (
      //           child.type === "text" &&
      //           keywd !== "" &&
      //           child.data?.includes(keywd) &&
      //           isHighlight
      //         ) {
      //           // ハイライト対象のテキストを<span>要素で置換
      //           const parts = child.data?.split(keywd);
      //           const highlighted = parts?.reduce((prev, curr, i) => {
      //             if (i !== 0)
      //               prev.push(
      //                 <span style={{ backgroundColor: "yellow" }}>{keywd}</span>
      //               );
      //             prev.push(curr);
      //             return prev;
      //           }, [] as (string | JSX.Element)[]);
      //           return highlighted;
      //         }
      //         return domToReact([child as Element], options);
      //       })}
      //     </p>
      //   );
      // }
    },
  };

  return (
    <>
      <div className="">
        <input
          type="text"
          placeholder="検索キーワード"
          value={keywd}
          onChange={handleInput}
        />
        <button onClick={handleOnClick}>ハイライト</button>
        <select onChange={handleSelectChange}>
          <option value="yellow">黄色</option>
          <option value="lime">緑色</option>
          <option value="red">赤色</option>
        </select>
      </div>
      <div className={styles.textarea}>
        <p>{parse(sampleText, options)}</p>
      </div>
    </>
  );
};

export default WordHighLight;
