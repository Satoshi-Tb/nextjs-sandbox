import React from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";
import { useState } from "react";

// reactElementをレンダリング
const WordHighLightMulti = () => {
  const sampleText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
  `;
  const [keywds, setKeywds] = useState(["", ""]);
  const [highlightColors, setHighlightColors] = useState(["yellow", "yellow"]);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywds([event.target.value, keywds[1]]);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setHighlightColors([event.target.value, highlightColors[1]]);
  };

  const handleInput2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywds([keywds[0], event.target.value]);
  };

  const handleSelectChange2 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setHighlightColors([highlightColors[0], event.target.value]);
  };

  // 置換オプションを作成
  const replaceOption: HTMLReactParserOptions = {
    replace: (domNode) => {
      console.log(domNode);
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

  // // AI Sample
  // // ハイライト対象のテキスト
  // const targetTexts = ["Hello", "world"];

  // // HTML文字列
  // const htmlString = "<p>Hello, world!</p>";

  // // 置換オプションを作成
  // const options: HTMLReactParserOptions = {
  //   replace: (domNode) => {
  //     if (domNode.type === "tag" && (domNode as Element).name === "p") {
  //       const children = (domNode as Element).children ?? [];
  //       return (
  //         <p>
  //           {children.map((child, i) => {
  //             if (child.type === "text") {
  //               let modifiedText: (string | JSX.Element)[] = [child.data || ""];
  //               targetTexts.forEach((targetText) => {
  //                 if (child.data?.includes(targetText)) {
  //                   modifiedText = modifiedText.flatMap((textOrElement) => {
  //                     if (typeof textOrElement === "string") {
  //                       // ハイライト対象のテキストを<span>要素で置換
  //                       const parts = textOrElement.split(targetText);
  //                       const highlighted = parts.reduce((prev, curr, i) => {
  //                         if (i !== 0)
  //                           prev.push(
  //                             <span style={{ backgroundColor: "yellow" }}>
  //                               {targetText}
  //                             </span>
  //                           );
  //                         prev.push(curr);
  //                         return prev;
  //                       }, [] as (string | JSX.Element)[]);
  //                       return highlighted;
  //                     }
  //                     return textOrElement;
  //                   });
  //                 }
  //               });
  //               return modifiedText;
  //             }
  //             return domToReact([child as Element], options);
  //           })}
  //         </p>
  //       );
  //     }
  //   },
  // };

  // // HTMLをパース
  // const reactElement = parse(htmlString, options);

  return (
    <>
      <div className="">
        <input
          type="text"
          placeholder="検索キーワード"
          value={keywds[0]}
          onChange={handleInput}
          style={{ marginRight: "5px" }}
        />
        <select onChange={handleSelectChange}>
          <option value="yellow">黄色</option>
          <option value="lime">緑色</option>
          <option value="red">赤色</option>
        </select>
      </div>
      <div className="">
        <input
          type="text"
          placeholder="検索キーワード"
          value={keywds[1]}
          onChange={handleInput2}
          style={{ marginRight: "5px" }}
        />
        <select onChange={handleSelectChange2}>
          <option value="yellow">黄色</option>
          <option value="lime">緑色</option>
          <option value="red">赤色</option>
        </select>
      </div>
      <div style={{ border: "1px solid black", width: "500px" }}>
        <p>{parse(sampleText, replaceOption)}</p>
      </div>
    </>
  );
};

export default WordHighLightMulti;
