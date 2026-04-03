import { useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

const initialHtml = `<section>
  <h1>HTML Editor Sample</h1>
  <p>
    これは <strong>Monaco Editor</strong> で編集した HTML を
    <em>右側プレビュー</em> に反映するサンプルです。
  </p>

  <h2>ポイント</h2>
  <ul>
    <li>見出しや段落の編集</li>
    <li><a href="https://nextjs.org/" target="_blank" rel="noreferrer">リンク表示</a></li>
    <li>表や引用の見た目確認</li>
  </ul>

  <blockquote>
    小さく始めて、必要な機能だけを足していく。
  </blockquote>

  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>項目</th>
        <th>内容</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Editor</td>
        <td><code>Monaco Editor</code></td>
      </tr>
      <tr>
        <td>Preview</td>
        <td><code>dangerouslySetInnerHTML</code></td>
      </tr>
    </tbody>
  </table>
</section>`;

export function HtmlEditorSample() {
  const [html, setHtml] = useState(initialHtml);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>HTML Editor Sample</h1>
          <p style={{ margin: "4px 0 0", color: "#555" }}>
            左で HTML を編集し、右で描画結果を確認します。
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#555", fontSize: "14px" }}>
            {html.length} chars
          </span>
          <button
            type="button"
            onClick={() => setHtml(initialHtml)}
            style={{
              border: "1px solid #ccc",
              background: "#fff",
              borderRadius: "6px",
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "16px",
          minHeight: "70vh",
        }}
      >
        <section
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #e5e5e5",
              color: "#222",
              fontSize: "14px",
              fontWeight: 600,
              background: "#fafafa",
            }}
          >
            Editor
          </div>
          <MonacoEditor
            height="calc(70vh - 45px)"
            defaultLanguage="html"
            language="html"
            theme="vs"
            value={html}
            onChange={(value) => setHtml(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </section>

        <section
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #e5e5e5",
              color: "#222",
              fontSize: "14px",
              fontWeight: 600,
              background: "#fafafa",
            }}
          >
            Preview
          </div>
          <div
            style={{
              padding: "20px",
              minHeight: "calc(70vh - 45px)",
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      </div>
    </div>
  );
}

export default HtmlEditorSample;
