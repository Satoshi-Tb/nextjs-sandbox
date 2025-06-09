// HighlightEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import useSWR from "swr";
import Link from "next/link";

rangy.init();

type Highlight = {
  id: string;
  color: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const HIGHLIGHT_COLORS = ["#ffeb3b", "#b2ff59", "#80d8ff"];

export const RangyHighlightSample: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    HIGHLIGHT_COLORS[0]
  );

  // 初期表示データ
  const { data, isLoading } = useSWR("/api/highlight/document", fetcher);

  // ハイライト適用データ
  const { data: highlightData, mutate: reloadHighlight } = useSWR(
    "/api/highlight/highlighted",
    fetcher
  );

  useEffect(() => {
    // ハイライトデータセット
    if (highlightData?.html && contentRef.current) {
      contentRef.current.innerHTML = highlightData.html;
    }
  }, [highlightData]);

  const applyHighlight = async () => {
    // 選択状態取得
    const selection = rangy.getSelection();

    console.log("applyHighlight", selection);
    if (!selection || selection.isCollapsed) return;

    // 選択エリア判定
    const range = selection.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) return;

    const id = `hl-${Date.now()}`;
    const cssClass = `highlight-${id}`;

    const applier = (rangy as any).createClassApplier(cssClass, {
      elementTagName: "mark",
      elementProperties: {
        id: id,
        style: { backgroundColor: selectedColor, cursor: "pointer" },
      },
    });
    console.log("applyHighlight", applier);
    applier.applyToSelection();
    selection.removeAllRanges();
    // 保存用にinnerHTMLをサーバーにPOST
    if (contentRef.current) {
      await fetch("/api/highlight/highlighted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: contentRef.current.innerHTML }),
      });
      reloadHighlight();
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>文章ハイライトエディタ</h2>

      {/* カラー選択 */}
      <div style={{ marginBottom: "10px" }}>
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            style={{
              backgroundColor: color,
              border:
                selectedColor === color ? "2px solid black" : "1px solid gray",
              marginRight: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
        <button onClick={applyHighlight}>ハイライト</button>
      </div>

      {/* ハイライト対象文章 */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          border: "1px solid #ccc",
          padding: 12,
          lineHeight: 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
      {/* フッター */}
      <Link href="/">TOP</Link>
    </div>
  );
};
