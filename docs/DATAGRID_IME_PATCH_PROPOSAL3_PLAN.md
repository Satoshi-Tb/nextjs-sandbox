# DataGrid IME Patch Proposal 3 Plan

## 目的

`docs/DATAGRID_IME_INVESTIGATION.md` で整理した IME 問題について、対策案3
（`@mui/x-data-grid` 本体の patch）を試すための実装計画と、`node_modules`
を git 管理に含めずに差分レビュー・手動適用するための運用手順を 1
つの文書にまとめる。

この文書は以下を対象にする。

- 案1 / 案2 / 案3 の実務上の位置づけ
- 案3 の成功条件
- 案3 の具体的な patch 対象と改修方針
- patch ファイルを repo 管理しつつ、`node_modules` は git 管理しない運用
- 手動適用と検証の手順

## 現時点の判断

### 解決可能性

- 最も解決可能性が高いのは案1
- 案2は条件付き回避であり、環境差による取りこぼし余地が残る
- 案3は `initialValue = event.key` の経路を止められるが、IME の最初の未確定文字を
  edit input にどう受け渡すかは別問題として残る

### 実務上の位置づけ

- 本採用候補は案1
- 案2は UX を残したい場合の限定的回避策
- 案3はライブラリ patch による検証案であり、採用可否を判断するための実験として扱う

### 案3の成功条件

案3は次をすべて満たしたときのみ成功とみなす。

- 日本語 IME 入力開始時に先頭 ASCII が混入しない
- 最初の未確定文字が失われない
- 既存の英数直接入力 UX が壊れない

先頭 ASCII 混入が止まっても、初回 IME 文字が消えるなら案3は不成立と判断する。

## 案3 実装計画

### 変更対象

修正対象は `node_modules/@mui/x-data-grid` 配下の以下 4 ファイル。

- `node_modules/@mui/x-data-grid/hooks/features/editing/useGridCellEditing.js`
- `node_modules/@mui/x-data-grid/node/hooks/features/editing/useGridCellEditing.js`
- `node_modules/@mui/x-data-grid/modern/hooks/features/editing/useGridCellEditing.js`
- `node_modules/@mui/x-data-grid/legacy/hooks/features/editing/useGridCellEditing.js`

理由:

- `@mui/x-data-grid@6.16.2` は複数の配布ビルドを持つ
- 実行時にどのビルドが参照されるかに依存する
- 1 ファイルだけ修正すると、別ビルドが使われた場合に patch が効かない

### 改修方針

`useGridCellEditing` の `view` mode における printable key 起点の編集開始ロジックだけを最小変更で修正する。

#### 1. IME 疑い判定を追加する

`handleCellKeyDown` 周辺に IME 疑い判定ヘルパーを追加する。

判定条件は以下を基本とする。

- `event.which === 229`
- `event.keyCode === 229`
- `event.nativeEvent?.isComposing === true`

#### 2. printableKeyDown 開始時に IME フラグを引き回す

`params.cellMode === GridCellModes.View && params.isEditable` の分岐で、
`reason === printableKeyDown` のときに IME 疑い入力かどうかを判定し、
`cellEditStart` に渡す params に内部フラグを追加する。

想定イメージ:

- 既存:
  - `reason`
  - `key`
- patch 後:
  - `reason`
  - `key`
  - `isImeLike`

このフラグはライブラリ内部でのみ使用する。

#### 3. handleCellEditStart の initialValue セット条件を変える

`reason === GridCellEditStartReasons.printableKeyDown` の処理を次のように変える。

- React 17 系:
  - 既存の `deleteValue = true` を維持する
- React 18 系かつ非 IME:
  - 既存どおり `initialValue = event.key`
- React 18 系かつ IME 疑い:
  - `initialValue = event.key` を使わない
  - `deleteValue = true` で空の edit input を先に立ち上げる

狙い:

- ASCII キーを初期値として edit input に混入させない
- その後の composition 入力を空 input に受けさせる

### 変更しないもの

- `edit` mode 中の既存 IME ガード (`event.which === 229`) は触らない
- `Ctrl/Cmd+V`、`Enter`、`Delete`、`Backspace` の既存編集開始条件は変えない
- アプリ側コンポーネントには原則変更を入れない
- 今回は `patch-package` 導入までは行わない

## patch ファイル運用方針

### 方針

`node_modules` そのものは git 管理に含めない。  
代わりに、repo 配下の `docs/patches/` などへ unified diff を置き、その差分をレビューしてからローカルで手動適用する。

### 管理対象

repo で管理するのは以下。

- patch ファイル
- この計画書
- 適用手順
- 検証手順

repo で管理しないのは以下。

- `node_modules/@mui/x-data-grid/...` の実ファイル差分

### 推奨ファイル名

例:

- `docs/patches/mui-x-data-grid-ime-proposal3.patch`

## 作業分担

### Codex 側

- patch 対象 4 ファイルに対する unified diff を作成する
- patch の意図と変更点を文書化する
- 手動適用手順と検証手順を残す

### ユーザー側

- patch ファイルの内容をレビューする
- 必要に応じて手元で patch を一時適用する
- 実機 IME での動作確認を行う

## patch 作成手順

### 1. patch ファイルを repo に追加する

patch は `node_modules` を直接コミットせず、unified diff として保存する。

想定保存先:

- `docs/patches/mui-x-data-grid-ime-proposal3.patch`

### 2. patch には 4 ファイル分の差分を含める

含める対象:

- `hooks/features/editing/useGridCellEditing.js`
- `node/hooks/features/editing/useGridCellEditing.js`
- `modern/hooks/features/editing/useGridCellEditing.js`
- `legacy/hooks/features/editing/useGridCellEditing.js`

### 3. patch のレビュー観点

- IME 疑い判定が `printableKeyDown` 経路だけに効いているか
- 既存の英数直接入力経路を壊していないか
- 4 ファイルで差分内容が揃っているか
- React 17 系分岐を壊していないか

## 手動適用手順

### 前提

- 依存インストール済みで `node_modules` が存在すること
- patch ファイルが repo 内に存在すること

### 適用

`patch` コマンドを使う場合の例:

```bash
patch -p0 < docs/patches/mui-x-data-grid-ime-proposal3.patch
```

`git apply` を使う場合は patch のパス構造に応じて `-p` の調整が必要になるため、
patch ファイル作成時に実際のヘッダ構造へ合わせて別途確認する。

### 差し戻し

`node_modules` 上の一時変更なので、最も確実な戻し方は依存を再インストールすること。

例:

```bash
npm install
```

または `@mui/x-data-grid` を個別に入れ直して元に戻す。

## 検証手順

### 静的確認

- `tsc --noEmit`
- `npm run lint`

### 手動確認

検証対象は既存の multiline recipe ページを使う。

確認項目:

- 日本語 IME ON で、セル選択状態から `a` キー起点で入力開始しても先頭に ASCII `a`
  が入らない
- 最初の未確定文字が消えずにそのまま変換候補へ進める
- ダブルクリック開始は従来どおり動く
- `Enter` / `Ctrl+Enter` / `Cmd+Enter` の multiline 編集挙動が壊れていない
- IME OFF の半角英数直接入力は従来どおり最初の 1 文字が入る
- `Delete`、`Backspace`、`Escape`、`Tab`、貼り付け開始が壊れていない

### 波及確認

repo 内には multiline recipe 以外にも `DataGrid` 利用箇所があるため、最低限以下は spot check する。

- 通常のグリッドで英数キー開始編集が壊れていないか
- IME を使わない通常操作に副作用が出ていないか

## 成否判定

### 成功

- 先頭 ASCII 混入なし
- 初回 IME 文字の欠落なし
- 既存英数入力 UX と基本編集挙動の破壊なし

### 失敗

以下のいずれかに該当した場合は案3は不成立とする。

- 最初の IME 文字が消える
- IME により再入力が必要になる
- 英数直接入力 UX が壊れる
- 他の `DataGrid` 編集挙動に無視できない副作用が出る

## 次アクション

案3を進める場合の推奨順序は次のとおり。

1. `docs/patches/` に patch ファイルを作る
2. patch 差分をレビューする
3. ユーザーが手元で patch を手動適用する
4. 実機 IME で検証する
5. 成功なら常設運用の要否を再検討する
6. 失敗なら案1を本採用、案2を補助案として扱う

