// pages/index.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Link from "next/link";

// ハイライトデータの型定義
interface HighlightData {
  id: string;
  startContainer: string;
  startOffset: number;
  endContainer: string;
  endOffset: number;
  text: string;
  timestamp: number;
}

// ハイライト範囲を特定するための情報
interface HighlightRange {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
}

// サンプルの複雑なHTMLコンテンツ
const SAMPLE_CONTENT = `
  <div>
    <h2>第1章：技術の進歩と社会への影響</h2>
    <p>現代社会において、<b>人工知能</b>の発展は<span style="color: blue;">急速に進んでいます</span>。
    特に<sup>1</sup>、機械学習分野では<br/>革新的な技術が<em>次々と</em>登場しています。</p>
    
    <p>これらの技術は、<strong>医療</strong>、<i>教育</i>、そして<u>エンターテインメント</u>など
    様々な分野で<span style="background-color: yellow;">活用されています</span>。
    しかし、同時に<code>プライバシー</code>や<mark>倫理的な問題</mark>も浮上しています。</p>
    
    <blockquote>
      「技術は<b>中立的</b>であり、それをどう使うかが<em>重要</em>である」
      <br/>- 著名な研究者の言葉
    </blockquote>
    
    <p>私たちは、これらの<small>新しい技術</small>を<big>責任を持って</big>活用し、
    <span style="font-weight: bold; color: red;">より良い未来</span>を築いていく必要があります。</p>
  </div>
`;

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

// ノードパスを取得する関数
const getNodePath = (node: Node, root: Element): number[] => {
  const path: number[] = [];
  let current = node;

  while (current && current !== root) {
    const parent = current.parentNode;
    if (parent) {
      const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
      path.unshift(index);
      current = parent;
    } else {
      break;
    }
  }

  return path;
};

// パスからノードを取得する関数
const getNodeFromPath = (path: number[], root: Element): Node | null => {
  let current: Node = root;

  for (const index of path) {
    if (current.childNodes[index]) {
      current = current.childNodes[index];
    } else {
      return null;
    }
  }

  return current;
};

// 範囲を正規化する関数（テキストノードのみを対象とする）
const normalizeRange = (range: Range): Range | null => {
  const newRange = range.cloneRange();

  // 開始位置をテキストノードに調整
  let startContainer = newRange.startContainer;
  let startOffset = newRange.startOffset;

  if (startContainer.nodeType !== Node.TEXT_NODE) {
    const walker = document.createTreeWalker(
      startContainer,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode = walker.nextNode();
    let currentOffset = 0;

    while (
      textNode &&
      currentOffset + textNode.textContent!.length < startOffset
    ) {
      currentOffset += textNode.textContent!.length;
      textNode = walker.nextNode();
    }

    if (textNode) {
      startContainer = textNode;
      startOffset = startOffset - currentOffset;
    }
  }

  // 終了位置をテキストノードに調整
  let endContainer = newRange.endContainer;
  let endOffset = newRange.endOffset;

  if (endContainer.nodeType !== Node.TEXT_NODE) {
    const walker = document.createTreeWalker(
      endContainer,
      NodeFilter.SHOW_TEXT,
      null
    );

    let textNode = walker.nextNode();
    let currentOffset = 0;

    while (
      textNode &&
      currentOffset + textNode.textContent!.length < endOffset
    ) {
      currentOffset += textNode.textContent!.length;
      textNode = walker.nextNode();
    }

    if (textNode) {
      endContainer = textNode;
      endOffset = endOffset - currentOffset;
    }
  }

  if (
    startContainer.nodeType === Node.TEXT_NODE &&
    endContainer.nodeType === Node.TEXT_NODE
  ) {
    newRange.setStart(startContainer, startOffset);
    newRange.setEnd(endContainer, endOffset);
    return newRange;
  }

  return null;
};

// ハイライトを適用する関数
const applyHighlight = (range: Range, id: string): void => {
  try {
    const span = document.createElement("span");
    span.className = "highlight";
    span.setAttribute("data-highlight-id", id);
    span.style.borderBottom = "3px solid red";
    span.style.cursor = "pointer";

    range.surroundContents(span);
  } catch (error) {
    // 複雑な範囲の場合は、範囲を分割して処理
    const contents = range.extractContents();
    const span = document.createElement("span");
    span.className = "highlight";
    span.setAttribute("data-highlight-id", id);
    span.style.borderBottom = "3px solid red";
    span.style.cursor = "pointer";
    span.appendChild(contents);
    range.insertNode(span);
  }
};

// ハイライトを削除する関数
const removeHighlight = (id: string): void => {
  const elements = document.querySelectorAll(`[data-highlight-id="${id}"]`);
  elements.forEach((element) => {
    const parent = element.parentNode;
    while (element.firstChild) {
      parent?.insertBefore(element.firstChild, element);
    }
    parent?.removeChild(element);
  });
};

// 重複するハイライトを統合する関数
const mergeOverlappingHighlights = (
  highlights: HighlightData[]
): HighlightData[] => {
  if (highlights.length <= 1) return highlights;

  // タイムスタンプでソート
  const sorted = [...highlights].sort((a, b) => a.timestamp - b.timestamp);
  const merged: HighlightData[] = [];

  for (const current of sorted) {
    const lastMerged = merged[merged.length - 1];

    if (!lastMerged) {
      merged.push(current);
      continue;
    }

    // 重複判定のロジック（簡略化）
    if (
      current.startContainer === lastMerged.endContainer &&
      current.startOffset <= lastMerged.endOffset + 10
    ) {
      // 統合
      lastMerged.endContainer = current.endContainer;
      lastMerged.endOffset = current.endOffset;
      lastMerged.text = lastMerged.text + " " + current.text;
    } else {
      merged.push(current);
    }
  }

  return merged;
};

// メインコンポーネント
export const HighlightApp: React.FC = () => {
  const [highlights, setHighlights] = useState<HighlightData[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // ハイライトを保存するAPI（模擬）
  const saveHighlights = async (
    highlightData: HighlightData[]
  ): Promise<void> => {
    try {
      // 実際のAPIコールをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Saving highlights:", highlightData);
      setSnackbar({
        open: true,
        message: "ハイライトを保存しました",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "保存に失敗しました",
        severity: "error",
      });
    }
  };

  // ハイライトを読み込むAPI（模擬）
  const loadHighlights = async (): Promise<HighlightData[]> => {
    try {
      // 実際のAPIコールをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 500));
      const savedData = localStorage.getItem("highlights");
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      setSnackbar({
        open: true,
        message: "読み込みに失敗しました",
        severity: "error",
      });
      return [];
    }
  };

  // 選択範囲からハイライトデータを作成
  const createHighlightFromSelection = (): HighlightData | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !contentRef.current) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const normalizedRange = normalizeRange(range);

    if (!normalizedRange || normalizedRange.collapsed) {
      return null;
    }

    const startPath = getNodePath(
      normalizedRange.startContainer,
      contentRef.current
    );
    const endPath = getNodePath(
      normalizedRange.endContainer,
      contentRef.current
    );

    return {
      id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startContainer: JSON.stringify(startPath),
      startOffset: normalizedRange.startOffset,
      endContainer: JSON.stringify(endPath),
      endOffset: normalizedRange.endOffset,
      text: normalizedRange.toString(),
      timestamp: Date.now(),
    };
  };

  // ハイライトを追加
  const addHighlight = () => {
    console.log("addHighlight called");
    const highlightData = createHighlightFromSelection();
    if (!highlightData) {
      setSnackbar({
        open: true,
        message: "テキストを選択してください",
        severity: "error",
      });
      return;
    }

    const newHighlights = [...highlights, highlightData];
    const mergedHighlights = mergeOverlappingHighlights(newHighlights);
    console.log("addHighlight ハイライトデータ", {
      highlightData,
      highlights,
      mergedHighlights,
    });
    setHighlights(mergedHighlights);
    localStorage.setItem("highlights", JSON.stringify(mergedHighlights));

    // 選択をクリア
    window.getSelection()?.removeAllRanges();

    setSnackbar({
      open: true,
      message: "ハイライトを追加しました",
      severity: "success",
    });
  };

  // ハイライトを復元
  const restoreHighlights = () => {
    if (!contentRef.current) return;

    // 既存のハイライトをクリア
    const existingHighlights =
      contentRef.current.querySelectorAll(".highlight");
    existingHighlights.forEach((el) => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent?.insertBefore(el.firstChild, el);
      }
      parent?.removeChild(el);
    });

    // ハイライトを復元
    highlights.forEach((highlight) => {
      try {
        const startPath = JSON.parse(highlight.startContainer);
        const endPath = JSON.parse(highlight.endContainer);

        const startNode = getNodeFromPath(startPath, contentRef.current!);
        const endNode = getNodeFromPath(endPath, contentRef.current!);

        if (startNode && endNode) {
          const range = document.createRange();
          range.setStart(startNode, highlight.startOffset);
          range.setEnd(endNode, highlight.endOffset);

          applyHighlight(range, highlight.id);
        }
      } catch (error) {
        console.error("Failed to restore highlight:", error);
      }
    });
  };

  // ハイライトクリック処理
  const handleHighlightClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const highlightId = target.getAttribute("data-highlight-id");

    if (highlightId) {
      const newHighlights = highlights.filter((h) => h.id !== highlightId);
      setHighlights(newHighlights);
      localStorage.setItem("highlights", JSON.stringify(newHighlights));

      removeHighlight(highlightId);
      setSnackbar({
        open: true,
        message: "ハイライトを削除しました",
        severity: "success",
      });
    }
  };

  // 初期化
  useEffect(() => {
    const loadInitialHighlights = async () => {
      const savedHighlights = await loadHighlights();
      setHighlights(savedHighlights);
    };

    loadInitialHighlights();
  }, []);

  // ハイライト復元
  useEffect(() => {
    if (highlights.length > 0) {
      // DOMが更新された後に復元
      setTimeout(restoreHighlights, 100);
    }
  }, [highlights]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Kindle風ハイライト機能
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Button variant="contained" onClick={addHighlight} sx={{ mr: 2 }}>
              選択範囲をハイライト
            </Button>
            <Button
              variant="outlined"
              onClick={() => saveHighlights(highlights)}
              sx={{ mr: 2 }}
            >
              保存 ({highlights.length}件)
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setHighlights([]);
                localStorage.removeItem("highlights");
                const existingHighlights =
                  contentRef.current?.querySelectorAll(".highlight");
                existingHighlights?.forEach((el) => {
                  const parent = el.parentNode;
                  while (el.firstChild) {
                    parent?.insertBefore(el.firstChild, el);
                  }
                  parent?.removeChild(el);
                });
              }}
            >
              全てクリア
            </Button>
          </Box>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              テキストを選択して「選択範囲をハイライト」ボタンを押すか、ハイライト部分をクリックして削除できます。
            </Typography>

            <Box
              ref={contentRef}
              onClick={handleHighlightClick}
              sx={{
                lineHeight: 1.8,
                fontSize: "16px",
                userSelect: "text",
                "& .highlight:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
              }}
              dangerouslySetInnerHTML={{ __html: SAMPLE_CONTENT }}
            />
          </Paper>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          >
            <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
        {/* フッター */}
        <Link href="/">TOP</Link>
      </Box>
    </ThemeProvider>
  );
};
