import { useEffect, useState } from "react";
//import { SearchNReplace } from "@sereneinserenade/tiptap-extension-search-n-replace";
import { SearchAndReplace } from "./extentions/SearchAndReplace";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";

const SearchAndReplaceEditor = () => {
  const editor = useEditor({
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
    extensions: [
      Document,
      Paragraph,
      Text,
      SearchAndReplace.configure({
        searchResultClass: "search-result", // class to give to found items. default 'search-result'
        caseSensitive: false, // no need to explain
        disableRegex: false, // also no need to explain
      }),
    ],
  });

  const [searchTerm, setSearchTerm] = useState("React");

  const [replaceTerm, setReplaceTerm] = useState("astonishing");

  //TODO うまく動作しない
  useEffect(() => {
    if (!editor) return;
    console.log("keyword changed");
    editor.chain().setSearchTerm(searchTerm).run();
    //editor.commands.setSearchTerm(searchTerm);
    //editor.commands.setReplaceTerm(replaceTerm);
  }, [searchTerm, replaceTerm]);

  const handelOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handelOnChange!");
    setSearchTerm((prev) => {
      return event.target.value;
    });
  };

  return (
    <div>
      <EditorContent
        editor={editor}
        style={{ width: "600px", background: "white" }}
      />
      <hr />
      <input type="text" value={searchTerm} onChange={handelOnChange} />
    </div>
  );
};

export default SearchAndReplaceEditor;
