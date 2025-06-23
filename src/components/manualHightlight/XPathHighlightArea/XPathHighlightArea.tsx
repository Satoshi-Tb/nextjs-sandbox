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
  const [serializedRanges, setSerializedRanges] = useState<SavedRange[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const getXPathFromNode = (node: Node, root: Node): string => {
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

  const getNodeByXPath = (xpath: string, root: Node): Node => {
    if (xpath === "./") return root;
    const evaluator = document.evaluate(
      xpath,
      root,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    const node = evaluator.singleNodeValue;
    if (!node)
      throw new Error(
        "Node that corresponds to the specified XPath does not exist. " + xpath
      );

    return node;
  };

  const applyHighlights = () => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const highlightClass = "custom-underline";
    container.querySelectorAll("span." + highlightClass).forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }
    });
    container.normalize();

    // TODO テキストの後ろから適用必要
    serializedRanges.forEach((saved) => {
      try {
        const startNode = getNodeByXPath(saved.startXPath, container);
        const endNode = getNodeByXPath(saved.endXPath, container);

        const range = document.createRange();
        range.setStart(startNode, saved.startOffset);
        range.setEnd(endNode, saved.endOffset);

        console.log("XPath->range", { saved, range });

        const frag = range.extractContents();
        const span = document.createElement("span");
        span.className = highlightClass;
        span.style.borderBottom = "3px solid red";
        span.style.textDecoration = "none";
        span.appendChild(frag);
        range.insertNode(span);
      } catch (e) {
        console.warn("適用失敗", { e, saved });
      }
    });
  };

  useEffect(() => {
    applyHighlights();
  }, [serializedRanges]);

  const handleMouseUp = () => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const text = range.toString().trim();
      console.log("handleMouseUp", { text, range });
      if (
        !text ||
        range.collapsed ||
        !contentRef.current ||
        !contentRef.current.contains(range.commonAncestorContainer)
      )
        return;

      const startXPath = getXPathFromNode(
        range.startContainer,
        contentRef.current
      );
      const endXPath = getXPathFromNode(range.endContainer, contentRef.current);

      const newRange: SavedRange = {
        id: Date.now(),
        order: orderCounter,
        startXPath,
        startOffset: range.startOffset,
        endXPath,
        endOffset: range.endOffset,
        text,
        timestamp: new Date().toLocaleString(),
      };
      console.log("range->xpath", { range, newRange });
      setSerializedRanges((prev) => [...prev, newRange]);
      setOrderCounter((prev) => prev + 1);
      onRangeSelect?.(newRange);
      sel.removeAllRanges();
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <Box
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: html }}
          onMouseUp={handleMouseUp}
          sx={{ ...contentAreaSx }}
        />
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          startIcon={<ListIcon />}
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
        >
          下線一覧 ({serializedRanges.length})
        </Button>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            下線一覧 ({serializedRanges.length}件)
          </Typography>
          <Button
            onClick={() => {
              setSerializedRanges([]);
              setOrderCounter(1);
            }}
          >
            すべて削除 <DeleteForeverIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>順番</TableCell>
                  <TableCell>選択テキスト</TableCell>
                  <TableCell>開始XPath</TableCell>
                  <TableCell>開始Offset</TableCell>
                  <TableCell>終了XPath</TableCell>
                  <TableCell>終了Offset</TableCell>
                  <TableCell>作成日時</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serializedRanges.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.order}</TableCell>
                    <TableCell>{r.text}</TableCell>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                    >
                      {r.startXPath}
                    </TableCell>
                    <TableCell>{r.startOffset}</TableCell>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                    >
                      {r.endXPath}
                    </TableCell>
                    <TableCell>{r.endOffset}</TableCell>
                    <TableCell>{r.timestamp}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSerializedRanges((prev) =>
                            prev.filter((x) => x.id !== r.id)
                          );
                          onRangeDelete?.(r.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
