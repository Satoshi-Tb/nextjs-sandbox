import React from "react";
import parse, {
  DOMNode,
  HTMLReactParserOptions,
  Text,
  Element,
  domToReact,
} from "html-react-parser";
import Link from "next/link";
import { normalizeForHighlight } from "@/utils/stringUtil";

type HighlightSetting = {
  keyword: string;
  color: string;
};

// ハイライト設定
const highlightSetting: HighlightSetting = {
  keyword: "gpt",
  color: "yellow",
};
const highlightSettings: HighlightSetting[] = [
  highlightSetting,
  { keyword: "openai", color: "red" },
  { keyword: "open", color: "lightgreen" },
  { keyword: "ちゃっと", color: "lightblue" },
];

// ハイライトサンプル1
const optHighlight1 = (setting: HighlightSetting): HTMLReactParserOptions => {
  return {
    replace: (domNode: DOMNode) => {
      // console.dir(domNode, { depth: null });
      // Textノードを処理
      if (domNode instanceof Text) {
        const text = domNode.data;

        // キーワードで元のtextを分割し、キーワードをハイライトタグでラップしたJSXオブジェクトを追加しながら
        // JSXまたはstringの配列を構築する
        const jsxElements = text
          .split(setting.keyword)
          .reduce((prev, curr, i) => {
            if (i !== 0) {
              prev.push(
                <Highlight text={setting.keyword} color={setting.color} />
              );
            }
            prev.push(curr);
            return prev;
          }, [] as (string | JSX.Element)[]);

        return <>{jsxElements}</>;
      }
      return;
    },
  };
};

type HighlightProps = {
  text: string;
  color: string;
};
const Highlight = ({ text, color }: HighlightProps) => (
  <span style={{ backgroundColor: color }}>{text}</span>
);

// textにハイライトタグを設定して、JSXエレメントの配列として返す
const highlightedNodes = (
  text: string,
  setting: HighlightSetting
): (string | JSX.Element)[] => {
  // キーワード検索のため、キーワードと検索対象文字列をノーマライズ
  const normalizedSearchText = normalizeForHighlight(setting.keyword);
  const normalizedInputText = normalizeForHighlight(text);

  // キーワードヒット位置を取得
  const regex = new RegExp(`(${normalizedSearchText})`, "g"); // 正規表現構築

  let match;
  const matchResult: { index: number; len: number }[] = []; // 検索結果(検索ヒット位置と、キーワード文字数)

  // ノーマライズ結果に対して、全ての検索ヒット位置を取得
  while ((match = regex.exec(normalizedInputText)) !== null) {
    // console.log(
    //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
    // );
    matchResult.push({
      index: match.index,
      len: normalizedSearchText.length,
    });
  }

  // 検索結果無しの場合、元のテキストをそのまま返す
  if (matchResult.length === 0) return [text];

  // 元の文書から検索ヒット位置に該当するワードを抽出し、ハイライトタグを付与
  const jsxElements: (string | JSX.Element)[] = [];
  let ptr = 0;
  matchResult.forEach((m) => {
    jsxElements.push(text.slice(ptr, m.index));
    jsxElements.push(
      <span style={{ backgroundColor: setting.color }}>
        {text.slice(m.index, m.index + m.len)}
      </span>
    );
    ptr = m.index + m.len;
  });
  jsxElements.push(text.slice(ptr));
  return jsxElements;
};

// ハイライトサンプル2
const optHighlight2 = (setting: HighlightSetting): HTMLReactParserOptions => {
  return {
    replace: (domNode: DOMNode) => {
      // console.dir(domNode, { depth: null });
      // Textノードを処理
      if (domNode instanceof Text) {
        return <>{highlightedNodes(domNode.data, setting)}</>;
      }
      return;
    },
  };
};

// ハイライトサンプル3
const optHighlight3 = (
  settings: HighlightSetting[]
): HTMLReactParserOptions => {
  return {
    replace: (domNode: DOMNode) => {
      // console.dir(domNode, { depth: null });
      // Textノードを処理
      if (domNode instanceof Text) {
        let result: (string | JSX.Element)[] = [domNode.data];
        // console.log(`initial state:`, result);
        settings.forEach((s, idx) => {
          result = result.flatMap((elm) => {
            if (typeof elm !== "string") return elm;
            return highlightedNodes(elm, s);
          });
          // console.log(`hilight key:${idx}: ${s.keyword}`, result);
        });
        // console.log(`terminate state:`, result);
        return <>{result}</>;
      }
      return;
    },
  };
};

// 再帰処理調査用
const keywords: string[] = ["React", "act"];
const highlightWrap = (text: string, keyword: string) => (
  <span style={{ backgroundColor: "yellow" }} key={keyword}>
    {text}
  </span>
);

const highlightKeywords = (
  node: DOMNode,
  remainingKeywords: string[]
): false | void | object | JSX.Element | null | undefined => {
  if (node instanceof Text) {
    let parts: (string | JSX.Element)[] = [node.data];

    // 残りのキーワードを順次処理
    remainingKeywords.forEach((keyword) => {
      parts = parts.flatMap((part) => {
        if (typeof part === "string") {
          const regex = new RegExp(`(${keyword})`, "gi");
          return part
            .split(regex)
            .map((subPart, index) =>
              regex.test(subPart) ? highlightWrap(subPart, keyword) : subPart
            );
        }
        return part;
      });
    });
    return parts;
  }

  if (node instanceof Element && node.type === "tag" && node.children) {
    return React.createElement(
      node.name,
      node.attribs,
      domToReact(
        node.children.map((child) =>
          highlightKeywords(child, remainingKeywords)
        )
      )
    );
  }

  return node;
};

const htmlString2 =
  "<div>Hello, <span>React and HTML parsing is fun!</span></div>";
const parsedResult = parse(htmlString2, {
  replace: (node) => highlightKeywords(node, keywords),
});

const HighlightedComponent = () => {
  return <div>{parsedResult}</div>;
};

// mainコンポーネント
const HighLightSample4 = () => {
  // 原文
  const htmlString = `
  <p>
  <b><u>ChatGPT</u></b>（チャットジーピーティー、英語: Chat Generative Pre-trained Transformer）[1]は、<span style="background-color: gray;">OpenAI</span>が2022年11月に公開した人工知能チャットボットであり、生成AIの一種。
  GPTの原語のGenerative Pre-trained Transformerとは、「生成可能な事前学習済み変換器」という意味である[2]。OpenAIの<a href="/wiki/GPT-3" title="GPT-3">GPT-3</a>ファミリーの大規模な言語モデルに基づいて構築されており、教師あり学習と強化学習の両方の手法を使って転移学習され、機械学習のサブセットである深層学習を使って開発されている[3]。Gptモデルにはgpt 3.5, ＧＰＴ4等がある。
  <img src="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/150px-ChatGPT_logo.svg.png" decoding="async" width="150" height="150" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/225px-ChatGPT_logo.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/300px-ChatGPT_logo.svg.png 2x" data-file-width="512" data-file-height="512">
  </p>
    `;

  return (
    <div>
      <h4>ハイライト設定</h4>
      {highlightSettings.map((item, i) => (
        <div key={i}>
          {i}:{item.keyword}, {item.color}
        </div>
      ))}
      <br />
      <DisplayCard key={1} title="オリジナルHTML" planeHtml={htmlString} />
      <hr />
      <DisplayCard
        key={3}
        title="ハイライトその１"
        description="単一ワードのみ/完全一致（大文字小文字や、全角半角対応なし）"
        planeHtml={htmlString}
        parseOptions={optHighlight1(highlightSetting)}
      />
      <hr />
      <DisplayCard
        key={4}
        title="ハイライトその２"
        description="単一ワードのみ/大文字小文字、全角半角区別なし"
        planeHtml={htmlString}
        parseOptions={optHighlight2(highlightSetting)}
      />
      <hr />
      <DisplayCard
        key={5}
        title="ハイライトその３"
        description="複数ワード可/キーワード重複対応なし/大文字小文字、全角半角区別なし"
        planeHtml={htmlString}
        parseOptions={optHighlight3(highlightSettings)}
      />
      <hr />
      <HighlightedComponent />
      <div style={{ display: "flex" }}>
        <div style={{ marginTop: "20px" }}>
          <Link href="/">Homeに戻る</Link>
        </div>
      </div>
    </div>
  );
};

// 表示用レイアウトコンポーネント
type DisplayCardProps = {
  title: string;
  description?: string;
  planeHtml: string;
  parseOptions?: HTMLReactParserOptions;
};
const DisplayCard = ({
  title,
  description,
  planeHtml,
  parseOptions,
}: DisplayCardProps) => {
  return (
    <>
      <div style={{ textDecoration: "underline" }}>{title}</div>
      {description && <div>{description}</div>}
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
            <div style={{ padding: "5px" }}>{planeHtml}</div>
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
            <div style={{ padding: "5px" }}>
              {parse(planeHtml, parseOptions)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HighLightSample4;
