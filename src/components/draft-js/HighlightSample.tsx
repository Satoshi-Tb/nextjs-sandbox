import { Editor, EditorState, RichUtils, convertFromRaw } from "draft-js";
import React, { useState, useEffect } from "react";
import { createHighlightDecorator } from "./decolators/HighlightDecorator";

const initialText = `
React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、
サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
`;

const initData = convertFromRaw({
  entityMap: {},
  blocks: [
    {
      key: "xxxxx",
      text: initialText, // 任意のテキスト
      type: "unstyled", // テキストのタイプ。初期値は "unstyled"
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      data: {},
    },
  ],
});

const initState = EditorState.createWithContent(initData);

const SearchHighlighter = () => {
  const [editorState, setEditorState] = useState<EditorState>(initState);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);

    // Update the decorator with the new keyword
    const decorator = createHighlightDecorator(e.target.value);
    const newEditorState = EditorState.set(editorState, { decorator });
    setEditorState(newEditorState);
  };

  const handleHighlightSelection = () => {
    const selection: Draft.DraftModel.ImmutableData.SelectionState =
      editorState.getSelection();
    if (!selection.isCollapsed()) {
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());
      const selectedText = block
        .getText()
        .slice(selection.getStartOffset(), selection.getEndOffset());

      const decorator = createHighlightDecorator(selectedText);
      const newEditorState = EditorState.set(editorState, { decorator });
      setEditorState(newEditorState);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter search keyword"
          value={searchKeyword}
          onChange={handleKeywordChange}
        />
        <button onClick={handleHighlightSelection}>選択部分をハイライト</button>
      </div>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        readOnly={false}
      />
    </div>
  );
};

export default SearchHighlighter;
