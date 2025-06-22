import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
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
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ListIcon from "@mui/icons-material/List";
import * as rangy from "rangy";
import "rangy/lib/rangy-serializer";
import "rangy/lib/rangy-classapplier";

// 保存された範囲の型定義
export type SavedRange = {
  id: number;
  order: number;
  serialized: string;
  text: string;
  timestamp: string;
};

type RangyManualHighlightAreaProps = {
  html: string; // ハイライト設定対象のHTMLドキュメント
  onError?: (error: Error) => void; // エラー発生時のハンドラ
  onRangeSelect?: (range: SavedRange) => void; // 範囲選択された場合のハンドラ。範囲永続化API実行などの利用を想定
  onRangeDelete?: (id: number) => void; // 保存済選択範囲を削除された場合のハンドラ。範囲永続化API実行などの利用を想定
};

export const RangyManualHighlightArea: React.FC<
  RangyManualHighlightAreaProps
> = ({ html, onError, onRangeSelect, onRangeDelete }) => {
  const [serializedRanges, setSerializedRanges] = useState<SavedRange[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rangyの初期化
    if (typeof window !== "undefined") {
      try {
        rangy.init();
        console.log("Rangyライブラリが初期化されました");
      } catch (err) {
        const error = new Error(
          `Rangy初期化エラー: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error(error.message);
        onError?.(error);
      }
    }
  }, [onError]);

  // serializedRangesが変更された時にハイライトを更新
  useEffect(() => {
    if (!contentRef.current) return;

    try {
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
    } catch (err) {
      const error = new Error(
        `ハイライト更新エラー: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error(error.message);
      onError?.(error);
    }
  }, [serializedRanges, onError]);

  // マウスアップ時の範囲選択処理（元のDOM状態でシリアライズ）
  // TODO 範囲選択が重なる場合に失敗する。設定済ハイライトの前方から新しくハイライトを設定し、それぞれが重なると、範囲設定エラーになる
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
            // 新しい範囲を作成
            const newRange: SavedRange = {
              id: Date.now(),
              order: orderCounter,
              serialized: serialized,
              text: selectedText,
              timestamp: new Date().toLocaleString(),
            };

            setSerializedRanges((prev) => [...prev, newRange]);
            setOrderCounter((prev) => prev + 1);
            console.log(
              `範囲を保存しました: "${selectedText.substring(0, 30)}${
                selectedText.length > 30 ? "..." : ""
              }"`
            );

            // 親コンポーネントに通知
            onRangeSelect?.(newRange);
          }
        }

        // 選択を解除
        selection.removeAllRanges();
      } catch (err) {
        const error = new Error(
          `範囲選択処理エラー: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        console.error(error.message);
        onError?.(error);
      }
    }, 10);
  };

  // 特定の保存範囲を削除
  const handleDeleteRange = (id: number): void => {
    try {
      setSerializedRanges((prev) => prev.filter((range) => range.id !== id));
      console.log("範囲を削除しました");

      // 親コンポーネントに通知
      onRangeDelete?.(id);
    } catch (err) {
      const error = new Error(
        `範囲削除エラー: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(error.message);
      onError?.(error);
    }
  };

  // すべての保存範囲を削除
  const handleClearAll = (): void => {
    try {
      const deletedIds = serializedRanges.map((range) => range.id);
      setSerializedRanges([]);
      setOrderCounter(1);
      console.log("すべての範囲を削除しました");

      // 親コンポーネントに各削除を通知
      deletedIds.forEach((id) => onRangeDelete?.(id));
    } catch (err) {
      const error = new Error(
        `全範囲削除エラー: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(error.message);
      onError?.(error);
    }
  };

  // ダイアログを開く
  const handleOpenDialog = (): void => {
    setDialogOpen(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = (): void => {
    setDialogOpen(false);
  };

  return (
    <>
      {/* 親コンテナ（相対位置指定） */}
      <Box sx={{ position: "relative" }}>
        {/* サンプルテキスト表示エリア */}
        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: html }}
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

        {/* オーバーレイボタン（絶対位置指定） */}
        <Button
          variant="contained"
          onClick={handleOpenDialog}
          startIcon={<ListIcon />}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            minWidth: "auto",
            px: 2,
            py: 1,
            fontSize: "0.875rem",
          }}
        >
          下線一覧 ({serializedRanges.length})
        </Button>
      </Box>

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
            <Box display="flex" alignItems="center">
              <Button
                onClick={handleClearAll}
                disabled={serializedRanges.length === 0}
                color="error"
              >
                <Typography variant="body2">すべて削除</Typography>
                <DeleteForeverIcon />
              </Button>
            </Box>
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
                        <Typography variant="body2" title={range.text}>
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
                          }}
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
    </>
  );
};
