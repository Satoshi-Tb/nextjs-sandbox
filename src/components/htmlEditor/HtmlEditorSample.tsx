import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Loading editor...
      </Typography>
    </Box>
  ),
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" component="h1">
            HTML Editor Sample
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            左で HTML を編集し、右で描画結果を確認します。
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {html.length} chars
          </Typography>
          <Button
            type="button"
            onClick={() => setHtml(initialHtml)}
            variant="outlined"
            size="small"
          >
            Reset
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2,
          minHeight: "70vh",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Editor
            </Typography>
          </Box>
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
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.50",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Preview
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2.5,
              minHeight: "calc(70vh - 45px)",
              overflow: "auto",
              "& h1, & h2, & h3": { mt: 0 },
              "& table": { borderCollapse: "collapse" },
              "& th, & td": { borderColor: "#bdbdbd" },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Paper>
      </Box>
    </Box>
  );
}

export default HtmlEditorSample;
