import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
/// <reference types="rangy/lib/rangy-serializer" />
/// <reference types="rangy/lib/rangy-classapplier" />
import * as rangy from "rangy";
import "rangy/lib/rangy-serializer";
import "rangy/lib/rangy-classapplier";

// 保存された範囲の型定義
interface SavedRange {
  id: number;
  serialized: string;
  text: string;
  timestamp: string;
}

// サンプルテキスト（複数のHTML要素を含む）
const SAMPLE_TEXT = `
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

rangy.init();

export const RangyApp: React.FC = () => {
  const [serializedRanges, setSerializedRanges] = useState<SavedRange[]>([]);
  const [deserializeInput, setDeserializeInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   // Rangyの初期化
  //   if (typeof window !== "undefined") {
  //     rangy.init();
  //     setMessage("Rangyライブラリが初期化されました");
  //   }
  // }, []);

  // 選択範囲の取得とシリアライズ
  const handleSerialize = (): void => {
    try {
      const selection = rangy.getSelection();
      if (selection.rangeCount === 0) {
        setMessage("エラー: テキストが選択されていません");
        return;
      }

      const range = selection.getRangeAt(0);
      const serialized = rangy.serializeRange(range, true, contentRef.current);
      const selectedText = range.toString();

      if (serialized && selectedText) {
        const newRange: SavedRange = {
          id: Date.now(),
          serialized: serialized,
          text: selectedText,
          timestamp: new Date().toLocaleString(),
        };

        setSerializedRanges((prev) => [...prev, newRange]);
        setMessage(
          `成功: 範囲を保存しました "${selectedText.substring(0, 30)}${
            selectedText.length > 30 ? "..." : ""
          }"`
        );

        // 選択を解除
        selection.removeAllRanges();
      } else {
        setMessage("エラー: 範囲のシリアライズに失敗しました");
      }
    } catch (err) {
      setMessage(
        `エラー: シリアライズ中にエラーが発生しました - ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  // デシリアライズして範囲に下線を設定
  const handleDeserialize = (): void => {
    if (!deserializeInput.trim()) {
      setMessage("エラー: 入力が空です");
      return;
    }

    try {
      // 既存の下線を削除
      clearUnderlines();

      const range = rangy.deserializeRange(
        deserializeInput.trim(),
        contentRef.current
      );
      if (range) {
        // 下線のスタイルを適用
        const applier = rangy.createCssClassApplier("rangy-underline", {
          elementTagName: "span",
          elementProperties: {
            style: {
              borderBottom: "3px solid red",
              textDecoration: "none",
            },
          },
        });

        applier.applyToRange(range);
        setMessage("成功: 範囲に下線を設定しました");
      } else {
        setMessage("エラー: 無効なシリアライズデータです");
      }
    } catch (err) {
      setMessage(
        `エラー: デシリアライズ中にエラーが発生しました - ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  // 下線をクリア
  const clearUnderlines = (): void => {
    if (contentRef.current) {
      const underlinedElements =
        contentRef.current.querySelectorAll(".rangy-underline");
      underlinedElements.forEach((element) => {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      });
    }
  };

  // 特定の保存範囲を削除
  const handleDeleteRange = (id: number): void => {
    setSerializedRanges((prev) => prev.filter((range) => range.id !== id));
    setMessage("成功: 範囲を削除しました");
  };

  // すべての保存範囲を削除
  const handleClearAll = (): void => {
    setSerializedRanges([]);
    clearUnderlines();
    setMessage("成功: すべての範囲を削除しました");
  };

  // 保存された範囲をテキストエリアに設定
  const handleUseRange = (serialized: string): void => {
    setDeserializeInput(serialized);
    setMessage("シリアライズデータをテキストエリアに設定しました");
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rangy Range Selection Demo
      </Typography>

      {/* メッセージ表示 */}
      {message && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            bgcolor: message.startsWith("エラー") ? "#ffebee" : "#e8f5e8",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            color={message.startsWith("エラー") ? "error" : "success"}
          >
            {message}
          </Typography>
        </Box>
      )}

      {/* サンプルテキストエリア */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          サンプルテキスト
        </Typography>

        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: SAMPLE_TEXT }}
          sx={{
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

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleSerialize} sx={{ mr: 1 }}>
            シリアライズ
          </Button>
          <Button variant="outlined" onClick={clearUnderlines}>
            下線クリア
          </Button>
        </Box>
      </Paper>

      {/* デシリアライズエリア */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          デシリアライズ
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={deserializeInput}
          onChange={(e) => setDeserializeInput(e.target.value)}
          placeholder="シリアライズデータを入力してください"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleDeserialize}
          disabled={!deserializeInput.trim()}
        >
          デシリアライズ
        </Button>
      </Paper>

      {/* 保存された範囲一覧 */}
      <Paper sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            保存された範囲 ({serializedRanges.length})
          </Typography>
          <IconButton
            color="error"
            onClick={handleClearAll}
            disabled={serializedRanges.length === 0}
          >
            <ClearAllIcon />
          </IconButton>
        </Box>

        {serializedRanges.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            保存された範囲はありません
          </Typography>
        ) : (
          <List>
            {serializedRanges.map((range) => (
              <ListItem key={range.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    range.text.substring(0, 50) +
                    (range.text.length > 50 ? "..." : "")
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {range.timestamp}
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        rows={2}
                        value={range.serialized}
                        onClick={() => handleUseRange(range.serialized)}
                        sx={{
                          mt: 1,
                          cursor: "pointer",
                          "& .MuiInputBase-input": { fontSize: "0.8rem" },
                        }}
                        title="クリックでデシリアライズエリアに設定"
                        InputProps={{ readOnly: true }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDeleteRange(range.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};
