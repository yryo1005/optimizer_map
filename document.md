# Optimizer Map

勾配降下法に基づく最適化アルゴリズムの系譜を，手法をノード，改善方法をエッジとするグラフとして可視化し，
GitHub Pagesで公開するプロジェクトである．機能の詳細，データスキーマ，GitHub設定については[README.md](README.md)を参照する．

## 開発の経緯

本プロジェクトは2段階で構築した．

1. ローカルのClaude Codeで，基本的な最適化手法7件（SGD，Momentum，Nesterov，AdaGrad，RMSprop，Adam，AdamW）を
   対象に，データスキーマの試作とレビュー用Markdown生成の仕組みを構築した．
2. クラウドセッションのClaudeが，上記の設計思想を踏襲しつつ270手法規模へ拡張し，D3.js／KaTeXによる
   可視化フロントエンド，データ検証・ビルド・自動化ツール群，GitHub Actionsワークフローを含む
   プロトタイプを構築した．ローカルのClaude Codeがこれをリポジトリへ移植し，動作確認を行った．

1段階目で作成したデータ（`data/nodes/`の7ファイル，検証スクリプト，レビュー用Markdown生成スクリプト）は，
2段階目のデータに同じ手法が同等以上の情報量で含まれているため，`.orders/_archive_stage1_local_data/`へ
退避し，現在のデータには採用していない．

## ディレクトリ構成と役割

```text
./
├── data/
│   ├── nodes/<id>.json         # 手法ごとに1ファイル（270手法）
│   ├── categories.json         # 分野タグ（22種）と所属グループ
│   ├── groups.json             # 色分け・配置に使う分野グループ（8種）
│   ├── improvement_types.json  # 改良パターンの語彙（15種）
│   ├── practical_vocab.json    # 実用情報の語彙
│   └── metadata_overrides.json # 書誌情報取得時の論文手動指定用の対応表
├── site/                       # GitHub Pagesで配信する静的サイト（D3.js＋KaTeX）
│   ├── index.html
│   ├── assets/{app.js,layout.js,style.css}
│   └── data/graph.json         # ビルド生成物（.gitignore対象）
├── tools/                      # データ検証・ビルド・自動化スクリプト（Python／Node.js）
├── tests/e2e/smoke.cjs         # Playwrightによる E2E スモークテスト
├── review/nodes_review.md      # 生成AIが作成したデータのレビュー用Markdown
├── docs/combination_proposal.md # 手法の組み合わせ提案アルゴリズムの設計資料
├── .github/workflows/          # Pages公開，書誌情報更新，新着取り込み，リンク確認の自動化
├── package.json                # Node.js依存（d3，katex，playwright）
├── .orders/
│   ├── order_{n:03}.md             # ユーザー指示とその解釈・対応方針の記録
│   └── _archive_stage1_local_data/ # 1段階目（ローカル試作）のデータ・スクリプトの退避先
└── README.md                   # 機能一覧，データスキーマ，GitHub設定等の詳細
```

## 実行環境

### Python
- 標準ライブラリのみで動作するため，専用の仮想環境は不要である．システムのPython 3（3.10以降）で実行する．

### Node.js
- D3.js・KaTeXのビルド時検証（`tools/check_formulas.mjs`，`tools/precompute_layout.mjs`）とE2Eテスト（Playwright）にNode.js 20以降が必要である．
- 本開発環境にはNode.jsがapt経由では古いバージョン（12系）しか提供されていなかったため，`~/.local/node`にNode.js v20の公式バイナリを展開して利用している．システムへの恒久的な設定変更（`~/.bashrc`等）は行っていないため，以後の実行時は以下でPATHを通す必要がある．

```bash
export PATH="$HOME/.local/node/bin:$PATH"
```

## ローカルでの実行手順

```bash
export PATH="$HOME/.local/node/bin:$PATH"

npm ci
npx playwright install chromium   # E2Eテストを実行する場合のみ

python3 tools/validate_nodes.py
node tools/check_formulas.mjs
python3 tools/build_graph.py
node tools/precompute_layout.mjs
node tests/e2e/smoke.cjs          # Playwright導入後のみ

python3 -m http.server 8000 -d site
```

ブラウザで`http://localhost:8000/`を開く．`#adam`のようにIDを付けると，その手法を選択した状態で開く．

## 動作確認の記録（2026-11-04実施）

- `npm ci`: 成功．
- `python3 tools/validate_nodes.py`: `nodes=270 edges=407 errors=0 warnings=0`．
- `node tools/check_formulas.mjs`: `formulas checked, errors=0`．
- `python3 tools/build_graph.py`: `site/data/graph.json`を生成（nodes=270, edges=407）．
- `node tools/precompute_layout.mjs`: 配置を事前計算し`graph.json`へ埋め込み．
- `node tests/e2e/smoke.cjs`: 11/11件成功．
- CDN（jsdelivr）からのD3・KaTeX読み込み: Playwrightのヘッドレスブラウザで`http://localhost:8000/`を開き，
  `cdn.jsdelivr.net`への3件のリクエストが200で成功し，コンソール・ページエラーがないことを確認した．
- 書き出し機能（BibTeX・CSV・SVG・PNG）はE2Eテストの`export`ケースでファイル内容まで確認済みだが，
  実際のクリップボードへのコピー動作はヘッドレス環境では検証できないため，人間による実機ブラウザでの確認が必要である．

## 残課題

`.ai/ai-agent/`等のAIエージェントが次の作業を検討する際の手がかりとして，未実施の作業を記録する．

- **T2 書誌情報の取得**: `tools/fetch_metadata.py`はネットワーク経由でSemantic Scholarへアクセスする処理であり，
  今回は`--dry-run`を含め未実行である．Citation数は現時点では生成AIによる概算値である．
- **T3 リンク切れの確認**: `tools/check_links.py`は未実行である．
- **T4 新着論文の自動取り込み**: `tools/discover_candidates.py`，`tools/generate_nodes_gemini.py`は
  `GEMINI_API_KEY`が必要であり未実行である．`tokens.json`に`gemini`キーが存在するため，
  `.ai/ai-agent/core/llm.py`の構造化出力の仕組みへの置き換えを検討する．
- **T5 GitHubの設定とワークフローの初回実行**: GitHub Pagesの公開設定，Secrets（`GEMINI_API_KEY`等）の登録，
  各ワークフローの`workflow_dispatch`での初回実行は，GitHubリポジトリ側の設定作業であり未実施である．
- **T6 データのレビュー**: `review/nodes_review.md`の内容（改良パターンの分類407本，実用情報270件，
  解説50件，未記入の解説220件）は生成AIが作成したものであり，ユーザーによる確認が必要である．
- **T7 組み合わせ提案v1の実装**: 現状は試作（v0）のみであり，`docs/combination_proposal.md`に記載の
  設計（手法の種類`kind`の追加，2段階構成，生成AIによる合成可能性判定等）は未実装である．
- **既知の課題**: 領域配置が離れた副分野で小さな島になる問題，全体表示でのエッジの過密，
  改善アイデア候補の精度等（詳細はHANDOFF_FOR_CLAUDE_CODE.mdを参照）．

## Git管理上の注意事項

- `tokens.json`（APIキーを格納）は`.gitignore`に登録済みであり，Gitの管理対象外である．
- `site/data/graph.json`はビルド生成物のため`.gitignore`に登録済みである．main pushをトリガーに
  GitHub Actions（`pages.yml`）が生成・デプロイを行う想定である．
- `node_modules/`も`.gitignore`に登録済みである．
- `CloudSession/`はクラウドセッションから受け取った元資料（zip・引き継ぎ文書）を保管したディレクトリであり，
  リポジトリへの移植が完了した後は削除してよい．
