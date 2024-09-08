import React, { ReactNode, createElement } from "react";
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
  domToReact,
} from "html-react-parser";
import Link from "next/link";
import { normalizeForHighlight } from "@/utils/stringUtil";
import { renderToStaticMarkup } from "react-dom/server";

type HighlightSetting = {
  keyword: string;
  color: string;
  enable?: boolean; // キーワードごとにON/OFFしたい場合など
};

// ハイライト設定
const sampleHighlightSettings: HighlightSetting[] = [
  { keyword: "high", color: "red" },
  { keyword: "highlight", color: "yellow" },
  { keyword: "ハイライト", color: "green" },
  { keyword: "version", color: "lightblue" },
  { keyword: "span", color: "lime" },
  { keyword: "style", color: "lime" },
];

// ハイライトキーワードのソート
// 文字数が多いほうが先（部分重複キーワード対応のため。文字数短いほうがハイライト優先度高い）
// 同一文字数の場合、順位変更なし（先の方がハイライト優先度高い）
const hsSorter = (s1: HighlightSetting, s2: HighlightSetting) =>
  s2.keyword.length - s1.keyword.length;

// 指定されたテキストのキーワード文言に、ハイライトタグ（spanタグ）を設定する
// TODO <>のハイライトができない。&lt;、&gt;でもダメ。記号も全角変換したほうがよいか。その場合、"や\の扱いどうするか要検討
const applyHighlight = (
  keyword: string,
  color: string,
  text: string,
  normalize: boolean
) => {
  const normalizedKeyword = normalize
    ? normalizeForHighlight(keyword)
    : keyword; // キーワードのノーマライズ
  const normalizedInputText = normalize ? normalizeForHighlight(text) : text; // 対象文字列のノーマライズ

  const regex = new RegExp(
    `(${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, // 正規表現構築時に、特殊文字をエスケープする
    "g"
  ); // 正規表現構築

  let match;
  let resultStr = "";
  let ptr = 0;

  // ノーマライズ結果に対して、全ての検索ヒット位置を取得
  while ((match = regex.exec(normalizedInputText)) !== null) {
    // console.log(
    //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
    // );
    resultStr += text.slice(ptr, match.index);
    resultStr +=
      `<span style="background-color: ${color}; font-weight: bold;">` +
      text.slice(match.index, match.index + normalizedKeyword.length) +
      "</span>";
    ptr = match.index + normalizedKeyword.length;
  }

  resultStr += text.slice(ptr);
  return resultStr;
};

/**
 * 文字列のキーワードに一致する箇所をハイライト用タグで囲んで、JSXElementとして返す。
 * @param keyword
 * @param color
 * @param text
 * @param normalize
 * @returns
 */
const applyHighlightNode = (
  keyword: string,
  color: string,
  text: string,
  normalize: boolean
) => {
  const normalizedKeyword = normalize
    ? normalizeForHighlight(keyword)
    : keyword; // キーワードのノーマライズ
  const normalizedInputText = normalize ? normalizeForHighlight(text) : text; // 対象文字列のノーマライズ

  const regex = new RegExp(
    `(${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, // 正規表現構築時に、特殊文字をエスケープする
    "g"
  ); // 正規表現構築

  let match;
  let ptr = 0;

  const jsxElements: (string | JSX.Element)[] = [];
  // ノーマライズ結果に対して、全ての検索ヒット位置を取得
  while ((match = regex.exec(normalizedInputText)) !== null) {
    // console.log(
    //   `Found ${match[0]} start=${match.index} end=${regex.lastIndex}.`
    // );
    jsxElements.push(text.slice(ptr, match.index));
    jsxElements.push(
      <span style={{ backgroundColor: color, fontWeight: "bold" }}>
        {text.slice(match.index, match.index + normalizedKeyword.length)}
      </span>
    );
    ptr = match.index + normalizedKeyword.length;
  }

  jsxElements.push(text.slice(ptr));
  return <>{jsxElements}</>;
};

// 特定の文字列をハイライトするためのカスタム変換関数
const optHighlightSample = (
  settings: HighlightSetting[],
  normalize: boolean = true
): HTMLReactParserOptions => {
  return {
    replace: (domNode) => {
      if (domNode instanceof Text) {
        let highlightedText = domNode.data;

        // ハイライト設定分、テキストを置換
        settings.sort(hsSorter).forEach(({ keyword, color }) => {
          highlightedText = highlightedText
            .split(/(<[^>]+>)/) // HTMLタグごとに文字列分割
            .filter(Boolean)
            .map((chunk) => {
              if (chunk.includes("<")) return chunk; // タグは処理しない
              return applyHighlight(keyword, color, chunk, normalize); // テキストにはハイライト用タグをセット
            })
            .join("");
        });

        return <>{parse(highlightedText)}</>; // 再帰的に変換するために再度parseを呼び出す
      }
    },
  };
};

/**
 *
 * @param node
 * @param hs
 * @returns
 */
const traverse = (
  node: ReactNode,
  hs: HighlightSetting,
  normalize: boolean
): ReactNode => {
  // 文字列の場合
  if (typeof node === "string") {
    return applyHighlightNode(hs.keyword, hs.color, node, normalize);
  }

  // JSX.Elementの場合
  if (React.isValidElement(node)) {
    if (!node.props.children) {
      return node; // 子要素がない場合、そのまま返す
    }

    // 子要素が複数の場合に対応するため、再帰的に処理
    const newChildren = React.Children.map(node.props.children, (child) =>
      traverse(child, hs, normalize)
    );

    // 新しい子要素で新しい要素を作成
    return createElement(node.type, { ...node.props }, newChildren);
  }

  // その他の型はそのまま返す
  return node;
};

// 特定の文字列をハイライトするためのカスタム変換関数
const optHighlightSample2 = (
  settings: HighlightSetting[],
  normalize: boolean = true
): HTMLReactParserOptions => {
  return {
    replace: (domNode) => {
      if (domNode instanceof Text) {
        let highlightedText = domNode.data;

        let jsx = <>{highlightedText}</>;
        // ハイライト設定分、テキストを置換
        settings.sort(hsSorter).forEach((s) => {
          jsx = <>{traverse(jsx, s, normalize)}</>;
        });

        return jsx;
      }
    },
  };
};

// オプションサンプル：タグ除去
const optTagStrip: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    // console.dir(domNode, { depth: null });
    // DOMNodeがElement（タグ）である場合、除去(<></>に置換)
    if (domNode instanceof Element && domNode.type === "tag") {
      // 再帰的に子要素を処理する
      return <>{domToReact(domNode.children, optTagStrip)}</>;
    }
    return;
  },
};

// ハイライトコンポーネントサンプル
type HighlightKeywordsProps = {
  text: string;
  settings?: HighlightSetting[];
  enableHighlight?: boolean;
  enableNormalize?: boolean;
};
/**
 * ハイライト用コンポーネントサンプル。parseを利用するため、すべてのタグ文字列がHTMLタグとして解釈される点に注意
 */
const HighlightKeywords = ({
  text,
  settings = [],
  enableHighlight = true,
}: HighlightKeywordsProps) => {
  return (
    <>
      {enableHighlight
        ? parse(text, optHighlightSample(settings))
        : parse(text)}
    </>
  );
};

/**
 * または関数のみ
 * こちらのほうがparse利用が分かりやすい。こちらの方がよいか
 */
const parseAndHighlight = (
  text: string,
  settings: HighlightSetting[],
  hilightEnable: boolean = true
) => {
  return hilightEnable
    ? parse(text, optHighlightSample(settings))
    : parse(text);
};

/**
 * 別のやり方１。
 * 文字列→ハイライトタグ付与→parse→文字列→ハイライトタグ付与→parse…を繰り返す方法
 * このやり方だと、HTMLタグ内の文字列も置換対象にできる。
 */
const HighlightKeywords2 = ({
  text,
  settings = [],
  enableHighlight = true,
  enableNormalize = true,
}: HighlightKeywordsProps) => {
  if (!enableHighlight) return parse(text);
  let hilightedHtmlString = text;
  settings.sort(hsSorter).forEach((s) => {
    const jsx = parse(hilightedHtmlString, {
      replace: (domNode) => {
        if (domNode instanceof Text) {
          return applyHighlightNode(
            s.keyword,
            s.color,
            domNode.data,
            enableNormalize
          );
        }
      },
    });
    hilightedHtmlString = renderToStaticMarkup(<>{jsx}</>);
  });
  return parse(hilightedHtmlString);
};

/**
 * 別のやり方２
 * ハイライトタグでラップして、JSXElementで返す方法。文字列置換回数が少ないので別のやり方１よりも速い
 * このやり方でも、HTMLタグ内の文字列も置換対象にできる。
 */
const HighlightKeywords3 = ({
  text,
  settings = [],
  enableHighlight = true,
  enableNormalize = true,
}: HighlightKeywordsProps) => {
  if (!enableHighlight) return parse(text);
  return parse(text, optHighlightSample2(settings, enableNormalize));
};

/**
 * main
 */
const HighLightSample3 = () => {
  const htmlString = `
    <div>
      <h1>Hello, World!</h1>
      <p>
      This is a sample HTML string with some text to <u>highlight</u>. Let's highlight the words 'highlight' and 'ハイライト' and 'version'.<br/>Ignore upper/lower case: Version, VERSION, ｖｅｒｓｉｏｎ, ＶerＳION
      <img src="https://www.j-platpat.inpit.go.jp/gazette_work/domestic/A/419289000/419289100/419289140/419289141/7239EB7A6A04F265EADF0B7910FBA631E4E0BFE2EACC7203C2F97822A65C5B3A/text/JPA 419289141_i_000004.jpg?version=202408280639"></img><br/>
      タグ文字検証《HTMLタグ》<br />
      タグ文字：<span style="text-decoration: underline;">ハイライト</span><br />
      タグ文字（エスケープ文字形式）：&lt;span  style="text-decoration: underline;"&gt;ハイライト&lt;/span&gt;<br />
      タグ文字（エスケープ文字をエスケープ）：&amp;lt;span style="text-decoration: underline;"&amp;gt;ハイライト&amp;lt;/span&amp;gt;<br />
      タグ文字検証《HTMLタグ以外》<br />
      タグ文字：<ハイライト><br />
      タグ文字（エスケープ文字形式）：&lt;ハイライト&gt;<br />
      タグ文字（エスケープ文字をエスケープ）：&amp;lt;ハイライト&amp;gt;
      </p>
    </div>
  `;

  const testString1 =
    "ロボット/ロボツト/ロホット/ろぼっと/ろぼつと/ろほっと/ﾛﾎﾞｯﾄ/ﾛﾎﾞﾂﾄ/ﾛﾎｯﾄ";
  const testSettings1: HighlightSetting[] = [
    { keyword: "ロボット", color: "yellow" },
    { keyword: "ロボツト", color: "yellow" },
    { keyword: "ロホット", color: "yellow" },
    { keyword: "ろぼっと", color: "yellow" },
    { keyword: "ろぼつと", color: "yellow" },
    { keyword: "ろほっと", color: "yellow" },
    { keyword: "ﾛﾎﾞｯﾄ", color: "yellow" },
    { keyword: "ﾛﾎﾞﾂﾄ", color: "yellow" },
    { keyword: "ﾛﾎｯﾄ", color: "yellow" },
  ];

  const testString2 = "ABC!\\ /abc!\\ /Abc!\\ /ａｂｃ！￥　/ＡＢＣ！／　";
  const testSettings2: HighlightSetting[] = [
    { keyword: "ABC!\\ ", color: "yellow" },
    { keyword: "abc!\\ ", color: "yellow" },
    { keyword: "abC!\\ ", color: "yellow" },
    { keyword: "ＡＢＣ！￥　", color: "yellow" },
    { keyword: "ａｂｃ！／ ", color: "yellow" },
    { keyword: "ａｂｃ!\\　", color: "yellow" },
    { keyword: "ABC！￥ ", color: "yellow" },
  ];

  const alphaNumTest = [
    "a",
    "b",
    "c",
    "A",
    "B",
    "C",
    "ｂ",
    "ｃ",
    "0",
    "1",
    "０",
    "１",
  ];

  const symbolTest = [
    "　",
    "！",
    "”",
    "“",
    "＃",
    "＄",
    "％",
    "＆",
    "’",
    "（",
    "）",
    "＊",
    "＋",
    "，",
    "－",
    "．",
    "￥",
    "／",
    "；",
    "＞",
    "＜",
    "＝",
    "？",
    "＠",
    "［",
    "＼",
    "］",
    "＾",
    "＿",
    "‘",
    "｛",
    "｜",
    "｝",
    "～",
    " ",
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "\\",
    "/",
    ";",
    ">",
    "<",
    "=",
    "?",
    "@",
    "[",
    "]",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
  ];
  const symbolTestString = symbolTest.join(" ");

  // 結論：半角タグ文字はマッチに使えない。がんばったら、&lt;をマッチ文字にできるが、ややこしいから禁止にした方がよい

  // ケース1:対象文字列中にタグ文字で囲まれた文字列がある場合、タグ文字を含めて、タグ内部の文言はハイライト対象にできない
  // 理由：タグ文字含めて、HTMLタグ解釈されるため。タグ分解の正規表現の精度を上げれば回避できるが、一律NGにした方がよい。
  //  そもそも生のタグ文字はデータに含まれていないはず。-> 入力チェック制限にした方が良い
  const symbolTest2String =
    "タグの前<タグ内部>タグの外　imgタグの前<img src='imgタグ内部'/>imgタグの外"; // タグ付き
  const tagSymbolTest: HighlightSetting[] = [
    { keyword: "<", color: "yellow" },
    { keyword: ">", color: "yellow" },
    { keyword: "&lt;", color: "yellow" },
    { keyword: "&gt;", color: "yellow" },
    { keyword: "&amp;lt;", color: "yellow" },
    { keyword: "&amp;gt;", color: "yellow" },
    { keyword: "タグ内部", color: "yellow" },
  ];

  // ケース2:タグ文字で囲んだ場合と結果は同様。parseライブラリの仕様のため、加工処理の段階でエスケープ文字は対応する記号に変換される
  const symbolTest3String =
    "エスケープ文字を利用したタグの前&lt;タグ内部&gt;タグの外　imgタグの前&lt;img src='imgタグ内部'/&gt;imgタグの外"; // タグ付き

  // ケース3:エスケープ文字(&)もエスケープする場合。parseライブラリのエスケープ解決は1段階まで。つまり&amp;→&変換まで。
  // ゆえに、&文字のエスケープまで行わないと、厳密にXSSのガードにならない
  const symbolTest4String =
    "エスケープ文字を利用(＆もエスケープ）したタグの前&amp;lt;タグ内部&amp;gt;タグの外　imgタグの前&amp;lt;img src='imgタグ内部'/&amp;gt;imgタグの外"; // タグ付き

  return (
    <>
      <h2>html-react-parseのテスト</h2>
      <h4>ハイライト設定</h4>
      {sampleHighlightSettings.map((item, i) => (
        <div>
          {i}:{item.keyword}, {item.color}
        </div>
      ))}
      <br />
      <DisplayCard
        key={1}
        title="原文"
        planeHtml={htmlString}
        parsedComponent={<>{parse(htmlString)}</>}
      />
      <hr />
      <DisplayCard
        key={2}
        title="タグ削除"
        planeHtml={htmlString}
        parsedComponent={<>{parse(htmlString, optTagStrip)}</>}
      />
      <hr />
      <DisplayCard
        key={3}
        title="ハイライト化（複数キーワード対応、タグ文字列置換による実装）"
        planeHtml={htmlString}
        parsedComponent={
          <HighlightKeywords
            text={htmlString}
            settings={sampleHighlightSettings}
            enableHighlight={true}
          />
        }
      />
      <hr />
      <DisplayCard
        key={4}
        title="ハイライト化（複数キーワード対応、JSX.Elementによる実装）"
        planeHtml={htmlString}
        parsedComponent={
          <HighlightKeywords2
            text={htmlString}
            settings={sampleHighlightSettings}
            enableHighlight={true}
          />
        }
      />
      <DisplayCard
        key={5}
        title="ハイライト化（複数キーワード対応、JSX.Element traverseによる実装）"
        planeHtml={htmlString}
        parsedComponent={
          <HighlightKeywords3
            text={htmlString}
            settings={sampleHighlightSettings}
            enableHighlight={true}
          />
        }
      />
      {/* <div>
        {traverse(
          <p>
            <div>
              段落１<u>文章１highlight</u>
            </div>
            <div>段落２ highlight</div>
          </p>,
          { keyword: "highlight", color: "yellow" }
        )}
      </div> */}
      {symbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s}</h4>
          <HighlightKeywords3
            key={i}
            text={symbolTestString}
            settings={[{ keyword: s, color: "yellow" }]}
          />
        </>
      ))}
      <h4>原文：{symbolTest2String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          ハイライト結果：
          <HighlightKeywords3 key={i} text={symbolTest2String} settings={[s]} />
        </>
      ))}
      <h4>原文：{symbolTest3String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          ハイライト結果：
          <HighlightKeywords3 key={i} text={symbolTest3String} settings={[s]} />
        </>
      ))}
      <h4>原文：{symbolTest4String}</h4>
      {tagSymbolTest.map((s, i) => (
        <>
          <h4>キーワード：{s.keyword}</h4>
          <HighlightKeywords3 key={i} text={symbolTest4String} settings={[s]} />
        </>
      ))}
      <div style={{ marginTop: "20px" }}>
        <Link href="/">Homeに戻る</Link>
      </div>
    </>
  );
};

// 表示用レイアウトコンポーネント
type DisplayCardProps = {
  title: string;
  description?: string;
  planeHtml: string;
  parsedComponent: JSX.Element;
};
const DisplayCard = ({
  title,
  description,
  planeHtml,
  parsedComponent,
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
              width: "800px",
              background: "white",
              margin: "10px",
              overflow: "scroll",
            }}
          >
            <div style={{ padding: "5px" }}>{planeHtml}</div>
          </div>
        </div>
        <div>
          <div style={{ padding: "5px" }}>パース済HTML</div>
          <div
            style={{
              border: "1px solid black",
              width: "800px",
              background: "white",
              margin: "10px",
              overflow: "scroll",
            }}
          >
            <div style={{ padding: "5px" }}>{parsedComponent}</div>
          </div>
        </div>
      </div>
    </>
  );
};
export default HighLightSample3;
