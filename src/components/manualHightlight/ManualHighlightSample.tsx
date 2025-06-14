import React, { useState, useRef, useCallback, useEffect } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

type HighlightItem = {
  id: number;
  start: number;
  end: number;
};

// サンプルのHTML文章（装飾タグを含む）
const sampleText = `
    <p>これは<b>サンプル文章</b>です。この文章には<span style="color: blue;">様々な装飾</span>が含まれています。</p>
    <p><sup>上付き文字</sup>や<br/>改行も含まれており、<b>複数の段落</b>にわたって下線を引くことができます。</p>
    <p>Kindleの<span style="font-style: italic;">ハイライト機能</span>のように、任意の箇所に下線を設定できます。下線は<b>重なる場合に統合</b>され、クリックで削除することも可能です。</p>
  `;

export const ManualHighlightSample = () => {
  // ハイライト設定状態
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  // 選択状態の管理
  const [isSelecting, setIsSelecting] = useState(false);
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
        // 重なりがある場合は統合
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

    if (!container || !container.contains(range.commonAncestorContainer))
      return null;

    // 選択範囲をテキスト全体での文字位置に変換
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

    console.log(
      "handleMouseUp called, textContainerRef.current:",
      textContainerRef.current
    );

    const range = getSelectionRange();
    if (range) {
      setHighlights((prev) => {
        const newHighlights = [...prev, { ...range, id: Date.now() }];
        return mergeOverlappingHighlights(newHighlights);
      });
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
  };

  // HTMLにハイライトを適用
  const applyHighlights = (htmlContent: string) => {
    if (highlights.length === 0) return htmlContent;

    // HTMLタグを除いたプレーンテキストを取得
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // ハイライト位置をソート
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    // 挿入ポイントを計算（後ろから処理して位置ずれを防ぐ）
    // const insertPoints = [];
    // sortedHighlights.forEach((highlight) => {
    //   insertPoints.push({ pos: highlight.end, type: "end", id: highlight.id });
    //   insertPoints.push({
    //     pos: highlight.start,
    //     type: "start",
    //     id: highlight.id,
    //   });
    // });
    // insertPoints.sort((a, b) => b.pos - a.pos);

    // HTMLを文字単位で分解してハイライトタグを挿入
    let result = htmlContent;
    let textPos = 0;
    let htmlPos = 0;

    // 複雑なHTML構造でのハイライト適用のため、DOMベースの処理を使用
    const div = document.createElement("div");
    div.innerHTML = htmlContent;

    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT, null);

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // 各テキストノードに対してハイライトを適用
    let currentTextPos = 0;
    textNodes.forEach((textNode) => {
      const nodeText = textNode.textContent || "";
      const nodeStart = currentTextPos;
      const nodeEnd = currentTextPos + nodeText.length;

      // このノードに影響するハイライトを見つける
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

        // ハイライト区間を処理
        relevantHighlights.forEach((highlight) => {
          const relStart = Math.max(0, highlight.start - nodeStart);
          const relEnd = Math.min(nodeText.length, highlight.end - nodeStart);

          if (relStart < relEnd) {
            // ハイライト前のテキスト
            if (lastPos < relStart) {
              spans.push({
                text: nodeText.substring(lastPos, relStart),
                highlighted: false,
                id: null,
              });
            }

            // ハイライト部分
            spans.push({
              text: nodeText.substring(relStart, relEnd),
              highlighted: true,
              id: highlight.id,
            });

            lastPos = relEnd;
          }
        });

        // 残りのテキスト
        if (lastPos < nodeText.length) {
          spans.push({
            text: nodeText.substring(lastPos),
            highlighted: false,
            id: null,
          });
        }

        // 新しい要素を作成
        const fragment = document.createDocumentFragment();
        spans.forEach((span) => {
          if (span.highlighted) {
            const mark = document.createElement("mark");
            mark.style.backgroundColor = "transparent";
            mark.style.borderBottom = "3px solid #ff4444";
            mark.style.cursor = "pointer";
            span.id &&
              mark.setAttribute("data-highlight-id", span.id.toString());
            mark.textContent = span.text;
            if (span.id !== null) {
              //mark.onclick = (e) => handleHighlightClick(e, span.id);
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
      // 実際のAPI呼び出しをシミュレート
      const saveData = {
        textId: "sample_text_001", // 元テキストのID
        highlights: highlights.map((h) => ({
          id: h.id,
          start: h.start,
          end: h.end,
        })),
        userId: "user_123", // 実際はログインユーザーのID
      };

      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: "ハイライトが保存されました",
          });
        }, 1000);
      });

      console.log("保存データ:", saveData);
      alert("ハイライトが保存されました！");
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました。");
    }
  };

  // すべてのハイライトを削除
  const clearAllHighlights = () => {
    if (window.confirm("すべてのハイライトを削除しますか？")) {
      setHighlights([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // デバッグ用
  useEffect(() => {
    console.log("textContainerRef.current:", textContainerRef.current);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          テキストハイライト機能
        </h1>

        {/* コントロールパネル */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
          <button
            onClick={saveHighlights}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <SaveAltIcon />
            保存
          </button>

          <button
            onClick={clearAllHighlights}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <DeleteForeverIcon />
            全削除
          </button>

          <div className="text-sm text-gray-600 flex items-center">
            ハイライト数: {highlights.length}
          </div>
        </div>
      </div>

      {/* 使い方説明 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">使い方:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• テキストを選択すると下線（ハイライト）が追加されます</li>
          <li>• 下線をクリックすると削除できます</li>
          <li>• 重なる下線は自動的に統合されます</li>
          <li>• HTMLタグをまたいでハイライトできます</li>
        </ul>
      </div>

      {/* メインテキストエリア */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <div
          ref={textContainerRef}
          className="leading-relaxed text-gray-800 select-text"
          onMouseDown={handleMouseDown}
          dangerouslySetInnerHTML={{
            __html: applyHighlights(sampleText),
          }}
          style={{
            userSelect: "text",
            WebkitUserSelect: "text",
            MozUserSelect: "text",
            msUserSelect: "text",
          }}
        />
      </div>

      {/* ハイライト一覧 */}
      {highlights.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ハイライト一覧
          </h3>
          <div className="space-y-2">
            {highlights.map((highlight) => {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = sampleText;
              const fullText = tempDiv.textContent || tempDiv.innerText || "";
              const highlightedText = fullText.substring(
                highlight.start,
                highlight.end
              );

              return (
                <div
                  key={highlight.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                >
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">
                      位置: {highlight.start}-{highlight.end}
                    </span>
                    <div className="mt-1">
                      <span
                        className="text-gray-800"
                        style={{
                          borderBottom: "3px solid #ff4444",
                        }}
                      >
                        {highlightedText}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(event) =>
                      handleHighlightClick(event.nativeEvent, highlight.id)
                    }
                    className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
