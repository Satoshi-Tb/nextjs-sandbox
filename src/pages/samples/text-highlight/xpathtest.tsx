// pages/index.tsx
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";

interface RangeData {
  startXPath: string;
  endXPath: string;
  startOffset: number;
  endOffset: number;
  text: string;
}

const Home: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<RangeData | null>(null);
  const [xpathInput, setXpathInput] = useState("");
  const [offsetInput, setOffsetInput] = useState("0");
  const [endXpathInput, setEndXpathInput] = useState("");
  const [endOffsetInput, setEndOffsetInput] = useState("0");
  const [isRelativePath, setIsRelativePath] = useState(false);
  const [error, setError] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
          setSelectedRange(null);
          return;
        }

        try {
          const startXPath = isRelativePath
            ? getXPathTo(range.startContainer, contentRef.current)
            : getXPath(range.startContainer);
          const endXPath = isRelativePath
            ? getXPathTo(range.endContainer, contentRef.current)
            : getXPath(range.endContainer);

          setSelectedRange({
            startXPath,
            endXPath,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            text: range.toString(),
          });
          setError("");
        } catch (err) {
          setError("選択範囲の処理中にエラーが発生しました");
          console.error(err);
        }
      }
    };

    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [isRelativePath]);

  const restoreSelection = () => {
    if (!xpathInput) return;

    try {
      const startNode = evaluateXPath(
        xpathInput,
        isRelativePath ? contentRef.current : document
      );
      const endNode = endXpathInput
        ? evaluateXPath(
            endXpathInput,
            isRelativePath ? contentRef.current : document
          )
        : startNode;

      if (!startNode || !endNode) {
        setError("指定されたXPathでノードが見つかりませんでした");
        return;
      }

      const range = document.createRange();
      range.setStart(startNode, parseInt(offsetInput) || 0);
      range.setEnd(
        endNode,
        parseInt(endOffsetInput) || parseInt(offsetInput) || 0
      );

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setError("");
    } catch (err) {
      setError("XPathから選択範囲の復元中にエラーが発生しました");
      console.error(err);
    }
  };

  const evaluateXPath = (
    xpath: string,
    contextNode: Node | null = null
  ): Node | null => {
    const context = contextNode || document;
    const result = document.evaluate(
      xpath,
      context,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  };

  const clearSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    setSelectedRange(null);
    setError("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 簡単なフィードバック
      const originalText = text.substring(0, 20) + "...";
      console.log("クリップボードにコピーしました:", originalText);
    });
  };

  return (
    <div className="container">
      <Head>
        <title>Range to XPath Converter</title>
        <meta
          name="description"
          content="Convert DOM Range to XPath and vice versa"
        />
      </Head>

      <main className="main">
        <h1 className="title">Range ⇄ XPath Converter</h1>

        <div className="controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isRelativePath}
              onChange={(e) => setIsRelativePath(e.target.checked)}
            />
            相対パスを使用
          </label>
          <button onClick={clearSelection} className="clear-btn">
            選択をクリア
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="converter-section">
          <h2>選択範囲 → XPath</h2>
          {selectedRange ? (
            <div className="range-info">
              <div className="info-item">
                <label>開始XPath:</label>
                <div className="xpath-output">
                  <code>{selectedRange.startXPath}</code>
                  <button
                    onClick={() => copyToClipboard(selectedRange.startXPath)}
                    className="copy-btn"
                  >
                    コピー
                  </button>
                </div>
              </div>
              <div className="info-item">
                <label>開始オフセット:</label>
                <span>{selectedRange.startOffset}</span>
              </div>
              <div className="info-item">
                <label>終了XPath:</label>
                <div className="xpath-output">
                  <code>{selectedRange.endXPath}</code>
                  <button
                    onClick={() => copyToClipboard(selectedRange.endXPath)}
                    className="copy-btn"
                  >
                    コピー
                  </button>
                </div>
              </div>
              <div className="info-item">
                <label>終了オフセット:</label>
                <span>{selectedRange.endOffset}</span>
              </div>
              <div className="info-item">
                <label>選択テキスト:</label>
                <div className="selected-text">"{selectedRange.text}"</div>
              </div>
            </div>
          ) : (
            <p className="placeholder">
              下のサンプルテキストから文字列を選択してください
            </p>
          )}
        </div>

        <div className="converter-section">
          <h2>XPath → 選択範囲</h2>
          <div className="xpath-input-section">
            <div className="input-group">
              <label>開始XPath:</label>
              <input
                type="text"
                value={xpathInput}
                onChange={(e) => setXpathInput(e.target.value)}
                placeholder={
                  isRelativePath
                    ? ".//p[1]/text()[1]"
                    : "/html/body/div/p[1]/text()[1]"
                }
                className="xpath-input"
              />
            </div>
            <div className="input-group">
              <label>開始オフセット:</label>
              <input
                type="number"
                value={offsetInput}
                onChange={(e) => setOffsetInput(e.target.value)}
                min="0"
                className="offset-input"
              />
            </div>
            <div className="input-group">
              <label>終了XPath (省略可):</label>
              <input
                type="text"
                value={endXpathInput}
                onChange={(e) => setEndXpathInput(e.target.value)}
                placeholder="省略時は開始XPathと同じ"
                className="xpath-input"
              />
            </div>
            <div className="input-group">
              <label>終了オフセット:</label>
              <input
                type="number"
                value={endOffsetInput}
                onChange={(e) => setEndOffsetInput(e.target.value)}
                min="0"
                className="offset-input"
              />
            </div>
            <button onClick={restoreSelection} className="restore-btn">
              選択範囲を復元
            </button>
          </div>
        </div>

        <div className="sample-content" ref={contentRef}>
          <h2>サンプルコンテンツ</h2>
          <p>
            これは<strong>サンプル</strong>のテキストです。この文章を選択して、
            XPathがどのように生成されるかを確認できます。
          </p>
          <div className="nested-content">
            <p>
              ネストされた要素内の<em>テキスト</em>も選択できます。
              <span className="highlight">ハイライト</span>
              された部分も含まれます。
            </p>
            <ul>
              <li>リスト項目1</li>
              <li>
                リスト項目2 with <a href="#">リンク</a>
              </li>
              <li>リスト項目3</li>
            </ul>
          </div>
          <blockquote>
            <p>
              引用ブロック内のテキストも選択可能です。
              複数の段落にまたがる選択も可能です。
            </p>
            <p>
              2つめの段落です。XPathは正確に開始位置と終了位置を 特定できます。
            </p>
          </blockquote>
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .main {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .title {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .clear-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .clear-btn:hover {
          background: #c82333;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        }

        .converter-section {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: #f9f9f9;
        }

        .converter-section h2 {
          margin-top: 0;
          color: #495057;
        }

        .range-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item label {
          font-weight: bold;
          color: #666;
        }

        .xpath-output {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .xpath-output code {
          background: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          flex: 1;
          word-break: break-all;
        }

        .copy-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .copy-btn:hover {
          background: #0056b3;
        }

        .selected-text {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 8px;
          border-radius: 4px;
          font-style: italic;
        }

        .placeholder {
          color: #666;
          font-style: italic;
        }

        .xpath-input-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group label {
          font-weight: bold;
          color: #666;
        }

        .xpath-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: monospace;
        }

        .offset-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100px;
        }

        .restore-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .restore-btn:hover {
          background: #218838;
        }

        .sample-content {
          border: 2px solid #007bff;
          border-radius: 8px;
          padding: 20px;
          background: white;
          user-select: text;
        }

        .sample-content h2 {
          color: #007bff;
          margin-top: 0;
        }

        .nested-content {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-left: 4px solid #007bff;
        }

        .highlight {
          background: #ffeb3b;
          padding: 2px 4px;
          border-radius: 2px;
        }

        ul {
          margin: 15px 0;
          padding-left: 20px;
        }

        li {
          margin: 5px 0;
        }

        blockquote {
          margin: 20px 0;
          padding: 15px;
          background: #e9ecef;
          border-left: 4px solid #6c757d;
        }

        blockquote p {
          margin: 10px 0;
        }

        a {
          color: #007bff;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Home;

/**
 * XPath生成のためのユーティリティ関数
 * Based on https://github.com/tilgovi/simple-xpath-position/blob/master/src/xpath.js
 */

function getXPath(node: Node, root?: Node): string {
  if (!node) return "";

  if (node.nodeType === Node.DOCUMENT_NODE) {
    return "/";
  }

  if (node === root) {
    return "";
  }

  const parent = node.parentNode;
  if (!parent) {
    return "";
  }

  if (parent === root) {
    return getNodeXPath(node);
  }

  const parentXPath = getXPath(parent, root);
  const nodeXPath = getNodeXPath(node);

  return parentXPath + "/" + nodeXPath;
}

function getXPathTo(node: Node, root?: Node): string {
  if (!node || !root) return getXPath(node);

  if (node === root) {
    return ".";
  }

  if (!root.contains(node)) {
    return getXPath(node);
  }

  const path = getXPath(node, root);
  return path ? "." + path : ".";
}

function getNodeXPath(node: Node): string {
  if (!node.parentNode) return "";

  const parent = node.parentNode;
  const siblings = Array.from(parent.childNodes);

  if (node.nodeType === Node.TEXT_NODE) {
    const textSiblings = siblings.filter((n) => n.nodeType === Node.TEXT_NODE);
    if (textSiblings.length === 1) {
      return "text()";
    }
    const index = textSiblings.indexOf(node) + 1;
    return `text()[${index}]`;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const elementSiblings = siblings.filter(
      (n) =>
        n.nodeType === Node.ELEMENT_NODE &&
        (n as Element).tagName.toLowerCase() === tagName
    );

    if (elementSiblings.length === 1) {
      return tagName;
    }

    const index = elementSiblings.indexOf(node) + 1;
    return `${tagName}[${index}]`;
  }

  // その他のノードタイプ
  const nodeName = node.nodeName.toLowerCase();
  const sameSiblings = siblings.filter(
    (n) => n.nodeName.toLowerCase() === nodeName
  );

  if (sameSiblings.length === 1) {
    return nodeName;
  }

  const index = sameSiblings.indexOf(node) + 1;
  return `${nodeName}[${index}]`;
}
