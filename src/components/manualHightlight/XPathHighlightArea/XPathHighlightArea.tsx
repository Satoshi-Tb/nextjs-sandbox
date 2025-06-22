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
  SxProps,
  Theme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ListIcon from "@mui/icons-material/List";

// 保存された範囲の型定義（XPath形式）
export type SavedRange = {
  id: number;
  order: number;
  startXPath: string;
  startOffset: number;
  endXPath: string;
  endOffset: number;
  text: string;
  timestamp: string;
};

type XPathHighlightAreaProps = {
  html: string;
  onError?: (error: Error) => void;
  onRangeSelect?: (range: SavedRange) => void;
  onRangeDelete?: (id: number) => void;
  contentAreaSx?: SxProps<Theme>;
};

export const XPathHighlightArea: React.FC<XPathHighlightAreaProps> = ({
  html,
  onError,
  onRangeSelect,
  onRangeDelete,
  contentAreaSx,
}) => {
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  // XPathユーティリティ関数群
  const XPathUtils = {
    /**
     * DOMノードからXPathを生成
     * @param node - 対象のDOMノード
     * @param root - ルート要素（デフォルトはdocument）
     * @returns XPath文字列
     */
    getXPath: (
      node: Node,
      root: Element = document.documentElement
    ): string => {
      if (node === root) return "";

      let path = "";
      let current = node;

      while (
        current &&
        current !== root &&
        current.nodeType !== Node.DOCUMENT_NODE
      ) {
        let index = 1;
        let sibling = current.previousSibling;

        // 同じノードタイプの兄弟要素をカウント
        while (sibling) {
          if (sibling.nodeType === current.nodeType) {
            if (current.nodeType === Node.ELEMENT_NODE) {
              if (
                (sibling as Element).tagName === (current as Element).tagName
              ) {
                index++;
              }
            } else if (current.nodeType === Node.TEXT_NODE) {
              index++;
            }
          }
          sibling = sibling.previousSibling;
        }

        if (current.nodeType === Node.ELEMENT_NODE) {
          const tagName = (current as Element).tagName.toLowerCase();
          path = `/${tagName}[${index}]${path}`;
        } else if (current.nodeType === Node.TEXT_NODE) {
          path = `/text()[${index}]${path}`;
        }

        current = current.parentNode!;
      }

      return path;
    },

    /**
     * XPathからDOMノードを取得
     * @param xpath - XPath文字列
     * @param root - 検索のルート要素
     * @returns 見つかったノードまたはnull
     */
    getNodeByXPath: (xpath: string, root: Element): Node | null => {
      if (!xpath) return root;

      try {
        const result = document.evaluate(
          xpath,
          root,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        return result.singleNodeValue;
      } catch (error) {
        console.warn("XPath evaluation failed:", xpath, error);
        return null;
      }
    },

    /**
     * 範囲をXPath形式でシリアライズ
     * @param range - Range オブジェクト
     * @param root - ルート要素
     * @returns SavedRangeの一部（XPath情報）
     */
    serializeRange: (range: Range, root: Element): Partial<SavedRange> => {
      const startXPath = XPathUtils.getXPath(range.startContainer, root);
      const endXPath = XPathUtils.getXPath(range.endContainer, root);

      return {
        startXPath,
        startOffset: range.startOffset,
        endXPath,
        endOffset: range.endOffset,
        text: range.toString().trim(),
      };
    },

    /**
     * XPath情報からRangeオブジェクトを復元
     * @param savedRange - 保存された範囲情報
     * @param root - ルート要素
     * @returns 復元されたRangeまたはnull
     */
    deserializeRange: (savedRange: SavedRange, root: Element): Range | null => {
      try {
        const startNode = XPathUtils.getNodeByXPath(
          savedRange.startXPath,
          root
        );
        const endNode = XPathUtils.getNodeByXPath(savedRange.endXPath, root);

        if (!startNode || !endNode) {
          console.warn("Failed to find nodes for range:", savedRange);
          return null;
        }

        const range = document.createRange();

        // オフセットが有効な範囲内かチェック
        const startOffset = Math.min(
          savedRange.startOffset,
          startNode.textContent?.length || 0
        );
        const endOffset = Math.min(
          savedRange.endOffset,
          endNode.textContent?.length || 0
        );

        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        return range;
      } catch (error) {
        console.warn("Range deserialization failed:", savedRange, error);
        return null;
      }
    },
  };

  // ハイライト表示の管理
  const HighlightManager = {
    /**
     * すべてのハイライトを削除してDOMを元の状態に戻す
     */
    clearAllHighlights: (): void => {
      if (!contentRef.current) return;

      // highlight-wrapperクラスの要素を全て取得
      const highlightElements =
        contentRef.current.querySelectorAll(".highlight-wrapper");

      highlightElements.forEach((element) => {
        const parent = element.parentNode;
        if (parent) {
          // 子要素をparentに移動
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          // wrapper要素を削除
          parent.removeChild(element);
        }
      });

      // テキストノードを正規化（隣接するテキストノードをマージ）
      contentRef.current.normalize();
    },

    /**
     * 単一の範囲にハイライトを適用
     * @param range - ハイライトする範囲
     * @param rangeId - 範囲のID
     */
    applyHighlight: (range: Range, rangeId: number): void => {
      try {
        // 範囲の内容を取得
        const contents = range.extractContents();

        // ハイライト用のspan要素を作成
        const highlightSpan = document.createElement("span");
        highlightSpan.className = `highlight-wrapper highlight-${rangeId}`;
        highlightSpan.style.borderBottom = "3px solid red";
        highlightSpan.style.textDecoration = "none";
        highlightSpan.setAttribute("data-highlight-id", rangeId.toString());

        // 抽出した内容をspan内に配置
        highlightSpan.appendChild(contents);

        // 元の位置にspan要素を挿入
        range.insertNode(highlightSpan);

        console.log(`ハイライト適用完了: ID=${rangeId}`);
      } catch (error) {
        console.warn(`ハイライト適用失敗: ID=${rangeId}`, error);
      }
    },

    /**
     * 重複チェック - 新しい範囲が既存の範囲と重複するかチェック
     * @param newRange - チェックする新しい範囲
     * @param existingRanges - 既存の範囲リスト
     * @returns 重複している場合はtrue
     */
    hasOverlap: (newRange: Range, existingRanges: SavedRange[]): boolean => {
      if (!contentRef.current) return false;

      return existingRanges.some((savedRange) => {
        const existingRange = XPathUtils.deserializeRange(
          savedRange,
          contentRef.current!
        );
        if (!existingRange) return false;

        // 範囲の重複判定
        // 1. 新しい範囲の開始が既存範囲内にある
        // 2. 新しい範囲の終了が既存範囲内にある
        // 3. 新しい範囲が既存範囲を完全に包含する
        const newStartInExisting = existingRange.isPointInRange(
          newRange.startContainer,
          newRange.startOffset
        );
        const newEndInExisting = existingRange.isPointInRange(
          newRange.endContainer,
          newRange.endOffset
        );
        const newContainsExisting = newRange.intersectsNode(
          existingRange.commonAncestorContainer
        );

        return newStartInExisting || newEndInExisting || newContainsExisting;
      });
    },

    /**
     * 全ての保存された範囲にハイライトを適用
     * 範囲の重複を避けるため、文書の後方から前方に向かって適用
     */
    applyAllHighlights: (): void => {
      if (!contentRef.current) return;

      // まず全てのハイライトをクリア
      HighlightManager.clearAllHighlights();

      // XPathの文書順序に基づいてソート（後方から適用するため降順）
      const sortedRanges = [...savedRanges].sort((a, b) => {
        // 単純なXPath文字列比較（より精密な比較も可能）
        if (a.startXPath !== b.startXPath) {
          return b.startXPath.localeCompare(a.startXPath);
        }
        return b.startOffset - a.startOffset;
      });

      console.log(
        "ハイライト適用順序（後方→前方）:",
        sortedRanges.map((r) => ({
          order: r.order,
          text: r.text.substring(0, 20) + "...",
          xpath: r.startXPath,
        }))
      );

      // 後方から順番に適用（前の要素の位置に影響しない）
      sortedRanges.forEach((savedRange, index) => {
        const range = XPathUtils.deserializeRange(
          savedRange,
          contentRef.current!
        );
        if (range) {
          HighlightManager.applyHighlight(range, savedRange.id);
          console.log(
            `適用成功 ${index + 1}/${
              sortedRanges.length
            }: ${savedRange.text.substring(0, 30)}`
          );
        } else {
          console.warn(`適用失敗: ${savedRange.text.substring(0, 30)}`);
        }
      });
    },
  };

  // savedRangesが変更された時にハイライトを更新
  useEffect(() => {
    try {
      HighlightManager.applyAllHighlights();
    } catch (err) {
      const error = new Error(
        `ハイライト更新エラー: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error(error.message);
      onError?.(error);
    }
  }, [savedRanges, onError]);

  /**
   * マウスアップ時の範囲選択処理
   * Selection APIを使用してユーザーの選択範囲を取得し、XPath形式で保存
   */
  const handleMouseUp = (): void => {
    // DOM操作の安定化のため少し遅延
    setTimeout(() => {
      try {
        const selection = window.getSelection();

        // 選択がない、または選択範囲が0の場合は何もしない
        if (!selection || selection.rangeCount === 0) {
          return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        // 空の選択の場合は何もしない
        if (!selectedText) {
          return;
        }

        // コンテンツエリア外の選択は無視
        if (!contentRef.current?.contains(range.commonAncestorContainer)) {
          return;
        }

        // 重複チェック（TODO課題の解決）
        // 新しい範囲が既存の範囲と重複する場合は警告を出して処理を中止
        if (HighlightManager.hasOverlap(range, savedRanges)) {
          console.warn(
            "選択範囲が既存のハイライトと重複しています:",
            selectedText.substring(0, 30)
          );
          selection.removeAllRanges();
          onError?.(
            new Error(
              "選択範囲が既存のハイライトと重複しています。重複しない範囲を選択してください。"
            )
          );
          return;
        }

        // 重要: ハイライト適用前のクリーンなDOM状態でXPathを取得
        HighlightManager.clearAllHighlights();

        // クリーンなDOM状態で選択範囲を再取得
        const cleanSelection = window.getSelection();
        if (!cleanSelection || cleanSelection.rangeCount === 0) {
          console.warn("DOM正規化後に選択範囲が失われました");
          return;
        }

        const cleanRange = cleanSelection.getRangeAt(0);
        const serializedData = XPathUtils.serializeRange(
          cleanRange,
          contentRef.current!
        );

        if (serializedData.startXPath && serializedData.endXPath) {
          // 新しい範囲を作成
          const newRange: SavedRange = {
            id: Date.now(), // 簡易的なID生成
            order: orderCounter,
            startXPath: serializedData.startXPath,
            startOffset: serializedData.startOffset!,
            endXPath: serializedData.endXPath,
            endOffset: serializedData.endOffset!,
            text: serializedData.text!,
            timestamp: new Date().toLocaleString(),
          };

          setSavedRanges((prev) => [...prev, newRange]);
          setOrderCounter((prev) => prev + 1);

          console.log(
            `範囲保存完了: "${selectedText.substring(0, 30)}${
              selectedText.length > 30 ? "..." : ""
            }"`
          );
          console.log("XPath情報:", {
            start: `${newRange.startXPath}[${newRange.startOffset}]`,
            end: `${newRange.endXPath}[${newRange.endOffset}]`,
          });

          // 親コンポーネントに通知
          onRangeSelect?.(newRange);
        }

        // 選択をクリア
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

  /**
   * 特定の保存範囲を削除
   * @param id - 削除する範囲のID
   */
  const handleDeleteRange = (id: number): void => {
    try {
      setSavedRanges((prev) => prev.filter((range) => range.id !== id));
      console.log("範囲削除完了:", id);
      onRangeDelete?.(id);
    } catch (err) {
      const error = new Error(
        `範囲削除エラー: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(error.message);
      onError?.(error);
    }
  };

  /**
   * すべての保存範囲を削除
   */
  const handleClearAll = (): void => {
    try {
      const deletedIds = savedRanges.map((range) => range.id);
      setSavedRanges([]);
      setOrderCounter(1);
      console.log("全範囲削除完了");

      // 各削除を通知
      deletedIds.forEach((id) => onRangeDelete?.(id));
    } catch (err) {
      const error = new Error(
        `全範囲削除エラー: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(error.message);
      onError?.(error);
    }
  };

  const handleOpenDialog = (): void => setDialogOpen(true);
  const handleCloseDialog = (): void => setDialogOpen(false);

  return (
    <>
      <Box sx={{ position: "relative" }}>
        {/* メインコンテンツエリア */}
        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: html }}
          onMouseUp={handleMouseUp}
          sx={{
            // デフォルトスタイル + 外部指定スタイル
            ...contentAreaSx,
          }}
        />

        {/* 下線一覧ボタン */}
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
          下線一覧 ({savedRanges.length})
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
              下線一覧 ({savedRanges.length}件)
            </Typography>
            <Button
              onClick={handleClearAll}
              disabled={savedRanges.length === 0}
              color="error"
            >
              <Typography variant="body2">すべて削除</Typography>
              <DeleteForeverIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {savedRanges.length === 0 ? (
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
                    <TableCell>XPath情報</TableCell>
                    <TableCell>作成日時</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedRanges.map((range) => (
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
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                          }}
                        >
                          開始: {range.startXPath}[{range.startOffset}]<br />
                          終了: {range.endXPath}[{range.endOffset}]
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
