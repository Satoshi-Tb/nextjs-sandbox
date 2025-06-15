// pages/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

// 下線スタイル（CSSクラス）
const UNDERLINE_CLASS = "custom-underline";

// 永続化データ形式
export interface UnderlineRange {
  startContainerPath: number[];
  startOffset: number;
  endContainerPath: number[];
  endOffset: number;
}

const mockAPI = {
  async getHighlights(): Promise<UnderlineRange[]> {
    return JSON.parse(localStorage.getItem("highlights") || "[]");
  },
  async saveHighlights(ranges: UnderlineRange[]) {
    localStorage.setItem("highlights", JSON.stringify(ranges));
  },
};

export const ManualHighlightSample3 = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<UnderlineRange[]>([]);

  useEffect(() => {
    (async () => {
      const saved = await mockAPI.getHighlights();
      setHighlights(saved);
      saved.forEach((range) => {
        try {
          applyUnderline(range);
        } catch (e) {
          console.warn("Failed to apply underline", e);
        }
      });
    })();
  }, []);

  const handleMouseUp = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);

    if (
      !contentRef.current ||
      !contentRef.current.contains(range.commonAncestorContainer)
    )
      return;

    const serialized = serializeRange(range, contentRef.current);
    applyUnderline(serialized);

    const merged = mergeHighlights([...highlights, serialized]);
    setHighlights(merged);
    await mockAPI.saveHighlights(merged);
    selection.removeAllRanges();
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(UNDERLINE_CLASS)) {
      const selectionIndex = Array.from(
        contentRef.current!.querySelectorAll("." + UNDERLINE_CLASS)
      ).indexOf(target);
      const updated = [...highlights];
      updated.splice(selectionIndex, 1);
      setHighlights(updated);
      mockAPI.saveHighlights(updated);
      restoreContent();
      updated.forEach((r) => {
        try {
          applyUnderline(r);
        } catch (e) {
          console.warn("Failed to apply underline", e);
        }
      });
    }
  };

  const serializeRange = (range: Range, root: HTMLElement): UnderlineRange => {
    const pathTo = (node: Node): number[] => {
      const path: number[] = [];
      while (node && node !== root) {
        const parent = node.parentNode;
        if (!parent) break;
        path.unshift(Array.prototype.indexOf.call(parent.childNodes, node));
        node = parent;
      }
      return path;
    };
    return {
      startContainerPath: pathTo(range.startContainer),
      startOffset: range.startOffset,
      endContainerPath: pathTo(range.endContainer),
      endOffset: range.endOffset,
    };
  };

  const deserializeRange = (data: UnderlineRange, root: HTMLElement): Range => {
    const fromPath = (path: number[]): Node | null => {
      return path.reduce<Node | null>((node, idx) => {
        if (!node || !node.childNodes || node.childNodes.length <= idx)
          return null;
        return node.childNodes[idx];
      }, root as unknown as Node);
    };

    const startNode = fromPath(data.startContainerPath);
    const endNode = fromPath(data.endContainerPath);

    if (!startNode || !endNode) throw new Error("Invalid path");

    const range = document.createRange();
    range.setStart(startNode, data.startOffset);
    range.setEnd(endNode, data.endOffset);
    return range;
  };

  const applyUnderline = (data: UnderlineRange) => {
    const range = deserializeRange(data, contentRef.current!);
    if (range.collapsed) return;
    const span = document.createElement("span");
    span.className = UNDERLINE_CLASS;
    span.style.borderBottom = "3px solid red";
    range.surroundContents(span);
  };

  const restoreContent = () => {
    if (!contentRef.current) return;
    const html = contentRef.current.innerHTML;
    contentRef.current.innerHTML = html.replaceAll(
      /<span class=\"custom-underline\".*?>(.*?)<\/span>/g,
      "$1"
    );
  };

  const mergeHighlights = (list: UnderlineRange[]): UnderlineRange[] => {
    const sortKey = (r: UnderlineRange) =>
      JSON.stringify(r.startContainerPath) + r.startOffset;
    return list
      .sort((a, b) => (sortKey(a) > sortKey(b) ? 1 : -1))
      .reduce<UnderlineRange[]>((acc, curr) => {
        const last = acc[acc.length - 1];
        if (!last) return [curr];
        if (
          JSON.stringify(curr.startContainerPath) <=
          JSON.stringify(last.endContainerPath)
        ) {
          last.endContainerPath = curr.endContainerPath;
          last.endOffset = curr.endOffset;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        装飾タグを含む固定HTMLテキスト
      </Typography>
      <Box
        ref={contentRef}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        sx={{
          border: "1px solid #ccc",
          p: 2,
          userSelect: "text",
        }}
      >
        <p>
          これは<b>重要な</b>
          文章です。ユーザーは任意の箇所を選択してハイライトできます。
          <br />
          <span style={{ color: "blue" }}>青い文字</span>
          で書かれた部分もあります。
        </p>
        <p>
          第二段落では<sup>上付き文字</sup>も使用されています。
          <br />
          <b>太字</b>と<i>斜体</i>が混在しています。
        </p>
      </Box>
    </Box>
  );
};

// // styles/globals.css
// .custom-underline {
//   border-bottom: 3px solid red;
//   cursor: pointer;
// }
