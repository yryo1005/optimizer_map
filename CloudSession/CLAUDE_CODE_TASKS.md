# Claude Code への作業指示（クラウドセッションで実施・確認できなかったもの）

本資料は，クラウドセッション（ネットワーク制限あり，GitHub への push なし）では実施・確認できなかった作業を，ローカルの Claude Code が実施するための指示である．
移植の手順と設計上の決定事項は `HANDOFF_FOR_CLAUDE_CODE.md` を参照すること．

各タスクは「手順」と「完了条件」を持つ．上から順に実施することを推奨する．

---

## T1. ローカルでの動作確認（最初に実施）

**手順**

```bash
npm ci
```

```bash
npx playwright install chromium
```

```bash
python tools/validate_nodes.py && node tools/check_formulas.mjs
```

```bash
python tools/build_graph.py && node tools/precompute_layout.mjs
```

```bash
node tests/e2e/smoke.cjs
```

```bash
python -m http.server 8000 -d site
```

**完了条件**

- E2E テストが 11/11 で成功する（クラウドセッションでは成功を確認済み）．
- 通常のブラウザで `http://localhost:8000/` を開き，**CDN（jsdelivr）から D3・KaTeX が読み込まれて**表示される．
  クラウドセッションでは CDN に接続できず，同一バージョンの npm パッケージで代替して確認したため，CDN 経由での表示は未確認である．
- 書き出し（BibTeX・CSV・SVG・PNG）を実際のブラウザで試し，ファイルが保存される．「BibTeX をコピー」と「生成AIへの相談用プロンプトをコピー」でクリップボードに入る（クリップボードは未確認）．

## T2. 書誌情報の取得（Semantic Scholar）

**手順**

```bash
python tools/fetch_metadata.py --dry-run
```

```bash
python tools/fetch_metadata.py
```

**完了条件**

- `data/metadata.json` が生成され，`needs_review` の件数が出力される．
- `needs_review` の手法（タイトル検索で一致した28件の中から出る想定）について，正しい論文を `data/metadata_overrides.json` に `{"<id>": "ARXIV:xxxx.xxxxx"}` または `"DOI:..."` の形で指定し，再実行して解消する．
- 画面の詳細パネルで「Citation数（Semantic Scholar（取得日）取得）」「論文」「著者」「掲載先」が表示される．
- Citation数を `data/nodes/*.json` に書き戻すか（`--write-citations`），`metadata.json` を優先する現状のままにするかをユーザーに確認して決める．
- API の応答形式が想定と異なる場合は `tools/fetch_metadata.py` の `slim()` と `request()` を修正する．

## T3. リンク切れの確認

**手順**

```bash
python tools/check_links.py --report link-report.md
```

**完了条件**

- リンク切れ（BROKEN）を修正する．403/429（WARN）は自動アクセスの拒否の可能性があるため，ブラウザで開いて確認する．

## T4. 新着論文の自動取り込み（arXiv + Gemini）

**手順**

```bash
python tools/discover_candidates.py --days 30 --top 10
```

```bash
python tools/generate_nodes_gemini.py --dry-run
```

```bash
GEMINI_API_KEY=... python tools/generate_nodes_gemini.py --limit 3
```

**完了条件**

- `data/candidates/candidates.json` に候補が出力され，明らかに無関係な論文（ハイパーパラメータ最適化・ベンチマーク等）が上位に来ないことを確認する．来る場合は `discover_candidates.py` の `POSITIVE`／`NEGATIVE` を調整する．
- 生成されたノードが検証を通り，`review/nodes_review.md` で内容が妥当である．
- ローカルの `.ai/ai-agent/core/llm.py`（Gemini 構造化出力のビルダー）がある場合は，`generate_nodes_gemini.py` の `call_gemini()` をそちらの呼び出しに置き換える．`build_prompt()`／`response_schema()` はそのまま使える．
- Gemini の無料枠で使えるモデル名を確認し，`GEMINI_MODEL` の既定値（現在 `gemini-2.5-flash`）を更新する．
- 試験的に生成したノードは，確認後に削除するか正式に採用するかをユーザーに確認する．

## T5. GitHub の設定とワークフローの初回実行

**手順**

1. Settings → Pages → Source を「GitHub Actions」にする．
2. Settings → Secrets and variables → Actions に Secrets `GEMINI_API_KEY`（必須），`S2_API_KEY`（任意），Variables `GEMINI_MODEL`（任意）を登録する．
3. Settings → Actions → General で「Allow GitHub Actions to create and approve pull requests」を有効にする．
4. 各ワークフローを `workflow_dispatch` で手動実行する．

**完了条件**

| ワークフロー | 確認すること |
|---|---|
| `pages.yml` | 検証・数式検証・生成・配置計算・**E2E テスト**・デプロイがすべて成功し，公開URLで表示できる．PR では検証と E2E のみ実行される |
| `metadata.yml` | 書誌情報の更新 PR が作られる |
| `discover.yml` | 新着候補の PR が作られる（候補がない週は PR なし） |
| `links.yml` | リンク切れがあれば Issue が作られる |

- E2E ステップでは `npx playwright install --with-deps chromium` を実行している．実行時間が長すぎる場合は，Playwright のブラウザをキャッシュする（`actions/cache` で `~/.cache/ms-playwright`）．
- ワークフロー中のアクションのバージョン（`actions/checkout@v4` 等）が古い場合は更新する．

## T6. データのレビュー（ユーザーと一緒に実施）

クラウドセッションの Claude が知識から作成したデータであり，ユーザーの確認が必要である．`review/nodes_review.md` と画面の詳細パネルで確認する．

| 対象 | 件数 | 確認の観点 |
|---|---|---|
| 改良パターン（`parents[].types`） | 407本 | 「理論的再解釈・一般化」と他パターンの境界，1〜2個への絞り込みの妥当性 |
| 実用情報（`practical`） | 270件 | **実装の有無**（`implementations`）は誤りやすい．特に PyTorch 標準（`torch.optim`）・Optax・Keras にある手法の一覧は各ライブラリの最新版の文書で確認する |
| 解説（`deep_dive`） | 50件 | 典型的な設定値（学習率・β 等）が現在の実践と合っているか |
| 未記入の解説 | 220件 | Gemini で生成するか（`generate_nodes_gemini.py` と同様のプロンプトで既存ノード向けのスクリプトを追加する），重要な手法だけ人手で書くかをユーザーと決める |

## T7. 組み合わせ提案 v1 の実装

設計は `docs/combination_proposal.md` を参照．試作（v0）は `tools/propose_combinations.py` にある．

**手順**

1. 各手法に `kind`（`optimizer` / `technique` / `framework` / `learned`）を追加する（生成AIで付与し，ユーザーが確認）．`tools/validate_nodes.py` に語彙の検証を追加する．
2. `propose_combinations.py` で `kind = optimizer` 以外を候補から除外し，MMR による多様化と類推による提案を追加する．
3. `python tools/propose_combinations.py --backtest` で，v0 と比べて Precision@20・Recall@50 が大きく下がっていないことを確認する（v0 の平均: P@20 = 0.086，R@50 = 0.099）．
4. 上位20件をユーザーに見せ，「既知／検討の価値あり／不適切」の評価を受けて重みを調整する．
5. 画面への組み込み（パターン表の下に候補の一覧，比較ビューで開く，相談用プロンプトのコピー）．候補はビルド時に `--json` で生成して graph.json に含める．
6. E2E テストに組み合わせ候補の表示テストを追加する．

## T8. 既知の課題（余力があれば）

`HANDOFF_FOR_CLAUDE_CODE.md` の「既知の課題」を参照．優先度の高いものは次のとおり．

- 領域配置で副分野の手法が離れていると範囲が小さな島になる（Bubble Sets 方式の「橋」）．
- 全体表示でのエッジの過密（グループ内のエッジのみ表示する切り替え，エッジのバンドリング）．
- 改善アイデアの候補で，既に同じ改良パターンを受けている手法を除外する．
