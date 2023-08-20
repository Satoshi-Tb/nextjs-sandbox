import React, { useState } from "react";
import {
  Editor,
  EditorState,
  ContentState,
  Modifier,
  SelectionState,
} from "draft-js";

const HighlightAndMarkEditor: React.FC = () => {
  const initialContent = ContentState.createFromText(
    `
    React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
    Reactはシングルページアプリケーションやモバイルアプリケーションの開発におけるベースとして使用することができる。複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
    Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースの<span style='text-decoration: solid underline purple 4px;'>Webアプリケーションフレームワーク</span>であり、
    サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
    `
  );
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createWithContent(initialContent)
  );

  const handleHighlightSelection = () => {
    const selection: SelectionState = editorState.getSelection();
    console.log(selection);
    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent();
      const contentStateWithHighlight = Modifier.applyInlineStyle(
        contentState,
        selection,
        "HIGHLIGHT"
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithHighlight,
        "change-inline-style"
      );

      const selectionStateAfterHighlight = selection.merge({
        anchorOffset: selection.getEndOffset(),
        focusOffset: selection.getEndOffset(),
      }) as SelectionState;

      const finalEditorState = EditorState.forceSelection(
        newEditorState,
        selectionStateAfterHighlight
      );

      setEditorState(finalEditorState);
    }
  };

  return (
    <div>
      <button onClick={handleHighlightSelection}>選択部分をハイライト</button>
      <div style={styles.editor}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          customStyleMap={styleMap}
          readOnly={true} // エディタを読み取り専用に設定
        />
      </div>
    </div>
  );
};

const styleMap = {
  HIGHLIGHT: {
    backgroundColor: "yellow",
  },
};

const styles = {
  editor: {
    border: "1px solid gray",
    minHeight: "6em",
    padding: "10px",
  },
};

export default HighlightAndMarkEditor;
