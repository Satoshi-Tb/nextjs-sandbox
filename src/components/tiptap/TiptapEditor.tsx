import { useState } from "react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Highlight from "@tiptap/extension-highlight";
import { EditorContent, useEditor } from "@tiptap/react";
import React from "react";
import { Button, Select, MenuItem, SelectChangeEvent } from "@mui/material";

export default () => {
  const [color, setColor] = useState("yellow");

  // 一部のタグしか、有効にならないような制御が入っている
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Highlight.configure({ multicolor: true }),
    ],
    content: `
      <p>
      React (リアクト) は、Meta（旧Facebook）とコミュニティによって開発されているユーザインタフェース構築のためのJavaScriptライブラリである。React.jsまたはReactJSの名称でも知られている。
      </p>
      <p>
      Reactはシングルページアプリケーションや<a href="">モバイルアプリケーション</a>の開発におけるベースとして使用することができる。
      </p>
      <p>
      複雑なReactアプリケーションでは通常、状態管理・ルーティング・APIとの対話のための追加のライブラリが必要となる。
      </p>
      <p>
      Next.js（ネクストジェイエス）は、Node.js上に構築されたオープンソースのWebアプリケーションフレームワークであり、 サーバーサイドスクリプトや静的Webサイトの生成などの、ReactベースのWebアプリケーション機能を有効にする。
      </p>
    `,
    editable: false,
  });

  const handleChange = (event: SelectChangeEvent, child: React.ReactNode) => {
    setColor(event.target.value);
  };

  const handleHighlight = () => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color: color }).run();
  };

  const handleClear = () => {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().run();
  };

  return (
    <div style={{ margin: "5px" }}>
      <EditorContent
        editor={editor}
        style={{ width: "600px", background: "white" }}
      />
      <hr />
      <Button onClick={handleHighlight}>Highlight</Button>
      <Select
        value={color}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value="" disabled>
          マーク色
        </MenuItem>
        <MenuItem value={"yellow"}>黄</MenuItem>
        <MenuItem value={"lime"}>緑</MenuItem>
        <MenuItem value={"red"}>赤</MenuItem>
      </Select>
      <Button onClick={handleClear}>Clear Mark</Button>
    </div>
  );
};
