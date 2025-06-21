import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ListIcon from "@mui/icons-material/List";
import * as rangy from "rangy";
import "rangy/lib/rangy-serializer";
import "rangy/lib/rangy-classapplier";

// 保存された範囲の型定義
interface SavedRange {
  id: number;
  order: number;
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

const RangyApp: React.FC = () => {
  const [serializedRanges, setSerializedRanges] = useState<SavedRange[]>([]);
  const [message, setMessage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rangyの初期化
    if (typeof window !== "undefined") {
      rangy.init();
      setMessage("Rangyライブラリが初期化されました");
    }
  }, []);

  // serializedRangesが変更された時にハイライトを更新
  useEffect(() => {
    if (!contentRef.current) return;

    // 既存のハイライトをすべて除去してDOM構造を完全にリセット
    const allUnderlines = contentRef.current.querySelectorAll(
      '[class*="rangy-underline"]'
    );
    allUnderlines.forEach((element) => {
      const parent = element.parentNode;
      if (parent) {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      }
    });

    // DOM正規化（隣接するテキストノードをマージして元の状態に戻す）
    contentRef.current.normalize();

    // 戦略: 文書の後方から前方に向かって適用（後ろの要素から適用すると前の位置が変わらない）
    const sortedRanges = [...serializedRanges].sort((a, b) => {
      // シリアライズデータから開始位置を抽出
      const getStartPosition = (serialized: string) => {
        try {
          // "2/3:7,2/3:11" のような形式から開始位置を数値化
          const parts = serialized.split(",");
          if (parts.length > 0) {
            const startPart = parts[0];
            const pathAndOffset = startPart.split(":");
            if (pathAndOffset.length === 2) {
              const path = pathAndOffset[0].split("/").map(Number);
              const offset = Number(pathAndOffset[1]);
              // パス要素を重み付きで計算（より深い階層ほど大きな重み）
              let position = 0;
              for (let i = 0; i < path.length; i++) {
                position += path[i] * Math.pow(1000, path.length - i - 1);
              }
              return position + offset;
            }
          }
        } catch (e) {
          console.warn("位置解析エラー:", serialized, e);
        }
        return 0;
      };

      // 降順ソート（後ろの要素から適用）
      return getStartPosition(b.serialized) - getStartPosition(a.serialized);
    });

    console.log(
      "適用順序（後方から前方）:",
      sortedRanges.map((r) => ({
        order: r.order,
        text: r.text,
        serialized: r.serialized,
      }))
    );

    // 後方の要素から順番に適用（前の要素の位置に影響しない）
    sortedRanges.forEach((savedRange, index) => {
      try {
        const range = (rangy as any).deserializeRange(
          savedRange.serialized,
          contentRef.current
        );
        if (range) {
          const applier = (rangy as any).createCssClassApplier(
            `rangy-underline-${savedRange.id}`,
            {
              elementTagName: "span",
              elementProperties: {
                style: {
                  borderBottom: "3px solid red",
                  textDecoration: "none",
                },
              },
            }
          );
          applier.applyToRange(range);
          console.log(
            `適用成功 (${index + 1}/${sortedRanges.length}):`,
            savedRange.text
          );
        } else {
          console.warn(
            `範囲の復元に失敗 (順序: ${savedRange.order}, ID: ${savedRange.id}):`,
            savedRange.serialized
          );
        }
      } catch (err) {
        console.warn(
          `ハイライト適用エラー (順序: ${savedRange.order}, ID: ${savedRange.id}):`,
          err
        );
      }
    });
  }, [serializedRanges]);

  // マウスアップ時の範囲選択処理（元のDOM状態でシリアライズ）
  const handleMouseUp = (): void => {
    setTimeout(() => {
      try {
        const selection = rangy.getSelection();
        if (selection.rangeCount === 0) {
          return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (!selectedText) {
          return;
        }

        // 重要: 元のDOM構造（ハイライト適用前）でシリアライズを取得
        // まず一時的にすべてのハイライトを除去
        const tempRemovedRanges = [...serializedRanges];

        // DOM構造をクリーンな状態に戻す
        if (contentRef.current) {
          const allUnderlines = contentRef.current.querySelectorAll(
            '[class*="rangy-underline"]'
          );
          allUnderlines.forEach((element) => {
            const parent = element.parentNode;
            if (parent) {
              while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
              }
              parent.removeChild(element);
            }
          });
          contentRef.current.normalize();
        }

        // クリーンなDOM状態で新しい選択範囲を取得し直す
        const cleanSelection = rangy.getSelection();
        if (cleanSelection.rangeCount > 0) {
          const cleanRange = cleanSelection.getRangeAt(0);
          const serialized = (rangy as any).serializeRange(
            cleanRange,
            true,
            contentRef.current
          );

          if (serialized) {
            // 新しい範囲を状態に追加
            const newRange: SavedRange = {
              id: Date.now(),
              order: orderCounter,
              serialized: serialized,
              text: selectedText,
              timestamp: new Date().toLocaleString(),
            };

            setSerializedRanges((prev) => [...prev, newRange]);
            setOrderCounter((prev) => prev + 1);
            setMessage(
              `範囲を保存しました: "${selectedText.substring(0, 30)}${
                selectedText.length > 30 ? "..." : ""
              }"`
            );
          }
        }

        // 選択を解除
        selection.removeAllRanges();
      } catch (err) {
        setMessage(
          `エラー: 範囲処理中にエラーが発生しました - ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }, 10);
  };

  // 下線をクリア
  const clearUnderlines = (): void => {
    if (contentRef.current) {
      // 各範囲のクラス名で検索して削除
      serializedRanges.forEach((savedRange) => {
        const underlinedElements = contentRef.current!.querySelectorAll(
          `.rangy-underline-${savedRange.id}`
        );
        underlinedElements.forEach((element) => {
          const parent = element.parentNode;
          if (parent) {
            while (element.firstChild) {
              parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
          }
        });
      });

      // CSS属性セレクタで全ての下線要素を検索（より確実な方法）
      const allUnderlines = contentRef.current.querySelectorAll(
        '[class*="rangy-underline"]'
      );
      allUnderlines.forEach((element) => {
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
    setOrderCounter(1);
    setMessage("成功: すべての範囲を削除しました");
  };

  // ダイアログを開く
  const handleOpenDialog = (): void => {
    setDialogOpen(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = (): void => {
    setDialogOpen(false);
  };

  // 保存された範囲を復元（下線表示）
  const handleRestoreRange = (serialized: string): void => {
    // 特定の範囲のみを復元する場合は、該当範囲のみの配列を作成して状態更新
    const targetRange = serializedRanges.find(
      (range) => range.serialized === serialized
    );
    if (targetRange) {
      // 一時的に該当範囲のみを表示
      setSerializedRanges([targetRange]);
      setMessage("範囲に下線を復元しました");

      // 3秒後に全範囲を復元
      setTimeout(() => {
        setSerializedRanges((prev) => {
          // 元の配列を復元（targetRangeが含まれているかチェック）
          const originalRanges = [...serializedRanges];
          return originalRanges;
        });
      }, 3000);
    }
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
          サンプルテキスト（範囲選択すると自動で下線が設定されます）
        </Typography>

        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: SAMPLE_TEXT }}
          onMouseUp={handleMouseUp}
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
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            startIcon={<ListIcon />}
            sx={{ mr: 1 }}
          >
            下線一覧 ({serializedRanges.length})
          </Button>
          <Button variant="outlined" onClick={() => setSerializedRanges([])}>
            下線クリア
          </Button>
        </Box>
      </Paper>

      {/* 下線一覧ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              下線一覧 ({serializedRanges.length}件)
            </Typography>
            <IconButton
              color="error"
              onClick={handleClearAll}
              disabled={serializedRanges.length === 0}
              title="すべて削除"
            >
              <ClearAllIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {serializedRanges.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ py: 4 }}
            >
              保存された下線はありません
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>順番</TableCell>
                    <TableCell>選択テキスト</TableCell>
                    <TableCell>シリアライズデータ</TableCell>
                    <TableCell>作成日時</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serializedRanges.map((range) => (
                    <TableRow key={range.id} hover>
                      <TableCell>{range.order}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          variant="body2"
                          title={range.text}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={() => handleRestoreRange(range.serialized)}
                        >
                          {range.text.length > 50
                            ? `${range.text.substring(0, 50)}...`
                            : range.text}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            wordBreak: "break-all",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                          title="クリックで下線を復元"
                          onClick={() => handleRestoreRange(range.serialized)}
                        >
                          {range.serialized.length > 80
                            ? `${range.serialized.substring(0, 80)}...`
                            : range.serialized}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {range.timestamp}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRange(range.id)}
                          size="small"
                          title="削除"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RangyApp;
