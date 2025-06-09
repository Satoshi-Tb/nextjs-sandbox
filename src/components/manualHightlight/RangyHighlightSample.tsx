// HighlightEditor.tsx
import React, { useRef, useState } from "react";
import rangy from "rangy";
import "rangy/lib/rangy-classapplier";

rangy.init();

type Highlight = {
  id: string;
  color: string;
};

const HIGHLIGHT_COLORS = ["#ffeb3b", "#b2ff59", "#80d8ff"];

export const RangyHighlightSample: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>(
    HIGHLIGHT_COLORS[0]
  );
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const applyHighlight = () => {
    const selection = rangy.getSelection();

    console.log("applyHighlight", selection);

    if (!selection || selection.isCollapsed) return;

    const id = `hl-${Date.now()}`;
    const cssClass = `highlight-${id}`;

    const applier = (rangy as any).createClassApplier(cssClass, {
      elementTagName: "mark",
      elementProperties: {
        id: id,
        style: { backgroundColor: selectedColor, cursor: "pointer" },
        onclick: () => removeHighlight(id),
      },
    });
    console.log("applyHighlight", applier);
    applier.applyToSelection();
    setHighlights((prev) => [...prev, { id, color: selectedColor }]);
    selection.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const range = rangy.createRange();
    range.selectNodeContents(el);
    (rangy.getSelection() as any).setSingleRange(range);

    const applier = (rangy as any).createClassApplier(`highlight-${id}`, {
      elementTagName: "mark",
    });
    applier.undoToSelection();
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

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
        dangerouslySetInnerHTML={{
          __html: `
            <p><b>React</b>はFacebookが開発した<strong>UIライブラリ</strong>であり、</p>
            <p><span style="color:blue">コンポーネント指向</span>と仮想DOMによる高速描画を特徴としています。</p>
            <p>さらに、<sup>Next.js</sup>などのフレームワークとも併用されます。</p>
          `,
        }}
      />
    </div>
  );
};
