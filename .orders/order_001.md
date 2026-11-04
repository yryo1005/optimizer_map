# Order 001

## ユーザー指示（原文）

勾配降下法に基づき最適化アルゴリズムまとめ，
これを可視化したOptimizer_Mapを作成することを考えます

例えば有名な手法であるAdamは，
確率的勾配降下法（SGD）から，慣性項を追加することでモーメント法に，
勾配の累積で学習率をスケジューリングするAdaGradを経由し，勾配2次モーメントで学習率をスケジューリングすることでRMSpropに，
これらを組み合わせることでAdamに，のような順で派生していきます
また，Adam自身もWeight Decayを導入することでAdamWへと派生していきます

これらの最適化手法の関係は，
ノードが手法，エッジが改善方法のようなグラフ構造で表現できます
これを可視化し，どのようなトレンドがあるか確認したり．改善方法の検討に活用するのが目的です

この可視化マップをGitHub pagesを経由して公開します
この際，
・ノードをCitationが多いものを大きくする，
・ノードを古いものを上にして，新しくなるほど下にする
・大枠の分野(高速化，適応的学習率，2次手法，勾配分散低減など)ごとに近づける，また色分けする
・ノードをクリックすることで共通のフォーマットでアルゴリズムが表示される
の機能を実現したいと思います

このプログラムを作る際の実装ステップを考えてください

## 解釈・対応方針

本指示は，最適化アルゴリズムの系譜をノード・エッジのグラフとして可視化し，GitHub Pages上で公開するWebアプリケーション（Optimizer Map）の実装ステップを検討するタスクであると解釈した．
現時点ではプログラムの実装そのものではなく，実装ステップの検討（計画立案）が目的であるため，`@.ai/ai-dev-kit/documentation.md`（文書作成規約）および`@.ai/ai-dev-kit/environment_construction.md`（環境構築規約）を確認した上で，実装ステップの提案をチャット上で回答する．

## 追加指示（2回目）

- 対象とする最適化手法の範囲を，基本的な手法だけでなく近年の手法まで含める．
- 手法の要約，ノード・エッジのラベル付け，アルゴリズムの記述（概要文・更新式等）は生成AIによって自動化する．
  - 実装段階（現在）はClaude Codeが自動化を担当してよい．
  - 将来的にはGemini無料プランでの定期実行（データ更新の自動化）を想定している．

この追加指示を受け，既存の`.ai/ai-agent/core/llm.py`（Gemini構造化出力のビルダー，`tokens.json`の`gemini`キーを参照）の設計を再利用する方針で，データ生成ステップ（Step 2）を見直した．

## 追加指示（3回目）

- レビュー用ドラフト（旧`data/nodes_draft.json`）は，ユーザー自身が確認する運用でよいが，JSONのままでは読みにくいため，確認用にMarkdown等の読みやすい形式へ整形して出力する．
- `data/nodes.json`に全手法を追記していく構成ではなく，手法ごとに独立したJSONファイルに分割した方が管理しやすい．
- 近年の手法については，最初から網羅的に対象とするのではなく，まずは有名な手法から着手し，段階的に対象を広げていく．

これらを受け，データ格納構成（手法ごとに1ファイル）とレビュー用出力形式（Markdown整形）を見直した．

## 追加指示（4回目）: 第1段階の実装

上記の設計に基づき，第1段階（基本手法7件: SGD，Momentum，Nesterov，AdaGrad，RMSprop，Adam，AdamW）の
データ生成パイプラインを実装した．`programs/data_generation/schema.py`にPydanticスキーマ（`OptimizerNode`）を，
`data/nodes/<id>.json`（手法ごとに1ファイル）と`data/manifest.json`を作成し，`tests/test_data_schema.py`で
構造的な整合性（スキーマ準拠，`derived_from`参照の存在，自己参照の禁止）を検証した．
また，`programs/data_generation/build_review_markdown.py`で`data/nodes/`の内容を`.reports/draft_review_001.md`
としてレビュー用Markdownに整形して出力した．Citation数は本セッションでの概算値である．

## 追加指示（5回目）: クラウドセッションのプロトタイプの統合

ユーザーが別途クラウドセッション（ネットワーク制限ありのClaudeセッション）で，本プロジェクトと同じ設計思想
（ノード・エッジ，発表年による縦位置，分野による色分け，詳細パネル）に基づくプロトタイプを270手法規模で
構築し，`CloudSession/optimizer-map.zip`としてローカルリポジトリに配置した．`CloudSession/CLAUDE_CODE_TASKS.md`
（クラウドセッションでは実施・確認できなかった作業の指示）と，zip内の`HANDOFF_FOR_CLAUDE_CODE.md`（移植手順・
設計上の決定事項）に基づき，ローカルのClaude Codeが次を実施した．

- 第1段階で作成したローカルのデータ・スクリプト（`data/nodes/`，`programs/data_generation/`，
  `tests/test_data_schema.py`，`.reports/draft_review_001.md`）を`.orders/_archive_stage1_local_data/`へ退避した．
  クラウド側の270手法のデータに，第1段階で対象とした7手法が同等以上の情報量で含まれているため，統合（マージ）
  ではなく置き換えとした．
- クラウドセッションのプロジェクト一式（`data/`，`site/`，`tools/`，`review/`，`docs/combination_proposal.md`，
  `.github/`，`tests/e2e/`，`package.json`，`package-lock.json`，`README.md`）をリポジトリルートへ配置した．
- `CLAUDE_CODE_TASKS.md`のT1（ローカルでの動作確認）を実施した．ローカル環境にNode.jsが導入されていなかったため，
  `~/.local/node`にNode.js v20の公式バイナリを展開して導入した（システムへの恒久的な設定変更は行っていない）．
  `npm ci`，`tools/validate_nodes.py`（270ノード/407エッジ，エラー0），`tools/check_formulas.mjs`（エラー0），
  `tools/build_graph.py`，`tools/precompute_layout.mjs`，E2Eスモークテスト（11/11成功），CDN（jsdelivr）からの
  D3・KaTeX読み込み確認（Playwrightのヘッドレスブラウザで確認）を実施し，いずれも成功した．書き出し機能の
  クリップボードへのコピーのみ，ヘッドレス環境では確認できないため未確認のまま残っている．
- T2（書誌情報の取得），T3（リンク切れ確認），T4（新着論文の自動取り込み），T5（GitHubの設定），T6（データレビュー），
  T7（組み合わせ提案v1の実装）は，ネットワークアクセスを伴う処理や，GitHub側の設定，ユーザーによるデータレビューを
  要するため，本セッションでは未実施である．詳細は`document.md`の「残課題」に記載した．
