import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { CssHighlightArea, SavedRange, AppMode } from "./CssHighlightArea";
import Link from "next/link";

// CssHighlightAreaコンポーネントのデモアプリ

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
  const [currentMode, setCurrentMode] = useState<AppMode>("line");
  const [persistedRanges, setPersistedRanges] = useState<SavedRange[]>([]);

  const handleRangeSelect = (range: SavedRange): void => {
    console.log("範囲が選択されました:", range);
    // 永続化処理のシミュレーション
    setPersistedRanges((prev) => {
      const exists = prev.find((r) => r.id === range.id);
      if (exists) {
        return prev; // 既に存在する場合は追加しない
      }
      const updated = [...prev, range];
      console.log("永続化データ更新:", updated.length, "件");
      return updated;
    });
  };

  const handleRangeDelete = (id: number): void => {
    console.log("範囲が削除されました:", id);
    // 永続化データからも削除
    setPersistedRanges((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      console.log("永続化データ更新:", updated.length, "件");
      return updated;
    });
  };

  const handleError = (error: Error): void => {
    console.error("アプリケーションエラー:", error);
    setErrorMessage(error.message);
  };

  const handleModeChange = (): void => {
    if (currentMode === "line") {
      setCurrentMode("eraser");
    } else {
      setCurrentMode("line");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        CSS Custom Highlight Area Demo
      </Typography>

      {/* ブラウザ対応状況の説明 */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          💡 CSS Custom Highlight API について
        </Typography>
        <Typography variant="body2" component="div">
          この機能は以下のブラウザで利用可能です：
          <ul>
            <li>Chrome 105+ (2022年9月〜)</li>
            <li>Firefox 113+ (2023年5月〜)</li>
            <li>Safari 17.2+ (2023年12月〜)</li>
          </ul>
          古いブラウザでは警告メッセージが表示され、機能が無効化されます。
        </Typography>
      </Box>

      {/* 永続化状態表示 */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          bgcolor: "#e3f2fd",
          borderRadius: 1,
          border: "1px solid #2196f3",
        }}
      >
        <Typography variant="h6" gutterBottom>
          💾 永続化シミュレーション
        </Typography>
        <Typography variant="body2">
          <strong>保存済み範囲:</strong> {persistedRanges.length}件
          {persistedRanges.length > 0 && (
            <Box component="span" sx={{ ml: 1 }}>
              - 最新: &ldqt;
              {persistedRanges[persistedRanges.length - 1]?.text.substring(
                0,
                20
              )}
              ...&ldqt;
            </Box>
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          このデモでは、部品が内部でRangeオブジェクトを管理し、永続化イベント時にのみXPath形式で外部に通知する仕組みを確認できます。
        </Typography>
      </Box>
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

      {/* エラーメッセージ表示 */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 1,
          border: "1px solid #dee2e6",
        }}
      >
        <Typography variant="h6" gutterBottom>
          📝 操作方法
        </Typography>
        <Typography variant="body2" component="div">
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            <li>
              <strong>ラインモード（🖍️）:</strong>{" "}
              テキストを選択してハイライトを追加
            </li>
            <li>
              <strong>消しゴムモード（🧹）:</strong> ハイライト範囲を選択して
              <strong>部分削除</strong>
            </li>
            <li>
              <strong>モード切替:</strong>{" "}
              左上のボタンでライン/消しゴムを切り替え
            </li>
            <li>
              <strong>一覧表示:</strong>{" "}
              右上のボタンで設定済みハイライト一覧を表示
            </li>
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "#fff3cd",
              borderRadius: 1,
              border: "1px solid #ffc107",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", color: "#856404" }}
            >
              🎯 消しゴム機能の特徴
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ mt: 0.5, color: "#856404" }}
            >
              • 選択した範囲の<strong>部分のみ</strong>を削除
              <br />
              • ハイライト全体ではなく、重複箇所だけを消去
              <br />• 残った部分は自動的に新しいハイライトとして保持
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 1,
              p: 1,
              bgcolor: currentMode === "line" ? "#e3f2fd" : "#ffebee",
              borderRadius: 1,
            }}
          >
            現在のモード:{" "}
            <strong>
              {currentMode === "line" ? "🖍️ ラインモード" : "🧹 消しゴムモード"}
            </strong>
          </Box>
        </Typography>
      </Box>

      <CssHighlightArea
        html={SAMPLE_HTML}
        mode={currentMode}
        initialRanges={persistedRanges}
        onError={handleError}
        onRangeSelect={handleRangeSelect}
        onRangeDelete={handleRangeDelete}
        onModeChange={handleModeChange}
        contentAreaSx={{
          // カスタムスタイルの例
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
          minHeight: 200,
          backgroundColor: "#fafafa",
          userSelect: "text",
          "& h2": { color: "#1976d2", mt: 0 },
          "& blockquote": {
            borderLeft: "4px solid #1976d2",
            pl: 2,
            ml: 0,
            fontStyle: "italic",
            backgroundColor: "#f0f0f0",
          },
        }}
      />

      {/* 技術説明 */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "#e8f5e8", borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🚀 新アーキテクチャ：Range管理 + 永続化分離
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>
              <strong>内部Range管理:</strong>{" "}
              部品内でRangeオブジェクトを直接保持・操作
            </li>
            <li>
              <strong>高速処理:</strong>{" "}
              XPath変換処理を削減し、大幅なパフォーマンス向上
            </li>
            <li>
              <strong>永続化分離:</strong> 外部API呼び出し時のみXPath形式に変換
            </li>
            <li>
              <strong>初期復元:</strong>{" "}
              `initialRanges`プロパティで永続化データから復元
            </li>
            <li>
              <strong>イベント駆動:</strong>{" "}
              `onRangeSelect`/`onRangeDelete`で外部システム連携
            </li>
          </ul>
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "#d4edda",
            borderRadius: 1,
            border: "1px solid #c3e6cb",
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", color: "#155724" }}
          >
            アーキテクチャ: [部品内部: Range管理] ↔ [外部API: XPath永続化]
            <br />
            利用者は永続化処理のみに集中でき、部品は高速Range操作に専念
          </Typography>
        </Box>
      </Box>

      {/* フッター */}
      <Box sx={{ mt: 3 }}>
        <Link href="/">TOP</Link>
      </Box>
    </Container>
  );
};

export default DemoApp;
