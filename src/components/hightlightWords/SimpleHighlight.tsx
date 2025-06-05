import Link from "next/link";
import React, { useRef } from "react";

export const SimpleHighlight: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    // contentRefの範囲内だけを対象にする（外部は無視）
    if (!contentRef.current?.contains(range.commonAncestorContainer)) return;

    // ハイライト用の <mark> 要素を作成
    const mark = document.createElement("mark");
    mark.style.backgroundColor = "yellow";

    try {
      range.surroundContents(mark);
      selection.removeAllRanges(); // 選択解除
    } catch (err) {
      console.warn("ハイライトできませんでした。複雑な範囲です。", err);
    }
  };

  return (
    <div>
      <h2>ハイライトテスト</h2>
      <div
        ref={contentRef}
        onMouseUp={handleMouseUp}
        style={{
          lineHeight: "1.6",
          userSelect: "text",
          border: "1px solid #ccc",
          padding: "1em",
        }}
      >
        Reactは、ユーザーインターフェースを構築するためのJavaScriptライブラリです。
        テキストをマウスで選択するだけで、自動的にハイライトが付きます。
        選択後、黄色のマーカーが適用される仕組みになっています。
      </div>
      {/* フッター */}
      <Link href="/">TOP</Link>
    </div>
  );
};
