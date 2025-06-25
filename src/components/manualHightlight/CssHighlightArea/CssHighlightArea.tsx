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
import EditIcon from "@mui/icons-material/Edit";
import AutoFixOffIcon from "@mui/icons-material/AutoFixOff";

// アプリケーションモードの型定義
export type AppMode = "line" | "eraser";

// 内部管理用の範囲データ（Rangeベース）
interface InternalSavedRange {
  id: number;
  order: number;
  range: Range; // メイン管理対象
  text: string;
  timestamp: string;
}

// 外部API用の範囲データ（永続化対応）
export type SavedRange = {
  id: number;
  order: number;
  startPath: string; // 永続化用XPath
  endPath: string; // 永続化用XPath
  startOffset: number;
  endOffset: number;
  text: string;
  timestamp: string;
};

type CssHighlightAreaProps = {
  html: string; // ハイライト設定対象のHTMLドキュメント
  mode?: AppMode; // アプリケーションモード（デフォルト: 'line'）
  initialRanges?: SavedRange[]; // 初期化時の範囲データ（永続化からの復元用）
  onError?: (error: Error) => void; // エラー発生時のハンドラ
  onRangeSelect?: (range: SavedRange) => void; // 範囲選択された場合のハンドラ
  onRangeDelete?: (id: number) => void; // 保存済選択範囲を削除された場合のハンドラ
  onModeChange?: (mode: AppMode) => void; // モード変更時のハンドラ
  contentAreaSx?: SxProps<Theme>; // MUIのSxProps型
};

export const CssHighlightArea: React.FC<CssHighlightAreaProps> = ({
  html,
  mode = "line",
  initialRanges = [],
  onError,
  onRangeSelect,
  onRangeDelete,
  onModeChange,
  contentAreaSx,
}) => {
  const [savedRanges, setSavedRanges] = useState<InternalSavedRange[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // CSS Custom Highlight APIの対応チェック
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "CSS" in window && "highlights" in CSS;
      setIsSupported(supported);

      if (!supported) {
        const error = new Error(
          "CSS Custom Highlight APIがサポートされていません"
        );
        console.error(error.message);
        onError?.(error);
        return;
      }

      // CSS ハイライトスタイルを動的に追加
      const styleId = "css-highlight-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          ::highlight(manual-highlight) {
            background-color: transparent;
            text-decoration: underline;
            text-decoration-color: red;
            text-decoration-thickness: 3px;
            text-decoration-style: solid;
          }
        `;
        document.head.appendChild(style);
      }

      console.log("CSS Custom Highlight APIが初期化されました");
    }
  }, [onError]);

  // 内部形式から外部形式への変換（永続化用）
  const toExternalFormat = (internal: InternalSavedRange): SavedRange => {

    const startPath = getXPath(
      internal.range.startContainer,
      contentRef.current!
    );
    const endPath = getXPath(internal.range.endContainer, contentRef.current!);

    return {
      id: internal.id,
      order: internal.order,
      startPath: startPath || "",
      endPath: endPath || "",
      startOffset: internal.range.startOffset,
      endOffset: internal.range.endOffset,
      text: internal.text,
      timestamp: internal.timestamp,
    };
  };

  // 外部形式から内部形式への変換（復元用）
  const toInternalFormat = (
    external: SavedRange
  ): InternalSavedRange | null => {
    if (!contentRef.current) return null;

    try {
      const startNode = getNodeFromXPath(
        external.startPath,
        contentRef.current
      );
      const endNode = getNodeFromXPath(external.endPath, contentRef.current);

      if (!startNode || !endNode) {
        console.warn("ノード復元失敗:", external);
        return null;
      }

      const range = document.createRange();
      range.setStart(startNode, external.startOffset);
      range.setEnd(endNode, external.endOffset);

      return {
        id: external.id,
        order: external.order,
        range: range.cloneRange(),
        text: external.text,
        timestamp: external.timestamp,
      };
    } catch (err) {
      console.warn("内部形式変換エラー:", external, err);
      return null;
    }
  };

  const getXPath = (node: Node, root: Node = contentRef.current!): string => {
    if (!node) throw new Error("node is null or undefined");
    if (!root) throw new Error("root is null or undefined");

    const getPathSegment = (node: Node): string => {
      if (!node.parentNode) throw new Error("parent node is null or undefined");
      const siblings = Array.from(node.parentNode.childNodes).filter(
        (n) =>
          n.nodeType === node.nodeType &&
          (n as Element).nodeName === (node as Element).nodeName
      );
      const index = siblings.indexOf(node as ChildNode) + 1;
      if (node.nodeType === Node.TEXT_NODE) {
        return "text()[" + index + "]";
      } else {
        return `${(node as Element).nodeName.toLowerCase()}[${index}]`;
      }
    };
    const segments: string[] = [];
    while (node && node !== root && node.nodeType !== Node.DOCUMENT_NODE) {
      segments.unshift(getPathSegment(node));
      node = node.parentNode!;
    }
    return "./" + segments.join("/");
  };

  // XPathからDOMノードを取得する関数（document.evaluateを使用）
  const getNodeFromXPath = (
    xpath: string,
    rootNode: Node = contentRef.current!
  ): Node | null => {
    if (!rootNode || !xpath) return null;

    try {
      const result = document.evaluate(
        xpath,
        rootNode,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (err) {
      console.warn("XPath解析エラー:", xpath, err);
      return null;
    }
  };

  // Range同士の交差判定
  const hasIntersection = (range1: Range, range2: Range): boolean => {
    try {
      return !(
        range1.compareBoundaryPoints(Range.END_TO_START, range2) >= 0 ||
        range1.compareBoundaryPoints(Range.START_TO_END, range2) <= 0
      );
    } catch (err) {
      console.warn("交差判定エラー:", err);
      return false;
    }
  };

  // 交差領域の計算
  const calculateIntersection = (
    range1: Range,
    range2: Range
  ): Range | null => {
    if (!hasIntersection(range1, range2)) return null;

    try {
      const intersection = document.createRange();

      // 開始位置：より後の位置を選択
      if (range1.compareBoundaryPoints(Range.START_TO_START, range2) >= 0) {
        intersection.setStart(range1.startContainer, range1.startOffset);
      } else {
        intersection.setStart(range2.startContainer, range2.startOffset);
      }

      // 終了位置：より前の位置を選択
      if (range1.compareBoundaryPoints(Range.END_TO_END, range2) <= 0) {
        intersection.setEnd(range1.endContainer, range1.endOffset);
      } else {
        intersection.setEnd(range2.endContainer, range2.endOffset);
      }

      return intersection;
    } catch (err) {
      console.warn("交差領域計算エラー:", err);
      return null;
    }
  };

  // Rangeを分割して部分削除
  const splitRange = (originalRange: Range, removeRange: Range): Range[] => {
    const intersection = calculateIntersection(originalRange, removeRange);
    if (!intersection) {
      // 交差がない場合は元の範囲をそのまま返す
      return [originalRange];
    }

    const parts: Range[] = [];

    try {
      // 前半部分（交差領域より前）
      if (
        originalRange.compareBoundaryPoints(
          Range.START_TO_START,
          intersection
        ) < 0
      ) {
        const beforePart = document.createRange();
        beforePart.setStart(
          originalRange.startContainer,
          originalRange.startOffset
        );
        beforePart.setEnd(
          intersection.startContainer,
          intersection.startOffset
        );

        // 空でない範囲のみ追加
        if (beforePart.toString().trim()) {
          parts.push(beforePart);
        }
      }

      // 後半部分（交差領域より後）
      if (
        originalRange.compareBoundaryPoints(Range.END_TO_END, intersection) > 0
      ) {
        const afterPart = document.createRange();
        afterPart.setStart(intersection.endContainer, intersection.endOffset);
        afterPart.setEnd(originalRange.endContainer, originalRange.endOffset);

        // 空でない範囲のみ追加
        if (afterPart.toString().trim()) {
          parts.push(afterPart);
        }
      }

      return parts;
    } catch (err) {
      console.warn("範囲分割エラー:", err);
      return [originalRange]; // エラー時は元の範囲を保持
    }
  };

  // InternalSavedRangeを作成
  const createInternalSavedRange = (
    range: Range,
    order: number
  ): InternalSavedRange => {
    return {
      id: Date.now() + Math.random(), // 一意性を保証
      order,
      range: range.cloneRange(), // Rangeを保護
      text: range.toString(),
      timestamp: new Date().toLocaleString(),
    };
  };

  // 選択範囲と既存ハイライトの重複チェック
  const findOverlappingRanges = (newRange: Range): InternalSavedRange[] => {
    const overlapping: InternalSavedRange[] = [];

    for (const savedRange of savedRanges) {
      if (hasIntersection(newRange, savedRange.range)) {
        overlapping.push(savedRange);
      }
    }

    return overlapping;
  };

  // モード切替ハンドラ
  const handleModeChange = (newMode: AppMode): void => {
    onModeChange?.(newMode);
  };
  const restoreRange = (savedRange: SavedRange): Range | null => {
    if (!contentRef.current) return null;

    try {
      const startNode = getNodeFromXPath(
        savedRange.startPath,
        contentRef.current
      );
      const endNode = getNodeFromXPath(savedRange.endPath, contentRef.current);

      if (!startNode || !endNode) {
        console.warn("ノード復元失敗:", savedRange);
        return null;
      }

      const range = document.createRange();
      range.setStart(startNode, savedRange.startOffset);
      range.setEnd(endNode, savedRange.endOffset);

      return range;
    } catch (err) {
      console.warn("範囲復元エラー:", savedRange, err);
      return null;
    }
  };

  // 初期化時の範囲データ復元
  useEffect(() => {
    if (!isSupported || !contentRef.current || initialRanges.length === 0)
      return;

    try {
      console.log("初期範囲データを復元中...", initialRanges.length);

      const restoredRanges: InternalSavedRange[] = [];
      let maxOrder = 0;

      for (const externalRange of initialRanges) {
        const internalRange = toInternalFormat(externalRange);
        if (internalRange) {
          restoredRanges.push(internalRange);
          maxOrder = Math.max(maxOrder, internalRange.order);
        } else {
          console.warn("範囲復元に失敗:", externalRange);
        }
      }

      if (restoredRanges.length > 0) {
        setSavedRanges(restoredRanges);
        setOrderCounter(maxOrder + 1);
        console.log(`${restoredRanges.length}個の範囲を復元しました`);
      }
    } catch (err) {
      const error = new Error(
        `初期データ復元エラー: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error(error.message);
      onError?.(error);
    }
  }, [initialRanges, isSupported, onError]);
  useEffect(() => {
    if (!isSupported || !contentRef.current) return;

    try {
      // 既存のハイライトをクリア
      CSS.highlights.clear();

      // 新しいハイライトを適用
      if (savedRanges.length > 0) {
        const ranges: Range[] = savedRanges.map(
          (savedRange) => savedRange.range
        );

        if (ranges.length > 0) {
          const highlight = new Highlight(...ranges);
          CSS.highlights.set("manual-highlight", highlight);
          console.log(`${ranges.length}個のハイライトを適用しました`);
        }
      }
    } catch (err) {
      const error = new Error(
        `ハイライト更新エラー: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error(error.message);
      onError?.(error);
    }
  }, [savedRanges, isSupported, onError]);

  // マウスアップ時の範囲選択処理
  const handleMouseUp = (): void => {
    if (!isSupported) return;

    setTimeout(() => {
      try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (!selectedText) return;

        if (mode === "line") {
          // ラインモード: ハイライト追加
          handleLineMode(range, selectedText);
        } else if (mode === "eraser") {
          // 消しゴムモード: ハイライト削除
          handleEraserMode(range);
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

  // ラインモード処理
  const handleLineMode = (range: Range, selectedText: string): void => {
    try {
      const newRange = createInternalSavedRange(range, orderCounter);

      setSavedRanges((prev) => [...prev, newRange]);
      setOrderCounter((prev) => prev + 1);

      console.log(
        `ラインモード: 範囲を保存しました: "${selectedText.substring(0, 30)}${
          selectedText.length > 30 ? "..." : ""
        }"`
      );

      // 親コンポーネントに外部形式で通知
      const externalFormat = toExternalFormat(newRange);
      onRangeSelect?.(externalFormat);
    } catch (err) {
      console.error("ラインモード処理エラー:", err);
    }
  };

  // 消しゴムモード処理（部分削除版）
  const handleEraserMode = (eraseRange: Range): void => {
    try {
      const overlappingRanges = findOverlappingRanges(eraseRange);

      if (overlappingRanges.length === 0) {
        console.log("消しゴムモード: 削除対象のハイライトがありません");
        return;
      }

      console.log(
        `消しゴムモード: ${overlappingRanges.length}個のハイライトを部分削除処理中...`
      );

      // 処理対象を除外したベースとなる範囲リスト
      const remainingRanges = savedRanges.filter(
        (range) =>
          !overlappingRanges.some((overlapping) => overlapping.id === range.id)
      );

      // 分割処理で新しく作成される範囲
      const newSplitRanges: InternalSavedRange[] = [];
      let newOrderCounter = Math.max(...savedRanges.map((r) => r.order), 0) + 1;

      // 各重複範囲を分割処理
      for (const overlappingRange of overlappingRanges) {
        // 範囲を分割
        const splitParts = splitRange(overlappingRange.range, eraseRange);

        console.log(
          `範囲分割: "${overlappingRange.text}" → ${splitParts.length}個の部分に分割`
        );

        // 分割された各部分をInternalSavedRangeに変換
        for (const part of splitParts) {
          const newSavedRange = createInternalSavedRange(
            part,
            newOrderCounter++
          );
          newSplitRanges.push(newSavedRange);
          console.log(`新しい分割範囲: "${newSavedRange.text}"`);
        }

        // 元の範囲の削除を親コンポーネントに通知（外部形式で）
        const externalFormat = toExternalFormat(overlappingRange);
        onRangeDelete?.(externalFormat.id);
      }

      // 状態を更新：残存範囲 + 新しい分割範囲
      setSavedRanges([...remainingRanges, ...newSplitRanges]);
      setOrderCounter(newOrderCounter);

      console.log(
        `消しゴムモード完了: ${overlappingRanges.length}個削除, ${newSplitRanges.length}個の新範囲追加`
      );

      // 新しく追加された範囲を親コンポーネントに通知（外部形式で）
      newSplitRanges.forEach((range) => {
        const externalFormat = toExternalFormat(range);
        onRangeSelect?.(externalFormat);
      });
    } catch (err) {
      console.error("消しゴムモード処理エラー:", err);
      const error = new Error(
        `消しゴムモード処理エラー: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      onError?.(error);
    }
  };

  // 特定の保存範囲を削除
  const handleDeleteRange = (id: number): void => {
    try {
      const targetRange = savedRanges.find((range) => range.id === id);
      if (!targetRange) {
        console.warn("削除対象の範囲が見つかりません:", id);
        return;
      }

      setSavedRanges((prev) => prev.filter((range) => range.id !== id));
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
      const deletedIds = savedRanges.map((range) => range.id);
      setSavedRanges([]);
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

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (isSupported) {
        CSS.highlights.clear();
      }
    };
  }, [isSupported]);

  return (
    <>
      {/* 親コンテナ */}
      <Box sx={{ position: "relative" }}>
        {/* API未対応の警告 */}
        {!isSupported && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "#fff3cd",
              borderRadius: 1,
              border: "1px solid #ffeaa7",
            }}
          >
            <Typography variant="body2" color="warning.main">
              ⚠️ このブラウザはCSS Custom Highlight APIをサポートしていません。
              Chrome 105+、Firefox 113+、Safari 17.2+でご利用ください。
            </Typography>
          </Box>
        )}

        {/* コンテンツ表示エリア */}
        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: html }}
          onMouseUp={handleMouseUp}
          sx={{
            // デフォルトスタイル
            ...contentAreaSx,
            // 未対応時は機能を無効化
            userSelect: isSupported ? "text" : "none",
            opacity: isSupported ? 1 : 0.7,
          }}
        />

        {/* モード切替ボタン群 */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            variant={mode === "line" ? "contained" : "outlined"}
            onClick={() => handleModeChange("line")}
            startIcon={<EditIcon />}
            disabled={!isSupported}
            size="small"
            sx={{
              minWidth: "auto",
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              backgroundColor: mode === "line" ? "#1976d2" : "transparent",
              color: mode === "line" ? "white" : "#1976d2",
              "&:hover": {
                backgroundColor: mode === "line" ? "#1565c0" : "#e3f2fd",
              },
            }}
          >
            ライン
          </Button>
          <Button
            variant={mode === "eraser" ? "contained" : "outlined"}
            onClick={() => handleModeChange("eraser")}
            startIcon={<AutoFixOffIcon />}
            disabled={!isSupported}
            size="small"
            sx={{
              minWidth: "auto",
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              backgroundColor: mode === "eraser" ? "#d32f2f" : "transparent",
              color: mode === "eraser" ? "white" : "#d32f2f",
              "&:hover": {
                backgroundColor: mode === "eraser" ? "#c62828" : "#ffebee",
              },
            }}
          >
            消しゴム
          </Button>
        </Box>

        {/* モード表示インジケーター */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            backgroundColor: mode === "line" ? "#e3f2fd" : "#ffebee",
            color: mode === "line" ? "#1976d2" : "#d32f2f",
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: "bold",
            border: `1px solid ${mode === "line" ? "#1976d2" : "#d32f2f"}`,
          }}
        >
          {mode === "line" ? "🖍️ ラインモード" : "🧹 消しゴムモード"}
        </Box>
        {/* 下線一覧ボタン */}
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          startIcon={<ListIcon />}
          disabled={!isSupported}
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
        onClose={() => setDialogOpen(false)}
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
              startIcon={<DeleteForeverIcon />}
            >
              すべて削除
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
                    <TableCell>開始位置</TableCell>
                    <TableCell>終了位置</TableCell>
                    <TableCell>作成日時</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedRanges.map((range) => {
                    const external = toExternalFormat(range);
                    return (
                      <TableRow key={range.id} hover>
                        <TableCell>{range.order}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" title={range.text}>
                            {range.text.length > 50
                              ? `${range.text.substring(0, 50)}...`
                              : range.text}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                          >
                            {`${external.startPath}[${external.startOffset}]`}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                          >
                            {`${external.endPath}[${external.endOffset}]`}
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
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
