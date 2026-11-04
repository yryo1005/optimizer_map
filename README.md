# Optimizer Map

勾配降下法に基づく最適化アルゴリズムの系譜を，**手法をノード，改善方法をエッジ**とするグラフとして可視化し，GitHub Pagesで公開するプロジェクトである．

- ノードの大きさ: Citation数（対数スケール，不明は破線の輪郭）
- 縦の位置: 発表年（古いものを上，新しいものを下）
- 横の位置と色: 分野グループ（8グループ）．2つの配置を切り替えられる．
  - **領域（既定）**: 手法を所属する全グループの間に置き，グループの範囲を等高線で囲う．範囲の重なりと，ノード外周の色分けリングで**分野の横断**を表す．
  - **列**: 主分野のグループごとの列に並べる．
- **改良パターン**: 「慣性項の追加」「重み減衰の導入」のような定番の改良をエッジに分類し，同じパターンをマップ全体で強調できる．**パターン表**（パターン × 分野／年代）で，まだ適用されていない組み合わせ（空欄）を確認できる．
- ノードをクリック: 共通フォーマット（発表年・Citation数・分野・参考文献・概要・更新式・派生元と改善内容・派生先）で詳細を表示．**論文ページ・PDF・Google Scholar・Semantic Scholar へのリンク**付き
- **改善アイデアの候補**: パターン表の未適用の組み合わせ（「＋」）から，対象になり得る手法・他分野での適用例・生成AIへの相談用プロンプトを表示
- **比較と系譜の経路**: 最大3手法を並べて比較し，手法間の系譜の経路（どの改良を積み重ねてきたか）をマップ上に表示
- **年スライダー**: 指定した年までの手法だけを表示し，マップが育つ様子を再生
- **トレンド**: 分野グループごとの手法数・改良パターンごとの改良の本数の年次推移（直近3年で増えているものを自動で抽出）
- **実用情報と絞り込み**: 状態量（メモリ）・実装（PyTorch標準/Optax/Keras/主要ライブラリ）・主なハイパーパラメータ・主な用途で絞り込み
- **解説の深掘り**: 主要50手法に「なぜ効くか」「弱点・注意点」「典型的な設定」
- **書き出し**: BibTeX・CSV・マップの画像（SVG/PNG）．対象は比較中 ＞ 選択中 ＞ 表示中の手法

## ディレクトリ構成

```
.
├── data/                           # 一次データ
│   ├── nodes/<id>.json             # 手法ごとに1ファイル（270手法）
│   ├── categories.json             # 分野タグ（22種）と所属グループ
│   ├── groups.json                 # 色分け・配置に使う分野グループ（8種）
│   ├── improvement_types.json      # 改良パターンの語彙（15種）
│   ├── practical_vocab.json        # 実用情報（状態量・実装・用途）の語彙
│   ├── metadata.json               # Semantic Scholar から取得した書誌情報（fetch_metadata.py が生成）
│   ├── metadata_overrides.json     # 書誌情報の取得で論文を手動指定する場合の対応表
│   └── candidates/                 # 新着論文の候補と生成の記録（discover/generate が生成）
├── site/                           # GitHub Pagesで配信する静的サイト
│   ├── index.html
│   ├── assets/app.js               # 描画・操作（D3 v7）
│   ├── assets/layout.js            # 配置計算（ブラウザとビルドで共用）
│   ├── assets/style.css            # 配色トークン（ライト/ダーク）とレイアウト
│   └── data/graph.json             # 生成物（.gitignore済み，CIで生成）
├── tools/
│   ├── validate_nodes.py           # データ検証（参照切れ・循環・語彙・重複など）
│   ├── check_formulas.mjs          # 更新式の KaTeX 描画検証
│   ├── build_graph.py              # data/ → site/data/graph.json（論文リンク・書誌情報の統合）
│   ├── precompute_layout.mjs       # 配置を事前計算して graph.json に埋め込む
│   ├── build_review_md.py          # data/ → review/nodes_review.md（人手レビュー用）
│   ├── fetch_metadata.py           # Semantic Scholar から書誌情報を取得
│   ├── check_links.py              # 参考文献のリンク切れ検出
│   ├── discover_candidates.py      # arXiv 新着から候補論文を抽出
│   ├── generate_nodes_gemini.py    # Gemini で候補論文から手法ノードを生成
│   └── propose_combinations.py     # 組み合わせの提案（試作）とバックテスト
├── tests/e2e/smoke.cjs             # E2E スモークテスト（Playwright，オフラインで実行可能）
├── docs/combination_proposal.md    # 組み合わせ提案のアルゴリズムの設計
├── review/nodes_review.md
├── .github/workflows/
│   ├── pages.yml                   # 検証 → 生成 → 配置計算 → Pagesへデプロイ（PRでは検証のみ）
│   ├── metadata.yml                # 月次: 書誌情報の更新 → PR
│   ├── discover.yml                # 週次: arXiv 新着 → Gemini で生成 → 検証 → PR
│   └── links.yml                   # 月次: リンク切れ確認 → Issue
├── package.json                    # ビルド用（d3，katex）
├── HANDOFF_FOR_CLAUDE_CODE.md      # ローカルのClaude Codeへの引き継ぎ事項（移植・設計上の決定）
└── CLAUDE_CODE_TASKS.md            # クラウドセッションで実施できなかった作業の指示（完了条件つき）
```

Python のツールは標準ライブラリのみで動く．Node.js（20以降）は配置の事前計算と更新式の検証に使う（なくても表示はできる）．

## ローカルでの実行

```bash
npm ci
```

```bash
python tools/validate_nodes.py
```

```bash
node tools/check_formulas.mjs
```

```bash
python tools/build_graph.py
```

```bash
node tools/precompute_layout.mjs
```

```bash
node tests/e2e/smoke.cjs
```

```bash
python -m http.server 8000 -d site
```

E2E テストの前に `npx playwright install chromium` が必要．ブラウザで `http://localhost:8000/` を開く．`#adam` のようにIDを付けると，その手法を選択した状態で開く．
`precompute_layout.mjs` を省略した場合は，ブラウザで配置を計算する（初期表示が約0.5秒遅くなる）．

## データのスキーマ

### `data/nodes/<id>.json`

| キー | 型 | 必須 | 内容 |
|---|---|---|---|
| `id` | string | ○ | 手法ID（ファイル名と一致，英小文字・数字・`_`） |
| `name` | string | ○ | 正式な表示名（日本語名 (英語名, 略称)） |
| `short_name` | string | － | ノードのラベル・検索に使う短い名前（省略時は`name`） |
| `year` | int | ○ | 発表年（arXiv初出年を優先） |
| `citations` | int / null | ○ | Citation数．`data/metadata.json` があればそちらを優先して表示する |
| `categories` | string[] | ○ | 分野タグ．**先頭が主分野**であり，主分野の所属グループで色と列が決まる |
| `reference` | string | ○ | 原典URL．arXiv のURLならPDFリンクを自動生成する |
| `summary` | string | ○ | 概要（である調，句読点は「，」「．」） |
| `update_rule` | string | ○ | 更新式（KaTeX互換LaTeX，`$$`なし）．最上位の`\quad`で行が分割されて表示される |
| `parents` | {id, types, improvement}[] | ○ | 派生元の手法ID，改良パターン（1〜2個，先頭が主），改善内容．起点は空配列 |
| `practical` | object | －（推奨） | 実用情報 `{state, implementations[], hyperparameters[], tasks[]}`．語彙は `practical_vocab.json` |
| `deep_dive` | object | － | 解説 `{why, weaknesses, settings}`（なぜ効くか・弱点・典型的な設定） |
| `notes` | string | － | 備考．同一論文で複数手法を登録する場合は「同一論文」と書くと参考文献の重複警告を抑制する |

### `data/improvement_types.json`

`{id, label, badge, description}` の配列．`badge` はエッジ上に表示する略号．

### `data/groups.json`

`{id, label, color: {light, dark}, order}` の配列．色は8色のカテゴリカルパレットであり，**隣り合う列の色の組で色覚多様性（CVD）の判別性を検証済み**である．9グループ目を追加する場合は新しい色を生成せず，既存グループへの統合を検討すること．

### `data/metadata.json`（自動生成）

`{<id>: {paperId, title, year, venue, authors[], citationCount, openAccessPdf, url, externalIds, lookup, fetched_at, needs_review?}}`．
`needs_review` が付いたもの（タイトル検索の結果が疑わしいもの）は表示に使わない．`data/metadata_overrides.json` に `{"<id>": "ARXIV:xxxx.xxxxx"}` のように論文を指定して再取得する．

## 手法の追加手順

### 手動で追加する

1. `data/nodes/<id>.json` を追加する（派生元には `types` を付ける）．
2. `python tools/validate_nodes.py` と `node tools/check_formulas.mjs` でエラーがないことを確認する．
3. `python tools/build_review_md.py` でレビュー用Markdownを更新し，内容を確認する．
4. `main` にpushすると，GitHub Actionsが検証・生成・デプロイを行う．

### 自動で取り込む（週次）

`discover.yml` が arXiv の新着から候補を抽出し，Gemini で手法ノードを生成して検証を通ったものを PR にする．PR上で `review/nodes_review.md` を確認してマージする．不採用の候補と理由は `data/candidates/rejected.json` に残る．

## GitHub の設定

- Settings → Pages の Source を **GitHub Actions** にする．
- Secrets: `GEMINI_API_KEY`（新着の自動取り込みに必須），`S2_API_KEY`（任意．Semantic Scholar のレート制限の緩和）．
- Variables: `GEMINI_MODEL`（任意．無料枠で使えるモデル名に合わせる）．
- Settings → Actions → General で「Allow GitHub Actions to create and approve pull requests」を有効にする．

## 注意事項

- Citation数は，`fetch_metadata.py` を実行するまでは生成AIによる概算値である．実用情報（特に実装の有無）と解説も生成AIによる整理であり，確認が必要である．表示には出典（概算／Semantic Scholar の取得日）を併記している．
- **論文のPDF本体はリポジトリに保存しない**（多くの論文は再配布が許諾されていないため）．リンクのみを表示する．
- 方策最適化・メタ学習・ミニマックス最適化（応用グループ）は汎用の最適化手法ではないが，勾配法の応用系統として収録している．凡例のボタンで表示/非表示を切り替えられる．
