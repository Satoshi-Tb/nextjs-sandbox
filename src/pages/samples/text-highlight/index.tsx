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
  const sampleText =
    "吾輩は猫である。名前はまだない。どこで生れたか<b>頓（とん）と</b>見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪（どうあく）な種族であったそうだ。この書生というのは時々我々を捕（つかま）えて煮て食うという話である。しかしその当時は何という考（かんがえ）もなかったから別段恐しいとも思わなかった。";
  const [keywd, setKeywd] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywd(event.target.value);
  };
  const handleOnClick = () => {
    setIsHighlight(!isHighlight);
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
              <span style={{ backgroundColor: "yellow" }}>{keywd}</span>
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
      </div>
      <div className={styles.textarea}>
        <p>{parse(sampleText, options)}</p>
      </div>
    </>
  );
};

export default WordHighLight;
