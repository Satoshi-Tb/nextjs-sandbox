import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Divider,
} from "@mui/material";
import {
  DeleteForever as DeleteForeverIcon,
  SaveAlt as SaveAltIcon,
  Clear as ClearIcon,
  Highlight as HighlightIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

type HighlightItem = {
  id: number;
  start: number;
  end: number;
};

export const ManualHighlightSample = () => {
  const theme = useTheme();

  // サンプルのHTML文章（装飾タグを含む）
  // TODO リンク、画像に対応させる場合、ハイライトへのクリックイベントをセットしない方が良い？（preventDefaultと相性悪そう）
  const sampleText = `
    <p>これは<b>サンプル文章</b>です。この文章には<span style="color: blue;">様々な装飾</span>が含まれています。</p>
    <p><sup>上付き文字</sup>や<sub>下付き文字</sub>に<br/>改行も含まれており、<b>複数の段落</b>にわたって下線を引くことができます。</p>
    <p>Kindleの<span style="font-style: italic;">ハイライト機能</span>のように、任意の箇所に下線を設定できます。下線は<b>重なる場合に統合</b>され、クリックで削除することも可能です。</p>
    <p><a href="https://ja.react.dev/">HTMLリンク(アンカー)</a>にもハイライト設定可能。</p>
    <p>途中に画像<img src="https://picsum.photos/200/300">を挟む場合もハイライト設定可能。</p>
    <p>リストにも対応できます<ul><li>TypeScript</li><li>react</li><li>Next.js</li></ul></p>
  `;

  // ハイライト設定状態
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  // 選択状態の管理
  const [isSelecting, setIsSelecting] = useState(false);
  // ダイアログの状態管理
  const [openClearDialog, setOpenClearDialog] = useState(false);
  // スナックバーの状態管理
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const textContainerRef = useRef<HTMLDivElement>(null);

  // ハイライトを統合する関数
  const mergeOverlappingHighlights = (newHighlights: HighlightItem[]) => {
    if (newHighlights.length <= 1) return newHighlights;

    const sorted = [...newHighlights].sort((a, b) => a.start - b.start);
    const merged = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }

    return merged;
  };

  // テキスト選択からハイライト範囲を取得
  const getSelectionRange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const container = textContainerRef.current;

    if (!container) {
      console.warn("textContainerRef.current is null");
      return null;
    }

    if (!document.contains(container)) {
      console.warn("Container is not in the document");
      return null;
    }

    if (!container.contains(range.commonAncestorContainer)) return null;

    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;

    preRange.setEnd(range.endContainer, range.endOffset);
    const end = preRange.toString().length;

    return start !== end ? { start, end } : null;
  };

  // マウスアップでハイライト追加
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    const range = getSelectionRange();
    if (range) {
      setHighlights((prev) => {
        const newHighlights = [...prev, { ...range, id: Date.now() }];
        return mergeOverlappingHighlights(newHighlights);
      });
      setSnackbar({ open: true, message: "ハイライトを追加しました" });
    }

    window.getSelection()?.removeAllRanges();
    setIsSelecting(false);
  }, [isSelecting]);

  // マウスダウンで選択開始
  const handleMouseDown = () => {
    setIsSelecting(true);
  };

  // ハイライトクリックで削除
  const handleHighlightClick = (e: MouseEvent, highlightId: number) => {
    e.preventDefault();
    e.stopPropagation();

    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    setSnackbar({ open: true, message: "ハイライトを削除しました" });
  };

  // HTMLにハイライトを適用
  const applyHighlights = (htmlContent: string) => {
    if (highlights.length === 0) return htmlContent;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    const div = document.createElement("div");
    div.innerHTML = htmlContent;

    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    let currentTextPos = 0;
    textNodes.forEach((textNode) => {
      const nodeText = textNode.textContent || "";
      const nodeStart = currentTextPos;
      const nodeEnd = currentTextPos + nodeText.length;

      const relevantHighlights = sortedHighlights.filter(
        (h) => h.start < nodeEnd && h.end > nodeStart
      );

      if (relevantHighlights.length > 0) {
        const spans: {
          id: number | null;
          text: string;
          highlighted: boolean;
        }[] = [];
        let lastPos = 0;

        relevantHighlights.forEach((highlight) => {
          const relStart = Math.max(0, highlight.start - nodeStart);
          const relEnd = Math.min(nodeText.length, highlight.end - nodeStart);

          if (relStart < relEnd) {
            if (lastPos < relStart) {
              spans.push({
                text: nodeText.substring(lastPos, relStart),
                highlighted: false,
                id: null,
              });
            }

            spans.push({
              text: nodeText.substring(relStart, relEnd),
              highlighted: true,
              id: highlight.id,
            });

            lastPos = relEnd;
          }
        });

        if (lastPos < nodeText.length) {
          spans.push({
            text: nodeText.substring(lastPos),
            highlighted: false,
            id: null,
          });
        }

        const fragment = document.createDocumentFragment();
        spans.forEach((span) => {
          if (span.highlighted) {
            const mark = document.createElement("mark");
            mark.style.backgroundColor = "transparent";
            mark.style.borderBottom = `3px solid ${theme.palette.error.main}`;
            mark.style.cursor = "pointer";
            mark.style.transition = "all 0.2s ease";
            span.id &&
              mark.setAttribute("data-highlight-id", span.id.toString());
            mark.textContent = span.text;

            // ホバー効果を追加
            mark.addEventListener("mouseenter", () => {
              mark.style.backgroundColor = theme.palette.error.light + "20";
            });
            mark.addEventListener("mouseleave", () => {
              mark.style.backgroundColor = "transparent";
            });

            if (span.id !== null) {
              mark.onclick = (e) => handleHighlightClick(e, span.id as number);
            }
            fragment.appendChild(mark);
          } else {
            fragment.appendChild(document.createTextNode(span.text));
          }
        });

        textNode.parentNode?.replaceChild(fragment, textNode);
      }

      currentTextPos = nodeEnd;
    });

    return div.innerHTML;
  };

  // API呼び出しのシミュレーション
  const saveHighlights = async () => {
    try {
      const saveData = {
        textId: "sample_text_001",
        highlights: highlights.map((h) => ({
          id: h.id,
          start: h.start,
          end: h.end,
        })),
        userId: "user_123",
      };

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      console.log("保存データ:", saveData);
      setSnackbar({ open: true, message: "ハイライトが保存されました！" });
    } catch (error) {
      console.error("保存エラー:", error);
      setSnackbar({ open: true, message: "保存に失敗しました。" });
    }
  };

  // すべてのハイライトを削除
  const clearAllHighlights = () => {
    setHighlights([]);
    setOpenClearDialog(false);
    setSnackbar({ open: true, message: "すべてのハイライトを削除しました" });
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 0 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            <HighlightIcon
              sx={{ mr: 2, verticalAlign: "middle", color: "primary.main" }}
            />
            テキストハイライト機能
          </Typography>

          {/* コントロールパネル */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  startIcon={<SaveAltIcon />}
                  onClick={saveHighlights}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  保存
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setOpenClearDialog(true)}
                  disabled={highlights.length === 0}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  全削除
                </Button>

                <Divider orientation="vertical" flexItem />

                <Chip
                  icon={<HighlightIcon />}
                  label={`ハイライト数: ${highlights.length}`}
                  color="primary"
                  variant="outlined"
                  size="medium"
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* 使い方説明 */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>使い方</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>テキストを選択すると下線（ハイライト）が追加されます</li>
            <li>下線をクリックすると削除できます</li>
            <li>重なる下線は自動的に統合されます</li>
            <li>HTMLタグをまたいでハイライトできます</li>
          </Box>
        </Alert>

        {/* メインテキストエリア */}
        <Paper
          elevation={1}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: "grey.50",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Box
            ref={textContainerRef}
            onMouseDown={handleMouseDown}
            dangerouslySetInnerHTML={{
              __html: applyHighlights(sampleText),
            }}
            sx={{
              lineHeight: 1.8,
              color: "text.primary",
              userSelect: "text",
              WebkitUserSelect: "text",
              MozUserSelect: "text",
              msUserSelect: "text",
              fontSize: "1.1rem",
              "& p": {
                mb: 2,
              },
              "& b": {
                fontWeight: 600,
              },
            }}
          />
        </Paper>

        {/* ハイライト一覧 */}
        {highlights.length > 0 && (
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "text.primary", mb: 3 }}
              >
                ハイライト一覧
              </Typography>
              <List disablePadding>
                {highlights.map((highlight, index) => {
                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = sampleText;
                  const fullText =
                    tempDiv.textContent || tempDiv.innerText || "";
                  const highlightedText = fullText.substring(
                    highlight.start,
                    highlight.end
                  );

                  return (
                    <React.Fragment key={highlight.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          backgroundColor:
                            index % 2 === 0 ? "transparent" : "grey.50",
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              component="span"
                              sx={{
                                borderBottom: `3px solid ${theme.palette.error.main}`,
                                fontWeight: 500,
                              }}
                            >
                              {highlightedText}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              位置: {highlight.start}-{highlight.end}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={(event) =>
                              handleHighlightClick(
                                event.nativeEvent,
                                highlight.id
                              )
                            }
                            size="small"
                            sx={{
                              "&:hover": {
                                backgroundColor: "error.light",
                                color: "white",
                              },
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* 確認ダイアログ */}
      <Dialog
        open={openClearDialog}
        onClose={() => setOpenClearDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          <Typography>
            すべてのハイライトを削除しますか？この操作は元に戻せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>キャンセル</Button>
          <Button
            onClick={clearAllHighlights}
            color="error"
            variant="contained"
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Container>
  );
};
