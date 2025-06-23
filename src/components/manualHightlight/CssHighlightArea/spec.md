# CSS Custom Highlight Area - ハイライト機能付きテキストエリアコンポーネント

## 📋 概要

**CSS Custom Highlight Area**は、HTML ドキュメント内でユーザーがマウス選択した範囲に自動的にハイライト（下線）を適用し、選択範囲の管理機能を提供する React コンポーネントです。最新の **CSS Custom Highlight API** を使用してブラウザネイティブの高性能ハイライト機能を実現し、複数の選択範囲を同時に表示・管理できます。

## 🚀 主要機能

### **コア機能**

| 機能                   | 説明                               | 技術的特徴                            |
| ---------------------- | ---------------------------------- | ------------------------------------- |
| **非破壊的ハイライト** | DOM 構造を変更せずにハイライト表示 | CSS Custom Highlight API 使用         |
| **高性能処理**         | 大量のハイライトでも高速動作       | ブラウザネイティブ最適化              |
| **重複範囲対応**       | 重なり合うハイライトも正しく表示   | 複数 Range オブジェクトの統合管理     |
| **XPath 位置管理**     | 相対 XPath 形式での位置保存        | `document.evaluate`標準ライブラリ使用 |

### **ユーザー操作**

| 操作             | 動作                             | 結果                             |
| ---------------- | -------------------------------- | -------------------------------- |
| **テキスト選択** | マウスドラッグでテキスト範囲選択 | 自動で赤い下線適用               |
| **一覧表示**     | 「下線一覧」ボタンクリック       | モーダルダイアログで管理画面表示 |
| **個別削除**     | 一覧画面で削除ボタンクリック     | 特定のハイライトを削除           |
| **全削除**       | 「すべて削除」ボタンクリック     | 全ハイライトをクリア             |

## ⚡ 技術スタック

### **フロントエンド**

```typescript
React 18.2.0 + TypeScript 5.2.2
Next.js 13.5.6 (Pages Router)
Material-UI 5.14.0
```

### **ハイライト技術**

```typescript
CSS Custom Highlight API (ブラウザネイティブ)
XPath (document.evaluate標準ライブラリ)
```

### **対応ブラウザ**

- **Chrome 105+** (2022 年 9 月〜)
- **Firefox 113+** (2023 年 5 月〜)
- **Safari 17.2+** (2023 年 12 月〜)

## 🎯 アーキテクチャ設計

### **データ構造**

```typescript
interface SavedRange {
  id: number; // 一意識別子（タイムスタンプ）
  order: number; // 選択順序
  startPath: string; // 開始位置XPath（相対パス）
  endPath: string; // 終了位置XPath（相対パス）
  startOffset: number; // 開始オフセット
  endOffset: number; // 終了オフセット
  text: string; // 選択テキスト
  timestamp: string; // 作成日時
}
```

### **XPath 例**

```
./p[1]/strong[1]/text()[1]    # 相対パス形式
./ul[1]/li[2]/span[1]/text()[1]
./blockquote[1]/text()[2]
```

## 🔄 動作フロー

```mermaid
graph TD
    A[ユーザーテキスト選択] --> B[mouseUpイベント]
    B --> C[Selection API で Range取得]
    C --> D[XPath相対パス生成]
    D --> E[SavedRange作成・保存]
    E --> F[CSS.highlights.set()]
    F --> G[ブラウザがハイライト描画]

    H[ページリロード] --> I[savedRanges復元]
    I --> J[document.evaluate でNode復元]
    J --> K[Range再構築]
    K --> F
```

## 🎨 CSS ハイライトスタイル

```css
::highlight(manual-highlight) {
  background-color: transparent;
  text-decoration: underline;
  text-decoration-color: red;
  text-decoration-thickness: 3px;
  text-decoration-style: solid;
}
```

## 📦 コンポーネント API

### **Props**

```typescript
interface CssHighlightAreaProps {
  html: string; // 表示HTMLコンテンツ
  onError?: (error: Error) => void; // エラーハンドラ
  onRangeSelect?: (range: SavedRange) => void; // 範囲選択ハンドラ
  onRangeDelete?: (id: number) => void; // 範囲削除ハンドラ
  contentAreaSx?: SxProps<Theme>; // MUIスタイリング
}
```

### **使用例**

```tsx
<CssHighlightArea
  html={documentHtml}
  onError={(error) => console.error(error)}
  onRangeSelect={(range) => saveToDatabase(range)}
  onRangeDelete={(id) => deleteFromDatabase(id)}
  contentAreaSx={{
    border: "1px solid #ccc",
    borderRadius: 1,
    padding: 2,
    minHeight: 200,
  }}
/>
```

## 🌟 技術的優位性

### **従来の DOM 操作方式との比較**

| 項目               | DOM 操作方式  | CSS Custom Highlight API |
| ------------------ | ------------- | ------------------------ |
| **パフォーマンス** | 重い DOM 変更 | ブラウザネイティブ最適化 |
| **DOM 構造**       | 破壊的変更    | 非破壊的（元 HTML 保持） |
| **重複処理**       | 複雑な管理    | 自動的に正しく描画       |
| **メモリ使用量**   | 多い          | 少ない                   |
| **描画品質**       | 不安定        | 一貫した高品質           |

### **HTML 複雑度対応例**

```html
<!-- 複雑なネスト構造でも正確にハイライト -->
<p>
  現代社会における<strong>科学技術の<em>発展</em></strong
  >は <span style="color: blue;">目覚ましく</span>、
  私たちの<u>生活</u>に大きな変化をもたらしています。
</p>
```

## 🔧 セットアップ

### **依存関係インストール**

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install -D typescript @types/react
```

### **ブラウザ対応チェック**

```typescript
const isSupported = "CSS" in window && "highlights" in CSS;
```
