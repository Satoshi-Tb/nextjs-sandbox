# DataGrid IME Investigation

## 対象

- [`src/components/dataGrid/GridRecipeMultilineEditing.tsx`](/mnt/c/home/dev/js/nextjs-sandbox/src/components/dataGrid/GridRecipeMultilineEditing.tsx)
- MUI X Data Grid v6 系の multiline editing recipe

## 症状

- セルを選択した状態で日本語 IME を使って入力を開始すると、1 文字目が IME 未確定文字ではなく ASCII のまま入力される
- 例:
  - `a` キーから日本語入力を開始すると、先頭に `a` が入ってから IME 変換が始まる
- ダブルクリックで先に編集モードへ入ってから入力すると、問題が起きにくい

参考:

- https://github.com/mui/mui-x/issues/10788

## 原因

原因は、Data Grid の「printable key を押したら編集開始する」経路と IME の composition 開始タイミングが衝突していることです。

MUI のセル編集開始処理では、セルが `view` mode のときに printable key を検知すると `cellEditStart(printableKeyDown)` を発火し、その後 `startCellEditMode()` に `initialValue = event.key` を渡します。

該当実装:

- [`node_modules/@mui/x-data-grid/hooks/features/editing/useGridCellEditing.js`](/mnt/c/home/dev/js/nextjs-sandbox/node_modules/@mui/x-data-grid/hooks/features/editing/useGridCellEditing.js)

ポイント:

- `view` mode で printable key を押す
- Grid がそのキーを `event.key` から取得する
- React 18 系の経路では `initialValue = key` を使って編集セルの初期値を設定する
- IME 入力では、この時点の `event.key` が確定後の文字ではなく、元の ASCII キーになることがある
- そのため、編集開始直後に先頭 1 文字として ASCII が入る

MUI 側には edit mode 中の IME を考慮した回避があります。

- `event.which === 229` のとき、`edit` mode 中の `Enter` / `Tab` / `Escape` 処理を保留している

ただし、これは「すでに edit mode に入った後」の話であり、「view mode から printable key で edit 開始する経路」には同等の IME ガードがありません。これがズレの本体です。

## 根拠

issue #10788 の報告内容:

- 選択セルで韓国語や IME 入力を開始すると、最初の文字が英字になる
- ダブルクリックして編集モードに入ってから入力すると問題が出にくい

issue の公開状態:

- 2023-10-24 に報告
- 2026-04-03 時点で、公開 issue 上は解決済みとは確認できない

参照:

- https://github.com/mui/mui-x/issues/10788

## 対応方針案

### 1. 推奨: printable key での自動編集開始を無効化する

内容:

- セル選択中に文字キーを押しても編集開始しない
- 編集開始は `Enter`、`F2`、ダブルクリック、明示 UI 操作に限定する
- 編集モードに入った後は通常の textarea として IME 入力させる

利点:

- 既知バグの経路を回避できる
- MUI 本体の patch が不要
- 挙動が安定しやすい

欠点:

- Excel 風の「選択してすぐ打つ」操作感は弱くなる

### 2. 条件付き回避: IME 疑い入力だけ自動編集開始を止める

内容:

- `event.which === 229`
- `event.nativeEvent.isComposing === true`
- `keyCode === 229`

などを見て、IME 開始中と判定できるときは printable key 起点の編集開始を抑止する

利点:

- 半角英数の直接入力 UX を残しやすい

欠点:

- ブラウザ差異、OS 差異がある
- composition 開始前の最初の keydown を完全には拾えないケースがある
- 根治ではなく回避策

### 3. MUI 本体を patch-package で修正する

内容:

- `useGridCellEditing` の printable key 起点ロジックを独自 patch
- IME 時は `initialValue = event.key` を使わない

利点:

- Grid の開始ロジック自体に手を入れられる

欠点:

- ライブラリ更新時の保守負荷が高い
- そもそも IME の最初の未確定文字をどう受け渡すかが別問題として残る
- アプリ側だけで完結しにくい

## 推奨結論

このプロジェクトでは、まず案 1 を採るのが妥当です。

具体的には:

- `GridRecipeMultilineEditing` では、文字キー起点の自動編集開始を前提にしない
- ユーザーには `Enter` / ダブルクリック / 明示操作で編集開始させる
- 編集中は `Ctrl+Enter` / `Cmd+Enter` で確定する multiline editor を使う

これなら、MUI の既知 IME 問題の経路を踏まずに multiline editing を維持できます。

## ライブラリのバージョンアップ検討

### 結論

現時点では、「特定のライブラリを特定バージョンへ上げれば、この IME 問題が解決する」とは言えません。

### 確認した内容

- このリポジトリでは [`package.json`](/mnt/c/home/dev/js/nextjs-sandbox/package.json) 上で `@mui/x-data-grid 6.16.2` と `react 18.2.0` を使用している
- 2026-04-03 時点で、MUI X の公開リリースには `v8.28.2` があり、`v9.0.0-beta.0` も公開されている
- ただし、公開 issue `#10788` は解決済みとは確認できない
- さらに、公開されている最新系の `useGridCellEditing` 実装でも、printable key による編集開始時に `initialValue = event.key` を使う流れが残っている

参照:

- https://github.com/mui/mui-x/issues/10788
- https://github.com/mui/mui-x/releases
- https://raw.githubusercontent.com/mui/mui-x/master/packages/x-data-grid/src/hooks/features/editing/useGridCellEditing.ts

### 判断理由

今回の IME 問題は、単純な表示崩れではなく、Data Grid の編集開始ロジックと IME composition のタイミング競合に起因しています。

そのため、以下のいずれかが確認できない限り、「バージョンアップで直る」とは判断できません。

- issue `#10788` に対応する修正 PR が存在する
- changelog / release notes に IME 入力修正が明記されている
- 最新版実装で printable key 起点の `initialValue = event.key` 経路が変わっている

今回の調査範囲では、上記のどれも確認できませんでした。

### 実務上の判断

- `@mui/x-data-grid` の単純なバージョンアップだけで解決する期待は低い
- 検証目的で最新版へ上げて再確認する価値はある
- ただし、修正保証のあるアップグレードとは扱わないほうがよい
- 優先度としては、ライブラリ更新よりアプリ側の回避策を先に採るべき

## Qiita 記事の対策の適用可否

対象記事:

- https://qiita.com/cho-tehu/items/6be5615ce99e7eb7b42f

### 結論

記事の内容は参考になりますが、今回の問題をそのまま解決するものではありません。

### 理由

Qiita 記事が主に扱っているのは、以下の系統の問題です。

- `renderCell` で常時 `<input>` を直接描画する
- IME 入力中に親 state 更新や再レンダリングが走る
- 未確定文字が消える、重複する、勝手に確定される

一方、今回の問題は別のタイミングで発生しています。

- セルはまだ `view` mode
- 文字キー入力により Data Grid が編集開始しようとする
- そのとき `event.key` を使って `initialValue` をセットする
- IME 入力開始時の最初の `event.key` が ASCII 扱いになり、先頭 1 文字が混入する

つまり、今回の問題は「編集中 input の再描画制御」ではなく、「編集開始前の printable key 処理」にあります。

### 各対策の評価

#### 1. `renderEditCell` を使う

今回のサンプルでは、すでに `renderEditCell` 相当の custom edit component を使っています。

- そのため、この対策はすでに適用済み
- 追加で採っても今回の先頭 1 文字問題は解消しない

#### 2. `processRowUpdate` を使う

この対策も、編集確定時の更新を整理するには有効です。

- ただし、今回の問題は編集確定時ではなく編集開始時に発生している
- そのため、直接の解決策にはならない

#### 3. `compositionstart` / `compositionend` を使う

これは `renderCell` で常時 `<input>` を扱う場合の応急処置としては有効な場面があります。

ただし今回のケースでは:

- 問題の混入文字が edit input mount 前に入る
- `compositionstart` を custom edit component 側で拾う時点では遅い可能性が高い

したがって、今回の問題には効きにくいと判断します。

#### 4. `renderCell` + ローカル `useState`

別アプローチとしては成立しますが、今回の multiline editing recipe には向きません。

理由:

- MUI の標準編集ライフサイクルから外れる
- フォーカス制御、保存、移動、仮想スクロール対応を自前で持つ必要がある
- 今回のサンプルの目的である「recipe を忠実に実装する」方針から外れる

### 実務上の見解

Qiita 記事から得られる重要な示唆は、IME 問題は input 内の composition 制御だけでは解けず、Data Grid の編集ライフサイクル全体で考える必要があるという点です。

しかし、今回のケースに対する直接解としては使えません。

したがって、今回の問題に対しては引き続き以下を推奨します。

- 文字キーによる自動編集開始をやめる
- `Enter` / ダブルクリック / 明示操作で編集開始する
- 編集開始後の multiline editor 内で IME を使わせる
