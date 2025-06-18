// pages/index.tsx
import React, { useState, useRef, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  Grid,
  Chip,
  AlertColor,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

// 型定義
interface SerializedRange {
  method: "basic" | "xpath";
  selectedText: string;
  collapsed: boolean;
}

interface BasicSerializedRange extends SerializedRange {
  method: "basic";
  startContainerPath: number[];
  startOffset: number;
  endContainerPath: number[];
  endOffset: number;
}

interface XPathSerializedRange extends SerializedRange {
  method: "xpath";
  startContainerXPath: string;
  startOffset: number;
  endContainerXPath: string;
  endOffset: number;
}

interface SavedRange {
  id: number;
  data: BasicSerializedRange | XPathSerializedRange;
  method: "basic" | "xpath";
  savedAt: string;
  preview: string;
}

// 基本的なパスベースシリアライザー
class BasicRangeSerializer {
  static serialize(
    range: Range,
    container: Element
  ): BasicSerializedRange | null {
    if (!range || range.collapsed) return null;

    return {
      startContainerPath: this.getNodePath(range.startContainer, container),
      startOffset: range.startOffset,
      endContainerPath: this.getNodePath(range.endContainer, container),
      endOffset: range.endOffset,
      collapsed: range.collapsed,
      selectedText: range.toString(),
      method: "basic",
    };
  }

  static deserialize(
    serializedRange: BasicSerializedRange,
    container: Element
  ): Range | null {
    if (!serializedRange || serializedRange.method !== "basic") return null;

    try {
      const startContainer = this.getNodeByPath(
        serializedRange.startContainerPath,
        container
      );
      const endContainer = this.getNodeByPath(
        serializedRange.endContainerPath,
        container
      );

      if (!startContainer || !endContainer) return null;

      const range = document.createRange();
      range.setStart(startContainer, serializedRange.startOffset);
      range.setEnd(endContainer, serializedRange.endOffset);
      return range;
    } catch (error) {
      console.error("Basic deserialization failed:", error);
      return null;
    }
  }

  private static getNodePath(node: Node, container: Element): number[] {
    const path: number[] = [];
    let current: Node | null = node;

    while (current && current !== container) {
      const parent: ParentNode | null = current.parentNode;
      if (!parent) break;

      const index = Array.from(parent.childNodes).indexOf(
        current as unknown as ChildNode
      );
      path.unshift(index);
      current = parent;
    }

    return path;
  }

  private static getNodeByPath(
    path: number[],
    container: Element
  ): Node | null {
    let current: Node = container;

    for (const index of path) {
      if (!current.childNodes || index >= current.childNodes.length) {
        return null;
      }
      current = current.childNodes[index];
    }

    return current;
  }
}

// XPathベースシリアライザー
class XPathRangeSerializer {
  static serialize(
    range: Range,
    container: Element
  ): XPathSerializedRange | null {
    if (!range || range.collapsed) return null;

    return {
      startContainerXPath: this.getXPath(range.startContainer, container),
      startOffset: range.startOffset,
      endContainerXPath: this.getXPath(range.endContainer, container),
      endOffset: range.endOffset,
      collapsed: range.collapsed,
      selectedText: range.toString(),
      method: "xpath",
    };
  }

  static deserialize(
    serializedRange: XPathSerializedRange,
    container: Element
  ): Range | null {
    if (!serializedRange || serializedRange.method !== "xpath") return null;

    try {
      const startContainer = this.getNodeByXPath(
        serializedRange.startContainerXPath,
        container
      );
      const endContainer = this.getNodeByXPath(
        serializedRange.endContainerXPath,
        container
      );

      if (!startContainer || !endContainer) {
        console.error(
          "XPath deserialization failed: Container nodes not found",
          {
            startXPath: serializedRange.startContainerXPath,
            endXPath: serializedRange.endContainerXPath,
          }
        );
        return null;
      }

      const range = document.createRange();
      const startOffset = Math.min(
        serializedRange.startOffset,
        startContainer.textContent?.length || 0
      );
      const endOffset = Math.min(
        serializedRange.endOffset,
        endContainer.textContent?.length || 0
      );

      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);

      return range;
    } catch (error) {
      console.error("XPath deserialization failed:", error);
      return null;
    }
  }

  private static getXPath(node: Node, container: Element): string {
    if (node === container) return ".";

    const path: string[] = [];
    let current: Node | null = node;

    while (current && current !== container) {
      let name = current.nodeName.toLowerCase();

      if (current.nodeType === Node.TEXT_NODE) {
        const parent = current.parentNode;
        if (parent) {
          const textNodes = Array.from(parent.childNodes).filter(
            (n) => n.nodeType === Node.TEXT_NODE
          );
          const index = textNodes.indexOf(current as unknown as ChildNode) + 1;
          name = `text()[${index}]`;
        }
      } else if (current.nodeType === Node.ELEMENT_NODE && current.parentNode) {
        const siblings = Array.from(current.parentNode.children).filter(
          (e): e is Element =>
            e instanceof Element && e.tagName === (current as Element).tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current as Element) + 1;
          name += `[${index}]`;
        }
      }

      path.unshift(name);
      current = current.parentNode;
    }

    return "./" + path.join("/");
  }

  private static getNodeByXPath(
    xpath: string,
    container: Element
  ): Node | null {
    try {
      const result = document.evaluate(
        xpath,
        container,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (error) {
      console.error("XPath evaluation failed:", error);
      return null;
    }
  }
}

// サンプルテキスト
const SAMPLE_TEXT = `
<h2>Range Serialization Demo</h2>
<p>このサンプルテキストでは、<strong>基本的なパスベース手法</strong>と<em>XPathベース手法</em>の両方を試すことができます。</p>

<p>以下のような要素を含んでいます：</p>
<ul>
  <li><u>下線付きテキスト</u></li>
  <li>上付き文字: E = mc<sup>2</sup></li>
  <li>下付き文字: H<sub>2</sub>O</li>
  <li><a href="#test">リンクテキスト</a></li>
  <li><span style="color: blue; background-color: yellow;">カラフルなスパン</span></li>
</ul>

<p>数式の例：<br/>
化学式: C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O<br/>
物理式: F = ma<sup>2</sup> × t<sup>3</sup></p>

<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
  <p>これは引用文です。<strong>太字</strong>や<em>斜体</em>、<u>下線</u>が含まれています。</p>
  <p>複数の段落にまたがる選択も可能です。</p>
</blockquote>

<div style="border: 1px solid #ddd; padding: 1rem; margin: 1rem 0;">
  <h3>コードサンプル</h3>
  <p>JavaScript: <code>console.log('Hello World');</code></p>
  <p>HTML: <code>&lt;span&gt;テキスト&lt;/span&gt;</code></p>
</div>

<p>画像も含まれています（プレースホルダー）：<br/>
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjREREIi8+Cjx0ZXh0IHg9IjIwIiB5PSIxMiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4Ij5JTUc8L3RleHQ+Cjwvc3ZnPgo=" alt="Sample Image" style="vertical-align: middle;" /></p>

<p>最後の段落です。この文章で<span style="font-weight: bold; color: red;">重要な部分</span>を選択してみてください。</p>
`;

export const RangeSerializerApp: React.FC = () => {
  const [savedRanges, setSavedRanges] = useState<SavedRange[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number>(0);
  const [deserializeInput, setDeserializeInput] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<AlertColor>("info");
  const contentRef = useRef<HTMLDivElement>(null);

  const showMessage = useCallback((text: string, type: AlertColor = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  }, []);

  const handleSerialize = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      showMessage("テキストを選択してください", "warning");
      return;
    }

    const range = selection.getRangeAt(0);
    const container = contentRef.current;

    if (!container) {
      showMessage("コンテナが見つかりません", "error");
      return;
    }

    let serialized: BasicSerializedRange | XPathSerializedRange | null;
    const method = selectedMethod === 0 ? "basic" : "xpath";

    if (method === "basic") {
      serialized = BasicRangeSerializer.serialize(range, container);
    } else {
      serialized = XPathRangeSerializer.serialize(range, container);
    }

    if (serialized) {
      const newRange: SavedRange = {
        id: Date.now(),
        data: serialized,
        method: method,
        savedAt: new Date().toLocaleString(),
        preview:
          serialized.selectedText.substring(0, 50) +
          (serialized.selectedText.length > 50 ? "..." : ""),
      };

      setSavedRanges((prev) => [...prev, newRange]);
      showMessage(`範囲を保存しました (${method})`, "success");

      // 選択を解除
      selection.removeAllRanges();
    } else {
      showMessage("シリアライズに失敗しました", "error");
    }
  }, [selectedMethod, showMessage]);

  const handleDeserialize = useCallback(
    (rangeData?: BasicSerializedRange | XPathSerializedRange) => {
      const container = contentRef.current;
      if (!container) {
        showMessage("コンテナが見つかりません", "error");
        return;
      }

      let serializedData: BasicSerializedRange | XPathSerializedRange;

      if (rangeData) {
        serializedData = rangeData;
      } else {
        try {
          const parsed = JSON.parse(deserializeInput);
          // 型チェック
          if (!parsed.method || !["basic", "xpath"].includes(parsed.method)) {
            throw new Error("Invalid method");
          }
          serializedData = parsed as
            | BasicSerializedRange
            | XPathSerializedRange;
        } catch (error) {
          showMessage("無効なJSONデータです", "error");
          return;
        }
      }

      let range: Range | null;
      if (serializedData.method === "basic") {
        range = BasicRangeSerializer.deserialize(
          serializedData as BasicSerializedRange,
          container
        );
      } else {
        range = XPathRangeSerializer.deserialize(
          serializedData as XPathSerializedRange,
          container
        );
      }

      if (range) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        showMessage("範囲を復元しました", "success");

        // デシリアライズ後、入力フィールドをクリア
        if (!rangeData) {
          setDeserializeInput("");
        }
      } else {
        const method = serializedData.method === "basic" ? "Basic" : "XPath";
        showMessage(
          `${method}手法でのデシリアライズに失敗しました。DOM構造が変更されている可能性があります。`,
          "error"
        );
      }
    },
    [deserializeInput, showMessage]
  );

  const handleDeleteRange = useCallback(
    (id: number) => {
      setSavedRanges((prev) => prev.filter((range) => range.id !== id));
      showMessage("範囲を削除しました", "info");
    },
    [showMessage]
  );

  const handleClearAll = useCallback(() => {
    setSavedRanges([]);
    showMessage("すべての範囲を削除しました", "info");
  }, [showMessage]);

  const handleRangeClick = useCallback((range: SavedRange) => {
    setDeserializeInput(JSON.stringify(range.data, null, 2));
  }, []);

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setSelectedMethod(newValue);
    },
    []
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Range Serializer Demo
      </Typography>

      {message && (
        <Alert severity={messageType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* サンプルテキスト */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                サンプルテキスト
              </Typography>
              <Box
                ref={contentRef}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 2,
                  minHeight: 400,
                  userSelect: "text",
                  "& h2, & h3": { mt: 0, mb: 1 },
                  "& p": { mb: 1 },
                  "& ul": { mb: 1 },
                  "& blockquote": {
                    borderLeft: "3px solid #ccc",
                    paddingLeft: "1rem",
                    margin: "1rem 0",
                    fontStyle: "italic",
                  },
                  "& code": {
                    backgroundColor: "#f5f5f5",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    fontFamily: "monospace",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: SAMPLE_TEXT }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* コントロールパネル */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                シリアライズ手法
              </Typography>
              <Tabs
                value={selectedMethod}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Basic" />
                <Tab label="XPath" />
              </Tabs>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSerialize}
                  fullWidth
                >
                  選択範囲をシリアライズ
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                デシリアライズ
              </Typography>
              <TextField
                label="シリアライズデータ (JSON)"
                multiline
                rows={6}
                value={deserializeInput}
                onChange={(e) => setDeserializeInput(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="JSONデータを入力してください"
              />
              <Button
                variant="contained"
                startIcon={<RestoreIcon />}
                onClick={() => handleDeserialize()}
                fullWidth
                color="secondary"
              >
                範囲を復元
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 保存された範囲一覧 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">
                  保存された範囲 ({savedRanges.length})
                </Typography>
                {savedRanges.length > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClearAll}
                    color="error"
                    size="small"
                  >
                    すべて削除
                  </Button>
                )}
              </Box>

              {savedRanges.length === 0 ? (
                <Typography color="text.secondary">
                  保存された範囲はありません
                </Typography>
              ) : (
                <List>
                  {savedRanges.map((range, index) => (
                    <React.Fragment key={range.id}>
                      <ListItem
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleRangeClick(range)}
                      >
                        <ListItemText
                          primary={
                            <Box>
                              <Chip
                                label={range.method.toUpperCase()}
                                size="small"
                                color={
                                  range.method === "basic"
                                    ? "primary"
                                    : "secondary"
                                }
                                sx={{ mr: 1 }}
                              />
                              {range.preview}
                            </Box>
                          }
                          secondary={`保存日時: ${range.savedAt}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeserialize(range.data);
                            }}
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            <RestoreIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRange(range.id);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < savedRanges.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>使用方法：</strong>
          <br />
          1. 上のサンプルテキストから任意の範囲をマウスで選択
          <br />
          2. シリアライズ手法（BasicまたはXPath）を選択
          <br />
          3. 「選択範囲をシリアライズ」ボタンをクリック
          <br />
          4. 保存された範囲をクリックしてJSONデータを確認
          <br />
          5. 復元ボタンまたはデシリアライズボタンで範囲を復元
          <br />
          <br />
          <strong>注意：</strong>
          DOM構造は不変を想定しています。構造が変更された場合、復元に失敗する可能性があります。
        </Typography>
      </Box>
    </Container>
  );
};
