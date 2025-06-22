import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import {
  RangyManualHighlightArea,
  SavedRange,
} from "@/components/manualHightlight/RangeSerializeWithRangySample";

// サンプルテキスト（複数のHTML要素を含む）
const SAMPLE_HTML = `
<h2>科学技術の進歩について</h2>
<p>現代社会における<strong>科学技術の発展</strong>は目覚ましく、私たちの生活に大きな変化をもたらしています。</p>
<p>特に以下の分野で顕著な進歩が見られます：</p>
<ul>
  <li><span style="color: blue;">人工知能（AI）</span>の発達</li>
  <li>量子コンピュータの研究 <sup>1</sup></li>
  <li>バイオテクノロジーの応用</li>
</ul>
<p>これらの技術は、<u>医療</u>、<em>教育</em>、<mark>環境保護</mark>など様々な分野で活用されています。</p>
<blockquote>
  「技術は人類の未来を切り開く鍵である」<br/>
  - 科学者 田中博士
</blockquote>
<p>化学式の例：H<sub>2</sub>O（水）、CO<sub>2</sub>（二酸化炭素）</p>
<p>数学の公式：E = mc<sup>2</sup></p>
<p>詳細については、<a href="#more-info" style="color: #1976d2;">こちらのリンク</a>をご覧ください。</p>
<p><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'%3E%3Crect width='100' height='50' fill='%23e3f2fd'/%3E%3Ctext x='50' y='30' text-anchor='middle' fill='%23333'%3E図表1%3C/text%3E%3C/svg%3E" alt="サンプル図表" style="vertical-align: middle;"/> この図表は技術の進歩を示しています。</p>
`;

const DemoApp: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleError = (error: Error): void => {
    console.error("アプリケーションエラー:", error);
    setErrorMessage(error.message);
  };

  const handleRangeSelect = (range: SavedRange): void => {
    console.log("範囲が選択されました:", range);
    // 必要に応じて外部システムに保存など
  };

  const handleRangeDelete = (id: number): void => {
    console.log("範囲が削除されました:", id);
    // 必要に応じて外部システムから削除など
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rangy Manual Highlight Area Demo
      </Typography>

      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <Box sx={{ mb: 2, p: 1, bgcolor: "#ffebee", borderRadius: 1 }}>
          <Typography
            variant="body2"
            color="error"
            onClick={() => setErrorMessage("")}
            sx={{ cursor: "pointer" }}
          >
            {errorMessage} (クリックで閉じる)
          </Typography>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        範囲選択でハイライト設定
      </Typography>

      <RangyManualHighlightArea
        html={SAMPLE_HTML}
        onError={handleError}
        onRangeSelect={handleRangeSelect}
        onRangeDelete={handleRangeDelete}
      />
    </Container>
  );
};

export default DemoApp;
