import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";

type Highlight = {
  id: string;
  start: number;
  end: number;
  color: string;
  text: string;
};

const HIGHLIGHT_COLORS = ["yellow", "red", "lightgreen"];
const STORAGE_KEY = "my_highlights";

export const MultiColorHighlight: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // 初期ロード時にlocalStorageから復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Highlight[] = JSON.parse(saved);
      setHighlights(parsed);
    }
  }, []);

  // DOM描画後にハイライト再描画
  useEffect(() => {
    restoreHighlights();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(highlights));
  }, [highlights]);

  const getOffset = (
    container: HTMLElement,
    node: Node,
    offset: number
  ): number => {
    let total = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    while (walker.nextNode()) {
      const currentNode = walker.currentNode;
      if (currentNode === node) {
        return total + offset;
      }
      total += currentNode.textContent?.length ?? 0;
    }
    return -1;
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) return;

    const start = getOffset(
      contentRef.current,
      range.startContainer,
      range.startOffset
    );
    const end = getOffset(
      contentRef.current,
      range.endContainer,
      range.endOffset
    );

    if (start < 0 || end <= start) return;

    const selectedText = selection.toString();
    const id = `${Date.now()}-${Math.random()}`;

    // 新規ハイライトを末尾に追加（後勝ち）
    const newHighlight: Highlight = {
      id,
      start,
      end,
      color: selectedColor,
      text: selectedText,
    };

    setHighlights((prev) => [
      ...prev.filter((h) => !(h.start < end && h.end > start)),
      newHighlight,
    ]);
    selection.removeAllRanges();
  };

  const restoreHighlights = () => {
    if (!contentRef.current) return;
    const container = contentRef.current;
    const originalText = container.innerText;

    container.innerHTML = ""; // 一度クリア

    let cursor = 0;
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    for (const h of sorted) {
      if (cursor < h.start) {
        container.appendChild(
          document.createTextNode(originalText.slice(cursor, h.start))
        );
      }

      const mark = document.createElement("mark");
      mark.style.backgroundColor = h.color;
      mark.textContent = originalText.slice(h.start, h.end);
      container.appendChild(mark);

      cursor = h.end;
    }

    if (cursor < originalText.length) {
      container.appendChild(
        document.createTextNode(originalText.slice(cursor))
      );
    }
  };

  return (
    <div>
      <h2>色付きハイライトテスト</h2>

      {/* カラーパレット */}
      <div style={{ marginBottom: "1em" }}>
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              backgroundColor: color,
              border:
                selectedColor === color ? "2px solid black" : "1px solid gray",
              width: 30,
              height: 30,
              marginRight: 10,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* テキスト領域 */}
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        style={{
          border: "1px solid #ccc",
          padding: "1em",
          lineHeight: 1.6,
          userSelect: "text",
          whiteSpace: "pre-wrap",
        }}
      >
        Reactは、ユーザーインターフェースを構築するためのJavaScriptライブラリです。
        テキストをマウスで選択し、上の色ボタンを選んだ状態で選択するとハイライトされます。
        既存のハイライトと重なった場合は、新しい色で上書きされます。
      </div>
      {/* フッター */}
      <Link href="/">TOP</Link>
    </div>
  );
};
