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

// 保存された範囲の型定義
export type SavedRange = {
  id: number;
  order: number;
  startPath: string;
  endPath: string;
  startOffset: number;
  endOffset: number;
  text: string;
  timestamp: string;
  range?: Range; // 復元されたRangeオブジェクト
};

type CssHighlightAreaProps = {
  html: string; // ハイライト設定対象のHTMLドキュメント
  onError?: (error: Error) => void; // エラー発生時のハンドラ
  onRangeSelect?: (range: SavedRange) => void; // 範囲選択された場合のハンドラ
  onRangeDelete?: (id: number) => void; // 保存済選択範囲を削除された場合のハンドラ
  contentAreaSx?: SxProps<Theme>; // MUIのSxProps型
};

export const CssHighlightArea: React.FC<CssHighlightAreaProps> = ({
  html,
  onError,
  onRangeSelect,
  onRangeDelete,
  contentAreaSx,
}) => {
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
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

  // DOMノードのXPathを取得する関数
  const getXPath = (node: Node): string => {
    if (!node || node === contentRef.current) return "";

    if (node.nodeType === Node.TEXT_NODE) {
      const parent = node.parentNode;
      if (!parent) return "";

      const textNodes = Array.from(parent.childNodes).filter(
        (child) => child.nodeType === Node.TEXT_NODE
      );
      const index = textNodes.indexOf(node as ChildNode);
      return `${getXPath(parent)}/text()[${index + 1}]`;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const parent = element.parentNode;
      if (!parent || parent === contentRef.current) {
        return `/${element.tagName.toLowerCase()}`;
      }

      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === element.tagName
      );
      const index = siblings.indexOf(element);
      return `${getXPath(parent)}/${element.tagName.toLowerCase()}[${
        index + 1
      }]`;
    }

    return "";
  };

  // XPathからDOMノードを取得する関数
  const getNodeFromXPath = (xpath: string): Node | null => {
    if (!contentRef.current || !xpath) return null;

    try {
      // XPathを解析してノードを取得
      const parts = xpath.split("/").filter((part) => part);
      let currentNode: Node = contentRef.current;

      for (const part of parts) {
        if (part.startsWith("text()")) {
          const match = part.match(/text\(\)\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]) - 1;
            const textNodes = Array.from(currentNode.childNodes).filter(
              (child) => child.nodeType === Node.TEXT_NODE
            );
            if (textNodes[index]) {
              currentNode = textNodes[index];
            } else {
              return null;
            }
          }
        } else {
          const match = part.match(/([^[]+)(?:\[(\d+)\])?/);
          if (match) {
            const tagName = match[1];
            const index = match[2] ? parseInt(match[2]) - 1 : 0;
            const children = Array.from(currentNode.childNodes).filter(
              (child) =>
                child.nodeType === Node.ELEMENT_NODE &&
                (child as Element).tagName.toLowerCase() === tagName
            );
            if (children[index]) {
              currentNode = children[index];
            } else {
              return null;
            }
          }
        }
      }

      return currentNode;
    } catch (err) {
      console.warn("XPath解析エラー:", xpath, err);
      return null;
    }
  };

  // 保存された範囲からRangeオブジェクトを復元する関数
  const restoreRange = (savedRange: SavedRange): Range | null => {
    try {
      const startNode = getNodeFromXPath(savedRange.startPath);
      const endNode = getNodeFromXPath(savedRange.endPath);

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

  // CSS Custom Highlight APIでハイライトを更新
  useEffect(() => {
    if (!isSupported || !contentRef.current) return;

    try {
      // 既存のハイライトをクリア
      CSS.highlights.clear();

      // 新しいハイライトを適用
      if (savedRanges.length > 0) {
        const ranges: Range[] = [];

        for (const savedRange of savedRanges) {
          const range = restoreRange(savedRange);
          if (range) {
            ranges.push(range);
          }
        }

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

        // 選択範囲の開始・終了位置を保存
        const startPath = getXPath(range.startContainer);
        const endPath = getXPath(range.endContainer);

        if (!startPath || !endPath) {
          console.warn("XPath取得に失敗しました");
          return;
        }

        const newRange: SavedRange = {
          id: Date.now(),
          order: orderCounter,
          startPath,
          endPath,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          text: selectedText,
          timestamp: new Date().toLocaleString(),
          range: range.cloneRange(),
        };

        setSavedRanges((prev) => [...prev, newRange]);
        setOrderCounter((prev) => prev + 1);

        console.log(
          `範囲を保存しました: "${selectedText.substring(0, 30)}${
            selectedText.length > 30 ? "..." : ""
          }"`
        );

        // 親コンポーネントに通知
        onRangeSelect?.(newRange);

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
      setSavedRanges((prev) => prev.filter((range) => range.id !== id));
      console.log("範囲を削除しました");
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

        {/* オーバーレイボタン */}
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
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                        >
                          {`${range.startPath}[${range.startOffset}]`}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                        >
                          {`${range.endPath}[${range.endOffset}]`}
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
          <Button onClick={() => setDialogOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
