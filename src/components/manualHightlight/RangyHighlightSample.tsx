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
  const { data: initialData, isLoading } = useSWR(
    "/api/highlight/document",
    fetcher
  );

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

  useEffect(() => {
    // ハイライト削除用のイベントセット
    // TODO イベント動作が不安定
    const container = contentRef.current;
    if (!container) return;

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      console.log("click highlight:start", { target });
      if (target.tagName === "MARK") {
        const cssClass = Array.from(target.classList).find((cls) =>
          cls.startsWith("highlight-")
        );
        console.log("click highlight:targetclass", { cssClass });
        if (!cssClass) return;

        const range = rangy.createRange();

        // range.selectNodeContents(target);
        // console.log("click highlight:createrange", { range });

        // (rangy.getSelection() as any).setSingleRange(range);

        // const applier = (rangy as any).createClassApplier(cssClass);

        range.selectNode(target);
        console.log("click highlight:createrange", { range });
        rangy.getSelection().removeAllRanges();
        rangy.getSelection().addRange(range);
        console.log("click highlight:resetrange", { range });
        const applier = (rangy as any).createClassApplier(cssClass, {
          elementTagName: "mark",
        });
        console.log("click highlight:applier", { applier });

        applier.undoToSelection();

        if (contentRef.current) {
          await fetch("/api/highlight/highlighted", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: contentRef.current.innerHTML }),
          });
          reloadHighlight();
        }
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [reloadHighlight]);

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

    // 選択範囲にハイライトマークアップを適用する
    // DOMを直接操作する
    const applier = (rangy as any).createClassApplier(cssClass, {
      elementTagName: "mark",
      elementProperties: {
        id: id,
        style: { backgroundColor: selectedColor, cursor: "pointer" },
      },
      onclick: () => {
        // note:このイベントハンドラは、html再レンダリングのタイミングで削除されるので、動作しない
        console.log("applier onclick");
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
        dangerouslySetInnerHTML={{ __html: initialData.html }}
      />
      {/* フッター */}
      <Link href="/">TOP</Link>
    </div>
  );
};
