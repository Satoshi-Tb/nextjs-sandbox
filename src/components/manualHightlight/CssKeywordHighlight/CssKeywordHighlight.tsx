import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

interface KeywordHighlight {
  id: string;
  keyword: string;
  color: string;
}

interface HighlightAreaProps {
  keywords: KeywordHighlight[];
  sampleText: string;
}

const HighlightArea: React.FC<HighlightAreaProps> = ({
  keywords,
  sampleText,
}) => {
  const highlightRef = useRef<HTMLDivElement>(null);
  const componentIdRef = useRef<string>();
  const registeredHighlights = useRef<Set<string>>(new Set());

  // コンポーネント固有のIDを初回のみ生成
  if (!componentIdRef.current) {
    componentIdRef.current = Math.random().toString(36).substring(2, 11);
  }
  const componentId = componentIdRef.current;

  // ハイライトを適用する関数
  const applyHighlights = useCallback(() => {
    if (!highlightRef.current) return;

    // 前回登録したハイライトを削除
    registeredHighlights.current.forEach((name) => {
      CSS.highlights.delete(name);
    });
    registeredHighlights.current.clear();

    keywords.forEach((item) => {
      const ranges: Range[] = [];
      const walker = document.createTreeWalker(
        highlightRef.current!,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node: Text | null;
      while ((node = walker.nextNode() as Text)) {
        const text = node.textContent;
        if (!text) continue;

        const regex = new RegExp(item.keyword, "gi");
        let match;
        while ((match = regex.exec(text)) !== null) {
          const range = new Range();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          ranges.push(range);
        }
      }

      if (ranges.length > 0) {
        const highlight = new Highlight(...ranges);
        const highlightName = `highlight-${componentId}-${item.id}`;
        CSS.highlights.set(highlightName, highlight);
        registeredHighlights.current.add(highlightName);
      }
    });
  }, [keywords, componentId]);

  // キーワードが変更されたときにハイライトを更新
  useEffect(() => {
    if (keywords.length > 0) {
      // DOM更新後にハイライトを適用
      const timer = setTimeout(applyHighlights, 100);
      return () => clearTimeout(timer);
    } else {
      // キーワードがない場合はハイライトをクリア
      CSS.highlights.clear();
    }
  }, [keywords, applyHighlights]);

  // CSSスタイルを動的に追加
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = keywords
      .map(
        (item) =>
          `::highlight(highlight-${componentId}-${item.id}) { background-color: ${item.color}; }`
      )
      .join("\n");

    document.head.appendChild(style);

    return () => {
      // スタイルを削除
      if (style.parentNode) {
        document.head.removeChild(style);
      }
      // 登録済みハイライトをすべて削除
      registeredHighlights.current.forEach((name) => {
        CSS.highlights.delete(name);
      });
      registeredHighlights.current.clear();
    };
  }, [keywords, componentId]);

  return (
    <Paper sx={{ p: 3, backgroundColor: "#fafafa" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        ハイライト表示エリア
      </Typography>
      <Typography
        ref={highlightRef}
        component="div"
        sx={{
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {sampleText}
      </Typography>
    </Paper>
  );
};

const KeywordHighlighterApp: React.FC = () => {
  const [keywords, setKeywords] = useState<KeywordHighlight[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newColor, setNewColor] = useState("#ffff00");
  const [sampleText, setSampleText] =
    useState(`これはサンプルテキストです。このテキストでキーワードハイライト機能をテストできます。
React、JavaScript、TypeScriptなどの技術キーワードを検索してみてください。
CSS Custom Highlight APIを使用することで、DOM構造を変更せずにハイライトを実現できます。
この技術により、パフォーマンスが向上し、より柔軟なハイライト機能を提供できます。`);

  // キーワード追加
  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    const newItem: KeywordHighlight = {
      id: `highlight-${Date.now()}`,
      keyword: newKeyword.trim(),
      color: newColor,
    };

    setKeywords((prev) => [...prev, newItem]);
    setNewKeyword("");
  };

  // キーワード削除
  const removeKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((item) => item.id !== id));
    // 注意: ハイライトの削除はHighlightAreaコンポーネント内で処理される
  };

  const predefinedColors = [
    "#ffff00",
    "#00ff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#ff69b4",
    "#90ee90",
    "#dda0dd",
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, textAlign: "center" }}
      >
        キーワードハイライトアプリ
      </Typography>

      <Grid container spacing={3}>
        {/* キーワード追加セクション */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <AddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                キーワード追加
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="検索キーワード"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  ハイライト色
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: color,
                        border:
                          newColor === color
                            ? "3px solid #333"
                            : "1px solid #ccc",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </Box>

                <TextField
                  type="color"
                  label="カスタム色"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  onClick={addKeyword}
                  disabled={!newKeyword.trim()}
                  startIcon={<SearchIcon />}
                  fullWidth
                >
                  キーワードを追加
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* キーワード一覧セクション */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                登録済みキーワード ({keywords.length})
              </Typography>

              {keywords.length === 0 ? (
                <Typography color="text.secondary">
                  登録されたキーワードはありません
                </Typography>
              ) : (
                <List>
                  {keywords.map((item) => (
                    <ListItem key={item.id} divider>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: 2 }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: item.color,
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            mr: 1,
                          }}
                        />
                        <Chip
                          label={item.keyword}
                          size="small"
                          sx={{ backgroundColor: item.color }}
                        />
                      </Box>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeKeyword(item.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* サンプルテキストセクション */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                テスト用ドキュメント
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TextField
                multiline
                rows={8}
                fullWidth
                label="テキスト内容を編集できます"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                sx={{ mb: 2 }}
              />

              <HighlightArea keywords={keywords} sampleText={sampleText} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 使用方法 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            使用方法
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            1.
            上部のフォームでキーワードと色を選択し、「キーワードを追加」ボタンをクリック
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            2. 登録されたキーワードがテキスト内で自動的にハイライト表示されます
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            3. 不要なキーワードは一覧から削除ボタンで削除可能
          </Typography>
          <Typography variant="body2">
            4. CSS Custom Highlight
            APIを使用しているため、DOM構造に影響を与えずにハイライトを実現
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KeywordHighlighterApp;
