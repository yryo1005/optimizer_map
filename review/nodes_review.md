# Optimizer Map データレビュー（ドラフト）

本資料は，`data/nodes/`に格納された最適化手法データを確認するためのレビュー用資料である．
Citation数は生成時点（本資料の作成セッション）での概算値であり，Semantic Scholar等のAPIによる
自動取得に置き換えるまでの暫定値として扱う．内容を確認し，修正が必要な場合は指示すること．


収録手法数: 270


---


## ニュートン法 (Newton's Method)

- **ID**: `newton`
- **発表年**: 1740
- **Citation数（概算）**: なし（null）
- **分野タグ**: 2次手法
- **参考文献**: https://en.wikipedia.org/wiki/Newton%27s_method_in_optimization
- **備考**: 方程式の求根法としてはNewton（1669頃）・Raphson（1690）に遡るが，最適化への適用はSimpson（1740）によるとされるため1740年とした．単一の原典論文がないためCitation数はnullとした．

**概要**

目的関数を現在の点の周りで2次のテイラー展開により近似し，その近似関数の最小点へ移動する手法である．ヘッセ行列（2階微分）の逆行列で勾配を変換することで曲率に応じた更新が可能となり，最適解の近傍で2次収束する．一方で，ヘッセ行列の計算・逆行列の計算コストが大きく，大規模な問題への直接の適用は困難である．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \left[ \nabla^2 f({\mathbf w}_t) \right]^{-1} \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

なし（起点となる手法）

---

## ガウス・ニュートン法 (Gauss-Newton Method)

- **ID**: `gauss_newton`
- **発表年**: 1809
- **Citation数（概算）**: なし（null）
- **分野タグ**: 2次手法
- **参考文献**: https://en.wikipedia.org/wiki/Gauss%E2%80%93Newton_algorithm
- **備考**: Gaussの最小2乗法（1809）に遡る．単一の参照可能な原典URL・Citation数がないためWikipediaを参照し，Citation数はnullとした．

**概要**

非線形最小2乗問題において，ヘッセ行列を残差のヤコビ行列の積で近似し，2階微分を用いずにニュートン法に近い更新を行う手法である．近似行列は常に半正定値となるため，ニュートン法より安定であり，深層学習における2次手法（Hessian-Free，K-FAC等）で用いられる一般化ガウス・ニュートン行列の起源となった．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - ({\mathbf J}_t^\top {\mathbf J}_t)^{-1} {\mathbf J}_t^\top {\mathbf r}({\mathbf w}_t), \quad {\mathbf J}_t = \frac{\partial {\mathbf r}}{\partial {\mathbf w}}({\mathbf w}_t) $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: ヘッセ行列のヤコビ行列の積（半正定値）による近似

---

## 最急降下法 (Gradient Descent)

- **ID**: `gd`
- **発表年**: 1847
- **Citation数（概算）**: なし（null）
- **分野タグ**: 高速化
- **参考文献**: https://en.wikipedia.org/wiki/Gradient_descent
- **備考**: Cauchy（1847）がComptes Rendusで提案した．単一の参照可能な原典URL・Citation数がないためWikipediaを参照し，Citation数はnullとした．

**概要**

目的関数の勾配の逆方向（関数値が最も急に減少する方向）に，一定の学習率でパラメータを繰り返し更新する，勾配に基づく最適化手法の原点である．各ステップで目的関数全体の勾配を計算するため，データ数に比例した計算量を要する．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

なし（起点となる手法）

---

## 確率的勾配降下法 (Stochastic Gradient Descent, SGD)

- **ID**: `sgd`
- **発表年**: 1951
- **Citation数（概算）**: 25,000
- **分野タグ**: 高速化
- **参考文献**: https://www.jstor.org/stable/2236626
- **備考**: Robbins & Monro（1951）の確率的近似法を起点とする．

**概要**

目的関数全体の勾配の代わりに，1サンプルまたは少数のミニバッチから計算した勾配の推定値を用いてパラメータを更新する確率的近似法である．全データを用いる最急降下法と比べ，1回の更新に要する計算量を大幅に削減できるため，大規模データセットに対する最適化の基礎となった．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［確率化・部分化］: 全データの勾配の代わりにミニバッチによる確率的な勾配推定を用いた更新

---

## Kiefer-Wolfowitz法 (Kiefer-Wolfowitz Stochastic Approximation)

- **ID**: `kiefer_wolfowitz`
- **発表年**: 1952
- **Citation数（概算）**: 3,000
- **分野タグ**: ゼロ次手法
- **参考文献**: https://doi.org/10.1214/aoms/1177729392

**概要**

勾配が直接観測できず，雑音を含む関数値のみが得られる状況で，各座標方向の有限差分により勾配を推定して確率的近似を行う手法である．Robbins-Monro法（SGD）を関数値のみから最大値・最小値を求める問題に拡張したもので，ゼロ次（勾配を用いない）最適化の起点となった．

**更新式**

$$ \hat g_{t,i} = \frac{f({\mathbf w}_t + c_t {\mathbf e}_i) - f({\mathbf w}_t - c_t {\mathbf e}_i)}{2 c_t} \;\; (i = 1, \dots, d), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \hat{\mathbf g}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［確率化・部分化］: 勾配の代わりに関数値の有限差分による勾配推定を用いた確率的近似

---

## Frank-Wolfe法 (Conditional Gradient Method)

- **ID**: `frank_wolfe`
- **発表年**: 1956
- **Citation数（概算）**: 5,000
- **分野タグ**: 正則化
- **参考文献**: https://doi.org/10.1002/nav.3800030109

**概要**

制約集合上の最適化において，射影の代わりに，制約集合上で勾配との内積を最小にする点を求める線形最小化オラクル（LMO）を解き，現在の点とその点の凸結合で更新する手法である．射影が高コストな制約（核ノルム球など）でも効率的で，反復点が少数の端点の凸結合となるため疎な解が得られる．近年のLMOに基づく深層学習の最適化手法（Scion等）の源流である．

**更新式**

$$ {\mathbf s}_t = \arg\min_{{\mathbf s} \in \mathcal{C}} \langle \nabla f({\mathbf w}_t), {\mathbf s} \rangle, \quad {\mathbf w}_{t+1} = (1 - \gamma_t) {\mathbf w}_t + \gamma_t {\mathbf s}_t, \quad \gamma_t = \frac{2}{t + 2} $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［符号化・正規化・直交化，理論的再解釈・一般化］: 射影の代わりに線形最小化オラクル（LMO）を用いた制約付き最適化

---

## DFP法 (Davidon-Fletcher-Powell Method)

- **ID**: `dfp`
- **発表年**: 1963
- **Citation数（概算）**: 5,000
- **分野タグ**: 2次手法
- **参考文献**: https://doi.org/10.1093/comjnl/6.2.163
- **備考**: Davidonの技術報告（1959）をFletcherとPowell（1963）が発展させた．参考文献はFletcher & Powell（1963）とした．

**概要**

最初に提案された準ニュートン法であり，パラメータの変化量と勾配の変化量から，ヘッセ行列の逆行列の近似をランク2の更新で逐次的に構成する．ニュートン法と異なりヘッセ行列の計算が不要でありながら，2次関数に対しては有限回の反復で収束する．

**更新式**

$$ {\mathbf H}_{t+1} = {\mathbf H}_t + \frac{{\mathbf s}_t {\mathbf s}_t^\top}{{\mathbf s}_t^\top {\mathbf y}_t} - \frac{{\mathbf H}_t {\mathbf y}_t {\mathbf y}_t^\top {\mathbf H}_t}{{\mathbf y}_t^\top {\mathbf H}_t {\mathbf y}_t}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf H}_t \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: 勾配の変化量によるヘッセ逆行列のランク2逐次近似（初の準ニュートン法）

---

## Levenberg-Marquardt法

- **ID**: `levenberg_marquardt`
- **発表年**: 1963
- **Citation数（概算）**: 25,000
- **分野タグ**: 2次手法
- **参考文献**: https://doi.org/10.1137/0111030
- **備考**: Levenberg（1944）が提案し，Marquardt（1963）が再発見・発展させた．参考文献とCitation数はMarquardt（1963）を代表とした．

**概要**

非線形最小2乗問題に対し，ヤコビ行列から構成したガウス・ニュートン行列に減衰項（単位行列の定数倍）を加えて解く手法である．減衰係数を適応的に調整することで，最適解から遠い場合は最急降下法に，近い場合はガウス・ニュートン法に近い振る舞いをし，安定性と高速な収束を両立する．

**更新式**

$$ ({\mathbf J}_t^\top {\mathbf J}_t + \lambda_t {\mathbf I}) \, \boldsymbol\delta_t = - {\mathbf J}_t^\top {\mathbf r}({\mathbf w}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \boldsymbol\delta_t $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理，正則化・重み減衰］: ガウス・ニュートン近似と適応的な減衰項（ダンピング）の導入
- ガウス・ニュートン法 (Gauss-Newton Method)（`gauss_newton`）から［正則化・重み減衰，クリッピング・安定化］: ガウス・ニュートン法への減衰項の導入

---

## 非線形共役勾配法 (Nonlinear Conjugate Gradient, Fletcher-Reeves)

- **ID**: `fletcher_reeves`
- **発表年**: 1964
- **Citation数（概算）**: 4,000
- **分野タグ**: 2次手法，高速化
- **参考文献**: https://doi.org/10.1093/comjnl/7.2.149

**概要**

線形方程式の解法である共役勾配法（Hestenes-Stiefel, 1952）を一般の非線形関数の最適化に拡張した手法である．現在の勾配と前回の探索方向を組み合わせて，互いに共役に近い探索方向を生成することで，ヘッセ行列を用いずに最急降下法より高速に収束する．

**更新式**

$$ \beta_t = \frac{\|\nabla f({\mathbf w}_t)\|^2}{\|\nabla f({\mathbf w}_{t-1})\|^2}, \quad {\mathbf d}_t = -\nabla f({\mathbf w}_t) + \beta_t {\mathbf d}_{t-1}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \alpha_t {\mathbf d}_t \;\; (\alpha_t : \text{直線探索}) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［曲率・前処理，慣性項・加速］: 前回の探索方向との共役性に基づく探索方向の生成

---

## モーメント法 (Momentum，Heavy Ball法)

- **ID**: `momentum`
- **発表年**: 1964
- **Citation数（概算）**: 9,000
- **分野タグ**: 高速化
- **参考文献**: https://doi.org/10.1016/0041-5553(64)90137-5

**概要**

勾配方向への更新に，過去の更新方向を一定の割合で保持する慣性項を加える手法である．谷状の目的関数において，勾配が小さい方向への更新を蓄積して加速し，振動しやすい方向への更新を打ち消すことで，SGDに比べ収束を高速化する．

**更新式**

$$ {\mathbf v}_{t+1} = \beta {\mathbf v}_t - \eta \nabla f_t({\mathbf w}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf v}_{t+1} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［慣性項・加速］: 慣性項（過去の更新方向の蓄積）の追加

---

## Armijo直線探索 (Armijo Line Search / Backtracking)

- **ID**: `armijo`
- **発表年**: 1966
- **Citation数（概算）**: 3,000
- **分野タグ**: 学習率自動調整
- **参考文献**: https://doi.org/10.2140/pjm.1966.16.1

**概要**

探索方向に沿って，関数値が勾配から予測される減少量の一定割合以上減少するという十分減少条件（Armijo条件）を満たすまで，ステップ幅を一定の比率で縮小していく直線探索法である．滑らかさの定数を知らなくても，各反復で適切なステップ幅を自動的に選べる．

**更新式**

$$ \eta \leftarrow \eta_0, \quad \text{while } f({\mathbf w}_t - \eta \nabla f({\mathbf w}_t)) > f({\mathbf w}_t) - c \, \eta \|\nabla f({\mathbf w}_t)\|^2 : \; \eta \leftarrow \rho \eta, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［学習率の自動化・スケジュール］: 十分減少条件に基づくステップ幅の自動的な縮小（バックトラッキング）

---

## Polyakステップサイズ (Polyak Step Size)

- **ID**: `polyak_step`
- **発表年**: 1969
- **Citation数（概算）**: 800
- **分野タグ**: 学習率自動調整
- **参考文献**: https://doi.org/10.1016/0041-5553(69)90061-5

**概要**

目的関数の最小値が既知である場合に，現在の関数値と最小値の差を勾配ノルムの2乗で割った値を学習率とする手法である．関数値の改善余地に応じて学習率が自動的に決まり，非平滑な凸関数を含め，学習率の調整なしに良好な収束性を示す．

**更新式**

$$ \eta_t = \frac{f({\mathbf w}_t) - f^*}{\|\nabla f({\mathbf w}_t)\|^2}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［学習率の自動化・スケジュール］: 最適値との差と勾配ノルムに基づく学習率の自動設定

---

## BFGS法 (Broyden-Fletcher-Goldfarb-Shanno Method)

- **ID**: `bfgs`
- **発表年**: 1970
- **Citation数（概算）**: 5,000
- **分野タグ**: 2次手法
- **参考文献**: https://doi.org/10.1093/comjnl/13.3.317
- **備考**: Broyden，Fletcher，Goldfarb，Shannoの4本の論文（いずれも1970年）で独立に提案された．参考文献はFletcherの論文を代表とし，Citation数も代表値の概算である．

**概要**

ヘッセ行列を直接計算せず，反復ごとのパラメータの変化量と勾配の変化量から，ヘッセ行列の逆行列の近似を逐次的に更新する準ニュートン法である．近似行列の正定値性を保つランク2の更新式により，ニュートン法に近い超1次収束を，勾配の計算のみで実現する．

**更新式**

$$ {\mathbf s}_t = {\mathbf w}_{t+1} - {\mathbf w}_t, \quad {\mathbf y}_t = \nabla f({\mathbf w}_{t+1}) - \nabla f({\mathbf w}_t), \quad \rho_t = \frac{1}{{\mathbf y}_t^\top {\mathbf s}_t}, \quad {\mathbf H}_{t+1} = ({\mathbf I} - \rho_t {\mathbf s}_t {\mathbf y}_t^\top) {\mathbf H}_t ({\mathbf I} - \rho_t {\mathbf y}_t {\mathbf s}_t^\top) + \rho_t {\mathbf s}_t {\mathbf s}_t^\top, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf H}_t \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: パラメータと勾配の変化量によるヘッセ逆行列の逐次近似（準ニュートン法）
- DFP法 (Davidon-Fletcher-Powell Method)（`dfp`）から［曲率・前処理，クリッピング・安定化］: 双対的なランク2更新式による正定値性と数値安定性の改善

---

## Extragradient法 (Extragradient Method)

- **ID**: `extragradient`
- **発表年**: 1976
- **Citation数（概算）**: 3,000
- **分野タグ**: ミニマックス最適化
- **参考文献**: https://cs.uwaterloo.ca/~y328yu/classics/extragrad.pdf
- **備考**: Korpelevich（1976, Ekonomika i Matematicheskie Metody）の論文の英訳スキャンを参照した．

**概要**

鞍点問題や変分不等式において，現在の点で勾配ステップを行って先読みの点を求め，その先読みの点での勾配を用いて元の点から更新する2段階の手法である．単純な勾配降下・上昇法が双線形な鞍点問題で振動・発散するのに対し，先読みにより回転する力学を打ち消して収束する．GANの学習の安定化に再び注目された．

**更新式**

$$ {\mathbf z}_{t+1/2} = {\mathbf z}_t - \eta \, F({\mathbf z}_t), \quad {\mathbf z}_{t+1} = {\mathbf z}_t - \eta \, F({\mathbf z}_{t+1/2}), \quad F({\mathbf x}, {\mathbf y}) = (\nabla_{\mathbf x} f, \, -\nabla_{\mathbf y} f) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［問題設定への適用，慣性項・加速］: 鞍点問題に対する先読み点での勾配評価による2段階の更新

---

## ミラー降下法 (Mirror Descent)

- **ID**: `mirror_descent`
- **発表年**: 1983
- **Citation数（概算）**: 4,000
- **分野タグ**: オンライン学習，適応的学習率
- **参考文献**: https://en.wikipedia.org/wiki/Mirror_descent
- **備考**: NemirovskiとYudinの書籍（1983）で体系化された．単一の参照可能な原典URLがないためWikipediaを参照した．

**概要**

ユークリッド距離の代わりに，問題の幾何構造に合わせたBregmanダイバージェンスを近接項として用いる勾配法である．確率単体上の最適化などで次元依存性を大きく改善でき，AdaGradやオンライン学習アルゴリズムの理論的な基盤となった．

**更新式**

$$ {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ \eta \langle \nabla f_t({\mathbf w}_t), {\mathbf w} \rangle + D_\psi({\mathbf w}, {\mathbf w}_t) \right\}, \quad D_\psi({\mathbf w}, {\mathbf v}) = \psi({\mathbf w}) - \psi({\mathbf v}) - \langle \nabla \psi({\mathbf v}), {\mathbf w} - {\mathbf v} \rangle $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［理論的再解釈・一般化］: ユークリッド距離のBregmanダイバージェンスへの一般化

---

## Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)

- **ID**: `nesterov`
- **発表年**: 1983
- **Citation数（概算）**: 12,000
- **分野タグ**: 高速化
- **参考文献**: https://mathnet.ru/eng/dan46009

**概要**

モーメント法では現在の位置における勾配を用いて慣性項と合成するのに対し，本手法では慣性項に従って一度先読みした位置における勾配を用いて更新する．この先読みにより，目的関数の曲率変化をより早く捉えられるため，モーメント法よりも理論的な収束率が改善される．

**更新式**

$$ {\mathbf v}_{t+1} = \beta {\mathbf v}_t - \eta \nabla f_t({\mathbf w}_t + \beta {\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf v}_{t+1} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速］: 慣性項に基づく先読み位置での勾配評価

---

## Barzilai-Borwein法 (BB Step Size)

- **ID**: `barzilai_borwein`
- **発表年**: 1988
- **Citation数（概算）**: 3,500
- **分野タグ**: 学習率自動調整，2次手法
- **参考文献**: https://doi.org/10.1093/imanum/8.1.141

**概要**

直前2回の反復におけるパラメータの変化量と勾配の変化量から，セカント条件をスカラーの最小2乗で近似的に満たすステップ幅を計算する勾配法である．ヘッセ行列をスカラー倍の単位行列で近似する準ニュートン法とみなせ，関数値が単調に減少しない場合もあるが，最急降下法より大幅に高速に収束することが多い．

**更新式**

$$ {\mathbf s}_{t-1} = {\mathbf w}_t - {\mathbf w}_{t-1}, \quad {\mathbf y}_{t-1} = \nabla f({\mathbf w}_t) - \nabla f({\mathbf w}_{t-1}), \quad \eta_t = \frac{{\mathbf s}_{t-1}^\top {\mathbf s}_{t-1}}{{\mathbf s}_{t-1}^\top {\mathbf y}_{t-1}}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f({\mathbf w}_t) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［学習率の自動化・スケジュール，曲率・前処理］: セカント条件のスカラー近似によるステップ幅の自動設定
- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: ヘッセ行列のスカラー倍の単位行列による近似

---

## L-BFGS法 (Limited-memory BFGS)

- **ID**: `lbfgs`
- **発表年**: 1989
- **Citation数（概算）**: 9,000
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://doi.org/10.1007/BF01589116

**概要**

BFGS法ではパラメータ数の2乗のサイズの近似行列を保持する必要がある問題に対し，直近m回分のパラメータの変化量と勾配の変化量のみを保持し，それらから近似行列と勾配の積を2重ループ再帰で直接計算する手法である．メモリ使用量をパラメータ数に比例する程度に抑え，大規模な問題に準ニュートン法を適用可能にした．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf H}^{(m)}_t \nabla f({\mathbf w}_t), \quad {\mathbf H}^{(m)}_t : \{ ({\mathbf s}_i, {\mathbf y}_i) \}_{i = t-m}^{t-1} \text{から2重ループ再帰で暗黙的に構成} $$

**派生元と改善内容**

- BFGS法 (Broyden-Fletcher-Goldfarb-Shanno Method)（`bfgs`）から［圧縮・量子化・低ランク，曲率・前処理］: 直近m組の変化量のみを用いた近似行列の暗黙的な表現（メモリの制限）

---

## 重み減衰 (Weight Decay)

- **ID**: `weight_decay`
- **発表年**: 1991
- **Citation数（概算）**: 2,500
- **分野タグ**: 正則化
- **参考文献**: https://papers.nips.cc/paper/1991/hash/8eefcfdf5990e441f0fb6f3fad709e21-Abstract.html

**概要**

各更新で重みを一定の割合だけ0に向けて縮小させる正則化手法である．SGDでは損失関数にL2正則化項を加えることと等価であり，不要な重み成分を抑制し，ラベルの雑音の影響を低減することで汎化性能を改善することが示された．

**更新式**

$$ {\mathbf w}_{t+1} = (1 - \eta \lambda) {\mathbf w}_t - \eta \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［正則化・重み減衰］: 各更新での重みの縮小（L2正則化）の導入

---

## Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)

- **ID**: `polyak_averaging`
- **発表年**: 1992
- **Citation数（概算）**: 3,000
- **分野タグ**: 重み平均化，高速化
- **参考文献**: https://doi.org/10.1137/0330046

**概要**

SGDの反復列そのものではなく，反復列の算術平均を最終的な解として出力する手法である．比較的大きな学習率でSGDを実行しつつ平均を取ることで，確率的勾配のノイズによる揺らぎが打ち消され，漸近的に最適な収束率が得られることが示されている．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f_t({\mathbf w}_t), \quad \bar{\mathbf w}_T = \frac{1}{T} \sum_{t=1}^{T} {\mathbf w}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［重みの平均化・補間］: 反復列の算術平均による確率的ノイズの抑制

---

## SPSA (Simultaneous Perturbation Stochastic Approximation)

- **ID**: `spsa`
- **発表年**: 1992
- **Citation数（概算）**: 6,000
- **分野タグ**: ゼロ次手法
- **参考文献**: https://doi.org/10.1109/9.119632

**概要**

Kiefer-Wolfowitz法では次元数dに比例する回数の関数評価が必要となる問題に対し，全座標を同時にランダムな方向に摂動させ，2回の関数評価のみで勾配を推定する手法である．次元数によらず1ステップあたりの関数評価回数が一定となるため，高次元の問題へのゼロ次最適化の適用を可能にした．

**更新式**

$$ \boldsymbol\Delta_t \sim \{\pm 1\}^d, \quad \hat{\mathbf g}_t = \frac{f({\mathbf w}_t + c_t \boldsymbol\Delta_t) - f({\mathbf w}_t - c_t \boldsymbol\Delta_t)}{2 c_t} \boldsymbol\Delta_t^{-1}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \hat{\mathbf g}_t $$

**派生元と改善内容**

- Kiefer-Wolfowitz法 (Kiefer-Wolfowitz Stochastic Approximation)（`kiefer_wolfowitz`）から［確率化・部分化］: 全座標の同時ランダム摂動による2回の関数評価での勾配推定

---

## Rprop (Resilient Backpropagation)

- **ID**: `rprop`
- **発表年**: 1993
- **Citation数（概算）**: 5,000
- **分野タグ**: 符号ベース，適応的学習率
- **参考文献**: https://doi.org/10.1109/ICNN.1993.298623

**概要**

勾配の大きさを用いず，勾配の符号のみを用いてパラメータごとのステップ幅を更新する手法である．前回と今回の勾配の符号が一致すればステップ幅を拡大し，反転すれば縮小することで，勾配の大きさのばらつきに影響されずに各パラメータの学習率を自動調整する．フルバッチ学習を前提とした手法である．

**更新式**

$$ \Delta_{t,i} = \begin{cases} \eta^{+} \Delta_{t-1,i} & (g_{t,i} \, g_{t-1,i} > 0) \\ \eta^{-} \Delta_{t-1,i} & (g_{t,i} \, g_{t-1,i} < 0) \\ \Delta_{t-1,i} & (\mathrm{otherwise}) \end{cases}, \quad w_{t+1,i} = w_{t,i} - \mathrm{sign}(g_{t,i}) \, \Delta_{t,i} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［符号化・正規化・直交化，適応的スケーリング］: 勾配の符号のみを用いたパラメータごとのステップ幅の適応的調整

---

## 指数勾配法 (Exponentiated Gradient, EG)

- **ID**: `exponentiated_gradient`
- **発表年**: 1997
- **Citation数（概算）**: 1,500
- **分野タグ**: オンライン学習
- **参考文献**: https://doi.org/10.1006/inco.1996.2612

**概要**

パラメータを加算的に更新する勾配降下法の代わりに，勾配の指数関数を乗じて乗法的に更新し，和が1になるよう正規化する手法である．相対エントロピーを距離とするミラー降下法に相当し，関連する特徴が少数（疎）の場合に，勾配降下法より次元への依存性が大幅に小さい誤差限界を達成する．

**更新式**

$$ w_{t+1,i} = \frac{w_{t,i} \exp(-\eta \, g_{t,i})}{\sum_{j} w_{t,j} \exp(-\eta \, g_{t,j})} $$

**派生元と改善内容**

- ミラー降下法 (Mirror Descent)（`mirror_descent`）から［理論的再解釈・一般化］: 相対エントロピーを用いた乗法的な更新

---

## 自然勾配法 (Natural Gradient Descent)

- **ID**: `natural_gradient`
- **発表年**: 1998
- **Citation数（概算）**: 4,500
- **分野タグ**: 2次手法
- **参考文献**: https://doi.org/10.1162/089976698300017746

**概要**

パラメータ空間をユークリッド空間ではなく，確率モデルの分布間の距離（KLダイバージェンス）に基づくリーマン多様体とみなし，その上での最急降下方向に沿って更新する手法である．フィッシャー情報行列の逆行列で勾配を変換することで，モデルのパラメータ化の仕方に依存しない更新が得られる．

**更新式**

$$ {\mathbf F}({\mathbf w}) = \mathbb{E}\left[ \nabla \log p({\mathbf x} | {\mathbf w}) \nabla \log p({\mathbf x} | {\mathbf w})^\top \right], \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf F}({\mathbf w}_t)^{-1} \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［曲率・前処理］: フィッシャー情報行列（分布空間の計量）による勾配の前処理
- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: ヘッセ行列のフィッシャー情報行列（常に半正定値）による置き換え

---

## 自然方策勾配法 (Natural Policy Gradient)

- **ID**: `natural_policy_gradient`
- **発表年**: 2001
- **Citation数（概算）**: 1,500
- **分野タグ**: 方策最適化，2次手法
- **参考文献**: https://papers.nips.cc/paper/2073-a-natural-policy-gradient

**概要**

強化学習の方策勾配法に，方策（行動の確率分布）の構造に基づくフィッシャー情報行列による前処理を適用した自然勾配法である．方策のパラメータ化に依存しない更新が得られ，自然勾配の方向は貪欲な最適行動の選択に向かうことから方策反復法と関係づけられる．

**更新式**

$$ {\mathbf F}(\boldsymbol\theta) = \mathbb{E}_{s, a \sim \pi_{\boldsymbol\theta}}\left[ \nabla \log \pi_{\boldsymbol\theta}(a|s) \nabla \log \pi_{\boldsymbol\theta}(a|s)^\top \right], \quad \boldsymbol\theta_{t+1} = \boldsymbol\theta_t + \eta \, {\mathbf F}(\boldsymbol\theta_t)^{-1} \nabla_{\boldsymbol\theta} J(\boldsymbol\theta_t) $$

**派生元と改善内容**

- 自然勾配法 (Natural Gradient Descent)（`natural_gradient`）から［問題設定への適用，曲率・前処理］: 方策の分布に基づくフィッシャー情報行列の強化学習への適用

---

## オンライン勾配降下法 (Online Gradient Descent)

- **ID**: `ogd`
- **発表年**: 2003
- **Citation数（概算）**: 3,500
- **分野タグ**: オンライン学習
- **参考文献**: https://www.aaai.org/Papers/ICML/2003/ICML03-120.pdf

**概要**

毎時刻異なる凸関数が敵対的に与えられるオンライン凸最適化の枠組みを定式化し，射影付きの勾配降下法が，学習率を時刻の平方根に反比例させることで，後から見た最良の固定解に対するリグレットをO(√T)に抑えられることを示した研究である．AdaGradやAdamの収束解析の基盤となるリグレット解析の出発点となった．

**更新式**

$$ {\mathbf w}_{t+1} = \Pi_{\mathcal{K}}\left( {\mathbf w}_t - \eta_t \nabla f_t({\mathbf w}_t) \right), \quad \eta_t = \frac{1}{\sqrt{t}}, \quad \mathrm{Regret}_T = \sum_{t=1}^{T} f_t({\mathbf w}_t) - \min_{{\mathbf w} \in \mathcal{K}} \sum_{t=1}^{T} f_t({\mathbf w}) = O(\sqrt{T}) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［理論的再解釈・一般化］: 敵対的に変化する関数列に対するオンライン凸最適化とリグレット解析

---

## ISTA (Iterative Shrinkage-Thresholding Algorithm, 近接勾配法)

- **ID**: `ista`
- **発表年**: 2004
- **Citation数（概算）**: 7,000
- **分野タグ**: 正則化
- **参考文献**: https://doi.org/10.1002/cpa.20042

**概要**

L1正則化のような微分不可能な正則化項を含む目的関数に対し，滑らかな部分で勾配降下を行った後，正則化項の近接写像（L1の場合は軟閾値処理）を適用する手法である．スパースな解を効率的に求めることができ，圧縮センシングやLassoの最適化で広く用いられる．

**更新式**

$$ {\mathbf w}_{t+1} = \mathrm{prox}_{\eta \lambda \|\cdot\|_1}\left( {\mathbf w}_t - \eta \nabla f({\mathbf w}_t) \right), \quad [\mathrm{prox}_{\tau \|\cdot\|_1}({\mathbf u})]_i = \mathrm{sign}(u_i) \max(|u_i| - \tau, 0) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［正則化・重み減衰］: 微分不可能な正則化項に対する近接写像（軟閾値処理）の導入

---

## 3次正則化ニュートン法 (Cubic Regularization of Newton's Method)

- **ID**: `cubic_newton`
- **発表年**: 2006
- **Citation数（概算）**: 1,200
- **分野タグ**: 2次手法
- **参考文献**: https://doi.org/10.1007/s10107-006-0706-8

**概要**

ニュートン法の2次モデルに，ステップの大きさの3乗に比例する正則化項を加えたモデルを最小化して更新する手法である．非凸関数においても鞍点を回避して2次の停留点（局所最適解）に収束することが大域的に保証され，非凸最適化の計算量理論の基盤となった．

**更新式**

$$ {\mathbf w}_{t+1} = \arg\min_{{\mathbf y}} \left\{ \langle \nabla f({\mathbf w}_t), {\mathbf y} - {\mathbf w}_t \rangle + \frac{1}{2} \langle \nabla^2 f({\mathbf w}_t) ({\mathbf y} - {\mathbf w}_t), {\mathbf y} - {\mathbf w}_t \rangle + \frac{M}{6} \|{\mathbf y} - {\mathbf w}_t\|^3 \right\} $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［正則化・重み減衰，曲率・前処理］: 2次モデルへの3次の正則化項の追加による大域的収束と鞍点回避

---

## oLBFGS (Online L-BFGS)

- **ID**: `olbfgs`
- **発表年**: 2007
- **Citation数（概算）**: 500
- **分野タグ**: 2次手法，オンライン学習
- **参考文献**: https://proceedings.mlr.press/v2/schraudolph07a.html

**概要**

L-BFGS法をミニバッチの確率的勾配によるオンライン学習に適用するため，曲率対（パラメータと勾配の変化量）を同一のミニバッチで計算し，ステップ幅をゲインの減衰スケジュールで与え，曲率の推定を正則化する等の修正を加えた手法である．確率的な準ニュートン法の先駆けとなった．

**更新式**

$$ {\mathbf s}_t = {\mathbf w}_{t+1} - {\mathbf w}_t, \quad {\mathbf y}_t = \nabla f_{B_t}({\mathbf w}_{t+1}) - \nabla f_{B_t}({\mathbf w}_t) + \lambda {\mathbf s}_t \;\; (\text{同一ミニバッチ}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta_t}{c} {\mathbf H}^{(m)}_t \nabla f_{B_t}({\mathbf w}_t) $$

**派生元と改善内容**

- L-BFGS法 (Limited-memory BFGS)（`lbfgs`）から［確率化・部分化，曲率・前処理］: 同一ミニバッチでの曲率対の計算と正則化による確率的設定への適用
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［曲率・前処理，確率化・部分化］: ミニバッチの確率的勾配への準ニュートン法の適用

---

## Online Newton Step (ONS)

- **ID**: `online_newton_step`
- **発表年**: 2007
- **Citation数（概算）**: 1,300
- **分野タグ**: オンライン学習，2次手法
- **参考文献**: https://doi.org/10.1007/s10994-007-5016-8

**概要**

指数凹関数のオンライン最適化において，これまでの勾配の外積の累積を前処理行列として用いるニュートン法型の更新を行う手法である．リグレットを対数オーダーO(log T)に抑えられ，勾配の外積の累積を前処理に用いるという考え方は，後の全行列版AdaGradやShampooの先駆けとなった．

**更新式**

$$ {\mathbf A}_t = {\mathbf A}_{t-1} + \nabla f_t({\mathbf w}_t) \nabla f_t({\mathbf w}_t)^\top, \quad {\mathbf w}_{t+1} = \Pi^{{\mathbf A}_t}_{\mathcal{K}}\left( {\mathbf w}_t - \frac{1}{\gamma} {\mathbf A}_t^{-1} \nabla f_t({\mathbf w}_t) \right) $$

**派生元と改善内容**

- オンライン勾配降下法 (Online Gradient Descent)（`ogd`）から［曲率・前処理］: 勾配の外積の累積による前処理（対数リグレットの達成）
- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: ヘッセ行列の勾配の外積による近似のオンライン学習への導入

---

## TONGA (Topmoumoute Online Natural Gradient Algorithm)

- **ID**: `tonga`
- **発表年**: 2007
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法
- **参考文献**: https://www.microsoft.com/en-us/research/publication/topmoumoute-online-natural-gradient-algorithm/

**概要**

汎化誤差を最もよく減少させる方向が，ベイズ・頻度論のいずれの観点からも勾配の共分散行列に基づく自然勾配方向になり得ることを示し，その共分散行列を低ランク＋ブロック対角でオンラインに近似する手法である．パラメータ数に線形な計算量でSGDより高速に収束する．

**更新式**

$$ {\mathbf C}_t = \gamma {\mathbf C}_{t-1} + {\mathbf g}_t {\mathbf g}_t^\top \;\; (\text{低ランク近似}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( {\mathbf C}_t + \lambda {\mathbf I} \right)^{-1} {\mathbf g}_t $$

**派生元と改善内容**

- 自然勾配法 (Natural Gradient Descent)（`natural_gradient`）から［曲率・前処理，圧縮・量子化・低ランク］: 勾配の共分散行列による自然勾配の低ランク・オンライン近似

---

## 双対平均化法 (Dual Averaging)

- **ID**: `dual_averaging`
- **発表年**: 2009
- **Citation数（概算）**: 1,500
- **分野タグ**: 適応的学習率，重み平均化
- **参考文献**: https://doi.org/10.1007/s10107-007-0149-x

**概要**

過去のすべての（劣）勾配の重み付き和を保持し，それに強凸な近接関数を加えた問題の最小化として次の点を決める手法である．新しい勾配ほど重みを小さくしてしまうミラー降下法の欠点を解消し，正則化双対平均化（RDA）など疎な解を得る手法やD-Adaptationの基盤となった．

**更新式**

$$ {\mathbf s}_t = \sum_{i=1}^{t} \lambda_i \nabla f_i({\mathbf w}_i), \quad {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ \langle {\mathbf s}_t, {\mathbf w} \rangle + \beta_t \, d({\mathbf w}) \right\} $$

**派生元と改善内容**

- ミラー降下法 (Mirror Descent)（`mirror_descent`）から［重みの平均化・補間，理論的再解釈・一般化］: 過去の勾配の重み付き和と近接関数による次の点の決定（勾配の重みの均一化）

---

## FISTA (Fast Iterative Shrinkage-Thresholding Algorithm)

- **ID**: `fista`
- **発表年**: 2009
- **Citation数（概算）**: 13,000
- **分野タグ**: 高速化，正則化
- **参考文献**: https://doi.org/10.1137/080716542

**概要**

ISTAにNesterovの加速法を組み合わせ，前回までの反復点の外挿点で近接勾配ステップを行う手法である．1ステップあたりの計算量はISTAとほぼ同じまま，収束率をO(1/t)からO(1/t^2)へと改善する．

**更新式**

$$ {\mathbf w}_{t} = \mathrm{prox}_{\eta \lambda \|\cdot\|_1}\left( {\mathbf y}_t - \eta \nabla f({\mathbf y}_t) \right), \quad s_{t+1} = \frac{1 + \sqrt{1 + 4 s_t^2}}{2}, \quad {\mathbf y}_{t+1} = {\mathbf w}_t + \frac{s_t - 1}{s_{t+1}} ({\mathbf w}_t - {\mathbf w}_{t-1}) $$

**派生元と改善内容**

- ISTA (Iterative Shrinkage-Thresholding Algorithm, 近接勾配法)（`ista`）から［慣性項・加速］: 近接勾配法への加速の導入
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，正則化・重み減衰］: 外挿点での勾配評価による加速の非平滑問題への拡張

---

## FOBOS (Forward-Backward Splitting, 近接SGD)

- **ID**: `fobos`
- **発表年**: 2009
- **Citation数（概算）**: 1,200
- **分野タグ**: オンライン学習，正則化
- **参考文献**: https://jmlr.org/papers/v10/duchi09a.html

**概要**

正則化付きのオンライン学習・確率的最適化において，損失の（劣）勾配による更新の後に，正則化項の近接写像を適用する2段階の更新を行う手法である．L1正則化では各更新の後に軟閾値処理が行われ，確率的な設定でも疎な解が得られる．近接SGDの代表的な形式である．

**更新式**

$$ {\mathbf w}_{t+1/2} = {\mathbf w}_t - \eta_t \nabla f_t({\mathbf w}_t), \quad {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ \frac{1}{2} \|{\mathbf w} - {\mathbf w}_{t+1/2}\|^2 + \eta_{t+1/2} \, r({\mathbf w}) \right\} $$

**派生元と改善内容**

- ISTA (Iterative Shrinkage-Thresholding Algorithm, 近接勾配法)（`ista`）から［正則化・重み減衰，確率化・部分化］: 近接勾配法の確率的・オンライン設定への拡張
- オンライン勾配降下法 (Online Gradient Descent)（`ogd`）から［正則化・重み減衰］: オンライン学習における正則化項の近接写像による扱い

---

## Hessian-Free最適化 (Hessian-Free Optimization)

- **ID**: `hessian_free`
- **発表年**: 2010
- **Citation数（概算）**: 1,500
- **分野タグ**: 2次手法
- **参考文献**: https://icml.cc/imls/conferences/2010/papers/458.pdf

**概要**

ヘッセ行列を明示的に構成・保持せず，ヘッセ行列（またはガウス・ニュートン行列）とベクトルの積のみを効率的に計算し，共役勾配法でニュートン方程式を近似的に解く手法である．減衰（ダンピング）付きのガウス・ニュートン行列を用いることで，事前学習なしに深いオートエンコーダを学習できることを示し，深層学習における2次手法の有効性を示した．

**更新式**

$$ ({\mathbf G}({\mathbf w}_t) + \lambda {\mathbf I}) \, {\mathbf d}_t = - \nabla f({\mathbf w}_t) \;\; \text{を共役勾配法で近似的に解く（行列ベクトル積のみ使用）}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf d}_t $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: 行列ベクトル積と共役勾配法によるヘッセ行列の明示的計算の回避，ガウス・ニュートン行列とダンピングの導入
- ガウス・ニュートン法 (Gauss-Newton Method)（`gauss_newton`）から［曲率・前処理］: 一般化ガウス・ニュートン行列による曲率の近似

---

## RDA (Regularized Dual Averaging)

- **ID**: `rda`
- **発表年**: 2010
- **Citation数（概算）**: 1,500
- **分野タグ**: オンライン学習，正則化
- **参考文献**: https://jmlr.org/papers/v11/xiao10a.html

**概要**

双対平均化法に正則化項を組み込み，過去の全勾配の平均と正則化項・強凸な近接項の和を最小化して次の点を決める手法である．FOBOSなどの近接SGDでは各ステップの学習率が小さくなると正則化による切り捨てが弱まり疎性が失われるのに対し，正則化項全体を毎回適用するため，より疎な解が得られる．

**更新式**

$$ \bar{\mathbf g}_t = \frac{1}{t} \sum_{i=1}^{t} \nabla f_i({\mathbf w}_i), \quad {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ \langle \bar{\mathbf g}_t, {\mathbf w} \rangle + \lambda \|{\mathbf w}\|_1 + \frac{\beta_t}{t} h({\mathbf w}) \right\} $$

**派生元と改善内容**

- 双対平均化法 (Dual Averaging)（`dual_averaging`）から［正則化・重み減衰］: 正則化項の双対平均化への組み込み
- FOBOS (Forward-Backward Splitting, 近接SGD)（`fobos`）から［正則化・重み減衰］: 正則化項の毎回の全適用による疎性の改善

---

## AdaGrad (Adaptive Gradient Algorithm)

- **ID**: `adagrad`
- **発表年**: 2011
- **Citation数（概算）**: 17,000
- **分野タグ**: 適応的学習率
- **参考文献**: https://jmlr.org/papers/v12/duchi11a.html

**概要**

各パラメータの勾配の2乗を学習開始から累積し，その累積値の平方根で学習率を割ることで，パラメータごとに異なる学習率を自動的に調整する手法である．勾配が頻繁に更新されるパラメータの学習率を小さく，稀にしか更新されないパラメータの学習率を大きくするため，疎なデータに対して有効である．

**更新式**

$$ {\mathbf r}_t = {\mathbf r}_{t-1} + \nabla f_t({\mathbf w}_t)^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{{\mathbf r}_t} + \epsilon} \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［適応的スケーリング］: 勾配2乗の累積によるパラメータごとの学習率スケジューリング
- ミラー降下法 (Mirror Descent)（`mirror_descent`）から［適応的スケーリング，理論的再解釈・一般化］: 勾配履歴に基づくデータ依存の近接項（Bregmanダイバージェンス）の導入
- オンライン勾配降下法 (Online Gradient Descent)（`ogd`）から［適応的スケーリング，理論的再解釈・一般化］: オンライン凸最適化のリグレット解析に基づく適応的学習率の設計

---

## Hogwild!

- **ID**: `hogwild`
- **発表年**: 2011
- **Citation数（概算）**: 2,500
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1106.5730

**概要**

共有メモリ上のパラメータを複数のプロセッサがロックを用いずに非同期にSGDで更新する手法である．問題が疎で各更新が触れるパラメータが少ない場合には，更新の衝突がまれであり，ロックなしでもほぼ線形の高速化と収束が得られることを示した．

**更新式**

$$ \text{各スレッド並列に} : \;\; i \sim \mathrm{Unif}(n), \quad \text{for } v \in e_i : \; w_v \leftarrow w_v - \eta \, [\nabla f_i({\mathbf w})]_v \quad (\text{ロックなし・非同期}) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散化・通信削減］: ロックを用いない共有メモリ上の非同期並列化

---

## SGLD (Stochastic Gradient Langevin Dynamics)

- **ID**: `sgld`
- **発表年**: 2011
- **Citation数（概算）**: 3,000
- **分野タグ**: ベイズ推論，平坦解探索
- **参考文献**: https://www.stats.ox.ac.uk/~teh/research/compstats/WelTeh2011a.pdf

**概要**

SGDの更新に，学習率に応じた大きさのガウス雑音を加えることで，学習率を減衰させるにつれて最適化から事後分布からのサンプリングへと滑らかに移行させる手法である．大規模データに対するベイズ推論を，SGDと同程度の計算量で可能にし，雑音を加えた最適化による平坦な解の探索の理論的な基盤ともなった．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t + \frac{\eta_t}{2} \left( \nabla \log p({\mathbf w}_t) + \frac{N}{n} \sum_{i=1}^{n} \nabla \log p(x_{t_i} | {\mathbf w}_t) \right) + \boldsymbol\xi_t, \quad \boldsymbol\xi_t \sim \mathcal{N}({\mathbf 0}, \eta_t {\mathbf I}) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［平坦化・雑音，問題設定への適用］: 学習率に応じたガウス雑音の付加によるサンプリングへの移行

---

## AdaDelta

- **ID**: `adadelta`
- **発表年**: 2012
- **Citation数（概算）**: 12,000
- **分野タグ**: 適応的学習率，学習率自動調整
- **参考文献**: https://arxiv.org/abs/1212.5701

**概要**

AdaGradの学習率の過度な減衰を，勾配2乗の指数移動平均を用いることで解決する手法である．さらに，過去の更新量の2乗の指数移動平均を分子に用いることで，更新量の単位をパラメータの単位と一致させ，大域的な学習率の設定を不要にしている．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf r}_t = \rho {\mathbf r}_{t-1} + (1 - \rho) {\mathbf g}_t^2, \quad \Delta {\mathbf w}_t = - \frac{\sqrt{{\mathbf s}_{t-1} + \epsilon}}{\sqrt{{\mathbf r}_t + \epsilon}} {\mathbf g}_t, \quad {\mathbf s}_t = \rho {\mathbf s}_{t-1} + (1 - \rho) \Delta {\mathbf w}_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \Delta {\mathbf w}_t $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング，学習率の自動化・スケジュール］: 勾配2乗の指数移動平均と更新量の2乗の移動平均による単位補正（大域的な学習率の不要化）

---

## 適応的リスタート (Adaptive Restart for Accelerated Gradient)

- **ID**: `adaptive_restart`
- **発表年**: 2012
- **Citation数（概算）**: 700
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1204.3982

**概要**

Nesterovの加速勾配法は慣性により関数値が振動する（リップル）ことがあり，強凸性のパラメータを知らなければ最適な収束率が得られない問題に対し，関数値が増加した時点や勾配と更新方向が鋭角をなした時点で慣性をリセット（リスタート）する手法である．パラメータを知らなくても強凸問題で線形収束に近い性能を回復する．

**更新式**

$$ \text{if } f({\mathbf w}_{t}) > f({\mathbf w}_{t-1}) \;\; \text{or} \;\; \nabla f({\mathbf y}_{t-1})^\top ({\mathbf w}_t - {\mathbf w}_{t-1}) > 0 : \;\; \theta_t \leftarrow 1, \; {\mathbf y}_t \leftarrow {\mathbf w}_t \quad (\text{慣性のリセット}) $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，クリッピング・安定化］: 関数値・勾配に基づく慣性の適応的なリセット

---

## ランダム座標降下法 (Randomized Coordinate Descent)

- **ID**: `coordinate_descent`
- **発表年**: 2012
- **Citation数（概算）**: 2,500
- **分野タグ**: 高速化，メモリ効率
- **参考文献**: https://doi.org/10.1137/100802001

**概要**

各反復でランダムに選んだ1つの座標（またはブロック）のみについて，その座標方向の偏微分を用いて更新する手法である．超大規模な問題では全勾配の計算より1座標の偏微分の計算が格段に安価であり，座標ごとのリプシッツ定数に応じたステップ幅により，全体の計算量で勾配法を上回る収束保証が得られることを示した．

**更新式**

$$ i_t \sim p_i \propto L_i^{\alpha}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{1}{L_{i_t}} \nabla_{i_t} f({\mathbf w}_t) \, {\mathbf e}_{i_t} $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［確率化・部分化］: ランダムに選んだ座標（ブロック）のみの更新

---

## Downpour SGD (DistBelief)

- **ID**: `downpour_sgd`
- **発表年**: 2012
- **Citation数（概算）**: 4,500
- **分野タグ**: 分散学習
- **参考文献**: https://papers.nips.cc/paper/4687-large-scale-distributed-deep-networks

**概要**

パラメータサーバーにモデルのパラメータを分割して保持し，多数のモデルの複製（レプリカ）がそれぞれ異なるデータで非同期に勾配を計算・送信する分散学習法である．AdaGradの適応的学習率と組み合わせることで非同期更新の遅延に対して頑健になり，数万コアを用いた大規模な深層ネットワークの学習を可能にした．

**更新式**

$$ \text{レプリカ } k : \;\; {\mathbf w}^{k} \leftarrow \mathrm{fetch}(\text{PS}), \quad {\mathbf g}^{k} = \nabla f_{B_k}({\mathbf w}^{k}), \quad \text{PS} : \; {\mathbf w} \leftarrow {\mathbf w} - \frac{\eta}{\sqrt{{\mathbf r}} + \epsilon} {\mathbf g}^{k} \;\; (\text{非同期，AdaGrad}) $$

**派生元と改善内容**

- Hogwild!（`hogwild`）から［分散化・通信削減］: パラメータサーバーと多数のモデル複製による大規模な非同期化
- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング，分散化・通信削減］: 非同期更新の遅延に頑健な適応的学習率の利用

---

## 勾配クリッピング (Gradient Norm Clipping)

- **ID**: `gradient_clipping`
- **発表年**: 2012
- **Citation数（概算）**: 6,000
- **分野タグ**: 学習安定化
- **参考文献**: https://arxiv.org/abs/1211.5063

**概要**

勾配のノルムが閾値を超えた場合に，方向を保ったまま閾値までノルムを縮小する手法である．再帰型ニューラルネットワークの学習で生じる勾配爆発による不安定な更新を防ぐために提案され，現在ではTransformerを含む深層学習全般で標準的に用いられている．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \tilde{\mathbf g}_t = \min\left( 1, \frac{c}{\|{\mathbf g}_t\|} \right) {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \tilde{\mathbf g}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［クリッピング・安定化］: 勾配ノルムの上限による勾配爆発の抑制

---

## MGDA (Multiple-Gradient Descent Algorithm)

- **ID**: `mgda`
- **発表年**: 2012
- **Citation数（概算）**: 800
- **分野タグ**: マルチタスク・多目的
- **参考文献**: https://doi.org/10.1016/j.crma.2012.03.014

**概要**

複数の目的関数を同時に最小化する多目的最適化において，各目的関数の勾配の凸包の中で最小ノルムとなる点を共通の降下方向として求める手法である．その方向に沿って更新するとすべての目的関数が同時に減少し（またはパレート停留点に到達し），パレート最適解に収束する．

**更新式**

$$ \boldsymbol\alpha^* = \arg\min_{\boldsymbol\alpha \in \Delta_K} \left\| \sum_{k=1}^{K} \alpha_k \nabla f_k({\mathbf w}_t) \right\|^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \sum_{k=1}^{K} \alpha^*_k \nabla f_k({\mathbf w}_t) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［問題設定への適用］: 複数の目的関数の勾配の凸包における最小ノルム点を共通の降下方向とする多目的化

---

## RMSprop (Root Mean Square Propagation)

- **ID**: `rmsprop`
- **発表年**: 2012
- **Citation数（概算）**: 22,000
- **分野タグ**: 適応的学習率
- **参考文献**: http://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf
- **備考**: 論文ではなくHintonのCoursera講義資料（Lecture 6e）で提案されたため，Citation数は講義資料を引用する文献数の概算である．

**概要**

AdaGradが学習開始からの勾配2乗を単純に累積するため，学習が進むにつれ学習率が過度に減衰する問題を解決する手法である．勾配の2乗の指数移動平均（直近の勾配を重視した移動平均）を用いて学習率をスケジューリングすることで，非定常な目的関数に対しても学習率が過度に減衰しないようにする．

**更新式**

$$ {\mathbf r}_t = \rho {\mathbf r}_{t-1} + (1 - \rho) \nabla f_t({\mathbf w}_t)^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{{\mathbf r}_t} + \epsilon} \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング］: 勾配2乗の指数移動平均による学習率スケジューリングへの変更
- Rprop (Resilient Backpropagation)（`rprop`）から［適応的スケーリング，確率化・部分化］: ミニバッチ学習に適用可能な勾配の大きさによる正規化（符号のみの利用からの拡張）

---

## SAG (Stochastic Average Gradient)

- **ID**: `sag`
- **発表年**: 2012
- **Citation数（概算）**: 1,000
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1202.6258

**概要**

有限和の目的関数に対し，各サンプルについて最後に計算した勾配を記憶しておき，毎ステップ1サンプルの勾配のみを更新して，記憶した全勾配の平均方向にパラメータを更新する手法である．SGDと同等の1ステップあたりの計算量で，強凸関数に対しフルバッチの勾配降下法と同様の線形収束を達成する．

**更新式**

$$ {\mathbf y}_i^{t} = \begin{cases} \nabla f_i({\mathbf w}_t) & (i = i_t) \\ {\mathbf y}_i^{t-1} & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{n} \sum_{i=1}^{n} {\mathbf y}_i^{t} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散低減］: サンプルごとの過去の勾配の記憶と，その平均による勾配の分散低減

---

## SDCA (Stochastic Dual Coordinate Ascent)

- **ID**: `sdca`
- **発表年**: 2012
- **Citation数（概算）**: 1,200
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1209.1873

**概要**

正則化付きの損失最小化問題の双対問題に対し，ランダムに選んだ1つの双対変数を厳密または近似的に最適化する座標上昇法である．主変数は双対変数から復元され，SGDと同程度の1ステップの計算量で，強凸問題に対し線形収束を達成する．

**更新式**

$$ \Delta\alpha_i = \arg\max_{\Delta} \left\{ -\phi_i^*(-(\alpha_i + \Delta)) - \frac{\lambda n}{2} \left\| {\mathbf w}_t + \frac{\Delta}{\lambda n} {\mathbf x}_i \right\|^2 \right\}, \quad \alpha_i \leftarrow \alpha_i + \Delta\alpha_i, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \frac{\Delta\alpha_i}{\lambda n} {\mathbf x}_i $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散低減］: 双対問題に対するランダムな座標上昇による分散低減と線形収束

---

## FTRL-Proximal (Follow The Regularized Leader)

- **ID**: `ftrl`
- **発表年**: 2013
- **Citation数（概算）**: 1,500
- **分野タグ**: オンライン学習，正則化，適応的学習率
- **参考文献**: https://doi.org/10.1145/2487575.2488200

**概要**

オンライン学習において，過去のすべての勾配の線形近似に，L1正則化と各時刻の点からの近接項を加えた問題を閉形式で解いて更新する手法である．パラメータごとのAdaGrad型学習率と組み合わせることで，広告のクリック率予測のような超高次元・疎なデータに対し，精度を保ちつつ非常に疎なモデルを得られる．

**更新式**

$$ {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ {\mathbf g}_{1:t}^\top {\mathbf w} + \frac{1}{2} \sum_{s=1}^{t} \sigma_s \|{\mathbf w} - {\mathbf w}_s\|^2 + \lambda_1 \|{\mathbf w}\|_1 \right\}, \quad \sum_{s=1}^{t} \sigma_{s,i} = \frac{\sqrt{\sum_{s \le t} g_{s,i}^2}}{\eta} $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング］: パラメータごとのAdaGrad型学習率の利用
- 双対平均化法 (Dual Averaging)（`dual_averaging`）から［正則化・重み減衰］: 過去の勾配の累積と近接項による閉形式の更新とL1正則化による疎性
- オンライン勾配降下法 (Online Gradient Descent)（`ogd`）から［正則化・重み減衰，理論的再解釈・一般化］: オンライン凸最適化の枠組みでの正則化付きリーダー追従
- RDA (Regularized Dual Averaging)（`rda`）から［正則化・重み減衰］: 正則化付き双対平均化による疎な解

---

## 深層学習におけるNesterov慣性項 (Sutskever et al.)

- **ID**: `sutskever_nag`
- **発表年**: 2013
- **Citation数（概算）**: 6,000
- **分野タグ**: 高速化
- **参考文献**: https://proceedings.mlr.press/v28/sutskever13.html

**概要**

適切な初期化と，徐々に大きくする慣性項の係数のスケジュールを組み合わせれば，慣性項付きSGD（特にNesterov型）だけで，Hessian-Free最適化と同等の性能で深いネットワークや再帰型ネットワークを学習できることを示した研究である．Nesterov法を慣性項付きSGDと同じ形に書き直した定式化は，深層学習フレームワークの標準実装となった．

**更新式**

$$ {\mathbf v}_{t+1} = \mu_t {\mathbf v}_t - \eta \nabla f_t({\mathbf w}_t + \mu_t {\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf v}_{t+1}, \quad \mu_t = \min\left( 1 - 2^{-1 - \log_2(\lfloor t/250 \rfloor + 1)}, \, \mu_{\max} \right) $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，学習率の自動化・スケジュール］: 慣性項付きSGD形式への書き直しと慣性項の係数のスケジュール
- Hessian-Free最適化 (Hessian-Free Optimization)（`hessian_free`）から［慣性項・加速，理論的再解釈・一般化］: 2次手法と同等の性能の1次手法による達成

---

## SVRG (Stochastic Variance Reduced Gradient)

- **ID**: `svrg`
- **発表年**: 2013
- **Citation数（概算）**: 3,500
- **分野タグ**: 勾配分散低減
- **参考文献**: https://papers.nips.cc/paper/2013/hash/ac1dd209cbcc5e5d1c6e28598e8cbbe8-Abstract.html

**概要**

定期的に計算した基準点での全勾配を用いて，確率的勾配を「現在の点と基準点での確率的勾配の差」と「基準点の全勾配」の和に補正する手法である．補正後の勾配は不偏かつ分散が最適解に近づくにつれて0に近づくため，一定の学習率で線形収束する．SAGと異なりサンプルごとの勾配を記憶する必要がない．

**更新式**

$$ \tilde{\boldsymbol\mu} = \nabla F(\tilde{\mathbf w}) = \frac{1}{n} \sum_{i=1}^{n} \nabla f_i(\tilde{\mathbf w}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \nabla f_{i_t}({\mathbf w}_t) - \nabla f_{i_t}(\tilde{\mathbf w}) + \tilde{\boldsymbol\mu} \right) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散低減］: 基準点の全勾配を用いた制御変量による確率的勾配の分散低減
- SAG (Stochastic Average Gradient)（`sag`）から［分散低減，圧縮・量子化・低ランク］: サンプルごとの勾配記憶の，定期的な全勾配計算への置き換え

---

## ZO-SGD (Randomized Stochastic Gradient-Free Method, Ghadimi & Lan)

- **ID**: `zo_sgd`
- **発表年**: 2013
- **Citation数（概算）**: 1,500
- **分野タグ**: ゼロ次手法
- **参考文献**: https://arxiv.org/abs/1309.5549

**概要**

ガウス平滑化に基づくランダムな方向の有限差分による勾配推定を確率的勾配法に組み込み，非凸な確率的最適化問題に対して，関数値のみを用いた場合の停留点への収束の計算量を初めて示した研究である．ゼロ次最適化の非凸問題での理論の基盤となった．

**更新式**

$$ {\mathbf u}_t \sim \mathcal{N}({\mathbf 0}, {\mathbf I}), \quad \hat{\mathbf g}_t = \frac{F({\mathbf w}_t + \mu {\mathbf u}_t, \xi_t) - F({\mathbf w}_t, \xi_t)}{\mu} {\mathbf u}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \hat{\mathbf g}_t $$

**派生元と改善内容**

- SPSA (Simultaneous Perturbation Stochastic Approximation)（`spsa`）から［確率化・部分化，理論的再解釈・一般化］: ガウス平滑化による勾配推定と非凸問題での収束解析

---

## Adam (Adaptive Moment Estimation)

- **ID**: `adam`
- **発表年**: 2014
- **Citation数（概算）**: 190,000
- **分野タグ**: 適応的学習率，高速化
- **参考文献**: https://arxiv.org/abs/1412.6980

**概要**

モーメント法が導入する勾配の1次モーメント（慣性項）と，RMSpropが導入する勾配の2次モーメント（学習率のスケジューリング）の両方を組み合わせた手法である．さらに，学習初期にモーメントの推定値が0に偏るバイアスを補正する機構を導入しており，幅広いタスクで安定して高速に収束するため，深層学習における最も標準的な最適化手法の一つとなっている．

**更新式**

$$ {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \nabla f_t({\mathbf w}_t), \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \nabla f_t({\mathbf w}_t)^2, \quad \hat{\mathbf m}_t = \frac{{\mathbf m}_t}{1 - \beta_1^t}, \quad \hat{\mathbf v}_t = \frac{{\mathbf v}_t}{1 - \beta_2^t}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon} \hat{\mathbf m}_t $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速］: 1次モーメント（慣性項）の導入とバイアス補正
- RMSprop (Root Mean Square Propagation)（`rmsprop`）から［適応的スケーリング］: 2次モーメントによる学習率スケジューリングの導入とバイアス補正

---

## AdaMax

- **ID**: `adamax`
- **発表年**: 2014
- **Citation数（概算）**: なし（null）
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1412.6980
- **備考**: Adamと同一論文（Kingma & Ba, 2014）で提案されたため，独立したCitation数は存在しない（null）．表示時は既定サイズ等で扱うこと．

**概要**

Adamの2次モーメントがL2ノルムに基づく勾配のスケーリングであることに着目し，これをL∞ノルム（過去の勾配の絶対値の指数重み付き最大値）に一般化した手法である．最大値演算を用いるため2次モーメントのバイアス補正が不要であり，数値的に安定した更新が得られる．

**更新式**

$$ {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \nabla f_t({\mathbf w}_t), \quad {\mathbf u}_t = \max(\beta_2 {\mathbf u}_{t-1}, |\nabla f_t({\mathbf w}_t)|), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{1 - \beta_1^t} \frac{{\mathbf m}_t}{{\mathbf u}_t} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，理論的再解釈・一般化］: 2次モーメントのL∞ノルム（指数重み付き最大値）への一般化

---

## EASGD (Elastic Averaging SGD)

- **ID**: `easgd`
- **発表年**: 2014
- **Citation数（概算）**: 900
- **分野タグ**: 分散学習，重み平均化
- **参考文献**: https://arxiv.org/abs/1412.6651

**概要**

各ワーカーのローカルなパラメータと，サーバーが保持する中心のパラメータとを弾性的な力（2乗距離のペナルティ）で結び付けながら学習する分散学習法である．ワーカーが中心から離れて探索することを許容しつつ通信を減らし，非同期・同期の双方で，Downpour SGDより安定して高い性能を示す．

**更新式**

$$ {\mathbf x}^{k}_{t+1} = {\mathbf x}^{k}_{t} - \eta \nabla f_k({\mathbf x}^{k}_t) - \alpha ({\mathbf x}^{k}_t - \tilde{\mathbf x}_t), \quad \tilde{\mathbf x}_{t+1} = \tilde{\mathbf x}_t + \alpha \sum_{k=1}^{K} ({\mathbf x}^{k}_t - \tilde{\mathbf x}_t) $$

**派生元と改善内容**

- Downpour SGD (DistBelief)（`downpour_sgd`）から［分散化・通信削減，重みの平均化・補間］: 中心パラメータとの弾性的な結合による探索と通信削減
- Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)（`polyak_averaging`）から［重みの平均化・補間，分散化・通信削減］: ワーカーのパラメータの平均への弾性的な引き寄せ

---

## OGM (Optimized Gradient Method)

- **ID**: `ogm`
- **発表年**: 2014
- **Citation数（概算）**: 400
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1406.5468

**概要**

滑らかな凸関数に対する1次手法のステップ係数を，性能評価問題（PEP）による最悪ケースの解析を最適化して数値的・解析的に決定した手法である．Nesterovの加速勾配法より最悪ケースの収束の上界が約2倍改善され，後にこの上界が1次手法の下界に一致する（最適である）ことが示された．

**更新式**

$$ {\mathbf y}_{t+1} = {\mathbf w}_t - \frac{1}{L} \nabla f({\mathbf w}_t), \quad {\mathbf w}_{t+1} = {\mathbf y}_{t+1} + \frac{\theta_t - 1}{\theta_{t+1}} ({\mathbf y}_{t+1} - {\mathbf y}_t) + \frac{\theta_t}{\theta_{t+1}} ({\mathbf y}_{t+1} - {\mathbf w}_t) $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，理論的再解釈・一般化］: 性能評価問題（PEP）による最悪ケース最適なステップ係数の導出

---

## 1-bit SGD

- **ID**: `onebit_sgd`
- **発表年**: 2014
- **Citation数（概算）**: 1,200
- **分野タグ**: 分散学習，符号ベース
- **参考文献**: https://www.isca-archive.org/interspeech_2014/seide14_interspeech.html

**概要**

データ並列の分散学習において，勾配を1要素あたり1bitに量子化して通信し，量子化で生じた誤差を次のミニバッチの勾配に加えて持ち越す（誤差フィードバック）手法である．誤差を持ち越すことで精度をほとんど落とさずに通信量を大幅に削減し，音声認識のDNNの学習を複数のGPUで大幅に高速化した．誤差フィードバックの起源とされる．

**更新式**

$$ \tilde{\mathbf g}^k_t = {\mathbf g}^k_t + {\mathbf e}^k_t, \quad {\mathbf q}^k_t = Q_{1\mathrm{bit}}(\tilde{\mathbf g}^k_t), \quad {\mathbf e}^k_{t+1} = \tilde{\mathbf g}^k_t - {\mathbf q}^k_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \sum_k {\mathbf q}^k_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［圧縮・量子化・低ランク，分散化・通信削減］: 勾配の1bit量子化と量子化誤差の次ステップへの持ち越し（誤差フィードバック）

---

## Saddle-Free Newton法

- **ID**: `saddle_free_newton`
- **発表年**: 2014
- **Citation数（概算）**: 1,700
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/1406.2572

**概要**

高次元の非凸最適化では局所最適解よりも鞍点が学習を妨げる主な要因であることを示し，ヘッセ行列の固有値をその絶対値に置き換えた行列で勾配を前処理する手法である．ニュートン法が鞍点に引き寄せられ，勾配法が鞍点付近で停滞するのに対し，負の曲率の方向から素早く離脱できる．

**更新式**

$$ \nabla^2 f({\mathbf w}_t) = {\mathbf U} \boldsymbol\Lambda {\mathbf U}^\top, \quad |{\mathbf H}| = {\mathbf U} |\boldsymbol\Lambda| {\mathbf U}^\top, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - |{\mathbf H}|^{-1} \nabla f({\mathbf w}_t) \;\; (\text{クリロフ部分空間で近似}) $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: ヘッセ行列の固有値の絶対値化による鞍点からの離脱

---

## SAGA

- **ID**: `saga`
- **発表年**: 2014
- **Citation数（概算）**: 2,000
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1407.0202

**概要**

SAGのようにサンプルごとの過去の勾配を記憶しつつ，SVRGと同様の不偏な補正を用いる手法である．SAGの勾配推定がバイアスを持つのに対し，本手法は不偏な推定量を用いるため解析が簡潔になり，近接作用素を用いて非平滑な正則化項を含む問題にも適用できる．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \nabla f_{j}({\mathbf w}_t) - \nabla f_{j}(\boldsymbol\phi_{j}) + \frac{1}{n} \sum_{i=1}^{n} \nabla f_i(\boldsymbol\phi_i) \right), \quad \boldsymbol\phi_{j} \leftarrow {\mathbf w}_t $$

**派生元と改善内容**

- SAG (Stochastic Average Gradient)（`sag`）から［分散低減］: 記憶した勾配を用いた不偏な勾配推定への変更
- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 基準点の全勾配の，記憶した勾配の平均による置き換え

---

## SGHMC (Stochastic Gradient Hamiltonian Monte Carlo)

- **ID**: `sghmc`
- **発表年**: 2014
- **Citation数（概算）**: 1,500
- **分野タグ**: ベイズ推論，高速化
- **参考文献**: https://arxiv.org/abs/1402.4102

**概要**

ハミルトニアン・モンテカルロ法をミニバッチの確率的勾配で実行する手法である．確率的勾配の雑音により目標の分布からずれてしまう問題に対し，摩擦項を加えて雑音の影響を打ち消すことで，正しい事後分布からのサンプリングを可能にする．更新式は慣性項付きSGDに適切な雑音を加えた形となり，SGLDより効率的に事後分布を探索する．

**更新式**

$$ {\mathbf v}_{t+1} = (1 - \alpha) {\mathbf v}_t - \eta \nabla \tilde U({\mathbf w}_t) + \mathcal{N}({\mathbf 0}, 2 (\alpha - \hat\beta) \eta {\mathbf I}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf v}_{t+1} $$

**派生元と改善内容**

- SGLD (Stochastic Gradient Langevin Dynamics)（`sgld`）から［慣性項・加速］: 運動量変数の導入（ハミルトニアン動力学）と摩擦項による雑音補正
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，問題設定への適用］: 慣性項付きSGDへの適切な雑音の付加によるサンプリングへの拡張

---

## Catalyst

- **ID**: `catalyst`
- **発表年**: 2015
- **Citation数（概算）**: 600
- **分野タグ**: 高速化，勾配分散低減
- **参考文献**: https://arxiv.org/abs/1506.02186

**概要**

任意の線形収束する1次最適化手法（SAG，SAGA，SVRG等）を内側の解法として用い，近接点法の外側ループにNesterov型の外挿を加えることで，元の手法を汎用的に加速する枠組みである．条件数の悪い問題で特に大きな高速化をもたらす．

**更新式**

$$ {\mathbf w}_k \approx \arg\min_{{\mathbf w}} \left\{ F({\mathbf w}) + \frac{\kappa}{2} \|{\mathbf w} - {\mathbf y}_{k-1}\|^2 \right\} \;\; (\text{内側の解法 } \mathcal{M} \text{で近似}), \quad {\mathbf y}_k = {\mathbf w}_k + \beta_k ({\mathbf w}_k - {\mathbf w}_{k-1}) $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，正則化・重み減衰］: 近接点法の外側ループへの外挿による汎用的な加速
- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減，慣性項・加速］: 線形収束する分散低減手法の内側の解法としての利用

---

## 周期的学習率 (Cyclical Learning Rates, CLR)

- **ID**: `clr`
- **発表年**: 2015
- **Citation数（概算）**: 3,000
- **分野タグ**: 学習率スケジュール
- **参考文献**: https://arxiv.org/abs/1506.01186

**概要**

学習率を単調に減衰させるのではなく，下限と上限の間で三角波状に周期的に変化させるスケジュールである．学習率を一時的に大きくすることで鞍点の付近から抜け出しやすくなり，学習率の細かな調整なしで良好な精度が得られる．学習率を徐々に増やしながら損失を観察して適切な範囲を決める学習率レンジテストも提案された．

**更新式**

$$ c = \left\lfloor 1 + \frac{t}{2s} \right\rfloor, \quad x = \left| \frac{t}{s} - 2c + 1 \right|, \quad \eta_t = \eta_{\min} + (\eta_{\max} - \eta_{\min}) \max(0, 1 - x) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: 上下限の間での三角波状の周期的な学習率変化

---

## 勾配雑音の付加 (Adding Gradient Noise)

- **ID**: `gradient_noise`
- **発表年**: 2015
- **Citation数（概算）**: 600
- **分野タグ**: 正則化，平坦解探索
- **参考文献**: https://arxiv.org/abs/1511.06807

**概要**

各ステップの勾配に，学習の進行とともに分散が減少するガウス雑音を加える手法である．非常に深いネットワークや複雑な構造のモデルにおいて，初期化の悪さによる学習の失敗を減らし，局所解からの脱出を促すことで，最適化と汎化の性能を改善する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \sigma_t^2 = \frac{\eta}{(1 + t)^{\gamma}}, \quad \tilde{\mathbf g}_t = {\mathbf g}_t + \mathcal{N}({\mathbf 0}, \sigma_t^2 {\mathbf I}), \quad {\mathbf w}_{t+1} = \mathrm{Optimizer}({\mathbf w}_t, \tilde{\mathbf g}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［平坦化・雑音］: 減衰するガウス雑音の勾配への付加
- SGLD (Stochastic Gradient Langevin Dynamics)（`sgld`）から［平坦化・雑音］: 雑音付加の最適化（サンプリングではなく）目的への転用

---

## K-FAC (Kronecker-Factored Approximate Curvature)

- **ID**: `kfac`
- **発表年**: 2015
- **Citation数（概算）**: 1,300
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/1503.05671

**概要**

自然勾配法に必要なフィッシャー情報行列を，層ごとのブロック対角行列で近似し，さらに各ブロックを層への入力の共分散と出力側の勾配の共分散のクロネッカー積で近似する手法である．クロネッカー積の性質により，小さな行列の逆行列のみで自然勾配を計算でき，大規模なニューラルネットワークに自然勾配法を適用可能にした．

**更新式**

$$ {\mathbf F}_l \approx {\mathbf A}_{l-1} \otimes {\mathbf S}_l, \quad {\mathbf A}_{l-1} = \mathbb{E}[{\mathbf a}_{l-1} {\mathbf a}_{l-1}^\top], \quad {\mathbf S}_l = \mathbb{E}[{\mathbf g}_l {\mathbf g}_l^\top], \quad {\mathbf W}_{l,t+1} = {\mathbf W}_{l,t} - \eta \, ({\mathbf S}_l + \gamma {\mathbf I})^{-1} \nabla_{{\mathbf W}_l} f \, ({\mathbf A}_{l-1} + \gamma {\mathbf I})^{-1} $$

**派生元と改善内容**

- 自然勾配法 (Natural Gradient Descent)（`natural_gradient`）から［曲率・前処理，圧縮・量子化・低ランク］: フィッシャー情報行列の層ごとのクロネッカー積近似による計算量の削減

---

## Path-SGD

- **ID**: `path_sgd`
- **発表年**: 2015
- **Citation数（概算）**: 400
- **分野タグ**: 学習安定化，2次手法
- **参考文献**: https://arxiv.org/abs/1506.02617

**概要**

ReLUネットワークでは層間で重みを再スケーリングしても関数が変わらないにもかかわらず，ユークリッド幾何に基づくSGDの更新はこの再スケーリングに依存してしまう問題に対し，入力から出力への全経路の重みの積に基づくパスノルムの下での最急降下法を近似する手法である．再スケーリング不変な更新により，SGDやAdaGradより安定に学習する．

**更新式**

$$ \gamma(w_e) = \sum_{\text{path } p \ni e} \prod_{e' \in p, e' \neq e} w_{e'}^2, \quad w_{e,t+1} = w_{e,t} - \frac{\eta}{\gamma(w_{e,t})} \frac{\partial f}{\partial w_e}({\mathbf w}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［符号化・正規化・直交化，理論的再解釈・一般化］: パスノルムの下での最急降下法による再スケーリング不変な更新

---

## PSGD (Preconditioned Stochastic Gradient Descent)

- **ID**: `psgd`
- **発表年**: 2015
- **Citation数（概算）**: 150
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/1512.04202

**概要**

パラメータの摂動と勾配の摂動の対応関係から，前処理行列を確率的勾配のみを用いてオンラインで推定する手法である．ニュートン法のように前処理後の勾配の摂動がパラメータの摂動と同じスケールになるように前処理行列を学習し，凸・非凸を問わず，また勾配の雑音を自然に抑制できる．後年のKronecker因子版（PSGD Kron）は大規模学習でも用いられる．

**更新式**

$$ \delta{\mathbf g} = \nabla f({\mathbf w}_t + \delta{\mathbf w}) - \nabla f({\mathbf w}_t), \quad {\mathbf P} = \arg\min_{{\mathbf P}} \mathbb{E}\left[ \delta{\mathbf g}^\top {\mathbf P} \, \delta{\mathbf g} + \delta{\mathbf w}^\top {\mathbf P}^{-1} \delta{\mathbf w} \right], \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf P} \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理］: 勾配とパラメータの摂動の対応による前処理行列のオンライン推定
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［曲率・前処理］: 確率的勾配への前処理の適用

---

## pSGLD (Preconditioned SGLD)

- **ID**: `psgld`
- **発表年**: 2015
- **Citation数（概算）**: 500
- **分野タグ**: ベイズ推論，適応的学習率
- **参考文献**: https://arxiv.org/abs/1512.07666

**概要**

SGLDでは全パラメータに同じ大きさのステップと雑音を用いるため，曲率がパラメータごとに大きく異なる深層ニューラルネットワークでは混合が遅い問題に対し，RMSpropと同じ対角の前処理行列でステップ幅と雑音の大きさをパラメータごとに調整する手法である．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf V}_t = \alpha {\mathbf V}_{t-1} + (1 - \alpha) {\mathbf g}_t^2, \quad {\mathbf D}_t = \mathrm{diag}\left( \frac{1}{\lambda + \sqrt{{\mathbf V}_t}} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{2} {\mathbf D}_t {\mathbf g}_t + \mathcal{N}({\mathbf 0}, \eta {\mathbf D}_t) $$

**派生元と改善内容**

- SGLD (Stochastic Gradient Langevin Dynamics)（`sgld`）から［適応的スケーリング］: 対角前処理によるパラメータごとのステップ幅と雑音の調整
- RMSprop (Root Mean Square Propagation)（`rmsprop`）から［適応的スケーリング，問題設定への適用］: RMSprop型の前処理行列のサンプリング手法への導入

---

## 確率的L-BFGS法 (Stochastic L-BFGS with Variance Reduction)

- **ID**: `stochastic_lbfgs`
- **発表年**: 2015
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法，勾配分散低減
- **参考文献**: https://arxiv.org/abs/1508.02087

**概要**

L-BFGS法をミニバッチの確率的勾配で用いると，雑音によりヘッセ逆行列の近似が不安定になる問題に対し，曲率対をサブサンプリングしたヘッセ行列とベクトルの積から計算し，勾配にはSVRGの分散低減を適用した手法である．減衰する学習率を用いずに，強凸な問題で線形収束を達成する．

**更新式**

$$ {\mathbf v}_t = \nabla f_{S}({\mathbf w}_t) - \nabla f_{S}(\tilde{\mathbf w}) + \nabla F(\tilde{\mathbf w}), \quad {\mathbf y}_r = \nabla^2 f_{T}(\bar{\mathbf w}_r) \, {\mathbf s}_r \;\; (\text{サブサンプルしたヘッセ行列との積}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf H}^{(m)}_r {\mathbf v}_t $$

**派生元と改善内容**

- L-BFGS法 (Limited-memory BFGS)（`lbfgs`）から［確率化・部分化，曲率・前処理］: サブサンプルしたヘッセ行列とベクトルの積による安定した曲率対の計算
- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 分散低減した勾配推定の準ニュートン法への適用
- oLBFGS (Online L-BFGS)（`olbfgs`）から［クリッピング・安定化，曲率・前処理］: 確率的L-BFGSの曲率対の安定化

---

## TRPO (Trust Region Policy Optimization)

- **ID**: `trpo`
- **発表年**: 2015
- **Citation数（概算）**: 9,000
- **分野タグ**: 方策最適化，2次手法
- **参考文献**: https://arxiv.org/abs/1502.05477

**概要**

方策の更新前後のKLダイバージェンスが一定値以下という信頼領域の制約の下で，代理目的関数を最大化する方策最適化手法である．単調な性能改善の理論保証に基づき，共役勾配法とフィッシャー行列とベクトルの積で自然勾配方向を求め，直線探索で制約を満たすステップ幅を選ぶことで，大きなニューラルネットワーク方策を安定に学習する．

**更新式**

$$ \max_{\boldsymbol\theta} \; \mathbb{E}\left[ \frac{\pi_{\boldsymbol\theta}(a|s)}{\pi_{\boldsymbol\theta_t}(a|s)} \hat A_t(s, a) \right] \;\; \mathrm{s.t.} \;\; \mathbb{E}\left[ \mathrm{KL}(\pi_{\boldsymbol\theta_t}(\cdot|s) \, \| \, \pi_{\boldsymbol\theta}(\cdot|s)) \right] \le \delta, \quad \boldsymbol\theta_{t+1} = \boldsymbol\theta_t + \alpha^j \sqrt{\frac{2\delta}{{\mathbf s}^\top {\mathbf F} {\mathbf s}}} \, {\mathbf s}, \;\; {\mathbf s} = {\mathbf F}^{-1} {\mathbf g} $$

**派生元と改善内容**

- 自然方策勾配法 (Natural Policy Gradient)（`natural_policy_gradient`）から［クリッピング・安定化，曲率・前処理］: KLダイバージェンスの信頼領域制約と直線探索による単調改善の保証
- Hessian-Free最適化 (Hessian-Free Optimization)（`hessian_free`）から［曲率・前処理］: 共役勾配法とフィッシャー行列とベクトルの積による自然勾配の計算

---

## DP-SGD (Differentially Private SGD)

- **ID**: `dp_sgd`
- **発表年**: 2016
- **Citation数（概算）**: 7,000
- **分野タグ**: 差分プライバシー，学習安定化
- **参考文献**: https://arxiv.org/abs/1607.00133

**概要**

学習データの個々のサンプルに関する情報が学習済みモデルから漏れないよう，差分プライバシーを保証しながら深層学習を行う手法である．サンプルごとの勾配のノルムを閾値でクリッピングして1サンプルの影響を有界にし，集約した勾配にガウス雑音を加えて更新する．プライバシー損失の累積はモーメントアカウンタントで厳密に評価する．

**更新式**

$$ {\mathbf g}_i = \nabla f_i({\mathbf w}_t), \quad \bar{\mathbf g}_i = {\mathbf g}_i \Big/ \max\left( 1, \frac{\|{\mathbf g}_i\|}{C} \right), \quad \tilde{\mathbf g}_t = \frac{1}{|B|} \left( \sum_{i \in B} \bar{\mathbf g}_i + \mathcal{N}({\mathbf 0}, \sigma^2 C^2 {\mathbf I}) \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \tilde{\mathbf g}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［問題設定への適用，平坦化・雑音］: ガウス雑音の付加による差分プライバシーの保証
- 勾配クリッピング (Gradient Norm Clipping)（`gradient_clipping`）から［クリッピング・安定化，問題設定への適用］: サンプルごとの勾配クリッピングによる感度の有界化

---

## Entropy-SGD

- **ID**: `entropy_sgd`
- **発表年**: 2016
- **Citation数（概算）**: 900
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/1611.01838

**概要**

損失そのものではなく，パラメータ近傍で損失を平滑化した局所エントロピーを最小化することで，平坦な領域の解へ誘導する手法である．局所エントロピーの勾配を，内側ループのLangevin動力学（確率的勾配に雑音を加えた更新）によるサンプリングで推定する．

**更新式**

$$ {\mathbf w}'_{k+1} = {\mathbf w}'_k - \eta' \left[ \nabla f({\mathbf w}'_k) - \gamma ({\mathbf w}_t - {\mathbf w}'_k) \right] + \sqrt{\eta'} \, \varepsilon \, \boldsymbol\xi_k, \quad \boldsymbol\mu \leftarrow \alpha \boldsymbol\mu + (1 - \alpha) {\mathbf w}'_{k+1}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \gamma ({\mathbf w}_t - \boldsymbol\mu) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［平坦化・雑音］: 局所エントロピーの最小化（Langevin動力学による内側ループ）
- SGLD (Stochastic Gradient Langevin Dynamics)（`sgld`）から［平坦化・雑音］: 内側ループでのLangevin動力学によるサンプリング

---

## FedAvg (Federated Averaging)

- **ID**: `fedavg`
- **発表年**: 2016
- **Citation数（概算）**: 20,000
- **分野タグ**: 分散学習，重み平均化
- **参考文献**: https://arxiv.org/abs/1602.05629

**概要**

データを各端末（クライアント）に置いたまま学習する連合学習のために，各クライアントでローカルなデータを用いて複数ステップのSGDを行い，サーバーでそれらのパラメータを平均する手法である．通信の頻度を大幅に減らしつつ，データが非独立同一分布（非IID）であっても実用的な精度を達成する．

**更新式**

$$ {\mathbf w}^{k}_{t,0} = {\mathbf w}_t, \quad {\mathbf w}^{k}_{t,i+1} = {\mathbf w}^{k}_{t,i} - \eta \nabla f^{k}({\mathbf w}^{k}_{t,i}) \;\; (i = 0, \dots, E-1), \quad {\mathbf w}_{t+1} = \sum_{k=1}^{K} \frac{n_k}{n} {\mathbf w}^{k}_{t,E} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散化・通信削減，重みの平均化・補間］: 各クライアントでの複数ステップのローカル更新とサーバーでのパラメータ平均

---

## Katyusha

- **ID**: `katyusha`
- **発表年**: 2016
- **Citation数（概算）**: 600
- **分野タグ**: 勾配分散低減，高速化
- **参考文献**: https://arxiv.org/abs/1603.05953

**概要**

SVRGにNesterov型の加速を直接組み合わせた初めての手法である．確率的勾配の雑音によって加速が打ち消される問題に対し，基準点の方向へ引き戻す負の慣性項（Katyusha運動量）を導入することで，有限和の強凸問題に対し最適な加速された収束率を達成する．

**更新式**

$$ {\mathbf x}_{t+1} = \tau_1 {\mathbf z}_t + \tau_2 \tilde{\mathbf w} + (1 - \tau_1 - \tau_2) {\mathbf y}_t, \quad \tilde\nabla_{t+1} = \nabla F(\tilde{\mathbf w}) + \nabla f_i({\mathbf x}_{t+1}) - \nabla f_i(\tilde{\mathbf w}), \quad {\mathbf z}_{t+1} = {\mathbf z}_t - \alpha \tilde\nabla_{t+1}, \quad {\mathbf y}_{t+1} = {\mathbf x}_{t+1} - \frac{1}{3L} \tilde\nabla_{t+1} $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減，慣性項・加速］: 分散低減された勾配推定の加速法への組み込み
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，分散低減］: 基準点への引き戻しを伴う加速（Katyusha運動量）

---

## KFC (Kronecker Factors for Convolution)

- **ID**: `kfc`
- **発表年**: 2016
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/1602.01407

**概要**

K-FACは全結合層を対象としていたため，畳み込み層に対して，空間的な位置ごとの活性と勾配の統計に関する独立性・空間的な均質性などの仮定を置くことで，フィッシャー情報行列のクロネッカー因子近似を導出した手法である．畳み込みネットワークの学習をSGDより少ない反復回数で行える．

**更新式**

$$ {\mathbf F}_\ell \approx \boldsymbol\Omega_{\ell-1} \otimes \boldsymbol\Gamma_\ell, \quad \boldsymbol\Omega_{\ell-1} = \mathbb{E}\left[ \sum_{t \in \mathcal{T}} \llbracket {\mathbf a}_{\ell-1} \rrbracket_t \llbracket {\mathbf a}_{\ell-1} \rrbracket_t^\top \right], \quad \boldsymbol\Gamma_\ell = \frac{1}{|\mathcal{T}|} \mathbb{E}\left[ \sum_{t \in \mathcal{T}} \mathcal{D}{\mathbf s}_{\ell,t} \mathcal{D}{\mathbf s}_{\ell,t}^\top \right] $$

**派生元と改善内容**

- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理］: 畳み込み層へのクロネッカー因子近似の拡張（空間的な均質性の仮定）

---

## Learning to Learn by Gradient Descent by Gradient Descent (L2L)

- **ID**: `l2l`
- **発表年**: 2016
- **Citation数（概算）**: 2,500
- **分野タグ**: 自動探索・メタ学習
- **参考文献**: https://arxiv.org/abs/1606.04474

**概要**

最適化手法の更新則そのものを，パラメータごとに勾配を入力として更新量を出力するLSTMで表現し，学習対象のタスク群に対する最適化性能が高くなるようにメタ学習する手法である．人手で設計された最適化手法を，類似したタスクにおいて上回ることを示し，学習された最適化手法（Learned Optimizer）の研究の起点となった．

**更新式**

$$ \begin{bmatrix} {\mathbf u}_t \\ {\mathbf h}_{t+1} \end{bmatrix} = m(\nabla f({\mathbf w}_t), {\mathbf h}_t; \boldsymbol\phi), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf u}_t, \quad \min_{\boldsymbol\phi} \; \mathbb{E}_f \left[ \sum_{t=1}^{T} \omega_t f({\mathbf w}_t) \right] $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［問題設定への適用］: 更新則のLSTMによるパラメータ化とメタ学習

---

## Nadam (Nesterov-accelerated Adaptive Moment Estimation)

- **ID**: `nadam`
- **発表年**: 2016
- **Citation数（概算）**: 2,500
- **分野タグ**: 適応的学習率，高速化
- **参考文献**: https://openreview.net/forum?id=OM0jvwB8jIp57ZJjtNEZ

**概要**

Adamの1次モーメント（慣性項）を，Nesterovの加速勾配法と同様の先読み型に置き換えた手法である．次ステップの慣性項を現在の更新に前倒しで反映することで，Adamより高速な収束を狙う．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf g}_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon} \left( \beta_1 \hat{\mathbf m}_t + \frac{(1 - \beta_1) {\mathbf g}_t}{1 - \beta_1^t} \right) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［慣性項・加速］: 1次モーメントのNesterov型（先読み型）への置き換え
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速］: 先読みによる加速の適応的学習率手法への導入

---

## QSGD (Quantized SGD)

- **ID**: `qsgd`
- **発表年**: 2016
- **Citation数（概算）**: 2,000
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1610.02132

**概要**

データ並列の分散学習で通信のボトルネックとなる勾配の送受信に対し，勾配をノルムと符号，少数の量子化レベルからなる不偏な確率的量子化で圧縮する手法である．量子化レベル数により通信量と勾配の分散のトレードオフを調整でき，収束保証を保ちつつ通信量を大幅に削減する．

**更新式**

$$ Q_s(g_i) = \|{\mathbf g}\|_2 \, \mathrm{sign}(g_i) \, \xi_i({\mathbf g}, s), \quad \xi_i = \begin{cases} (\ell + 1)/s & (\text{確率 } p = s |g_i| / \|{\mathbf g}\| - \ell) \\ \ell / s & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{K} \sum_{k=1}^{K} Q_s({\mathbf g}^k_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［圧縮・量子化・低ランク，分散化・通信削減］: 勾配の不偏な確率的量子化による通信量の削減

---

## SGD-BB / SVRG-BB

- **ID**: `sgd_bb`
- **発表年**: 2016
- **Citation数（概算）**: 250
- **分野タグ**: 学習率自動調整，勾配分散低減
- **参考文献**: https://arxiv.org/abs/1605.04131

**概要**

Barzilai-Borwein法のステップ幅を確率的勾配法に適用するため，SVRGの外側ループ（エポック）ごとに，基準点の変化量と全勾配の変化量からBBステップ幅を計算する手法である．学習率の事前設定や減衰スケジュールなしに，調整済みの学習率を用いたSVRGやSGDと同等の性能を示す．

**更新式**

$$ \eta_k = \frac{1}{m} \frac{\|\tilde{\mathbf w}_k - \tilde{\mathbf w}_{k-1}\|^2}{(\tilde{\mathbf w}_k - \tilde{\mathbf w}_{k-1})^\top (\nabla F(\tilde{\mathbf w}_k) - \nabla F(\tilde{\mathbf w}_{k-1}))}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_k \left( \nabla f_{i_t}({\mathbf w}_t) - \nabla f_{i_t}(\tilde{\mathbf w}_k) + \nabla F(\tilde{\mathbf w}_k) \right) $$

**派生元と改善内容**

- Barzilai-Borwein法 (BB Step Size)（`barzilai_borwein`）から［学習率の自動化・スケジュール，確率化・部分化］: エポックごとの基準点を用いたBBステップ幅の確率的設定への適用
- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 分散低減した勾配推定との組み合わせ

---

## SGDR (Stochastic Gradient Descent with Warm Restarts, コサイン減衰)

- **ID**: `sgdr`
- **発表年**: 2016
- **Citation数（概算）**: 7,000
- **分野タグ**: 学習率スケジュール
- **参考文献**: https://arxiv.org/abs/1608.03983

**概要**

学習率をコサイン関数に従って最大値から最小値まで滑らかに減衰させ，周期の終わりに学習率を最大値に戻して再開（ウォームリスタート）するスケジュールである．再開ごとに周期を伸ばすことができ，各周期の終わりに得られるモデルはスナップショットアンサンブルにも利用できる．ウォームリスタートなしのコサイン減衰は，現在の深層学習で最も標準的な学習率スケジュールとなっている．

**更新式**

$$ \eta_t = \eta_{\min} + \frac{1}{2} (\eta_{\max} - \eta_{\min}) \left( 1 + \cos\left( \frac{T_{\mathrm{cur}}}{T_i} \pi \right) \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: コサイン減衰と周期的なウォームリスタートによる学習率スケジュール

---

## ASGD (Accelerated Stochastic Gradient Descent, Jain et al.)

- **ID**: `accelerated_sgd`
- **発表年**: 2017
- **Citation数（概算）**: 200
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1704.08227

**概要**

確率的勾配の設定ではHeavy Ball法やNesterov法がSGDに対して加速しないことを示した上で，確率的な設定でも理論的に加速が得られる慣性項付きの手法を提案した研究である．統計的条件数に基づくパラメータ設定により，最小2乗回帰でSGDより速い収束を達成する．

**更新式**

$$ \bar{\mathbf w}_t = \alpha {\mathbf w}_t + (1 - \alpha) {\mathbf v}_t, \quad {\mathbf w}_{t+1} = \bar{\mathbf w}_t - \delta \nabla f_t(\bar{\mathbf w}_t), \quad {\mathbf v}_{t+1} = \beta \bar{\mathbf w}_t + (1 - \beta) {\mathbf v}_t - \gamma \nabla f_t(\bar{\mathbf w}_t) $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，理論的再解釈・一般化］: 確率的勾配の雑音を考慮した加速法の再設計

---

## ACKTR (Actor Critic using Kronecker-Factored Trust Region)

- **ID**: `acktr`
- **発表年**: 2017
- **Citation数（概算）**: 700
- **分野タグ**: 方策最適化，2次手法
- **参考文献**: https://arxiv.org/abs/1708.05144

**概要**

K-FACによるフィッシャー情報行列のクロネッカー積近似を用いて，アクター（方策）とクリティック（価値関数）の双方に信頼領域付きの自然勾配更新を適用する手法である．TRPOのような共役勾配法の反復を不要にし，1次手法のActor-Criticと同程度の計算量で，より高いサンプル効率を達成する．

**更新式**

$$ \Delta\boldsymbol\theta = \hat{\mathbf F}^{-1} \nabla_{\boldsymbol\theta} J \;\; (\hat{\mathbf F} : \text{K-FAC近似}), \quad \eta = \min\left( \eta_{\max}, \sqrt{\frac{2\delta}{\Delta\boldsymbol\theta^\top \hat{\mathbf F} \Delta\boldsymbol\theta}} \right), \quad \boldsymbol\theta_{t+1} = \boldsymbol\theta_t + \eta \, \Delta\boldsymbol\theta $$

**派生元と改善内容**

- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理，問題設定への適用］: K-FACによる自然勾配の方策最適化への適用
- TRPO (Trust Region Policy Optimization)（`trpo`）から［クリッピング・安定化］: 信頼領域によるステップ幅の制御

---

## AD-PSGD (Asynchronous Decentralized Parallel SGD)

- **ID**: `ad_psgd`
- **発表年**: 2017
- **Citation数（概算）**: 600
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1710.06952

**概要**

中央サーバーを持たない分散SGD（D-PSGD）を非同期化し，各ワーカーが他のワーカーの終了を待たずに，ランダムに選んだ近傍のワーカーとのみパラメータを平均する手法である．同期の待ち時間や遅いワーカーの影響を受けにくく，異質な計算環境で高いスループットと収束性を両立する．

**更新式**

$$ {\mathbf g}^{k} = \nabla f_k(\hat{\mathbf w}^{k}) \;\; (\text{古い可能性のあるパラメータ}), \quad j \sim \mathcal{N}(k), \quad {\mathbf w}^{k}, {\mathbf w}^{j} \leftarrow \frac{{\mathbf w}^{k} + {\mathbf w}^{j}}{2}, \quad {\mathbf w}^{k} \leftarrow {\mathbf w}^{k} - \eta {\mathbf g}^{k} $$

**派生元と改善内容**

- D-PSGD (Decentralized Parallel SGD)（`dpsgd`）から［分散化・通信削減］: 非同期なペアごとのゴシップ平均

---

## AdamW (Adam with Decoupled Weight Decay)

- **ID**: `adamw`
- **発表年**: 2017
- **Citation数（概算）**: 16,000
- **分野タグ**: 適応的学習率，正則化
- **参考文献**: https://arxiv.org/abs/1711.05101

**概要**

Adamにおいて重み減衰（Weight Decay）をL2正則化として損失関数に加える実装では，Adamの適応的な学習率のスケーリングが重み減衰の効果にも影響してしまい，正則化の強さが意図した通りに働かない問題がある．本手法は，重み減衰の項をモーメントの計算から分離し，パラメータ更新時に直接適用することで，学習率と正則化の強さを独立に制御できるようにする．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} + \lambda {\mathbf w}_t \right) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［正則化・重み減衰］: 重み減衰(Weight Decay)のモーメント計算からの分離
- 重み減衰 (Weight Decay)（`weight_decay`）から［正則化・重み減衰］: 重み減衰の適応的学習率手法への正しい（分離した）適用

---

## COCOB (COntinuous COin Betting)

- **ID**: `cocob`
- **発表年**: 2017
- **Citation数（概算）**: 150
- **分野タグ**: 学習率自動調整，オンライン学習
- **参考文献**: https://arxiv.org/abs/1705.07795

**概要**

最適化をコイン投げの賭けの問題に帰着させる，学習率を一切持たない手法である．各パラメータについて，これまでの勾配から得た「報酬」に応じて賭け金（初期点からの変位）を決めることで，学習率の調整なしに最適な学習率を用いた場合に近い収束保証を得る．

**更新式**

$$ L_{t,i} = \max(L_{t-1,i}, |g_{t,i}|), \quad G_{t,i} = G_{t-1,i} + |g_{t,i}|, \quad R_{t,i} = \max(R_{t-1,i} - g_{t,i}(w_{t,i} - w_{1,i}), 0), \quad w_{t+1,i} = w_{1,i} + \frac{-\sum_{s \le t} g_{s,i}}{L_{t,i} \max(G_{t,i} + L_{t,i}, \alpha L_{t,i})} (L_{t,i} + R_{t,i}) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール，理論的再解釈・一般化］: コイン投げの賭けへの帰着による学習率の完全な除去

---

## コンセンサス最適化 (Consensus Optimization, The Numerics of GANs)

- **ID**: `consensus_optimization`
- **発表年**: 2017
- **Citation数（概算）**: 500
- **分野タグ**: ミニマックス最適化，学習安定化
- **参考文献**: https://arxiv.org/abs/1705.10461

**概要**

GANの学習の力学のヤコビ行列が，実部が0に近く虚部が大きい固有値を持つために，同時勾配降下が均衡の周りで回転して収束しないことを示し，各プレイヤーの勾配の大きさの2乗を共通の正則化項として加える手法である．均衡付近の固有値の実部を負に押し下げることで収束を安定化する．

**更新式**

$$ L({\mathbf z}) = \frac{1}{2} \|F({\mathbf z})\|^2, \quad {\mathbf z}_{t+1} = {\mathbf z}_t - \eta \left( F({\mathbf z}_t) + \gamma \nabla L({\mathbf z}_t) \right) $$

**派生元と改善内容**

- 最急降下法 (Gradient Descent)（`gd`）から［正則化・重み減衰，問題設定への適用］: 勾配ノルムの2乗による正則化を加えた同時勾配降下

---

## DGC (Deep Gradient Compression)

- **ID**: `dgc`
- **発表年**: 2017
- **Citation数（概算）**: 1,500
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1712.01887

**概要**

分散学習で各ワーカーが送信する勾配のうち，大きさが上位の成分（0.1%程度）のみを送信し，残りはローカルに蓄積して後のステップで送信する勾配の疎化手法である．蓄積に伴う慣性項のずれを補正する慣性項補正や，局所的な勾配クリッピング等を組み合わせ，精度を落とさずに通信量を数百分の1に削減する．

**更新式**

$$ {\mathbf u}^k_t = \mu {\mathbf u}^k_{t-1} + {\mathbf g}^k_t, \quad {\mathbf v}^k_t = {\mathbf v}^k_{t-1} + {\mathbf u}^k_t, \quad \text{送信} : \mathrm{top}_k({\mathbf v}^k_t), \quad {\mathbf v}^k_t \leftarrow {\mathbf v}^k_t \odot \neg \mathrm{mask}, \;\; {\mathbf u}^k_t \leftarrow {\mathbf u}^k_t \odot \neg \mathrm{mask} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［圧縮・量子化・低ランク，分散化・通信削減］: 慣性項補正を伴う上位成分のみの送信とローカルでの残差蓄積

---

## D-PSGD (Decentralized Parallel SGD)

- **ID**: `dpsgd`
- **発表年**: 2017
- **Citation数（概算）**: 1,500
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1705.09056

**概要**

中央のパラメータサーバーを持たず，各ワーカーがネットワーク上の近傍のワーカーとのみパラメータを平均（ゴシップ平均）しながらローカルにSGDを行う分散学習法である．通信が中央のノードに集中しないため，ネットワークの帯域が限られる環境や遅延の大きい環境で，集中型の手法より高速に学習できることを示した．

**更新式**

$$ {\mathbf w}^{k}_{t+1} = \sum_{j \in \mathcal{N}(k)} W_{kj} \, {\mathbf w}^{j}_t - \eta \nabla f^{k}_t({\mathbf w}^{k}_t) \quad ({\mathbf W} : \text{二重確率な混合行列}) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［分散化・通信削減，重みの平均化・補間］: 近傍ノードとのゴシップ平均による中央サーバーを持たない分散化

---

## 進化戦略 (Evolution Strategies as a Scalable Alternative to RL)

- **ID**: `evolution_strategies`
- **発表年**: 2017
- **Citation数（概算）**: 2,500
- **分野タグ**: ゼロ次手法，分散学習
- **参考文献**: https://arxiv.org/abs/1703.03864

**概要**

パラメータにガウス雑音による摂動を加えた多数の個体の報酬（関数値）から，ガウス平滑化した目的関数の勾配を推定してパラメータを更新するゼロ次最適化手法を，強化学習に適用した研究である．各ワーカー間で共有した乱数シードにより，報酬のスカラー値のみを通信すればよく，数千のCPUで線形にスケールすることを示した．

**更新式**

$$ \boldsymbol\epsilon_i \sim \mathcal{N}({\mathbf 0}, {\mathbf I}) \;\; (i = 1, \dots, n), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \eta \frac{1}{n \sigma} \sum_{i=1}^{n} F({\mathbf w}_t + \sigma \boldsymbol\epsilon_i) \, \boldsymbol\epsilon_i $$

**派生元と改善内容**

- SPSA (Simultaneous Perturbation Stochastic Approximation)（`spsa`）から［確率化・部分化，分散化・通信削減］: ガウス平滑化による多数の摂動からの勾配推定と共有乱数シードによる大規模並列化

---

## GradNorm

- **ID**: `gradnorm`
- **発表年**: 2017
- **Citation数（概算）**: 1,800
- **分野タグ**: マルチタスク・多目的，学習安定化
- **参考文献**: https://arxiv.org/abs/1711.02257

**概要**

マルチタスク学習において，各タスクの損失の重みを，共有層に関する各タスクの勾配のノルムが，そのタスクの相対的な学習の進み具合に応じた目標値に揃うように勾配法で動的に調整する手法である．学習の遅いタスクの勾配を大きくすることで，タスク間の学習速度の不均衡を解消する．

**更新式**

$$ G_k = \|\nabla_{{\mathbf W}} \, \alpha_k f_k\|, \quad r_k = \frac{\tilde f_k}{\mathbb{E}_j[\tilde f_j]}, \;\; \tilde f_k = \frac{f_k(t)}{f_k(0)}, \quad \mathcal{L}_{\mathrm{grad}} = \sum_{k} \left| G_k - \bar G \cdot r_k^{\alpha} \right|_1, \quad \alpha_k \leftarrow \alpha_k - \eta_\alpha \nabla_{\alpha_k} \mathcal{L}_{\mathrm{grad}} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［問題設定への適用，適応的スケーリング］: タスクごとの勾配ノルムの均衡化によるタスク重みの動的な調整

---

## 超勾配降下法 (Hypergradient Descent)

- **ID**: `hypergradient`
- **発表年**: 2017
- **Citation数（概算）**: 300
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/1703.04782

**概要**

学習率そのものを最適化対象とし，損失の学習率に関する勾配（超勾配）が現在と直前の勾配の内積で安価に計算できることを利用して，学習中に学習率を勾配降下で更新する手法である．SGD，SGDN，Adamのいずれにも適用でき，初期の学習率への感度を大きく低減する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \eta_t = \eta_{t-1} + \beta \, {\mathbf g}_t^\top {\mathbf g}_{t-1}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf g}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: 学習率に関する超勾配による学習率のオンライン更新
- Adam (Adaptive Moment Estimation)（`adam`）から［学習率の自動化・スケジュール］: Adamの学習率への同一の超勾配更新の適用

---

## バッチサイズの増加 (Don't Decay the Learning Rate, Increase the Batch Size)

- **ID**: `increase_batch_size`
- **発表年**: 2017
- **Citation数（概算）**: 1,200
- **分野タグ**: 学習率スケジュール，大規模バッチ
- **参考文献**: https://arxiv.org/abs/1711.00489

**概要**

SGDの雑音の大きさが学習率とバッチサイズの比で決まることに着目し，学習率を減衰させる代わりに同じ比率でバッチサイズを増加させることで，同等の汎化性能をより少ないパラメータ更新回数で得られることを示した研究である．大規模なバッチでの並列化効率を高め，ImageNetの学習時間を大幅に短縮した．

**更新式**

$$ g \approx \frac{\eta N}{B} \;\; (\text{SGDの雑音の大きさ}), \quad \eta_t \leftarrow \eta_t / \alpha \;\; \Longrightarrow \;\; B_t \leftarrow \alpha B_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta_t}{B_t} \sum_{x \in B_t} \nabla l(x, {\mathbf w}_t) $$

**派生元と改善内容**

- 線形スケーリング則と学習率ウォームアップ (Linear Scaling Rule & Warmup)（`linear_scaling_warmup`）から［学習率の自動化・スケジュール］: 学習率の減衰のバッチサイズの増加への置き換え

---

## LARS (Layer-wise Adaptive Rate Scaling)

- **ID**: `lars`
- **発表年**: 2017
- **Citation数（概算）**: 1,500
- **分野タグ**: 大規模バッチ，適応的学習率
- **参考文献**: https://arxiv.org/abs/1708.03888

**概要**

大規模なミニバッチで学習する際には学習率を大きくする必要があるが，層ごとに重みと勾配のノルムの比が大きく異なるため学習が不安定になる問題を解決する手法である．層ごとに重みのノルムと勾配のノルムの比に基づく局所的な学習率を導入することで，数万規模のバッチサイズでも畳み込みニューラルネットワークを安定に学習できる．

**更新式**

$$ \lambda^l = \eta \frac{\|{\mathbf w}^l_t\|}{\|\nabla f_t({\mathbf w}^l_t)\| + \beta \|{\mathbf w}^l_t\|}, \quad {\mathbf v}^l_{t+1} = \mu {\mathbf v}^l_t + \gamma_t \lambda^l (\nabla f_t({\mathbf w}^l_t) + \beta {\mathbf w}^l_t), \quad {\mathbf w}^l_{t+1} = {\mathbf w}^l_t - {\mathbf v}^l_{t+1} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［適応的スケーリング］: 層ごとの重みと勾配のノルム比に基づく局所的な学習率の導入

---

## 線形スケーリング則と学習率ウォームアップ (Linear Scaling Rule & Warmup)

- **ID**: `linear_scaling_warmup`
- **発表年**: 2017
- **Citation数（概算）**: 4,000
- **分野タグ**: 学習率スケジュール，大規模バッチ
- **参考文献**: https://arxiv.org/abs/1706.02677

**概要**

ミニバッチサイズをk倍にした場合に学習率もk倍にする線形スケーリング則と，学習初期の数エポックで学習率を小さな値から目標値まで徐々に増加させるウォームアップを組み合わせた手法である．これによりバッチサイズ8192でImageNetのResNet-50を1時間で精度を落とさずに学習し，大規模バッチ学習の標準的な手順を確立した．

**更新式**

$$ \eta = k \, \eta_{\mathrm{base}} \;\; (\text{バッチサイズ} \times k), \quad \eta_t = \eta \cdot \min\left( 1, \frac{t}{T_{\mathrm{warmup}}} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \frac{1}{kn} \sum_{x \in B} \nabla l(x, {\mathbf w}_t) $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［学習率の自動化・スケジュール］: バッチサイズに比例した学習率のスケーリングと学習初期のウォームアップ

---

## MAML (Model-Agnostic Meta-Learning)

- **ID**: `maml`
- **発表年**: 2017
- **Citation数（概算）**: 13,000
- **分野タグ**: 自動探索・メタ学習
- **参考文献**: https://arxiv.org/abs/1703.03400

**概要**

多様なタスクに対して，少数のデータで数ステップの勾配降下を行うだけで高い性能が得られるような初期パラメータを学習するメタ学習手法である．内側ループのタスクごとの勾配降下の結果に対する損失を，外側ループで初期パラメータについて微分（2階微分を含む）して最適化する．

**更新式**

$$ \boldsymbol\theta'_i = \boldsymbol\theta - \alpha \nabla_{\boldsymbol\theta} \mathcal{L}_{\mathcal{T}_i}(\boldsymbol\theta), \quad \boldsymbol\theta \leftarrow \boldsymbol\theta - \beta \nabla_{\boldsymbol\theta} \sum_{\mathcal{T}_i} \mathcal{L}_{\mathcal{T}_i}(\boldsymbol\theta'_i) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［問題設定への適用］: 勾配降下の結果を微分する2重ループによる初期パラメータのメタ学習

---

## Meta-SGD

- **ID**: `meta_sgd`
- **発表年**: 2017
- **Citation数（概算）**: 1,000
- **分野タグ**: 自動探索・メタ学習，適応的学習率
- **参考文献**: https://arxiv.org/abs/1707.09835

**概要**

MAMLの初期パラメータに加えて，内側ループのパラメータごとの学習率ベクトル（更新の方向と大きさ）もメタ学習する手法である．1ステップの内側更新で少数ショット学習に適応でき，MAMLより高い性能を示す．

**更新式**

$$ \boldsymbol\theta'_i = \boldsymbol\theta - \boldsymbol\alpha \odot \nabla_{\boldsymbol\theta} \mathcal{L}_{\mathcal{T}_i}(\boldsymbol\theta), \quad (\boldsymbol\theta, \boldsymbol\alpha) \leftarrow (\boldsymbol\theta, \boldsymbol\alpha) - \beta \nabla_{(\boldsymbol\theta, \boldsymbol\alpha)} \sum_{\mathcal{T}_i} \mathcal{L}_{\mathcal{T}_i}(\boldsymbol\theta'_i) $$

**派生元と改善内容**

- MAML (Model-Agnostic Meta-Learning)（`maml`）から［問題設定への適用，適応的スケーリング］: パラメータごとの学習率ベクトルのメタ学習
- Learning to Learn by Gradient Descent by Gradient Descent (L2L)（`l2l`）から［問題設定への適用］: 更新則（学習率）そのもののメタ学習

---

## Natasha2

- **ID**: `natasha2`
- **発表年**: 2017
- **Citation数（概算）**: 250
- **分野タグ**: 2次手法，勾配分散低減
- **参考文献**: https://arxiv.org/abs/1708.08694

**概要**

非凸な確率的最適化において，SVRG型の分散低減と，ヘッセ行列とベクトルの積のみを用いて負の曲率方向を見つけるOja法を組み合わせ，鞍点を回避して近似的な局所最適解（2次の停留点）を求める手法である．SGDより良い計算量で局所最適解に到達することを示した．

**更新式**

$$ \text{if } \lambda_{\min}(\nabla^2 f({\mathbf w}_t)) < -\delta : \; {\mathbf w}_{t+1} = {\mathbf w}_t \pm \frac{\delta}{L_2} {\mathbf v} \;\; ({\mathbf v} : \text{Oja法による負の曲率方向}), \quad \text{else} : \; {\mathbf w}_{t+1} = \mathrm{SVRG}\text{型の正則化付き更新}({\mathbf w}_t) $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減，曲率・前処理］: 分散低減と負の曲率方向の探索の組み合わせによる鞍点回避
- 3次正則化ニュートン法 (Cubic Regularization of Newton's Method)（`cubic_newton`）から［曲率・前処理，理論的再解釈・一般化］: 2次の停留点（局所最適解）への収束保証の1次手法での実現

---

## Neural Optimizer Search (PowerSign / AddSign)

- **ID**: `neural_optimizer_search`
- **発表年**: 2017
- **Citation数（概算）**: 400
- **分野タグ**: 自動探索・メタ学習，符号ベース
- **参考文献**: https://arxiv.org/abs/1709.07417

**概要**

勾配や慣性項などの基本演算を組み合わせた更新則を数式（プログラム）として生成する制御器を強化学習で訓練し，新しい最適化手法を自動的に探索する手法である．発見された更新則のうち，勾配と慣性項の符号の一致度に応じて更新量を拡大・縮小するPowerSignとAddSignは，人手で設計された手法と同等以上の性能を示し，他のタスクへも転移した．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \text{(PowerSign)} \;\; {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, \alpha^{\mathrm{sign}({\mathbf g}_t) \odot \mathrm{sign}({\mathbf m}_t)} \odot {\mathbf g}_t, \quad \text{(AddSign)} \;\; {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, (\alpha + \mathrm{sign}({\mathbf g}_t) \odot \mathrm{sign}({\mathbf m}_t)) \odot {\mathbf g}_t $$

**派生元と改善内容**

- Learning to Learn by Gradient Descent by Gradient Descent (L2L)（`l2l`）から［問題設定への適用］: ニューラルネットワークではなく解釈可能な数式としての更新則の強化学習による探索
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，符号化・正規化・直交化］: 勾配と慣性項の符号の一致度による更新量の調整

---

## 1cycle方策 (One Cycle Policy, Super-Convergence)

- **ID**: `one_cycle`
- **発表年**: 2017
- **Citation数（概算）**: 1,500
- **分野タグ**: 学習率スケジュール，高速化
- **参考文献**: https://arxiv.org/abs/1708.07120

**概要**

学習全体で学習率を小さな値から非常に大きな値まで増加させた後に再び減少させる1周期のスケジュールを，慣性項の係数を逆向きに変化させることと組み合わせる手法である．大きな学習率が正則化として働き，従来より1桁少ない反復回数で同等の精度に到達する現象（Super-Convergence）を示した．

**更新式**

$$ \eta_t = \begin{cases} \eta_{\min} + (\eta_{\max} - \eta_{\min}) \frac{t}{T/2} & (t \le T/2) \\ \eta_{\max} - (\eta_{\max} - \eta_{\min}) \frac{t - T/2}{T/2} & (t > T/2) \end{cases}, \quad \beta_t : \beta_{\max} \to \beta_{\min} \to \beta_{\max} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［学習率の自動化・スケジュール，慣性項・加速］: 学習率と慣性項の係数の逆位相の1周期スケジュール
- SGDR (Stochastic Gradient Descent with Warm Restarts, コサイン減衰)（`sgdr`）から［学習率の自動化・スケジュール］: 周期的な学習率変化の単一周期・大振幅への変更
- 周期的学習率 (Cyclical Learning Rates, CLR)（`clr`）から［学習率の自動化・スケジュール］: 周期的学習率の単一周期化

---

## 楽観的勾配法 (Optimistic Gradient Descent / Optimistic Adam)

- **ID**: `optimistic_gd`
- **発表年**: 2017
- **Citation数（概算）**: 600
- **分野タグ**: ミニマックス最適化，オンライン学習
- **参考文献**: https://arxiv.org/abs/1711.00141

**概要**

GANの学習で生じる振動（極限周期）に対し，前ステップの勾配を予測値として用い，今回の勾配の2倍から前回の勾配を引いた方向に更新する楽観的ミラー降下法を適用した手法である．Extragradient法と同様の先読み効果を，1ステップあたり1回の勾配計算で実現し，双線形なゲームで最終反復が均衡に収束する．Adamに適用したOptimistic Adamも提案された．

**更新式**

$$ {\mathbf z}_{t+1} = {\mathbf z}_t - 2 \eta \, F({\mathbf z}_t) + \eta \, F({\mathbf z}_{t-1}) $$

**派生元と改善内容**

- Extragradient法 (Extragradient Method)（`extragradient`）から［慣性項・加速］: 前ステップの勾配を予測値とした1回の勾配計算での先読み
- オンライン勾配降下法 (Online Gradient Descent)（`ogd`）から［問題設定への適用］: 楽観的オンライン学習（予測を用いたミラー降下法）の鞍点問題への適用

---

## PPO (Proximal Policy Optimization)

- **ID**: `ppo`
- **発表年**: 2017
- **Citation数（概算）**: 25,000
- **分野タグ**: 方策最適化
- **参考文献**: https://arxiv.org/abs/1707.06347

**概要**

TRPOの信頼領域制約を，新旧の方策の確率比をクリッピングした代理目的関数に置き換えた方策最適化手法である．2次の計算を必要とせず，同じデータで複数エポックのミニバッチSGD（Adam）による更新が可能となり，実装の簡単さと安定性から，強化学習や大規模言語モデルのRLHFで最も広く用いられる手法の一つとなった．

**更新式**

$$ r_t(\boldsymbol\theta) = \frac{\pi_{\boldsymbol\theta}(a_t|s_t)}{\pi_{\boldsymbol\theta_{\mathrm{old}}}(a_t|s_t)}, \quad L^{\mathrm{CLIP}}(\boldsymbol\theta) = \mathbb{E}_t\left[ \min\left( r_t(\boldsymbol\theta) \hat A_t, \; \mathrm{clip}(r_t(\boldsymbol\theta), 1 - \epsilon, 1 + \epsilon) \hat A_t \right) \right], \quad \boldsymbol\theta \leftarrow \mathrm{Adam}(\nabla_{\boldsymbol\theta} L^{\mathrm{CLIP}}) $$

**派生元と改善内容**

- TRPO (Trust Region Policy Optimization)（`trpo`）から［クリッピング・安定化］: 信頼領域制約の確率比のクリッピングによる1次手法での近似
- Adam (Adaptive Moment Estimation)（`adam`）から［問題設定への適用］: 代理目的関数の複数エポックのミニバッチ最適化

---

## SARAH (StochAstic Recursive grAdient algoritHm)

- **ID**: `sarah`
- **発表年**: 2017
- **Citation数（概算）**: 800
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1703.00102

**概要**

SVRGが固定した基準点の全勾配を用いて補正するのに対し，直前の反復の勾配推定値を再帰的に更新して用いる手法である．推定量はバイアスを持つが，内側ループの中で推定値の分散が減少していくため，非凸問題を含めてより良い計算量が得られる．

**更新式**

$$ {\mathbf v}_0 = \nabla F({\mathbf w}_0), \quad {\mathbf v}_t = \nabla f_{i_t}({\mathbf w}_t) - \nabla f_{i_t}({\mathbf w}_{t-1}) + {\mathbf v}_{t-1}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf v}_t $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 固定基準点ではなく直前の推定値を用いる再帰的な勾配推定

---

## SWATS (Switching from Adam to SGD)

- **ID**: `swats`
- **発表年**: 2017
- **Citation数（概算）**: 600
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1712.07628

**概要**

学習初期はAdamで高速に学習し，適切な時点でSGDに切り替えることで，Adamの収束の速さとSGDの汎化性能を両立させる手法である．Adamの更新量を勾配方向へ射影した値の移動平均から，切り替え後のSGDの学習率を自動的に推定し，その推定値が安定した時点で切り替える．

**更新式**

$$ {\mathbf p}_t = -\eta \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad \gamma_t = \frac{{\mathbf p}_t^\top {\mathbf p}_t}{-{\mathbf p}_t^\top {\mathbf g}_t}, \quad \lambda_t = \beta_2 \lambda_{t-1} + (1 - \beta_2) \gamma_t, \quad \text{if } \left| \frac{\lambda_t}{1 - \beta_2^t} - \gamma_t \right| < \epsilon : \; \text{SGD}(\eta_{\mathrm{SGD}} = \lambda_t / (1 - \beta_2^t)) \text{へ切替} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［学習率の自動化・スケジュール］: 学習途中でのSGDへの切り替え
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: Adamの更新量から推定した学習率によるSGDへの移行

---

## TernGrad

- **ID**: `terngrad`
- **発表年**: 2017
- **Citation数（概算）**: 1,000
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1705.07878

**概要**

勾配を，各成分をその最大絶対値で正規化した確率で−1，0，+1の3値に確率的に量子化して通信する手法である．量子化は不偏であり，層ごとのスケーリングと勾配クリッピングを組み合わせることで，通信量を大幅に削減しつつ，収束保証と精度を保つ．

**更新式**

$$ s_t = \|{\mathbf g}_t\|_\infty, \quad \tilde{\mathbf g}_t = s_t \cdot \mathrm{sign}({\mathbf g}_t) \odot {\mathbf b}_t, \quad b_{t,i} \sim \mathrm{Bernoulli}\left( \frac{|g_{t,i}|}{s_t} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{K} \sum_{k} \tilde{\mathbf g}^k_t $$

**派生元と改善内容**

- QSGD (Quantized SGD)（`qsgd`）から［圧縮・量子化・低ランク］: 3値への不偏な確率的量子化
- 1-bit SGD（`onebit_sgd`）から［圧縮・量子化・低ランク］: 1bitから3値への量子化レベルの拡張（誤差フィードバックの代わりに不偏量子化）

---

## TTUR (Two Time-Scale Update Rule)

- **ID**: `ttur`
- **発表年**: 2017
- **Citation数（概算）**: 10,000
- **分野タグ**: ミニマックス最適化，学習率スケジュール
- **参考文献**: https://arxiv.org/abs/1706.08500
- **備考**: 同論文で提案された評価指標FIDの引用が大半を占めるため，Citation数はTTURの影響力を過大に表す．

**概要**

GANの生成器と識別器に異なる学習率（2つの時間スケール）を用いて更新する手法である．確率近似の2時間スケール理論に基づき，識別器を生成器より速く学習させることで，局所ナッシュ均衡への収束が保証されることを示した．同論文では生成画像の品質評価指標FIDも提案されている．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - b(t) \, \tilde{\mathbf g}_{\mathbf w}({\mathbf w}_t, \boldsymbol\theta_t), \quad \boldsymbol\theta_{t+1} = \boldsymbol\theta_t - a(t) \, \tilde{\mathbf g}_{\boldsymbol\theta}({\mathbf w}_t, \boldsymbol\theta_t), \quad \frac{a(t)}{b(t)} \to 0 \quad ({\mathbf w} : \text{識別器}, \; \boldsymbol\theta : \text{生成器}) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［学習率の自動化・スケジュール，問題設定への適用］: 生成器と識別器での異なる学習率（2時間スケール）の利用

---

## AcceleGrad

- **ID**: `accelegrad`
- **発表年**: 2018
- **Citation数（概算）**: 200
- **分野タグ**: 高速化，学習率自動調整
- **参考文献**: https://arxiv.org/abs/1809.02864

**概要**

AdaGrad型の適応的学習率と，2つの系列を線形に結合する加速勾配法型の更新を組み合わせた手法である．滑らかさの定数を事前に知らなくても，滑らかな場合は加速された収束率O(1/T^2)を，一般の場合はO(1/√T)を達成する（普遍性）．

**更新式**

$$ \tau_t = \frac{1}{\alpha_t}, \quad {\mathbf x}_{t+1} = \tau_t {\mathbf z}_t + (1 - \tau_t) {\mathbf y}_t, \quad \eta_t = \frac{2D}{\sqrt{G^2 + \sum_{i \le t} \alpha_i^2 \|{\mathbf g}_i\|^2}}, \quad {\mathbf z}_{t+1} = \Pi_{\mathcal{K}}({\mathbf z}_t - \alpha_t \eta_t {\mathbf g}_t), \quad {\mathbf y}_{t+1} = {\mathbf x}_{t+1} - \eta_t {\mathbf g}_t $$

**派生元と改善内容**

- AdaGrad-Norm（`adagrad_norm`）から［慣性項・加速，学習率の自動化・スケジュール］: AdaGrad型の適応的学習率の加速法への組み込み
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速］: 2系列の線形結合による加速（滑らかさの定数が未知でも成立）

---

## Adafactor

- **ID**: `adafactor`
- **発表年**: 2018
- **Citation数（概算）**: 1,500
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/1804.04235

**概要**

Adamの2次モーメントは全パラメータと同サイズのメモリを必要とする問題に対し，行列形状のパラメータについて2次モーメントを行方向・列方向の和の外積で低ランク近似（因子分解）する手法である．加えて，更新量のRMSによるクリッピングとパラメータのスケールに比例する相対的なステップ幅を導入し，1次モーメントを省略しても安定に学習できるようにしている．

**更新式**

$$ {\mathbf G}_t = \nabla f_t({\mathbf W}_t), \quad {\mathbf R}_t = \hat\beta_{2t} {\mathbf R}_{t-1} + (1 - \hat\beta_{2t}) ({\mathbf G}_t^2) {\mathbf 1}_m, \quad {\mathbf C}_t = \hat\beta_{2t} {\mathbf C}_{t-1} + (1 - \hat\beta_{2t}) {\mathbf 1}_n^\top ({\mathbf G}_t^2), \quad \hat{\mathbf V}_t = \frac{{\mathbf R}_t {\mathbf C}_t}{{\mathbf 1}_n^\top {\mathbf R}_t}, \quad {\mathbf U}_t = \frac{{\mathbf G}_t}{\sqrt{\hat{\mathbf V}_t}}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \alpha_t \frac{{\mathbf U}_t}{\max(1, \mathrm{RMS}({\mathbf U}_t) / d)} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［圧縮・量子化・低ランク，クリッピング・安定化］: 2次モーメントの行・列方向への因子分解によるメモリ削減と，更新量のクリッピング・相対的なステップ幅の導入

---

## AdaGrad-Norm

- **ID**: `adagrad_norm`
- **発表年**: 2018
- **Citation数（概算）**: 600
- **分野タグ**: 適応的学習率，学習率自動調整
- **参考文献**: https://arxiv.org/abs/1806.01811

**概要**

AdaGradのパラメータごとの学習率を，勾配ノルムの2乗の累積による単一のスカラーの学習率に簡略化した手法である．非凸な問題において，滑らかさの定数などを知らずとも，適切に調整したSGDとほぼ同等の収束率を達成することが示され，学習率調整不要の手法群の基盤となった．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad b_t^2 = b_{t-1}^2 + \|{\mathbf g}_t\|^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{b_t} {\mathbf g}_t $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング，学習率の自動化・スケジュール］: 勾配ノルムの累積による単一のスカラー学習率への簡略化

---

## AdaShift

- **ID**: `adashift`
- **発表年**: 2018
- **Citation数（概算）**: 100
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1810.00143

**概要**

Adamが収束しない原因を，現在の勾配と2次モーメントの推定値との相関にあると分析し，n ステップ前の勾配を用いて2次モーメントを計算する（時間的にずらす）ことで両者の相関を除去する手法である．2次モーメントを空間方向にもまとめることで，実効的な学習率の偏りを抑える．

**更新式**

$$ {\mathbf m}_t = \frac{\sum_{i=0}^{n-1} \beta_1^i {\mathbf g}_{t-i}}{\sum_{i=0}^{n-1} \beta_1^i}, \quad v_t = \beta_2 v_{t-1} + (1 - \beta_2) \, \phi({\mathbf g}_{t-n}^2), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{v_t}} {\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング］: 2次モーメントの計算に過去の勾配を用いた相関の除去

---

## AggMo (Aggregated Momentum)

- **ID**: `aggmo`
- **発表年**: 2018
- **Citation数（概算）**: 100
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1804.00325

**概要**

減衰率の異なる複数の慣性項を並列に保持し，それらの平均で更新する手法である．大きな減衰率の慣性項による加速と，小さな減衰率の慣性項による振動の抑制を両立し，大きな減衰率でも学習が安定する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf v}^{(i)}_t = \beta^{(i)} {\mathbf v}^{(i)}_{t-1} - {\mathbf g}_t \;\; (i = 1, \dots, K), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \frac{\eta}{K} \sum_{i=1}^{K} {\mathbf v}^{(i)}_t $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速］: 減衰率の異なる複数の慣性項の集約

---

## AMSGrad

- **ID**: `amsgrad`
- **発表年**: 2018
- **Citation数（概算）**: 3,500
- **分野タグ**: 適応的学習率
- **参考文献**: https://openreview.net/forum?id=ryQu7f-RZ

**概要**

Adamが単純な凸問題でも収束しない反例を示し，その原因が2次モーメントの指数移動平均により実効的な学習率が増加し得ることにあると指摘した手法である．2次モーメントの過去の最大値を用いて学習率を正規化することで，実効的な学習率が単調非増加となり，収束性が保証される．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf g}_t^2, \quad \hat{\mathbf v}_t = \max(\hat{\mathbf v}_{t-1}, {\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon} {\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，クリッピング・安定化］: 2次モーメントの過去の最大値による正規化（実効的な学習率の単調非増加化と収束保証）

---

## EKFAC (Eigenvalue-corrected K-FAC)

- **ID**: `ekfac`
- **発表年**: 2018
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/1806.03884

**概要**

K-FACのクロネッカー積近似の固有基底を用い，その基底上での対角スケーリング（固有値）をクロネッカー積から求めるのではなく，勾配の2乗から直接推定し直す手法である．K-FACより正確なフィッシャー情報行列の近似が得られ，対角スケーリングは安価に頻繁な更新が可能である．SOAPの考え方の先駆けとなった．

**更新式**

$$ {\mathbf A} = {\mathbf U}_A \boldsymbol\Lambda_A {\mathbf U}_A^\top, \quad {\mathbf S} = {\mathbf U}_S \boldsymbol\Lambda_S {\mathbf U}_S^\top, \quad {\mathbf s}^* = \mathbb{E}\left[ \left( {\mathbf U}_S^\top \nabla_{\mathbf W} f \, {\mathbf U}_A \right)^2 \right], \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf U}_S \left( \frac{{\mathbf U}_S^\top \nabla_{\mathbf W} f \, {\mathbf U}_A}{{\mathbf s}^* + \epsilon} \right) {\mathbf U}_A^\top $$

**派生元と改善内容**

- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理］: クロネッカー因子の固有基底上での対角スケーリングの直接推定

---

## FedProx

- **ID**: `fedprox`
- **発表年**: 2018
- **Citation数（概算）**: 5,000
- **分野タグ**: 分散学習，正則化
- **参考文献**: https://arxiv.org/abs/1812.06127

**概要**

連合学習においてクライアント間でデータ分布や計算能力が大きく異なる場合に，FedAvgのローカル更新がグローバルモデルから大きく乖離して収束が不安定になる問題に対し，ローカルの目的関数にグローバルモデルからの距離に関する近接項を加える手法である．クライアントごとに異なる量のローカル計算を許容しつつ，収束を安定化する．

**更新式**

$$ {\mathbf w}^{k}_{t+1} \approx \arg\min_{{\mathbf w}} \left\{ f_k({\mathbf w}) + \frac{\mu}{2} \|{\mathbf w} - {\mathbf w}_t\|^2 \right\}, \quad {\mathbf w}_{t+1} = \sum_{k} \frac{n_k}{n} {\mathbf w}^{k}_{t+1} $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［正則化・重み減衰］: ローカル目的関数へのグローバルモデルとの近接項の追加

---

## GGT (Full-Matrix Adaptive Regularization)

- **ID**: `ggt`
- **発表年**: 2018
- **Citation数（概算）**: 100
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/1806.02958

**概要**

全行列版AdaGradは理論的には優れるが，パラメータ数の2乗のサイズの行列とその逆平方根の計算が必要で実用的でない問題に対し，直近の少数の勾配からなる低ランク行列を用いて，その逆平方根を小さな行列の固有値分解から効率的に計算する手法である．GPU上で全行列の適応的正則化を実用的なコストで実現した．

**更新式**

$$ {\mathbf G}_t = [{\mathbf g}_t, \beta {\mathbf g}_{t-1}, \dots, \beta^{r-1} {\mathbf g}_{t-r+1}], \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( ({\mathbf G}_t {\mathbf G}_t^\top)^{1/2} + \epsilon {\mathbf I} \right)^{-1} {\mathbf g}_t \;\; (r \times r \text{行列の固有値分解で計算}) $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［曲率・前処理，圧縮・量子化・低ランク］: 直近の勾配の窓による低ランク化での全行列版の実用化

---

## L4 (Practical Loss-based Stepsize Adaptation)

- **ID**: `l4`
- **発表年**: 2018
- **Citation数（概算）**: 100
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/1802.05074

**概要**

損失を1ステップで目標値（これまでの最小損失より一定割合だけ小さい値）まで線形近似で下げるように学習率を決める手法である．Polyakステップサイズの考え方を，Adam等の任意の更新方向に適用でき，学習率の調整なしで調整済みの手法と同等以上の性能を示す．

**更新式**

$$ \eta_t = \alpha \frac{f({\mathbf w}_t) - \hat f_{\min}}{{\mathbf g}_t^\top {\mathbf v}_t}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf v}_t \quad ({\mathbf v}_t : \text{Adam等による更新方向}) $$

**派生元と改善内容**

- Polyakステップサイズ (Polyak Step Size)（`polyak_step`）から［学習率の自動化・スケジュール］: 目標損失の推定と任意の更新方向への適用
- Adam (Adaptive Moment Estimation)（`adam`）から［学習率の自動化・スケジュール］: Adamの更新方向に対する学習率の自動設定

---

## Local SGD

- **ID**: `local_sgd`
- **発表年**: 2018
- **Citation数（概算）**: 1,200
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1805.09767

**概要**

複数のワーカーがそれぞれ独立に複数ステップのSGDを行い，一定間隔でのみパラメータを平均する分散学習法の収束解析を与えた研究である．通信回数を大幅に削減しても，ワーカー数に対して線形な高速化（ミニバッチSGDと同等の収束率）が得られることを示した．

**更新式**

$$ {\mathbf w}^{k}_{t+1} = \begin{cases} \frac{1}{K} \sum_{j=1}^{K} \left( {\mathbf w}^{j}_t - \eta \nabla f^{j}_t({\mathbf w}^{j}_t) \right) & (t + 1 \bmod H = 0) \\ {\mathbf w}^{k}_t - \eta \nabla f^{k}_t({\mathbf w}^{k}_t) & (\mathrm{otherwise}) \end{cases} $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［理論的再解釈・一般化，分散化・通信削減］: 独立同一分布のデータ並列設定での収束解析と線形な高速化の保証
- EASGD (Elastic Averaging SGD)（`easgd`）から［重みの平均化・補間，分散化・通信削減］: ワーカー間の周期的なパラメータの平均化

---

## MGDA-UB (Multi-Task Learning as Multi-Objective Optimization)

- **ID**: `mgda_ub`
- **発表年**: 2018
- **Citation数（概算）**: 1,800
- **分野タグ**: マルチタスク・多目的
- **参考文献**: https://arxiv.org/abs/1810.04650

**概要**

深層学習のマルチタスク学習を多目的最適化として定式化し，MGDAを適用する際に，タスクごとの勾配を全パラメータについて計算するコストを避けるため，共有表現（エンコーダ出力）に関する勾配で上界を最小化する近似を導入した手法である．単一の逆伝播でMGDAの重みを求められ，タスクの重みの手動調整なしにパレート最適解を得る．

**更新式**

$$ \boldsymbol\alpha^* = \arg\min_{\boldsymbol\alpha \in \Delta_K} \left\| \sum_{k=1}^{K} \alpha_k \nabla_{{\mathbf Z}} f_k \right\|^2 \;\; ({\mathbf Z} : \text{共有表現}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla_{{\mathbf w}} \sum_{k} \alpha^*_k f_k({\mathbf w}_t) $$

**派生元と改善内容**

- MGDA (Multiple-Gradient Descent Algorithm)（`mgda`）から［問題設定への適用］: 共有表現に関する勾配による上界の最小化（深層学習への効率的な適用）

---

## Padam (Partially Adaptive Momentum Estimation)

- **ID**: `padam`
- **発表年**: 2018
- **Citation数（概算）**: 400
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1806.06763

**概要**

AMSGradの2次モーメントによる正規化の指数（平方根，すなわち1/2乗）を0から1/2の間の値pに一般化した手法である．pを小さくするほどSGDに近づくため，適応的手法の高速な収束とSGDの汎化性能の中間的な振る舞いを調整できる．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \hat{\mathbf v}_t = \max(\hat{\mathbf v}_{t-1}, {\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{{\mathbf m}_t}{\hat{\mathbf v}_t^{\,p}} \quad (0 < p \le 1/2) $$

**派生元と改善内容**

- AMSGrad（`amsgrad`）から［適応的スケーリング］: 2次モーメントによる正規化の指数の部分化（SGDとの中間）

---

## QHM (Quasi-Hyperbolic Momentum) / QHAdam

- **ID**: `qhm`
- **発表年**: 2018
- **Citation数（概算）**: 200
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1810.06801

**概要**

慣性項による更新と現在の勾配による更新を重み付き平均する手法である．この単純な形式で，Nesterov法や他の多くの慣性項の変種を特殊ケースとして表現でき，Adamに同様の修正を加えたQHAdamも提案されている．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta {\mathbf m}_{t-1} + (1 - \beta) {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left[ (1 - \nu) {\mathbf g}_t + \nu {\mathbf m}_t \right] $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，理論的再解釈・一般化］: 慣性項と現在の勾配の重み付き平均（Nesterov法等の統一表現）

---

## Reptile

- **ID**: `reptile`
- **発表年**: 2018
- **Citation数（概算）**: 1,700
- **分野タグ**: 自動探索・メタ学習，重み平均化
- **参考文献**: https://arxiv.org/abs/1803.02999

**概要**

MAMLの2階微分を不要にした1次のメタ学習手法である．タスクごとに数ステップのSGDを行い，得られたパラメータの方向へ初期パラメータを少しずつ移動させるだけという単純な更新で，MAMLと同等の性能を示す．更新はタスク間で勾配の内積を大きくする（汎化を促す）効果を持つ．

**更新式**

$$ \tilde{\boldsymbol\theta} = \mathrm{SGD}^{k}(\mathcal{L}_{\mathcal{T}}, \boldsymbol\theta), \quad \boldsymbol\theta \leftarrow \boldsymbol\theta + \epsilon (\tilde{\boldsymbol\theta} - \boldsymbol\theta) $$

**派生元と改善内容**

- MAML (Model-Agnostic Meta-Learning)（`maml`）から［問題設定への適用］: 2階微分を用いない1次のメタ更新への簡略化
- Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)（`polyak_averaging`）から［重みの平均化・補間］: 内側の最適化の到達点への補間による平均化的な更新

---

## SGA (Symplectic Gradient Adjustment)

- **ID**: `sga`
- **発表年**: 2018
- **Citation数（概算）**: 300
- **分野タグ**: ミニマックス最適化
- **参考文献**: https://arxiv.org/abs/1802.05642

**概要**

多人数の微分可能なゲームの力学を，ヤコビ行列の対称部分（ポテンシャルゲーム）と反対称部分（ハミルトニアンゲーム）に分解し，回転を生む反対称部分を打ち消す方向に勾配を調整する手法である．調整の符号を自動的に選ぶことで，安定な固定点に引き寄せられ不安定な固定点からは離れる．

**更新式**

$$ {\mathbf J} = {\mathbf S} + {\mathbf A}, \;\; {\mathbf A} = \frac{{\mathbf J} - {\mathbf J}^\top}{2}, \quad \boldsymbol\xi_\lambda = \boldsymbol\xi + \lambda {\mathbf A}^\top \boldsymbol\xi, \quad {\mathbf z}_{t+1} = {\mathbf z}_t - \eta \, \boldsymbol\xi_\lambda({\mathbf z}_t) $$

**派生元と改善内容**

- コンセンサス最適化 (Consensus Optimization, The Numerics of GANs)（`consensus_optimization`）から［問題設定への適用，理論的再解釈・一般化］: ヤコビ行列の反対称部分のみによる回転の打ち消し

---

## Shampoo

- **ID**: `shampoo`
- **発表年**: 2018
- **Citation数（概算）**: 400
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/1802.09568

**概要**

全行列版AdaGradの前処理行列（勾配の外積の累積）を，行列形状のパラメータについて行方向と列方向の2つの小さな前処理行列のクロネッカー積で近似する手法である．各前処理行列の-1/4乗を勾配の左右から掛けることで，パラメータ間の相関を考慮した前処理を現実的な計算量で実現する．近年は大規模学習の最適化手法ベンチマークで高い性能を示している．

**更新式**

$$ {\mathbf G}_t = \nabla f_t({\mathbf W}_t), \quad {\mathbf L}_t = {\mathbf L}_{t-1} + {\mathbf G}_t {\mathbf G}_t^\top, \quad {\mathbf R}_t = {\mathbf R}_{t-1} + {\mathbf G}_t^\top {\mathbf G}_t, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf L}_t^{-1/4} {\mathbf G}_t {\mathbf R}_t^{-1/4} $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［曲率・前処理，圧縮・量子化・低ランク］: 全行列版の前処理行列の行・列方向のクロネッカー積近似
- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理，理論的再解釈・一般化］: クロネッカー積構造による前処理のモデル非依存なテンソル一般化
- Online Newton Step (ONS)（`online_newton_step`）から［曲率・前処理，圧縮・量子化・低ランク］: 勾配の外積の累積による前処理の行列構造を用いた近似

---

## signSGD / Signum

- **ID**: `signsgd`
- **発表年**: 2018
- **Citation数（概算）**: 1,500
- **分野タグ**: 符号ベース，大規模バッチ
- **参考文献**: https://arxiv.org/abs/1802.04434

**概要**

確率的勾配の各成分の符号のみを用いてパラメータを更新する手法であり，慣性項を加えたものはSignumと呼ばれる．勾配を1bitに圧縮できるため分散学習における通信量を大幅に削減でき，さらに勾配の雑音や曲率に関する一定の条件下ではSGDと同等の収束率を持つことが示されている．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, \mathrm{sign}(\nabla f_t({\mathbf w}_t)), \quad \text{(Signum)} \;\; {\mathbf m}_t = \beta {\mathbf m}_{t-1} + (1 - \beta) \nabla f_t({\mathbf w}_t), \;\; {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, \mathrm{sign}({\mathbf m}_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［符号化・正規化・直交化，圧縮・量子化・低ランク］: 勾配の符号のみを用いた更新（1bitへの勾配圧縮）
- Rprop (Resilient Backpropagation)（`rprop`）から［符号化・正規化・直交化，確率化・部分化］: ステップ幅適応を省いた符号ベース更新のミニバッチ学習への適用

---

## SNVRG (Stochastic Nested Variance Reduced Gradient)

- **ID**: `snvrg`
- **発表年**: 2018
- **Citation数（概算）**: 200
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1806.07811

**概要**

SVRGの単一の基準点の代わりに，異なる更新頻度を持つ複数の基準点を入れ子に保持し，それぞれの差分を用いて勾配推定の分散をより効率的に削減する手法である．非凸な有限和問題において，SVRGより少ない勾配計算回数で停留点に到達する．

**更新式**

$$ {\mathbf v}_t = \nabla f_{I_0}({\mathbf w}^{(0)}) + \sum_{l=1}^{K} \left( \nabla f_{I_l}({\mathbf w}^{(l)}) - \nabla f_{I_l}({\mathbf w}^{(l-1)}) \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf v}_t \quad ({\mathbf w}^{(l)} : \text{更新頻度の異なる基準点}) $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 更新頻度の異なる複数の入れ子の基準点による分散低減

---

## メモリ付き疎化SGD (Sparsified SGD with Memory)

- **ID**: `sparsified_sgd`
- **発表年**: 2018
- **Citation数（概算）**: 700
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1809.07599

**概要**

勾配の上位k成分のみ（またはランダムなk成分）を送信する疎化を，送信しなかった成分をローカルなメモリに蓄積して後のステップで加える誤差補償と組み合わせた手法に対し，SGDと同じ収束率が得られることを初めて理論的に示した研究である．

**更新式**

$$ {\mathbf p}_t = {\mathbf m}_t + \eta_t {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \mathrm{top}_k({\mathbf p}_t), \quad {\mathbf m}_{t+1} = {\mathbf p}_t - \mathrm{top}_k({\mathbf p}_t) $$

**派生元と改善内容**

- DGC (Deep Gradient Compression)（`dgc`）から［圧縮・量子化・低ランク，理論的再解釈・一般化］: 疎化と誤差補償の組み合わせに対するSGDと同等の収束率の証明
- 1-bit SGD（`onebit_sgd`）から［圧縮・量子化・低ランク］: 誤差フィードバック（メモリ）による圧縮誤差の補償

---

## SPIDER (Stochastic Path-Integrated Differential EstimatoR)

- **ID**: `spider`
- **発表年**: 2018
- **Citation数（概算）**: 700
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1807.01695

**概要**

SARAHと同様の再帰的な勾配推定量を用い，正規化した勾配による更新と組み合わせることで，非凸な確率的最適化において停留点を見つけるための勾配計算回数が理論的な下限を達成することを示した手法である．

**更新式**

$$ {\mathbf v}_t = \begin{cases} \nabla f_{S_1}({\mathbf w}_t) & (t \bmod q = 0) \\ \nabla f_{S_2}({\mathbf w}_t) - \nabla f_{S_2}({\mathbf w}_{t-1}) + {\mathbf v}_{t-1} & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{{\mathbf v}_t}{\|{\mathbf v}_t\|} $$

**派生元と改善内容**

- SARAH (StochAstic Recursive grAdient algoritHm)（`sarah`）から［分散低減，符号化・正規化・直交化］: 正規化勾配による更新との組み合わせによる非凸問題での最適な計算量の達成

---

## SpiderBoost

- **ID**: `spiderboost`
- **発表年**: 2018
- **Citation数（概算）**: 300
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1810.10690

**概要**

SPIDERは理論的に最適な計算量を持つ一方，正規化した非常に小さなステップ幅を必要とし実用上遅い問題に対し，同じ再帰的な勾配推定を用いたまま，正規化を行わない大きな一定のステップ幅で同じ最適な計算量を達成できることを示した手法である．近接作用素を用いた非平滑な正則化項にも対応する．

**更新式**

$$ {\mathbf v}_t = \begin{cases} \nabla f({\mathbf w}_t) & (t \bmod q = 0) \\ \nabla f_{S}({\mathbf w}_t) - \nabla f_{S}({\mathbf w}_{t-1}) + {\mathbf v}_{t-1} & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = \mathrm{prox}_{\eta h}({\mathbf w}_t - \eta {\mathbf v}_t), \quad \eta = \frac{1}{2L} $$

**派生元と改善内容**

- SPIDER (Stochastic Path-Integrated Differential EstimatoR)（`spider`）から［分散低減，学習率の自動化・スケジュール］: 正規化なしの大きな一定ステップ幅での最適な計算量の達成

---

## 確率的重み平均化 (Stochastic Weight Averaging, SWA)

- **ID**: `swa`
- **発表年**: 2018
- **Citation数（概算）**: 2,500
- **分野タグ**: 重み平均化，平坦解探索
- **参考文献**: https://arxiv.org/abs/1803.05407

**概要**

周期的または一定の比較的大きな学習率でSGDを実行し，学習後半の一定間隔ごとの重みを平均する手法である．平均された重みは損失地形の平坦な領域の中心付近に位置する傾向があり，追加の計算コストをほとんど伴わずに汎化性能を改善する．平均後はバッチ正規化の統計量を再計算する必要がある．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f_t({\mathbf w}_t), \quad {\mathbf w}_{\mathrm{SWA}} \leftarrow \frac{n \, {\mathbf w}_{\mathrm{SWA}} + {\mathbf w}_t}{n + 1} \quad (t \bmod c = 0) $$

**派生元と改善内容**

- Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)（`polyak_averaging`）から［重みの平均化・補間，平坦化・雑音］: 周期的・大きな学習率下での深層学習向け重み平均化（平坦解への誘導）

---

## Vadam (Variational Adam)

- **ID**: `vadam`
- **発表年**: 2018
- **Citation数（概算）**: 350
- **分野タグ**: ベイズ推論，適応的学習率
- **参考文献**: https://arxiv.org/abs/1806.04854

**概要**

平均場ガウス変分推論の自然勾配法による更新が，重みに雑音を加えて勾配を評価するAdamの更新と同じ形で書けることを示し，Adamの実装をわずかに変更するだけで変分推論を行う手法である．2次モーメントが事後分布の精度（分散の逆数）の推定に対応し，不確実性の推定を安価に得られる．

**更新式**

$$ \boldsymbol\sigma_t = \frac{1}{\sqrt{N {\mathbf s}_t + \tilde\lambda}}, \quad {\mathbf w} \sim \mathcal{N}(\boldsymbol\mu_t, \boldsymbol\sigma_t^2), \quad {\mathbf g} = \nabla f({\mathbf w}), \quad {\mathbf m}_{t+1} = \beta_1 {\mathbf m}_t + (1 - \beta_1) ({\mathbf g} + \tilde\lambda \boldsymbol\mu_t / N), \quad {\mathbf s}_{t+1} = \beta_2 {\mathbf s}_t + (1 - \beta_2) {\mathbf g}^2, \quad \boldsymbol\mu_{t+1} = \boldsymbol\mu_t - \alpha \frac{\hat{\mathbf m}_{t+1}}{\sqrt{\hat{\mathbf s}_{t+1}} + \tilde\lambda / N} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［問題設定への適用，平坦化・雑音］: 重みへの雑音の付加による変分推論への拡張（2次モーメントの事後精度としての解釈）
- 自然勾配法 (Natural Gradient Descent)（`natural_gradient`）から［曲率・前処理］: 変分分布のパラメータに対する自然勾配の近似

---

## Yogi

- **ID**: `yogi`
- **発表年**: 2018
- **Citation数（概算）**: 1,500
- **分野タグ**: 適応的学習率
- **参考文献**: https://proceedings.neurips.cc/paper_files/paper/2018/hash/90365351ccc7437a1309dc64e4db32a3-Abstract.html

**概要**

Adamの2次モーメントの指数移動平均では，勾配が疎な場合などに過去の情報を急速に忘却し，実効的な学習率が急激に増加し得る問題を解決する手法である．2次モーメントを乗法的ではなく加法的に更新し，その変化量を勾配2乗の大きさで制限することで，実効的な学習率の増加を穏やかに制御する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf v}_t = {\mathbf v}_{t-1} - (1 - \beta_2) \, \mathrm{sign}({\mathbf v}_{t-1} - {\mathbf g}_t^2) \, {\mathbf g}_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{{\mathbf v}_t} + \epsilon} {\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，クリッピング・安定化］: 2次モーメントの加法的な更新による実効的な学習率の急増の抑制

---

## AdaBound

- **ID**: `adabound`
- **発表年**: 2019
- **Citation数（概算）**: 1,000
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1902.09843

**概要**

Adamなどの適応的手法は学習初期の収束が速い一方で汎化性能がSGDに劣ることがある．本手法は，パラメータごとの学習率に時間とともに狭まる上下限を設けて切り詰めることで，学習初期はAdamのように振る舞い，学習後半は一定の学習率を持つSGDへと滑らかに移行させる．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \hat{\boldsymbol\eta}_t = \mathrm{clip}\left( \frac{\eta}{\sqrt{{\mathbf v}_t}}, \, \eta_l(t), \, \eta_u(t) \right), \quad \eta_l(t) = \eta^{*} \left( 1 - \frac{1}{(1 - \beta_2) t + 1} \right), \quad \eta_u(t) = \eta^{*} \left( 1 + \frac{1}{(1 - \beta_2) t} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\hat{\boldsymbol\eta}_t}{\sqrt{t}} \odot {\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［クリッピング・安定化］: 学習率への動的な上下限の導入によるSGDへの滑らかな移行

---

## AdaMod

- **ID**: `adamod`
- **発表年**: 2019
- **Citation数（概算）**: 150
- **分野タグ**: 適応的学習率，学習安定化
- **参考文献**: https://arxiv.org/abs/1910.12249

**概要**

Adamの学習初期に適応的学習率が極端に大きくなる問題に対し，適応的学習率自体の指数移動平均を計算し，それを上限として学習率を切り詰める手法である．ウォームアップなしでも安定に学習でき，平滑化係数を0とするとAdamに一致する．

**更新式**

$$ \boldsymbol\eta_t = \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad {\mathbf s}_t = \beta_3 {\mathbf s}_{t-1} + (1 - \beta_3) \boldsymbol\eta_t, \quad \hat{\boldsymbol\eta}_t = \min(\boldsymbol\eta_t, {\mathbf s}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \hat{\boldsymbol\eta}_t \odot \hat{\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［クリッピング・安定化］: 適応的学習率の移動平均による上限の導入
- AdaBound（`adabound`）から［クリッピング・安定化］: 固定スケジュールの上下限の，適応的学習率自体に基づく上限への置き換え

---

## ALI-G (Adaptive Learning-rates for Interpolation with Gradients)

- **ID**: `alig`
- **発表年**: 2019
- **Citation数（概算）**: 80
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/1906.05661

**概要**

過剰パラメータ化された深層ニューラルネットワークでは訓練損失をほぼ0にできる（補間条件）ことを利用し，最小損失を0とおいたPolyakステップサイズを上限付きで用いる手法である．単一のハイパーパラメータ（学習率の上限）のみで，調整済みのSGDに近い汎化性能を示す．

**更新式**

$$ \eta_t = \min\left( \frac{f_{i_t}({\mathbf w}_t)}{\|\nabla f_{i_t}({\mathbf w}_t)\|^2 + \delta}, \, \eta_{\max} \right), \quad {\mathbf w}_{t+1} = \Pi_\Omega\left( {\mathbf w}_t - \eta_t \nabla f_{i_t}({\mathbf w}_t) \right) $$

**派生元と改善内容**

- Polyakステップサイズ (Polyak Step Size)（`polyak_step`）から［学習率の自動化・スケジュール，クリッピング・安定化］: 補間条件（最小損失0）の仮定と学習率の上限の導入

---

## Demon (Decaying Momentum)

- **ID**: `demon`
- **発表年**: 2019
- **Citation数（概算）**: 100
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/1910.04952

**概要**

慣性項の係数を学習の進行に応じて減衰させる手法である．各勾配が将来の更新に与える総寄与が線形に減少するように係数のスケジュールを設計することで，学習率のスケジュール調整への依存を減らし，SGDとAdamの双方に適用できる．

**更新式**

$$ \beta_t = \beta_{\mathrm{init}} \frac{1 - t/T}{(1 - \beta_{\mathrm{init}}) + \beta_{\mathrm{init}} (1 - t/T)}, \quad {\mathbf v}_{t+1} = \beta_t {\mathbf v}_t - \eta \nabla f_t({\mathbf w}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t + {\mathbf v}_{t+1} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，学習率の自動化・スケジュール］: 慣性項の係数の減衰スケジュールの導入
- Adam (Adaptive Moment Estimation)（`adam`）から［慣性項・加速，学習率の自動化・スケジュール］: 1次モーメントの減衰率への同一スケジュールの適用

---

## EF-SignSGD (Error Feedback)

- **ID**: `ef_signsgd`
- **発表年**: 2019
- **Citation数（概算）**: 600
- **分野タグ**: 分散学習，符号ベース
- **参考文献**: https://arxiv.org/abs/1901.09847

**概要**

signSGDなどの偏りのある勾配圧縮は，単純な問題でも収束しない場合や汎化性能が劣る場合があることを示し，圧縮で失われた誤差をローカルに保持して次のステップの勾配に加える誤差フィードバック機構を導入した手法である．任意の圧縮演算子に対してSGDと同等の収束率と汎化性能を回復する．

**更新式**

$$ {\mathbf p}_t = \eta {\mathbf g}_t + {\mathbf e}_t, \quad \boldsymbol\Delta_t = \frac{\|{\mathbf p}_t\|_1}{d} \mathrm{sign}({\mathbf p}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \boldsymbol\Delta_t, \quad {\mathbf e}_{t+1} = {\mathbf p}_t - \boldsymbol\Delta_t $$

**派生元と改善内容**

- signSGD / Signum（`signsgd`）から［圧縮・量子化・低ランク］: 圧縮誤差のローカルな保持と次ステップへの加算（誤差フィードバック）
- 1-bit SGD（`onebit_sgd`）から［圧縮・量子化・低ランク，理論的再解釈・一般化］: 誤差フィードバックの任意の圧縮演算子に対する理論的な正当化

---

## FedAvgM (Federated Averaging with Server Momentum)

- **ID**: `fedavgm`
- **発表年**: 2019
- **Citation数（概算）**: 1,000
- **分野タグ**: 分散学習，高速化
- **参考文献**: https://arxiv.org/abs/1909.06335

**概要**

クライアント間でデータ分布が異なる（非IID）場合のFedAvgの性能劣化を体系的に評価し，サーバー側での集約にクライアントの変化量の平均に対する慣性項を導入した手法である．単純な修正でありながら，非IIDのデータでの精度と収束を大きく改善する．

**更新式**

$$ \Delta_t = \sum_{k} \frac{n_k}{n} ({\mathbf w}_t - {\mathbf w}^{k}_{t}), \quad {\mathbf v}_{t+1} = \beta {\mathbf v}_t + \Delta_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - {\mathbf v}_{t+1} $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［慣性項・加速］: サーバー側の集約への慣性項の導入
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，分散化・通信削減］: サーバーでのパラメータ変化量への慣性項の適用

---

## LAMB (Layer-wise Adaptive Moments optimizer for Batch training)

- **ID**: `lamb`
- **発表年**: 2019
- **Citation数（概算）**: 1,500
- **分野タグ**: 大規模バッチ，適応的学習率
- **参考文献**: https://arxiv.org/abs/1904.00962

**概要**

LARSの層ごとの学習率スケーリングをAdam（AdamW）に適用した手法である．Adamによる更新量を層ごとに重みのノルムとの比で正規化することで，BERTの事前学習をバッチサイズ数万規模で安定に行うことを可能にし，学習時間を大幅に短縮した．

**更新式**

$$ {\mathbf r}_t = \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad {\mathbf w}^l_{t+1} = {\mathbf w}^l_t - \eta \frac{\phi(\|{\mathbf w}^l_t\|)}{\|{\mathbf r}^l_t + \lambda {\mathbf w}^l_t\|} ({\mathbf r}^l_t + \lambda {\mathbf w}^l_t) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［適応的スケーリング，符号化・正規化・直交化］: 層ごとの信頼比（重みと更新量のノルム比）による更新量の正規化
- LARS (Layer-wise Adaptive Rate Scaling)（`lars`）から［適応的スケーリング］: 層ごとの学習率スケーリングの適応的学習率手法への拡張

---

## Lookahead

- **ID**: `lookahead`
- **発表年**: 2019
- **Citation数（概算）**: 1,200
- **分野タグ**: 重み平均化，高速化
- **参考文献**: https://arxiv.org/abs/1907.08610

**概要**

SGDやAdamなど任意の内側の最適化手法で「速い重み」をkステップ更新した後，その到達点に向けて「遅い重み」を一定割合だけ補間する手法である．速い重みが探索した方向を平滑化して取り込むことで，内側の最適化手法の振動を抑え，ハイパーパラメータへの頑健性と収束の安定性を改善する．

**更新式**

$$ \boldsymbol\theta_{t,0} = \boldsymbol\phi_t, \quad \boldsymbol\theta_{t,i} = \boldsymbol\theta_{t,i-1} + A(f, \boldsymbol\theta_{t,i-1}) \;\; (i = 1, \dots, k), \quad \boldsymbol\phi_{t+1} = \boldsymbol\phi_t + \alpha (\boldsymbol\theta_{t,k} - \boldsymbol\phi_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［重みの平均化・補間］: 内側の最適化手法によるkステップ先の重みと遅い重みとの補間

---

## L-SVRG (Loopless SVRG)

- **ID**: `lsvrg`
- **発表年**: 2019
- **Citation数（概算）**: 250
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/1901.08689

**概要**

SVRGの外側・内側の2重ループ構造を廃し，毎ステップ小さな確率で基準点を現在の点に更新（全勾配を再計算）する単一ループの手法である．内側ループの長さという調整の難しいハイパーパラメータを不要にし，解析も簡潔になる一方で，SVRGと同等の収束率を保つ．

**更新式**

$$ {\mathbf g}_t = \nabla f_{i_t}({\mathbf w}_t) - \nabla f_{i_t}(\tilde{\mathbf w}_t) + \nabla F(\tilde{\mathbf w}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta {\mathbf g}_t, \quad \tilde{\mathbf w}_{t+1} = \begin{cases} {\mathbf w}_t & (\text{確率 } p) \\ \tilde{\mathbf w}_t & (\text{確率 } 1-p) \end{cases} $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減，確率化・部分化］: 2重ループの確率的な基準点更新による単一ループ化

---

## NovoGrad

- **ID**: `novograd`
- **発表年**: 2019
- **Citation数（概算）**: 300
- **分野タグ**: 大規模バッチ，メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/1905.11286

**概要**

Adamのパラメータごとの2次モーメントを，層ごとの勾配ノルムの2乗の指数移動平均（層ごとに1つのスカラー）に置き換えた手法である．層ごとに正規化した勾配に分離型の重み減衰を加えてから慣性項を計算することで，メモリ使用量を削減しつつ，大規模バッチでの音声認識・言語モデルの学習を安定化する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad v^l_t = \beta_2 v^l_{t-1} + (1 - \beta_2) \|{\mathbf g}^l_t\|^2, \quad {\mathbf m}^l_t = \beta_1 {\mathbf m}^l_{t-1} + \left( \frac{{\mathbf g}^l_t}{\sqrt{v^l_t} + \epsilon} + \lambda {\mathbf w}^l_t \right), \quad {\mathbf w}^l_{t+1} = {\mathbf w}^l_t - \eta \, {\mathbf m}^l_t $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［適応的スケーリング，圧縮・量子化・低ランク］: 層ごとの勾配ノルムによる2次モーメントと，正規化後の勾配への重み減衰の導入

---

## PowerSGD

- **ID**: `powersgd`
- **発表年**: 2019
- **Citation数（概算）**: 500
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/1905.13727

**概要**

分散学習で送受信する勾配行列を，1ステップの冪乗反復による低ランク近似で圧縮する手法である．前回の近似結果を冪乗反復の初期値として再利用し（ウォームスタート），圧縮誤差を誤差フィードバックで次ステップに持ち越すことで，All-Reduceと互換な形で通信量を大幅に削減しつつ，SGDと同等の精度を保つ．PyTorchのDDP通信フックとして実装されている．

**更新式**

$$ {\mathbf M} = {\mathbf G}_t + {\mathbf E}_t, \quad {\mathbf P} = \mathrm{AllReduce}({\mathbf M} {\mathbf Q}_{t-1}), \;\; \hat{\mathbf P} = \mathrm{orth}({\mathbf P}), \quad {\mathbf Q}_t = \mathrm{AllReduce}({\mathbf M}^\top \hat{\mathbf P}), \quad \hat{\mathbf G}_t = \hat{\mathbf P} {\mathbf Q}_t^\top, \quad {\mathbf E}_{t+1} = {\mathbf M} - \hat{\mathbf G}_t $$

**派生元と改善内容**

- EF-SignSGD (Error Feedback)（`ef_signsgd`）から［圧縮・量子化・低ランク］: 誤差フィードバックの低ランク圧縮への適用
- QSGD (Quantized SGD)（`qsgd`）から［圧縮・量子化・低ランク，分散化・通信削減］: 量子化の代わりに冪乗反復による低ランク近似を用いた勾配圧縮

---

## RAdam (Rectified Adam)

- **ID**: `radam`
- **発表年**: 2019
- **Citation数（概算）**: 3,000
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/1908.03265

**概要**

Adamの学習初期において，2次モーメントの推定に用いるサンプル数が少ないために適応的学習率の分散が大きくなり，不安定な更新を招く問題を指摘した手法である．適応的学習率の分散を解析的に評価して補正項で整流し，分散が十分小さくなるまでは慣性項付きSGDとして振る舞うことで，ウォームアップを不要にする．

**更新式**

$$ \rho_\infty = \frac{2}{1 - \beta_2} - 1, \quad \rho_t = \rho_\infty - \frac{2 t \beta_2^t}{1 - \beta_2^t}, \quad {\mathbf w}_{t+1} = \begin{cases} {\mathbf w}_t - \eta \, r_t \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \;\; r_t = \sqrt{\frac{(\rho_t - 4)(\rho_t - 2) \rho_\infty}{(\rho_\infty - 4)(\rho_\infty - 2) \rho_t}} & (\rho_t > 4) \\ {\mathbf w}_t - \eta \, \hat{\mathbf m}_t & (\mathrm{otherwise}) \end{cases} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［クリッピング・安定化］: 適応的学習率の分散の整流（ウォームアップの不要化）

---

## SCAFFOLD (Stochastic Controlled Averaging)

- **ID**: `scaffold`
- **発表年**: 2019
- **Citation数（概算）**: 3,000
- **分野タグ**: 分散学習，勾配分散低減
- **参考文献**: https://arxiv.org/abs/1910.06378

**概要**

非IIDなデータの下でFedAvgの各クライアントのローカル更新が自身の最適解へ偏る（クライアントドリフト）問題に対し，SVRGと同様の制御変量を用いて各クライアントの勾配を補正する手法である．サーバーとクライアントがそれぞれ勾配の推定値（制御変量）を保持し，その差でローカル勾配を補正することで，データの異質性によらず少ない通信回数で収束する．

**更新式**

$$ {\mathbf y}_k \leftarrow {\mathbf y}_k - \eta_l \left( \nabla f_k({\mathbf y}_k) - {\mathbf c}_k + {\mathbf c} \right) \;\; (K\text{ステップ}), \quad {\mathbf c}_k^{+} = {\mathbf c}_k - {\mathbf c} + \frac{1}{K \eta_l} ({\mathbf w} - {\mathbf y}_k), \quad {\mathbf w} \leftarrow {\mathbf w} + \frac{\eta_g}{|S|} \sum_{k \in S} ({\mathbf y}_k - {\mathbf w}) $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［分散低減，分散化・通信削減］: 制御変量によるクライアントドリフトの補正
- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減，問題設定への適用］: 制御変量による分散低減の連合学習への適用

---

## SlowMo (Slow Momentum)

- **ID**: `slowmo`
- **発表年**: 2019
- **Citation数（概算）**: 300
- **分野タグ**: 分散学習，高速化
- **参考文献**: https://arxiv.org/abs/1910.00643

**概要**

Local SGDなどの通信を減らした分散学習法の各ラウンドの後に，全ワーカーで平均したパラメータの変化量に対して外側の慣性項（遅い慣性項）を適用する枠組みである．内側の最適化手法によらず適用でき，通信効率を保ったまま精度を改善し，後のDiLoCoの外側最適化の考え方の先駆けとなった．

**更新式**

$$ {\mathbf x}_{t,\tau} = \frac{1}{K} \sum_{k} {\mathbf x}^k_{t,\tau} \;\; (\tau\text{ステップのローカル更新後}), \quad {\mathbf u}_{t+1} = \beta {\mathbf u}_t + \frac{1}{\gamma_t} ({\mathbf x}_{t,0} - {\mathbf x}_{t,\tau}), \quad {\mathbf x}_{t+1,0} = {\mathbf x}_{t,0} - \alpha \gamma_t {\mathbf u}_{t+1} $$

**派生元と改善内容**

- Local SGD（`local_sgd`）から［慣性項・加速］: ラウンドごとの平均変化量への外側の慣性項の適用
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，分散化・通信削減］: 遅い時間スケールでの慣性項の導入

---

## SLS (Stochastic Line Search, Painless SGD)

- **ID**: `sls`
- **発表年**: 2019
- **Citation数（概算）**: 300
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/1905.09997

**概要**

過剰パラメータ化されたモデルが満たす補間条件の下で，各ミニバッチの損失に対してArmijo直線探索を行って学習率を決める手法である．補間条件の下では確率的な直線探索でも決定的な場合と同様の収束率が保証され，学習率の調整なしにSGDやAdamを調整した場合と同等以上の性能を示す．

**更新式**

$$ \eta_t = \max \left\{ \eta : f_{i_t}({\mathbf w}_t - \eta \nabla f_{i_t}({\mathbf w}_t)) \le f_{i_t}({\mathbf w}_t) - c \, \eta \|\nabla f_{i_t}({\mathbf w}_t)\|^2 \right\}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f_{i_t}({\mathbf w}_t) $$

**派生元と改善内容**

- Armijo直線探索 (Armijo Line Search / Backtracking)（`armijo`）から［学習率の自動化・スケジュール，確率化・部分化］: ミニバッチ損失に対する確率的な直線探索（補間条件下での収束保証）
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: SGDの学習率の直線探索による自動設定

---

## SM3 (Square-root of Minima of Sums of Maxima of Squared-gradients Method)

- **ID**: `sm3`
- **発表年**: 2019
- **Citation数（概算）**: 200
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/1901.11150

**概要**

AdaGradの勾配2乗の累積をパラメータごとに保持する代わりに，パラメータを覆う部分集合（例えば行列の各行・各列）ごとに累積値を保持し，各パラメータについてそれを含む部分集合の累積値の最小値を用いる手法である．AdaGradと同等の収束保証を保ちつつ，オプティマイザの状態量をパラメータ数より大幅に少なくできる．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \mu_t(r) = \mu_{t-1}(r) + \max_{j \in S_r} g_{t,j}^2, \quad \nu_t(i) = \min_{r : S_r \ni i} \mu_t(r), \quad w_{t+1,i} = w_{t,i} - \eta \frac{g_{t,i}}{\sqrt{\nu_t(i)}} $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［圧縮・量子化・低ランク］: パラメータを覆う部分集合ごとの勾配2乗累積によるメモリ削減

---

## STORM (STOchastic Recursive Momentum)

- **ID**: `storm`
- **発表年**: 2019
- **Citation数（概算）**: 400
- **分野タグ**: 勾配分散低減，高速化
- **参考文献**: https://arxiv.org/abs/1905.10018

**概要**

SARAH/SPIDERの再帰的な分散低減と慣性項を統合し，定期的な全勾配（大バッチ）の計算を不要にした手法である．慣性項の更新に，同一サンプルで評価した現在と直前の勾配の差による補正項を加えることで，小さなバッチのみで分散低減を実現し，学習率も勾配の大きさから適応的に決定する．

**更新式**

$$ {\mathbf d}_t = \nabla f({\mathbf w}_t; \xi_t) + (1 - a_t) \left( {\mathbf d}_{t-1} - \nabla f({\mathbf w}_{t-1}; \xi_t) \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf d}_t $$

**派生元と改善内容**

- SARAH (StochAstic Recursive grAdient algoritHm)（`sarah`）から［分散低減，慣性項・加速］: 再帰的な補正の慣性項への統合による全勾配計算の不要化
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，分散低減］: 同一サンプルでの勾配差による慣性項の補正（分散低減付き慣性）

---

## SWAG (SWA-Gaussian)

- **ID**: `swag`
- **発表年**: 2019
- **Citation数（概算）**: 1,200
- **分野タグ**: ベイズ推論，重み平均化
- **参考文献**: https://arxiv.org/abs/1902.02476

**概要**

SWAで重みの平均を求める過程で，重みの2次モーメントと直近の偏差からなる低ランク行列も同時に記録し，平均と対角＋低ランクの共分散を持つガウス分布で重みの事後分布を近似する手法である．追加のコストをほとんど伴わずに，不確実性の推定や較正，分布外検知の性能を改善する．

**更新式**

$$ \bar{\mathbf w} = \frac{1}{T} \sum_{i} {\mathbf w}_i, \quad \Sigma_{\mathrm{diag}} = \mathrm{diag}\left( \frac{1}{T} \sum_{i} {\mathbf w}_i^2 - \bar{\mathbf w}^2 \right), \quad \hat{\mathbf D} = [{\mathbf w}_{T-K+1} - \bar{\mathbf w}, \dots, {\mathbf w}_T - \bar{\mathbf w}], \quad {\mathbf w} \sim \mathcal{N}\left( \bar{\mathbf w}, \frac{1}{2} \left( \Sigma_{\mathrm{diag}} + \frac{\hat{\mathbf D} \hat{\mathbf D}^\top}{K - 1} \right) \right) $$

**派生元と改善内容**

- 確率的重み平均化 (Stochastic Weight Averaging, SWA)（`swa`）から［問題設定への適用，重みの平均化・補間］: 重みの2次モーメントと偏差の記録によるガウス事後分布の近似

---

## ZO-AdaMM (Zeroth-Order Adaptive Momentum Method)

- **ID**: `zo_adamm`
- **発表年**: 2019
- **Citation数（概算）**: 150
- **分野タグ**: ゼロ次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/1910.06513

**概要**

ゼロ次の勾配推定値を用いてAdam型の適応的な慣性項付きの更新を行う手法である．ゼロ次の推定値は分散が大きいため，AMSGrad型の2次モーメントの最大値と，マハラノビス距離に基づく射影を組み合わせて収束を保証し，ブラックボックスな敵対的攻撃の生成などで有効性を示した．

**更新式**

$$ \hat{\mathbf g}_t = \mathrm{ZO\text{-}estimate}(f, {\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \hat{\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \hat{\mathbf g}_t^2, \quad \hat{\mathbf v}_t = \max(\hat{\mathbf v}_{t-1}, {\mathbf v}_t), \quad {\mathbf w}_{t+1} = \Pi_{\mathcal{X}, \sqrt{\hat{\mathbf V}_t}}\left( {\mathbf w}_t - \eta \hat{\mathbf V}_t^{-1/2} {\mathbf m}_t \right) $$

**派生元と改善内容**

- ZO-SGD (Randomized Stochastic Gradient-Free Method, Ghadimi & Lan)（`zo_sgd`）から［慣性項・加速，適応的スケーリング］: ゼロ次の勾配推定値への適応的な慣性項付き更新の適用
- AMSGrad（`amsgrad`）から［適応的スケーリング，クリッピング・安定化］: 2次モーメントの最大値による収束保証

---

## AdaBelief

- **ID**: `adabelief`
- **発表年**: 2020
- **Citation数（概算）**: 1,000
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/2010.07468

**概要**

Adamの2次モーメントに勾配の2乗ではなく，観測された勾配と1次モーメント（勾配の予測値）との差の2乗の指数移動平均を用いる手法である．勾配が予測通りであれば大きなステップを，予測から外れれば小さなステップを取ることで，Adamの高速な収束とSGDの汎化性能の両立を狙う．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf s}_t = \beta_2 {\mathbf s}_{t-1} + (1 - \beta_2) ({\mathbf g}_t - {\mathbf m}_t)^2 + \epsilon, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf s}_t} + \epsilon} \hat{\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング］: 2次モーメントを勾配と1次モーメントの差（予測誤差）の分散に置き換え

---

## AdaHessian

- **ID**: `adahessian`
- **発表年**: 2020
- **Citation数（概算）**: 400
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2006.00719

**概要**

Adamの2次モーメントに用いる勾配の2乗を，Hutchinson法によって推定したヘッセ行列の対角成分の2乗に置き換えた手法である．ヘッセ行列とベクトルの積のみで対角成分を推定し，さらに空間的な平均化と指数移動平均によって推定値の分散を抑えることで，曲率情報を取り入れた適応的学習率を実現する．

**更新式**

$$ {\mathbf D}_t = \mathrm{diag}(\nabla^2 f_t({\mathbf w}_t)) \approx \mathbb{E}_{\mathbf z}[{\mathbf z} \odot (\nabla^2 f_t({\mathbf w}_t) {\mathbf z})], \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \nabla f_t({\mathbf w}_t), \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf D}_t^{2}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{\hat{\mathbf m}_t}{(\sqrt{\hat{\mathbf v}_t})^k + \epsilon} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［曲率・前処理］: 2次モーメントのヘッセ行列の対角推定（Hutchinson法）への置き換え
- ニュートン法 (Newton's Method)（`newton`）から［曲率・前処理，確率化・部分化］: ヘッセ行列の対角近似と移動平均による確率的な2次情報の活用

---

## AdamP

- **ID**: `adamp`
- **発表年**: 2020
- **Citation数（概算）**: 300
- **分野タグ**: 適応的学習率，正則化
- **参考文献**: https://arxiv.org/abs/2006.08217

**概要**

バッチ正規化などにより出力が重みのスケールに不変となるパラメータでは，慣性項を持つ最適化手法が重みのノルムを急速に増大させ，実効的な学習率が過度に減衰する問題を指摘した手法である．スケール不変と判定された重みについて，更新量から重みの方向（半径方向）成分を射影により除去することで，ノルムの増大を抑制する．

**更新式**

$$ {\mathbf p}_t = \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad {\mathbf q}_t = \begin{cases} {\mathbf p}_t - \frac{{\mathbf w}_t^\top {\mathbf p}_t}{\|{\mathbf w}_t\|^2} {\mathbf w}_t & (\cos({\mathbf w}_t, \nabla f_t({\mathbf w}_t)) < \delta / \sqrt{\dim({\mathbf w})}) \\ {\mathbf p}_t & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf q}_t $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［正則化・重み減衰，符号化・正規化・直交化］: スケール不変な重みに対する更新量の半径方向成分の射影除去

---

## Apollo (Adaptive Parameter-wise Diagonal Quasi-Newton)

- **ID**: `apollo_qn`
- **発表年**: 2020
- **Citation数（概算）**: 40
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2009.13586

**概要**

ヘッセ行列を対角行列で近似し，その対角成分を弱いセカント条件に基づいてパラメータごとに逐次更新する対角準ニュートン法である．曲率の絶対値をとる整流により非凸問題での正定値性を保ち，Adam系と同程度の計算量・メモリで曲率情報を利用する．

**更新式**

$$ {\mathbf d}_t = {\mathbf m}_t - {\mathbf m}_{t-1}, \quad {\mathbf B}_t = {\mathbf B}_{t-1} - \frac{{\mathbf d}_t^\top \Delta{\mathbf w}_t + \Delta{\mathbf w}_t^\top {\mathbf B}_{t-1} \Delta{\mathbf w}_t}{\|\Delta{\mathbf w}_t\|_4^4 + \epsilon} \mathrm{diag}(\Delta{\mathbf w}_t^2), \quad {\mathbf D}_t = \max(|{\mathbf B}_t|, \sigma), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf D}_t^{-1} {\mathbf m}_t $$

**派生元と改善内容**

- BFGS法 (Broyden-Fletcher-Goldfarb-Shanno Method)（`bfgs`）から［曲率・前処理，圧縮・量子化・低ランク］: 対角行列への制限と弱いセカント条件による準ニュートン更新
- Adam (Adaptive Moment Estimation)（`adam`）から［曲率・前処理］: 慣性項付き勾配へのパラメータごとの前処理

---

## Distributed Shampoo (Scalable Second Order Optimization)

- **ID**: `distributed_shampoo`
- **発表年**: 2020
- **Citation数（概算）**: 200
- **分野タグ**: 2次手法，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2002.09018

**概要**

Shampooを大規模な深層学習で実用化するため，前処理行列の逆p乗根の計算をCPU等で非同期に，低頻度で行い，大きな層の前処理行列をブロックに分割し，前処理後の更新量の大きさをAdaGrad（Adam）の更新量に合わせて調整（グラフティング）する等の工夫を導入した実装である．大規模な分散環境で，1次手法より短い時間で学習できることを示した．

**更新式**

$$ {\mathbf L}_t = \beta {\mathbf L}_{t-1} + (1-\beta) {\mathbf G}_t {\mathbf G}_t^\top, \quad {\mathbf R}_t = \beta {\mathbf R}_{t-1} + (1-\beta) {\mathbf G}_t^\top {\mathbf G}_t, \quad {\mathbf D}_t = {\mathbf L}_t^{-1/4} {\mathbf G}_t {\mathbf R}_t^{-1/4} \;\; (\text{逆根は非同期・低頻度で更新}), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \frac{\|{\mathbf A}_t\|}{\|{\mathbf D}_t\|} {\mathbf D}_t \;\; ({\mathbf A}_t : \text{Adam等の更新量}) $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［分散化・通信削減，曲率・前処理］: 逆根の非同期・低頻度計算，ブロック分割，更新量のグラフティングによる大規模化

---

## FedNova (Normalized Averaging)

- **ID**: `fednova`
- **発表年**: 2020
- **Citation数（概算）**: 1,200
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/2007.07481

**概要**

連合学習でクライアントごとにローカルステップ数が異なる場合，FedAvgはステップ数の多いクライアントの目的関数に偏った解（目的関数の不一致）に収束することを示し，各クライアントの更新量をそのローカルステップ数で正規化してから集約する手法である．目的関数の不一致を解消しつつ高速な収束を保つ．

**更新式**

$$ {\mathbf d}_k = \frac{{\mathbf w}_t - {\mathbf w}^{k}_{t,\tau_k}}{\eta \, \|{\mathbf a}_k\|_1}, \quad \tau_{\mathrm{eff}} = \sum_{k} p_k \|{\mathbf a}_k\|_1, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, \tau_{\mathrm{eff}} \sum_{k} p_k {\mathbf d}_k $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［符号化・正規化・直交化，分散化・通信削減］: ローカルステップ数による更新量の正規化（目的関数の不一致の解消）

---

## FedOpt (Adaptive Federated Optimization: FedAdam / FedYogi / FedAdagrad)

- **ID**: `fedopt`
- **発表年**: 2020
- **Citation数（概算）**: 1,500
- **分野タグ**: 分散学習，適応的学習率
- **参考文献**: https://arxiv.org/abs/2003.00295

**概要**

FedAvgのサーバー側の集約を，クライアントのパラメータ変化量の平均を「擬似勾配」とみなした最適化の1ステップとして一般化し，サーバー側にAdam，Yogi，AdaGradなどの適応的な最適化手法を用いる枠組みである．クライアントとサーバーで異なる最適化手法を使い分けることで，連合学習の収束と性能を改善する．

**更新式**

$$ \Delta_t = \frac{1}{|S|} \sum_{k \in S} ({\mathbf w}^{k}_{t} - {\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \Delta_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \Delta_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \eta \frac{{\mathbf m}_t}{\sqrt{{\mathbf v}_t} + \tau} $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［理論的再解釈・一般化，分散化・通信削減］: サーバー側の集約の擬似勾配による最適化ステップへの一般化
- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，分散化・通信削減］: サーバー側の最適化手法としての適応的学習率手法の利用
- Yogi（`yogi`）から［適応的スケーリング，分散化・通信削減］: サーバー側の最適化手法としてのYogiの利用

---

## Fromage (Frobenius Matched Gradient Descent)

- **ID**: `fromage`
- **発表年**: 2020
- **Citation数（概算）**: 100
- **分野タグ**: 学習安定化，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2002.03432

**概要**

深いネットワークの2つのパラメータ間の距離を層ごとの相対的な変化で測る「深い相対的信頼」の概念を導入し，各層の更新量を重みのノルムに対する相対的な大きさとして制御する手法である．重みの大きさが更新で変わらないよう補正項を加えることで，学習率の調整なしに多様なタスクで安定に学習する．

**更新式**

$$ {\mathbf W}^\ell_{t+1} = \frac{1}{\sqrt{1 + \eta^2}} \left( {\mathbf W}^\ell_t - \eta \frac{\|{\mathbf W}^\ell_t\|_F}{\|{\mathbf G}^\ell_t\|_F} {\mathbf G}^\ell_t \right) $$

**派生元と改善内容**

- LARS (Layer-wise Adaptive Rate Scaling)（`lars`）から［符号化・正規化・直交化，理論的再解釈・一般化］: 層ごとの相対的な更新量の理論的な正当化（深い相対的信頼）とノルムの保存

---

## 勾配中心化 (Gradient Centralization)

- **ID**: `gradient_centralization`
- **発表年**: 2020
- **Citation数（概算）**: 400
- **分野タグ**: 正則化，学習安定化
- **参考文献**: https://arxiv.org/abs/2004.01461

**概要**

重み行列の勾配について，各出力ニューロンに対応する勾配ベクトルの平均を0にする（中心化する）操作を，最適化手法の更新前に加える手法である．重み空間と出力特徴空間に対する正則化として働き，1行の修正で既存のSGDやAdamに適用でき，学習を安定化し汎化性能を改善する．

**更新式**

$$ \Phi_{\mathrm{GC}}(\nabla_{{\mathbf w}_i} f) = \nabla_{{\mathbf w}_i} f - \frac{1}{M} \sum_{j=1}^{M} \nabla_{w_{i,j}} f, \quad {\mathbf w}_{i,t+1} = {\mathbf w}_{i,t} - \eta \, \Phi_{\mathrm{GC}}(\nabla_{{\mathbf w}_i} f_t) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［符号化・正規化・直交化，正則化・重み減衰］: 出力ニューロンごとの勾配ベクトルの中心化（平均0化）

---

## LaProp

- **ID**: `laprop`
- **発表年**: 2020
- **Citation数（概算）**: 60
- **分野タグ**: 適応的学習率，学習安定化
- **参考文献**: https://arxiv.org/abs/2002.04839

**概要**

Adamでは慣性項の計算と2次モーメントによる正規化が不必要に結合しており，これが不安定性の原因になると指摘した手法である．勾配を先に2次モーメントで正規化し，その正規化された勾配に対して慣性項を計算する順序に変えることで，Adamが発散するようなハイパーパラメータでも安定に学習できる．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf g}_t^2, \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \frac{{\mathbf g}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \hat{\mathbf m}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［慣性項・加速，クリッピング・安定化］: 正規化と慣性項の計算順序の入れ替え（慣性項と適応性の分離）
- RMSprop (Root Mean Square Propagation)（`rmsprop`）から［慣性項・加速］: RMSpropで正規化した勾配への慣性項の適用

---

## Madam (Multiplicative Adam)

- **ID**: `madam`
- **発表年**: 2020
- **Citation数（概算）**: 50
- **分野タグ**: 学習安定化，メモリ効率
- **参考文献**: https://arxiv.org/abs/2006.14560

**概要**

合成関数としてのネットワークの性質から，重みを加算的ではなく乗法的に更新すべきであると論じ，Adam型の正規化を行った勾配の符号付きの値で重みの大きさを指数的に更新する手法である．重みの表現が対数スケールとなるため，低精度の対数数値表現（8bit等）での学習とも相性がよい．

**更新式**

$$ \bar{\mathbf g}_t = \frac{{\mathbf g}_t}{\sqrt{\hat{\mathbf v}_t}}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t \odot \exp\left( -\eta \, \mathrm{sign}({\mathbf w}_t) \odot \bar{\mathbf g}_t \right) $$

**派生元と改善内容**

- Fromage (Frobenius Matched Gradient Descent)（`fromage`）から［符号化・正規化・直交化］: 相対的な更新の乗法的な更新への置き換え
- 指数勾配法 (Exponentiated Gradient, EG)（`exponentiated_gradient`）から［理論的再解釈・一般化］: 勾配の指数による乗法的な更新の深層学習への適用
- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング］: 2次モーメントによる勾配の正規化

---

## 正規化SGD＋慣性項 (Momentum Improves Normalized SGD)

- **ID**: `normalized_sgd_momentum`
- **発表年**: 2020
- **Citation数（概算）**: 200
- **分野タグ**: 高速化，学習安定化
- **参考文献**: https://arxiv.org/abs/2002.03305

**概要**

勾配をノルムで正規化して更新する正規化SGDは，大きなバッチを用いなければ収束が保証されない問題に対し，慣性項を正規化の前に適用することで，小さなバッチでも非凸問題の停留点への収束が保証されることを示した研究である．符号ベースやMuonなどの正規化型手法の理論的な背景の一つとなっている．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta {\mathbf m}_{t-1} + (1 - \beta) {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{{\mathbf m}_t}{\|{\mathbf m}_t\|} $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［符号化・正規化・直交化，慣性項・加速］: 慣性項の正規化による小さなバッチでの収束保証
- 勾配クリッピング (Gradient Norm Clipping)（`gradient_clipping`）から［符号化・正規化・直交化，クリッピング・安定化］: 勾配ノルムによる更新量の制御の正規化への一般化

---

## PAGE (ProbAbilistic Gradient Estimator)

- **ID**: `page`
- **発表年**: 2020
- **Citation数（概算）**: 200
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/2008.10898

**概要**

SARAHの再帰的な勾配推定について，毎ステップ確率pで大きなミニバッチの勾配を計算し直し，確率1-pで前回の推定値に小さなミニバッチの勾配差を加える単一ループの手法である．非凸な有限和・オンライン問題の双方で，停留点を求めるための最適な計算量を達成する．

**更新式**

$$ {\mathbf g}_{t+1} = \begin{cases} \nabla f_{B}({\mathbf w}_{t+1}) & (\text{確率 } p) \\ {\mathbf g}_t + \nabla f_{b}({\mathbf w}_{t+1}) - \nabla f_{b}({\mathbf w}_t) & (\text{確率 } 1-p) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta {\mathbf g}_t $$

**派生元と改善内容**

- SARAH (StochAstic Recursive grAdient algoritHm)（`sarah`）から［分散低減，確率化・部分化］: 確率的な全勾配の再計算による単一ループ化と最適な計算量

---

## PCGrad (Projecting Conflicting Gradients)

- **ID**: `pcgrad`
- **発表年**: 2020
- **Citation数（概算）**: 1,500
- **分野タグ**: マルチタスク・多目的
- **参考文献**: https://arxiv.org/abs/2001.06782

**概要**

マルチタスク学習で，あるタスクの勾配が別のタスクの勾配と負の内積を持つ（衝突する）場合に，その勾配を衝突する勾配の法平面へ射影して衝突成分を除去する「勾配手術」の手法である．衝突・大きさの差・高い曲率が重なる状況での学習の停滞を防ぎ，マルチタスク学習やマルチタスク強化学習の性能を改善する．

**更新式**

$$ \text{for } j \neq k : \;\; \text{if } {\mathbf g}_k^\top {\mathbf g}_j < 0 : \; {\mathbf g}_k \leftarrow {\mathbf g}_k - \frac{{\mathbf g}_k^\top {\mathbf g}_j}{\|{\mathbf g}_j\|^2} {\mathbf g}_j, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \sum_{k} {\mathbf g}_k $$

**派生元と改善内容**

- MGDA (Multiple-Gradient Descent Algorithm)（`mgda`）から［問題設定への適用］: 最小ノルム方向の代わりに衝突する勾配成分の射影による除去
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［問題設定への適用］: タスク勾配の衝突の解消（勾配手術）

---

## ランダムリシャッフリング (Random Reshuffling)

- **ID**: `random_reshuffling`
- **発表年**: 2020
- **Citation数（概算）**: 200
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/2006.05988
- **備考**: 手法自体は古くから実践で用いられており，参考文献は簡潔な収束解析を与えた論文（Mishchenko et al., 2020）とした．

**概要**

SGDで各ステップ独立にサンプルを選ぶ（復元抽出）代わりに，エポックごとにデータをランダムに並べ替えて重複なく順に用いる手法である．実践では標準的に用いられてきたが，その優位性の理論は複雑であった．本研究は簡潔な解析により，強凸問題などでSGDより良い収束率が得られることを示した．

**更新式**

$$ \pi^k \sim \mathrm{Perm}(n), \quad {\mathbf w}^{k}_{i+1} = {\mathbf w}^{k}_{i} - \eta \nabla f_{\pi^k_i}({\mathbf w}^{k}_{i}) \;\; (i = 0, \dots, n-1), \quad {\mathbf w}^{k+1}_0 = {\mathbf w}^{k}_n $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［確率化・部分化］: エポックごとのランダムな並べ替えによる非復元抽出

---

## SAM (Sharpness-Aware Minimization)

- **ID**: `sam`
- **発表年**: 2020
- **Citation数（概算）**: 2,500
- **分野タグ**: 平坦解探索，正則化
- **参考文献**: https://arxiv.org/abs/2010.01412

**概要**

損失の値だけでなく，パラメータの近傍における損失の最大値（鋭さ）も同時に小さくする，平坦な最小値を探索する手法である．勾配方向に一定半径だけ摂動させた点で勾配を計算し，その勾配で元の点を更新する2段階の手続きにより，min-max問題を効率的に近似的に解き，汎化性能を改善する．

**更新式**

$$ \hat{\boldsymbol\epsilon}({\mathbf w}_t) = \rho \frac{\nabla f_t({\mathbf w}_t)}{\|\nabla f_t({\mathbf w}_t)\|}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_t({\mathbf w}_t + \hat{\boldsymbol\epsilon}({\mathbf w}_t)) $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［平坦化・雑音］: 近傍での最悪ケースの損失（鋭さ）の最小化による平坦解の探索

---

## SPS (Stochastic Polyak Step-size)

- **ID**: `sps`
- **発表年**: 2020
- **Citation数（概算）**: 250
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2002.10542

**概要**

Polyakステップサイズを確率的勾配法に拡張し，各ミニバッチの損失とその最小値（過剰パラメータ化されたモデルでは0とみなせる）から学習率を計算する手法である．上限値で学習率を切り詰めることで安定化し，学習率の調整なしに補間条件下で高速な収束を示す．

**更新式**

$$ \eta_t = \min\left( \frac{f_{i_t}({\mathbf w}_t) - f_{i_t}^*}{c \, \|\nabla f_{i_t}({\mathbf w}_t)\|^2}, \, \eta_{\max} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \nabla f_{i_t}({\mathbf w}_t) $$

**派生元と改善内容**

- Polyakステップサイズ (Polyak Step Size)（`polyak_step`）から［確率化・部分化，学習率の自動化・スケジュール］: ミニバッチ損失を用いた確率的な拡張と学習率の上限の導入
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール］: SGDへの自動的な学習率設定の導入

---

## 8-bit Adam (Block-wise Quantized Adam)

- **ID**: `adam_8bit`
- **発表年**: 2021
- **Citation数（概算）**: 500
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2110.02861

**概要**

Adamの1次・2次モーメントを32bit浮動小数点ではなく8bitに量子化して保持する手法である．テンソルを小さなブロックに分割してブロックごとに正規化する量子化と，値の分布に適した動的な量子化表現を組み合わせることで，量子化誤差による性能劣化を抑えつつ，オプティマイザの状態量のメモリを約1/4に削減する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 Q^{-1}(\bar{\mathbf m}_{t-1}) + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 Q^{-1}(\bar{\mathbf v}_{t-1}) + (1 - \beta_2) {\mathbf g}_t^2, \quad \bar{\mathbf m}_t = Q({\mathbf m}_t), \quad \bar{\mathbf v}_t = Q({\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon} \hat{\mathbf m}_t \quad (Q : \text{ブロック単位の8bit動的量子化}) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［圧縮・量子化・低ランク］: モーメントのブロック単位8bit量子化によるメモリ削減

---

## AGC (Adaptive Gradient Clipping)

- **ID**: `agc`
- **発表年**: 2021
- **Citation数（概算）**: 1,200
- **分野タグ**: 学習安定化，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2102.06171
- **備考**: NFNets（High-Performance Large-Scale Image Recognition Without Normalization）の論文中で提案された．Citation数は論文全体の概算である．

**概要**

勾配クリッピングの閾値を固定値ではなく，対応する重みのノルムとの比（ユニットごと）に基づいて適応的に決める手法である．バッチ正規化を用いないNFNetsにおいて，大きなバッチサイズと強いデータ拡張の下でも安定した学習を可能にした．

**更新式**

$$ G^\ell_i \leftarrow \begin{cases} \lambda \frac{\|W^\ell_i\|^\star}{\|G^\ell_i\|} G^\ell_i & \left( \frac{\|G^\ell_i\|}{\|W^\ell_i\|^\star} > \lambda \right) \\ G^\ell_i & (\mathrm{otherwise}) \end{cases}, \quad \|W^\ell_i\|^\star = \max(\|W^\ell_i\|, \epsilon) $$

**派生元と改善内容**

- 勾配クリッピング (Gradient Norm Clipping)（`gradient_clipping`）から［クリッピング・安定化，適応的スケーリング］: 重みのノルムとの比に基づくユニットごとの適応的な閾値
- LARS (Layer-wise Adaptive Rate Scaling)（`lars`）から［適応的スケーリング，クリッピング・安定化］: 重みと勾配のノルム比に基づく層・ユニットごとの制御

---

## ASAM (Adaptive Sharpness-Aware Minimization)

- **ID**: `asam`
- **発表年**: 2021
- **Citation数（概算）**: 600
- **分野タグ**: 平坦解探索，正則化
- **参考文献**: https://arxiv.org/abs/2102.11600

**概要**

SAMの鋭さの定義は固定半径の近傍に基づくため，重みのスケールを変えても関数が変わらないモデルでは鋭さの値が変化してしまう問題を指摘した手法である．重みの大きさに応じて近傍の形状を調整する適応的な鋭さを導入することで，スケール不変性を持たせ，汎化性能との相関を改善する．

**更新式**

$$ {\mathbf T}_{\mathbf w} = \mathrm{diag}(|{\mathbf w}_t|), \quad \hat{\boldsymbol\epsilon}({\mathbf w}_t) = \rho \frac{{\mathbf T}_{\mathbf w}^2 \nabla f_t({\mathbf w}_t)}{\|{\mathbf T}_{\mathbf w} \nabla f_t({\mathbf w}_t)\|}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_t({\mathbf w}_t + \hat{\boldsymbol\epsilon}({\mathbf w}_t)) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: 重みのスケールに応じた適応的な近傍（スケール不変な鋭さ）の導入

---

## CAGrad (Conflict-Averse Gradient Descent)

- **ID**: `cagrad`
- **発表年**: 2021
- **Citation数（概算）**: 400
- **分野タグ**: マルチタスク・多目的
- **参考文献**: https://arxiv.org/abs/2110.14048

**概要**

平均損失の勾配の近傍の中で，最も改善の小さいタスクの改善量を最大化する方向を更新方向とする手法である．近傍の半径により，平均損失の勾配降下（半径0）とMGDA（半径大）の間を連続的に補間でき，平均損失の最小化への収束を保証しつつタスク間の衝突を緩和する．

**更新式**

$$ {\mathbf d}^* = \arg\max_{{\mathbf d} : \|{\mathbf d} - {\mathbf g}_0\| \le c \|{\mathbf g}_0\|} \; \min_{k} \, {\mathbf g}_k^\top {\mathbf d}, \quad {\mathbf g}_0 = \frac{1}{K} \sum_{k} {\mathbf g}_k, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf d}^* $$

**派生元と改善内容**

- MGDA (Multiple-Gradient Descent Algorithm)（`mgda`）から［問題設定への適用］: 平均勾配の近傍での最悪タスクの改善最大化（MGDAとの補間）
- PCGrad (Projecting Conflicting Gradients)（`pcgrad`）から［問題設定への適用，理論的再解釈・一般化］: 衝突の緩和と平均損失への収束保証の両立

---

## DP-FTRL (Differentially Private Follow-The-Regularized-Leader)

- **ID**: `dp_ftrl`
- **発表年**: 2021
- **Citation数（概算）**: 300
- **分野タグ**: 差分プライバシー，オンライン学習
- **参考文献**: https://arxiv.org/abs/2103.00039

**概要**

DP-SGDのプライバシー保証は，データのランダムなサンプリング（シャッフル）によるプライバシー増幅に依存するが，連合学習などではこれを保証しにくい問題に対し，FTRLの勾配の累積和に木構造集約（tree aggregation）で相関のある雑音を加える手法である．サンプリングに依存せずに，DP-SGDと同等以上のプライバシーと精度のトレードオフを達成し，実運用の連合学習（Gboard）に用いられた．

**更新式**

$$ {\mathbf s}_t = \sum_{i \le t} \bar{\mathbf g}_i + \mathrm{TreeNoise}_t \;\; (\text{木構造集約による相関雑音}), \quad {\mathbf w}_{t+1} = \arg\min_{{\mathbf w}} \left\{ \langle {\mathbf s}_t, {\mathbf w} \rangle + \frac{\lambda}{2} \|{\mathbf w} - {\mathbf w}_0\|^2 \right\} $$

**派生元と改善内容**

- FTRL-Proximal (Follow The Regularized Leader)（`ftrl`）から［問題設定への適用］: 勾配の累積和に基づく更新への差分プライバシーの導入
- DP-SGD (Differentially Private SGD)（`dp_sgd`）から［問題設定への適用］: サンプリングに依存しない木構造集約による雑音付加への置き換え

---

## ESAM (Efficient Sharpness-Aware Minimization)

- **ID**: `esam`
- **発表年**: 2021
- **Citation数（概算）**: 250
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2110.03141

**概要**

SAMは1ステップに2回の勾配計算を必要とし，計算コストが約2倍になる問題に対し，摂動を一部のパラメータのみにランダムに加える確率的重み摂動と，鋭さへの寄与の大きいデータのみを選んで2回目の勾配を計算するデータ選択の2つの工夫により，SAMの効果を保ちつつ計算コストを削減した手法である．

**更新式**

$$ \hat{\boldsymbol\epsilon} = \rho \frac{{\mathbf a} \odot \nabla f_{B}({\mathbf w}_t)}{\|\nabla f_{B}({\mathbf w}_t)\|}, \;\; a_i \sim \mathrm{Bernoulli}(\beta), \quad B^+ = \{ i : f_i({\mathbf w}_t + \hat{\boldsymbol\epsilon}) - f_i({\mathbf w}_t) \text{が上位} \}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_{B^+}({\mathbf w}_t + \hat{\boldsymbol\epsilon}) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，確率化・部分化］: 確率的な重み摂動と鋭さに敏感なデータ選択による計算コストの削減

---

## FedDyn (Federated Dynamic Regularization)

- **ID**: `feddyn`
- **発表年**: 2021
- **Citation数（概算）**: 800
- **分野タグ**: 分散学習，正則化
- **参考文献**: https://arxiv.org/abs/2111.04263

**概要**

各クライアントのローカル目的関数に，過去の勾配情報から動的に更新される線形項と近接項からなる正則化を加えることで，ローカルの最適解がグローバルな目的関数の停留点と一致するようにする手法である．クライアントが部分的にしか参加しない場合や非IIDのデータでも，通信回数を大幅に削減する．

**更新式**

$$ {\mathbf w}^{k}_{t} = \arg\min_{{\mathbf w}} \left\{ f_k({\mathbf w}) - \langle \nabla f_k({\mathbf w}^{k}_{t-1}), {\mathbf w} \rangle + \frac{\alpha}{2} \|{\mathbf w} - {\mathbf w}_{t-1}\|^2 \right\}, \quad \nabla f_k({\mathbf w}^{k}_{t}) = \nabla f_k({\mathbf w}^{k}_{t-1}) - \alpha ({\mathbf w}^{k}_{t} - {\mathbf w}_{t-1}) $$

**派生元と改善内容**

- FedProx（`fedprox`）から［正則化・重み減衰］: 過去の勾配に基づく動的な線形項の追加（ローカル最適解とグローバル停留点の一致）

---

## MADGRAD (Momentumized, Adaptive, Dual averaged GRADient)

- **ID**: `madgrad`
- **発表年**: 2021
- **Citation数（概算）**: 100
- **分野タグ**: 適応的学習率，重み平均化
- **参考文献**: https://arxiv.org/abs/2101.11075

**概要**

AdaGradの双対平均化版に慣性項を組み合わせた手法である．勾配の累積和と勾配2乗の累積和の3乗根による正規化を用い，初期点からの変位として次の点を構成することで，画像分類・言語モデル・音声認識など多様なタスクでSGDやAdamと同等以上の性能を示す．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \lambda_t = \eta \sqrt{t+1}, \quad {\mathbf s}_t = {\mathbf s}_{t-1} + \lambda_t {\mathbf g}_t, \quad \boldsymbol\nu_t = \boldsymbol\nu_{t-1} + \lambda_t {\mathbf g}_t^2, \quad {\mathbf z}_{t+1} = {\mathbf w}_0 - \frac{{\mathbf s}_t}{\sqrt[3]{\boldsymbol\nu_t} + \epsilon}, \quad {\mathbf w}_{t+1} = (1 - c) {\mathbf w}_t + c \, {\mathbf z}_{t+1} $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［適応的スケーリング］: 勾配2乗累積の3乗根による正規化
- 双対平均化法 (Dual Averaging)（`dual_averaging`）から［重みの平均化・補間］: 双対平均化形式での更新
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速］: 反復点の補間による慣性効果の導入

---

## Nero (Neuronal Rotator)

- **ID**: `nero`
- **発表年**: 2021
- **Citation数（概算）**: 50
- **分野タグ**: 学習安定化，学習率自動調整
- **参考文献**: https://arxiv.org/abs/2102.07227

**概要**

ニューロン（重み行列の行）ごとに，入力重みベクトルの平均を0，ノルムを一定に保つ制約を課し，その超球面上で重みを回転させるように更新する手法である．重み減衰や学習率スケジュール，慣性項の調整なしに，ニューロンごとに正規化した相対的な更新を行い，多様なアーキテクチャで良好な性能を示す．

**更新式**

$$ \bar g_{t,i} = \frac{{\mathbf g}_{t,i}}{\sqrt{v_{t,i}}}, \;\; v_{t,i} = \beta v_{t-1,i} + (1 - \beta) \|{\mathbf g}_{t,i}\|^2, \quad {\mathbf w}_{t+1,i} = \mathrm{proj}\left( {\mathbf w}_{t,i} - \eta \|{\mathbf w}_{t,i}\| \bar g_{t,i} \right), \quad \mathrm{proj} : \text{平均0・ノルム一定への射影} $$

**派生元と改善内容**

- Fromage (Frobenius Matched Gradient Descent)（`fromage`）から［符号化・正規化・直交化］: 層単位からニューロン単位への相対的な更新の細分化と超球面上への射影
- LARS (Layer-wise Adaptive Rate Scaling)（`lars`）から［符号化・正規化・直交化，適応的スケーリング］: ニューロンごとのノルムに基づく更新量の制御

---

## 1-bit Adam

- **ID**: `onebit_adam`
- **発表年**: 2021
- **Citation数（概算）**: 150
- **分野タグ**: 分散学習，適応的学習率
- **参考文献**: https://arxiv.org/abs/2102.02888

**概要**

Adamは非線形な2次モーメントを含むため，誤差フィードバック付きの1bit圧縮をそのまま適用できない問題に対し，学習初期のウォームアップ期間に通常のAdamで2次モーメントを推定した後，それを固定して1次モーメントのみを誤差フィードバック付きの1bit圧縮で通信する手法である．Adamと同等の収束性を保ちつつ，通信量を最大5分の1程度に削減する．

**更新式**

$$ {\mathbf v} \leftarrow {\mathbf v}_{T_w} \;\; (\text{ウォームアップ後に固定}), \quad {\mathbf m}^k_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}^k_t, \quad {\mathbf m}_t = \mathrm{EF\text{-}1bit\text{-}AllReduce}(\{{\mathbf m}^k_t\}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{{\mathbf m}_t}{\sqrt{{\mathbf v}} + \epsilon} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［分散化・通信削減，圧縮・量子化・低ランク］: ウォームアップ後の2次モーメントの固定による線形化
- EF-SignSGD (Error Feedback)（`ef_signsgd`）から［圧縮・量子化・低ランク，分散化・通信削減］: 1次モーメントの誤差フィードバック付き1bit圧縮通信

---

## 1-bit LAMB

- **ID**: `onebit_lamb`
- **発表年**: 2021
- **Citation数（概算）**: 30
- **分野タグ**: 分散学習，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2104.06069

**概要**

1-bit Adamの誤差フィードバック付き1bit圧縮通信を，大規模バッチ学習で用いられるLAMBに拡張した手法である．LAMBの層ごとの信頼比が圧縮によって不安定になる問題に対し，ウォームアップ期間の信頼比の推移を利用して圧縮期間中の信頼比を推定することで，BERTの事前学習をLAMBと同等の精度で，通信量を大幅に削減して行う．

**更新式**

$$ {\mathbf m}_t = \mathrm{EF\text{-}1bit\text{-}AllReduce}(\{{\mathbf m}^k_t\}), \quad r^\ell_t = \mathrm{clip}\left( \frac{\|{\mathbf w}^\ell_t\|}{\|{\mathbf u}^\ell_t\|} \cdot c^\ell_t, \; r_{\min}, r_{\max} \right), \quad {\mathbf w}^\ell_{t+1} = {\mathbf w}^\ell_t - \eta \, r^\ell_t \, {\mathbf u}^\ell_t \quad ({\mathbf u} = {\mathbf m} / \sqrt{{\mathbf v}_{\mathrm{frozen}}}) $$

**派生元と改善内容**

- 1-bit Adam（`onebit_adam`）から［圧縮・量子化・低ランク，分散化・通信削減］: 誤差フィードバック付き1bit圧縮通信の層ごとの適応的手法への拡張
- LAMB (Layer-wise Adaptive Moments optimizer for Batch training)（`lamb`）から［分散化・通信削減］: 層ごとの信頼比の圧縮下での推定

---

## SWAD (Stochastic Weight Averaging Densely)

- **ID**: `swad`
- **発表年**: 2021
- **Citation数（概算）**: 600
- **分野タグ**: 平坦解探索，重み平均化
- **参考文献**: https://arxiv.org/abs/2102.08604

**概要**

ドメイン汎化（学習時に見ていないドメインへの汎化）において平坦な解が有効であることを理論的に示し，SWAを周期的ではなく毎ステップ密に，かつ検証損失に基づいて過学習が始まる前の区間に限って重みを平均する手法である．複数のドメイン汎化ベンチマークで大きな性能改善を示した．

**更新式**

$$ {\mathbf w}_{\mathrm{SWAD}} = \frac{1}{t_e - t_s + 1} \sum_{t = t_s}^{t_e} {\mathbf w}_t \quad (t_s, t_e : \text{検証損失に基づく平均化の開始・終了ステップ}) $$

**派生元と改善内容**

- 確率的重み平均化 (Stochastic Weight Averaging, SWA)（`swa`）から［重みの平均化・補間，平坦化・雑音］: 毎ステップの密な重み平均と検証損失に基づく平均区間の選択

---

## Adan (Adaptive Nesterov Momentum)

- **ID**: `adan`
- **発表年**: 2022
- **Citation数（概算）**: 400
- **分野タグ**: 適応的学習率，高速化
- **参考文献**: https://arxiv.org/abs/2208.06677

**概要**

Nesterovの加速勾配法では先読み位置での勾配評価のために追加の計算が必要となる問題に対し，勾配の差分を用いて先読み勾配を近似する再定式化を導入した手法である．勾配，勾配差分，先読み勾配の2乗のそれぞれに指数移動平均を取り，分離型の重み減衰と組み合わせることで，視覚・言語モデルの学習を高速化する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = (1 - \beta_1) {\mathbf m}_{t-1} + \beta_1 {\mathbf g}_t, \quad {\mathbf d}_t = (1 - \beta_2) {\mathbf d}_{t-1} + \beta_2 ({\mathbf g}_t - {\mathbf g}_{t-1}), \quad {\mathbf n}_t = (1 - \beta_3) {\mathbf n}_{t-1} + \beta_3 [{\mathbf g}_t + (1 - \beta_2)({\mathbf g}_t - {\mathbf g}_{t-1})]^2, \quad {\mathbf w}_{t+1} = \frac{1}{1 + \lambda \eta} \left[ {\mathbf w}_t - \frac{\eta}{\sqrt{{\mathbf n}_t} + \epsilon} \odot ({\mathbf m}_t + (1 - \beta_2) {\mathbf d}_t) \right] $$

**派生元と改善内容**

- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速］: 勾配差分による先読み勾配の近似（追加の勾配計算が不要なNesterov型慣性）
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［慣性項・加速，適応的スケーリング］: Nesterov型慣性の適応的学習率・分離型重み減衰との統合

---

## Amos

- **ID**: `amos`
- **発表年**: 2022
- **Citation数（概算）**: 30
- **分野タグ**: 適応的学習率，正則化
- **参考文献**: https://arxiv.org/abs/2210.11693
- **備考**: 更新式は論文の手続きを簡略化した表記である．

**概要**

モデルの構造から決まる各パラメータの望ましいスケールの情報を用い，そのスケールに向けて重みを引き寄せる適応的な重み減衰と，学習率の自動的な減衰を組み合わせたAdam型の手法である．BERTやT5の事前学習において，AdamWの最良設定より少ないステップ数と，より少ないオプティマイザ状態のメモリで同等以上の損失に到達する．

**更新式**

$$ \hat v_t = \beta \hat v_{t-1} + (1 - \beta) \, \mathrm{mean}({\mathbf g}_t^2), \quad \gamma_t = \frac{c \, \eta_t^2}{\hat v_t} \|{\mathbf g}_t\|^2 \;\; (\text{適応的な重み減衰係数}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta \, \tilde\eta}{\sqrt{\hat v_t}} \, d_t \, {\mathbf g}_t - \frac{1}{2} \gamma_t {\mathbf w}_t \quad (\tilde\eta : \text{モデルが定めるスケール}) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［正則化・重み減衰，学習率の自動化・スケジュール］: モデル由来のスケールに基づく適応的な重み減衰と学習率の自動減衰
- Adafactor（`adafactor`）から［圧縮・量子化・低ランク］: スカラーに縮約した2次モーメントによるメモリ削減

---

## FedSAM / MoFedSAM

- **ID**: `fedsam`
- **発表年**: 2022
- **Citation数（概算）**: 300
- **分野タグ**: 分散学習，平坦解探索
- **参考文献**: https://arxiv.org/abs/2206.02618

**概要**

連合学習でローカルの最適化に通常の経験損失最小化を用いると，グローバルモデルが鋭い谷に導かれ，一部のクライアントで性能のばらつきが大きくなる問題に対し，ローカルの最適化手法としてSAMを用いる手法である．ローカルとグローバルのモデルを慣性項で結び付けた変種（MoFedSAM）も提案し，非IIDのデータで汎化性能を改善する．

**更新式**

$$ {\mathbf w}^{k}_{t,i+1} = {\mathbf w}^{k}_{t,i} - \eta \nabla f_k\left( {\mathbf w}^{k}_{t,i} + \rho \frac{\nabla f_k({\mathbf w}^{k}_{t,i})}{\|\nabla f_k({\mathbf w}^{k}_{t,i})\|} \right), \quad {\mathbf w}_{t+1} = \frac{1}{K} \sum_{k} {\mathbf w}^{k}_{t,E} $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［平坦化・雑音］: ローカル最適化のSAMへの置き換え
- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，問題設定への適用］: 平坦解探索の連合学習への適用

---

## Fisher SAM

- **ID**: `fisher_sam`
- **発表年**: 2022
- **Citation数（概算）**: 100
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2206.04920

**概要**

SAMが用いるユークリッド球の近傍は，パラメータ空間の幾何構造（確率分布間の距離）を反映していない問題に対し，フィッシャー情報行列で定まる楕円体の近傍で鞍点を探索する手法である．情報幾何に基づく近傍により，より意味のある鋭さを評価し，汎化性能を改善する．

**更新式**

$$ \hat{\boldsymbol\epsilon} = \rho \frac{{\mathbf F}({\mathbf w}_t)^{-1} \nabla f({\mathbf w}_t)}{\sqrt{\nabla f({\mathbf w}_t)^\top {\mathbf F}({\mathbf w}_t)^{-1} \nabla f({\mathbf w}_t)}}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f({\mathbf w}_t + \hat{\boldsymbol\epsilon}) \quad ({\mathbf F} : \text{対角フィッシャー近似}) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，曲率・前処理］: フィッシャー情報行列に基づく楕円体の近傍の導入
- 自然勾配法 (Natural Gradient Descent)（`natural_gradient`）から［曲率・前処理，平坦化・雑音］: パラメータ空間の情報幾何の鋭さの評価への利用

---

## Forward Gradient (Gradients without Backpropagation)

- **ID**: `forward_gradient`
- **発表年**: 2022
- **Citation数（概算）**: 200
- **分野タグ**: ゼロ次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2202.08587

**概要**

ランダムな方向ベクトルに対する方向微分を自動微分の順方向モードで1回の順伝播と同時に計算し，その方向微分と方向ベクトルの積を勾配の不偏推定量として用いる手法である．誤差逆伝播を必要とせず，有限差分によるゼロ次手法と異なり厳密な方向微分を用いるため推定の偏りがない．

**更新式**

$$ {\mathbf v} \sim \mathcal{N}({\mathbf 0}, {\mathbf I}), \quad d = \nabla f({\mathbf w}_t)^\top {\mathbf v} \;\; (\text{順方向モード自動微分}), \quad {\mathbf g}_t = d \, {\mathbf v}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta {\mathbf g}_t $$

**派生元と改善内容**

- SPSA (Simultaneous Perturbation Stochastic Approximation)（`spsa`）から［確率化・部分化］: 有限差分の代わりに順方向モード自動微分による厳密な方向微分を用いた勾配推定

---

## 勾配ノルムペナルティ (Penalizing Gradient Norm)

- **ID**: `gradient_norm_penalty`
- **発表年**: 2022
- **Citation数（概算）**: 200
- **分野タグ**: 平坦解探索，正則化
- **参考文献**: https://arxiv.org/abs/2202.03599

**概要**

損失関数に勾配ノルムのペナルティを加えて，リプシッツ定数の小さい平坦な解へ誘導する手法である．ペナルティ項の勾配を，勾配方向に摂動させた点での勾配との差分（有限差分）で近似することで，ヘッセ行列を計算せずに効率的に最適化でき，SAMはその特殊ケースとみなせる．

**更新式**

$$ \tilde f({\mathbf w}) = f({\mathbf w}) + \lambda \|\nabla f({\mathbf w})\|, \quad \nabla \tilde f({\mathbf w}_t) \approx (1 - \alpha) \nabla f({\mathbf w}_t) + \alpha \nabla f\left( {\mathbf w}_t + r \frac{\nabla f({\mathbf w}_t)}{\|\nabla f({\mathbf w}_t)\|} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla \tilde f({\mathbf w}_t) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，理論的再解釈・一般化］: 勾配ノルムのペナルティとしての一般化（SAMとの補間）

---

## GSAM (Surrogate Gap Guided Sharpness-Aware Minimization)

- **ID**: `gsam`
- **発表年**: 2022
- **Citation数（概算）**: 300
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2203.08065

**概要**

SAMの摂動後の損失は，鋭い最小値と平坦な最小値の双方で小さくなり得るため，平坦な解を必ずしも見つけられない問題を指摘した手法である．摂動後の損失と元の損失の差（サロゲートギャップ）を鋭さの指標とし，SAMの勾配に直交する方向でこれを最小化する上昇ステップを加えることで，汎化性能を改善する．

**更新式**

$$ \nabla f_p = \nabla f({\mathbf w}_t + \hat{\boldsymbol\epsilon}), \quad \nabla f_{\perp} = \nabla f({\mathbf w}_t) - \frac{\langle \nabla f({\mathbf w}_t), \nabla f_p \rangle}{\|\nabla f_p\|^2} \nabla f_p, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta (\nabla f_p - \alpha \nabla f_{\perp}) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: サロゲートギャップを最小化する直交方向の上昇ステップの追加

---

## LAWA (Latest Weight Averaging)

- **ID**: `lawa`
- **発表年**: 2022
- **Citation数（概算）**: 80
- **分野タグ**: 重み平均化
- **参考文献**: https://arxiv.org/abs/2209.14981

**概要**

学習中の直近k個のエポック終了時点の重みを平均する手法である．学習率を大きく保ったままでも，直近の重みの平均が学習率を減衰させた場合に近い性能を示すことから，ImageNetやBERTの学習において，同じ性能に到達するまでの学習時間を大幅に短縮できることを示した．

**更新式**

$$ {\mathbf w}_{\mathrm{LAWA}} = \frac{1}{k} \sum_{j = e-k+1}^{e} {\mathbf w}^{(j)} \quad ({\mathbf w}^{(j)} : \text{エポック } j \text{ 終了時の重み}) $$

**派生元と改善内容**

- 確率的重み平均化 (Stochastic Weight Averaging, SWA)（`swa`）から［重みの平均化・補間］: 直近の少数のチェックポイントのみの平均による学習の早期化

---

## LookSAM

- **ID**: `looksam`
- **発表年**: 2022
- **Citation数（概算）**: 200
- **分野タグ**: 平坦解探索，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2203.02714

**概要**

SAMの摂動点での勾配計算を毎ステップではなく数ステップごとにのみ行い，その間は以前に求めたSAM勾配の通常勾配に直交する成分を再利用する手法である．SAMとほぼ同等の汎化性能を保ちつつ計算コストを大幅に削減し，層ごとの学習率スケーリングと組み合わせて大規模バッチでのViTの学習を可能にした．

**更新式**

$$ {\mathbf g}_s = \nabla f({\mathbf w}_t + \hat{\boldsymbol\epsilon}), \;\; {\mathbf g}_v = {\mathbf g}_s - \frac{\langle {\mathbf g}_s, \nabla f({\mathbf w}_t) \rangle}{\|\nabla f({\mathbf w}_t)\|^2} \nabla f({\mathbf w}_t) \;\; (t \bmod k = 0), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \nabla f({\mathbf w}_t) + \alpha \frac{\|\nabla f({\mathbf w}_t)\|}{\|{\mathbf g}_v\|} {\mathbf g}_v \right) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，確率化・部分化］: 摂動点での勾配計算の間引きと直交成分の再利用

---

## μP (Maximal Update Parametrization, μTransfer)

- **ID**: `mup`
- **発表年**: 2022
- **Citation数（概算）**: 600
- **分野タグ**: 学習率スケジュール，学習率自動調整
- **参考文献**: https://arxiv.org/abs/2203.03466
- **備考**: Tensor Programs V（Yang et al., 2022）を参考文献とした．更新式はAdamに対するスケーリング規則の簡略表記である．

**概要**

モデルの幅を大きくしても各層の特徴量の更新量が一定の大きさに保たれるように，層ごとの初期化の分散と学習率（SGDとAdamで異なる）を幅に応じてスケーリングするパラメータ化である．この下では最適な学習率などのハイパーパラメータが幅によらずほぼ一定となり，小さなモデルで調整した値を大規模モデルにそのまま転移できる．

**更新式**

$$ \text{(Adam)} \;\; \eta_{\ell} = \begin{cases} \eta & (\text{入力層・バイアス}) \\ \eta \, / \, \mathrm{fan\_in} & (\text{隠れ層}) \\ \eta \, / \, \mathrm{fan\_in} & (\text{出力層，出力乗数 } 1/\mathrm{fan\_in}) \end{cases}, \quad {\mathbf W}^\ell_{t+1} = {\mathbf W}^\ell_t - \eta_\ell \frac{\hat{\mathbf m}^\ell_t}{\sqrt{\hat{\mathbf v}^\ell_t} + \epsilon} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［学習率の自動化・スケジュール，適応的スケーリング］: モデル幅に応じた層ごとの学習率のスケーリング
- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［学習率の自動化・スケジュール，適応的スケーリング］: モデル幅に応じた層ごとの学習率と初期化のスケーリング

---

## Nash-MTL

- **ID**: `nash_mtl`
- **発表年**: 2022
- **Citation数（概算）**: 300
- **分野タグ**: マルチタスク・多目的
- **参考文献**: https://arxiv.org/abs/2202.01017

**概要**

マルチタスク学習の勾配の結合を，各タスクを更新方向の決定に参加するプレイヤーとみなした交渉ゲームとして定式化し，ナッシュ交渉解として得られる重みでタスクの勾配を結合する手法である．どのタスクにも支配されないスケール不変な更新方向が得られ，多様なマルチタスク学習のベンチマークで高い性能を示す．

**更新式**

$$ \boldsymbol\alpha^* : \; ({\mathbf G}^\top {\mathbf G}) \boldsymbol\alpha = 1 / \boldsymbol\alpha \;\; (\text{要素ごと}), \quad {\mathbf d} = {\mathbf G} \boldsymbol\alpha^* = \sum_{k} \alpha^*_k {\mathbf g}_k, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf d} $$

**派生元と改善内容**

- MGDA (Multiple-Gradient Descent Algorithm)（`mgda`）から［問題設定への適用］: ナッシュ交渉解によるスケール不変なタスク勾配の結合

---

## PSGD Kron (Lie Group Preconditioners)

- **ID**: `psgd_kron`
- **発表年**: 2022
- **Citation数（概算）**: 30
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2211.04422

**概要**

PSGDの前処理行列を連結なリー群（三角行列のクロネッカー積等）に制約し，群の構造を保つ更新でオンラインに推定する手法である．群の不変性により減衰（ダンピング）の調整が不要となり，直線探索を必要とせず勾配の雑音にも頑健である．実装のKron版は大規模学習でもShampooやSOAPと並ぶ性能を示している．

**更新式**

$$ {\mathbf P} = {\mathbf Q}^\top {\mathbf Q}, \;\; {\mathbf Q} = {\mathbf Q}_1 \otimes {\mathbf Q}_2 \;\; ({\mathbf Q}_i : \text{上三角}), \quad {\mathbf Q} \leftarrow {\mathbf Q} - \eta_Q \frac{\nabla_{\mathcal{E}} c({\mathbf Q})}{\|\nabla_{\mathcal{E}} c({\mathbf Q})\|} {\mathbf Q}, \quad c({\mathbf Q}) = \mathbb{E}[\delta{\mathbf g}^\top {\mathbf P} \delta{\mathbf g} + \delta{\mathbf w}^\top {\mathbf P}^{-1} \delta{\mathbf w}], \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta {\mathbf P} {\mathbf g}_t $$

**派生元と改善内容**

- PSGD (Preconditioned Stochastic Gradient Descent)（`psgd`）から［曲率・前処理，圧縮・量子化・低ランク］: 前処理行列のリー群への制約とクロネッカー因子化

---

## RWP (Random Weight Perturbation)

- **ID**: `rwp`
- **発表年**: 2022
- **Citation数（概算）**: 60
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2211.11489

**概要**

SAMの2回の逐次的な勾配計算を不要にするため，フィルタ単位でスケーリングしたランダムな重みの摂動の下での損失と元の損失の和を最小化する手法である．2つの勾配は独立に並列計算できるため通常の学習とほぼ同じ速度で学習でき，SAMの半分の学習時間で同等以上の汎化性能を示す．

**更新式**

$$ \boldsymbol\epsilon \sim \mathcal{N}({\mathbf 0}, \sigma^2 \mathrm{diag}(\|{\mathbf W}_{j}\|^2)), \quad {\mathbf g}_t = \lambda \nabla f({\mathbf w}_t + \boldsymbol\epsilon) + (1 - \lambda) \nabla f({\mathbf w}_t) \;\; (\text{並列計算}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta {\mathbf g}_t $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音，確率化・部分化］: 敵対的な摂動のランダムな摂動への置き換えによる並列化
- 勾配雑音の付加 (Adding Gradient Noise)（`gradient_noise`）から［平坦化・雑音］: フィルタ単位でスケーリングした重み空間の雑音の利用

---

## SAF (Sharpness-Aware Training for Free)

- **ID**: `saf`
- **発表年**: 2022
- **Citation数（概算）**: 100
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2205.14083

**概要**

SAMの2回目の勾配計算を不要にするため，鋭さの代理指標として，現在と過去のエポックにおける出力の差（KLダイバージェンス）を損失に加える手法である．過去の出力を保持しておくことで追加の勾配計算なしに鋭さを抑制し，ベースの最適化手法とほぼ同じ計算コストでSAMと同等の汎化性能を得る．

**更新式**

$$ \tilde f({\mathbf w}_t) = f({\mathbf w}_t) + \lambda \frac{1}{\tau} \mathrm{KL}\left( \frac{\mathbf{y}^{(e - \tilde E)}}{\tau} \, \Big\| \, \frac{\mathbf{y}^{(e)}({\mathbf w}_t)}{\tau} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla \tilde f({\mathbf w}_t) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: 過去の出力との差を代理指標とした追加の勾配計算なしの鋭さの抑制

---

## VeLO (Versatile Learned Optimizer)

- **ID**: `velo`
- **発表年**: 2022
- **Citation数（概算）**: 150
- **分野タグ**: 自動探索・メタ学習，学習率自動調整
- **参考文献**: https://arxiv.org/abs/2211.09760

**概要**

ニューラルネットワークで表現した最適化手法を，従来より3桁多い数のタスクと2桁多い計算資源でメタ学習した，汎用の学習された最適化手法である．テンソルごとのLSTMが小さなMLP型の更新則の重みを生成する階層的な構造をとり，ハイパーパラメータの調整なしで，多くのタスクで学習率を調整したAdam系の手法より高速に学習する．

**更新式**

$$ \boldsymbol\theta^{\mathrm{MLP}}_{\ell, t} = \mathrm{LSTM}_{\mathrm{tensor}}(\text{テンソル単位の統計量}), \quad {\mathbf w}^\ell_{t+1} = {\mathbf w}^\ell_t - \mathrm{MLP}({\mathbf g}^\ell_t, {\mathbf m}^\ell_t, {\mathbf v}^\ell_t, \dots; \boldsymbol\theta^{\mathrm{MLP}}_{\ell, t}) $$

**派生元と改善内容**

- Learning to Learn by Gradient Descent by Gradient Descent (L2L)（`l2l`）から［問題設定への適用］: 大規模なメタ学習とテンソル単位LSTM・パラメータ単位MLPの階層的構造

---

## 0/1 Adam

- **ID**: `zero_one_adam`
- **発表年**: 2022
- **Citation数（概算）**: 40
- **分野タグ**: 分散学習，適応的学習率
- **参考文献**: https://arxiv.org/abs/2202.06009

**概要**

1-bit Adamはウォームアップ期間に非圧縮の通信を必要とし，その後も毎ステップ通信する問題に対し，2次モーメントを適応的に固定（凍結）し，さらにローカルステップを導入して通信自体を省略できるようにした手法である．Adamと同等の性能を保ちつつ，通信量と通信回数を1-bit Adamよりさらに削減する．

**更新式**

$$ {\mathbf v}_t = \begin{cases} \mathrm{update}({\mathbf v}_{t-1}) & (t \in \mathcal{T}_v) \\ {\mathbf v}_{t-1} & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf m}_t = \begin{cases} \mathrm{EF\text{-}1bit\text{-}AllReduce}({\mathbf m}^k_t) & (t \in \mathcal{T}_u) \\ {\mathbf m}^k_t \;\; (\text{ローカルステップ}) & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{{\mathbf m}_t}{\sqrt{{\mathbf v}_t} + \epsilon} $$

**派生元と改善内容**

- 1-bit Adam（`onebit_adam`）から［分散化・通信削減，圧縮・量子化・低ランク］: 2次モーメントの適応的な凍結とローカルステップによる通信回数の削減

---

## AdaLomo

- **ID**: `adalomo`
- **発表年**: 2023
- **Citation数（概算）**: 50
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2310.10195

**概要**

LOMOはSGDを用いるため学習率等に敏感であり，Adamに比べ性能が劣る問題に対し，Adafactorと同様に因子分解した2次モーメントによる適応的学習率をLOMOの層ごとの即時更新に組み合わせた手法である．LOMOと同程度の低メモリでAdamWに近い性能を達成する．

**更新式**

$$ {\mathbf r}^\ell_t = \beta {\mathbf r}^\ell_{t-1} + (1 - \beta) ({\mathbf G}^{\ell 2}_t) {\mathbf 1}, \quad {\mathbf c}^\ell_t = \beta {\mathbf c}^\ell_{t-1} + (1 - \beta) {\mathbf 1}^\top ({\mathbf G}^{\ell 2}_t), \quad {\mathbf W}^\ell_{t+1} = {\mathbf W}^\ell_t - \eta \frac{{\mathbf G}^\ell_t}{\sqrt{{\mathbf r}^\ell_t {\mathbf c}^\ell_t / {\mathbf 1}^\top {\mathbf r}^\ell_t}} \;\; (\text{逆伝播中に層ごとに即時更新}) $$

**派生元と改善内容**

- LOMO (LOw-Memory Optimization)（`lomo`）から［適応的スケーリング］: 層ごとの即時更新への適応的学習率の導入
- Adafactor（`adafactor`）から［適応的スケーリング，圧縮・量子化・低ランク］: 因子分解した2次モーメントによるメモリ効率の高い適応的学習率

---

## 4-bit Adam (Memory Efficient Optimizers with 4-bit States)

- **ID**: `adam_4bit`
- **発表年**: 2023
- **Citation数（概算）**: 60
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2309.01507

**概要**

8-bit Adamをさらに推し進め，Adamのモーメントを4bitで保持する手法である．2次モーメントの量子化で0付近の値が0に丸められることが不安定性の主因であることを示し，0を除外した線形量子化と，行・列の外れ値に対応する小さなブロックサイズ・ランク1の正規化を導入することで，精度を保ったまま状態量のメモリをさらに半減する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 Q_4^{-1}(\bar{\mathbf m}_{t-1}) + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 Q_4^{-1}(\bar{\mathbf v}_{t-1}) + (1 - \beta_2) {\mathbf g}_t^2, \quad \bar{\mathbf m}_t, \bar{\mathbf v}_t = Q_4({\mathbf m}_t), Q_4({\mathbf v}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} \quad (Q_4 : \text{4bit量子化}) $$

**派生元と改善内容**

- 8-bit Adam (Block-wise Quantized Adam)（`adam_8bit`）から［圧縮・量子化・低ランク］: 4bitへの量子化と0点を除外した2次モーメントの量子化

---

## α-SVRG

- **ID**: `alpha_svrg`
- **発表年**: 2023
- **Citation数（概算）**: 30
- **分野タグ**: 勾配分散低減
- **参考文献**: https://arxiv.org/abs/2311.05589

**概要**

SVRGが深層学習で有効でない原因として，学習初期には勾配の分散を減らすが後半には逆に増やしてしまうことを示し，分散低減項に学習とともに線形に減衰する係数αを掛ける手法である．分散を最小にする係数はネットワークが深いほど，学習が進むほど小さくなるという分析に基づき，多様なアーキテクチャの画像分類でベースラインやSVRGより低い訓練損失を達成する．

**更新式**

$$ {\mathbf g}_t = \nabla f_{i_t}({\mathbf w}_t) - \alpha_t \left( \nabla f_{i_t}(\tilde{\mathbf w}) - \nabla F(\tilde{\mathbf w}) \right), \quad \alpha_t = \alpha_0 \left( 1 - \frac{t}{T} \right), \quad {\mathbf w}_{t+1} = \mathrm{Optimizer}({\mathbf w}_t, {\mathbf g}_t) $$

**派生元と改善内容**

- SVRG (Stochastic Variance Reduced Gradient)（`svrg`）から［分散低減］: 分散低減項への線形に減衰する係数の導入による深層学習での有効化

---

## CAME (Confidence-guided Adaptive Memory Efficient Optimization)

- **ID**: `came`
- **発表年**: 2023
- **Citation数（概算）**: 150
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2307.02047

**概要**

Adafactorはメモリ効率に優れる一方，2次モーメントの因子分解近似の誤差により学習が不安定になることがある．本手法は，更新量とその指数移動平均との差（更新の信頼度）を同様に因子分解して推定し，信頼度の低い更新を抑制することで，Adafactorと同等のメモリ使用量でAdam並みの性能を達成する．

**更新式**

$$ {\mathbf U}_t = \frac{{\mathbf G}_t}{\sqrt{\hat{\mathbf V}_t}}, \quad {\mathbf M}_t = \beta_1 {\mathbf M}_{t-1} + (1 - \beta_1) \hat{\mathbf U}_t, \quad {\mathbf S}_t \approx \mathrm{Factorize}\left( \beta_3 {\mathbf S}_{t-1} + (1 - \beta_3) (\hat{\mathbf U}_t - {\mathbf M}_t)^2 \right), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \frac{{\mathbf M}_t}{\sqrt{{\mathbf S}_t}} $$

**派生元と改善内容**

- Adafactor（`adafactor`）から［圧縮・量子化・低ランク，クリッピング・安定化］: 更新量の信頼度（更新量と移動平均の差）の因子分解推定による不安定な更新の抑制

---

## D-Adaptation

- **ID**: `d_adaptation`
- **発表年**: 2023
- **Citation数（概算）**: 250
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2301.07733
- **備考**: 更新式は双対平均化に基づくD-Adapted Dual Averagingの簡略表記である．

**概要**

凸なリプシッツ関数に対する最適な学習率が，初期点から最適解までの距離Dに比例することに着目し，Dの下界を学習中に逐次推定して学習率を自動設定する手法である．学習率の調整なしに，Dが既知の場合と同等の漸近的な収束率を達成し，SGDやAdamへの適用版も提案されている．

**更新式**

$$ \lambda_t = \frac{d_t}{G}, \quad {\mathbf s}_{t+1} = {\mathbf s}_t + \lambda_t {\mathbf g}_t, \quad \hat d_{t+1} = \frac{\|{\mathbf s}_{t+1}\|^2 - \sum_{i=0}^{t} \lambda_i^2 \|{\mathbf g}_i\|^2}{2 \|{\mathbf s}_{t+1}\|}, \quad d_{t+1} = \max(d_t, \hat d_{t+1}), \quad {\mathbf w}_{t+1} = {\mathbf w}_0 - {\mathbf s}_{t+1} $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［学習率の自動化・スケジュール］: 初期点から最適解までの距離の逐次推定による学習率の自動設定
- 双対平均化法 (Dual Averaging)（`dual_averaging`）から［学習率の自動化・スケジュール］: 双対平均化の枠組みにおける距離の下界推定

---

## DiLoCo (Distributed Low-Communication Training)

- **ID**: `diloco`
- **発表年**: 2023
- **Citation数（概算）**: 300
- **分野タグ**: 分散学習，重み平均化
- **参考文献**: https://arxiv.org/abs/2311.08105

**概要**

接続の弱い計算資源の島（アイランド）間で言語モデルを学習するため，各ワーカーが内側の最適化手法としてAdamWで数百ステップ学習した後，パラメータの変化量を外側の勾配とみなしてNesterov型の慣性項で更新する，FedAvgの変種である．同期型の学習と同等の性能を，通信量を500分の1に抑えて達成した．

**更新式**

$$ {\mathbf w}^{k} \leftarrow \mathrm{AdamW}^{H}({\mathbf w}_t; D_k) \;\; (H\text{ステップ}), \quad \Delta_t = \frac{1}{K} \sum_{k=1}^{K} ({\mathbf w}_t - {\mathbf w}^{k}), \quad {\mathbf w}_{t+1} = \mathrm{Nesterov}({\mathbf w}_t, \Delta_t) $$

**派生元と改善内容**

- FedAvg (Federated Averaging)（`fedavg`）から［分散化・通信削減，重みの平均化・補間］: 長い内側ステップ数と外側の最適化手法によるパラメータ変化量の集約
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［分散化・通信削減］: 内側の最適化手法としての利用
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速，分散化・通信削減］: 外側の最適化手法としてのNesterov型慣性項の利用
- SlowMo (Slow Momentum)（`slowmo`）から［慣性項・加速，分散化・通信削減］: 外側の慣性項（Nesterov）による平均変化量の更新

---

## DoG (Distance over Gradients)

- **ID**: `dog`
- **発表年**: 2023
- **Citation数（概算）**: 100
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2302.12022

**概要**

学習率を，初期点から現在までに到達した最大距離を，これまでの勾配ノルムの2乗和の平方根で割った値として設定する，学習率の調整が不要な手法である．確率的な凸最適化において，最適な学習率を用いたSGDに近い収束保証を持ち，深層学習でも調整済みのSGDに近い性能を示す．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \bar r_t = \max\left( \max_{i \le t} \|{\mathbf w}_i - {\mathbf w}_0\|, \, r_\epsilon \right), \quad \eta_t = \frac{\bar r_t}{\sqrt{\sum_{i \le t} \|{\mathbf g}_i\|^2}}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf g}_t $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から［学習率の自動化・スケジュール］: AdaGrad-Norm型の分母と，初期点からの到達距離を分子とする学習率の自動設定
- AdaGrad-Norm（`adagrad_norm`）から［学習率の自動化・スケジュール］: AdaGrad-Normの分子への初期点からの到達距離の導入

---

## DoWG (Distance over Weighted Gradients)

- **ID**: `dowg`
- **発表年**: 2023
- **Citation数（概算）**: 50
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2305.16284

**概要**

DoGの学習率の分母である勾配ノルムの2乗和を，初期点からの到達距離で重み付けした和に置き換えた手法である．滑らかな問題と非滑らかな問題の双方で，学習率の調整なしに，最適な学習率を用いた勾配降下法と対数因子を除いて同等の収束率を達成する（普遍性）．

**更新式**

$$ \bar r_t = \max(\|{\mathbf w}_t - {\mathbf w}_0\|, \bar r_{t-1}), \quad v_t = v_{t-1} + \bar r_t^2 \|{\mathbf g}_t\|^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\bar r_t^2}{\sqrt{v_t}} {\mathbf g}_t $$

**派生元と改善内容**

- DoG (Distance over Gradients)（`dog`）から［学習率の自動化・スケジュール］: 到達距離で重み付けした勾配ノルムの累積による学習率の普遍化

---

## Eva (Kronecker-vectorized Second-order Optimization)

- **ID**: `eva`
- **発表年**: 2023
- **Citation数（概算）**: 40
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://mlanthology.org/iclr/2023/zhang2023iclr-eva/

**概要**

K-FACのクロネッカー因子（層への入力と出力側の勾配の共分散行列）を，ミニバッチ平均した小さなベクトルのクロネッカー積で近似し，Sherman-Morrisonの公式で逆行列を陽に計算せずに前処理を行う手法である．K-FACやShampooより少ないメモリと計算量で，SGDやK-FACより短い学習時間を達成する．

**更新式**

$$ \bar{\mathbf a} = \mathbb{E}[{\mathbf a}], \;\; \bar{\mathbf g} = \mathbb{E}[{\mathbf g}], \quad ({\mathbf C} + \gamma {\mathbf I})^{-1} {\mathbf v} = \frac{1}{\gamma} \left( {\mathbf v} - \frac{\bar{\mathbf c}^\top {\mathbf v}}{\gamma + \bar{\mathbf c}^\top \bar{\mathbf c}} \bar{\mathbf c} \right) \;\; (\bar{\mathbf c} \in \{\bar{\mathbf a}, \bar{\mathbf g}\}), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta (\bar{\mathbf g}\bar{\mathbf g}^\top + \gamma {\mathbf I})^{-1} \nabla_{\mathbf W} f (\bar{\mathbf a}\bar{\mathbf a}^\top + \gamma {\mathbf I})^{-1} $$

**派生元と改善内容**

- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理，圧縮・量子化・低ランク］: クロネッカー因子のベクトル近似とSherman-Morrisonによる逆行列計算の回避

---

## GAM (Gradient Norm Aware Minimization)

- **ID**: `gam`
- **発表年**: 2023
- **Citation数（概算）**: 100
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2303.03108

**概要**

SAMなどが最小化する近傍内の最悪ケースの損失（0次の平坦さ）は鋭さの指標として不十分であるとし，近傍内の勾配ノルムの最大値（1次の平坦さ）を損失に加えて最小化する手法である．勾配ノルムの最大値は確率的な勾配上昇とヘッセ行列とベクトルの積で近似し，SAMと組み合わせることでより平坦な解に到達する．

**更新式**

$$ \tilde f({\mathbf w}) = f({\mathbf w}) + \alpha \, \rho \max_{\|\boldsymbol\epsilon\| \le \rho} \|\nabla f({\mathbf w} + \boldsymbol\epsilon)\|, \quad \nabla \|\nabla f({\mathbf w})\| = \frac{\nabla^2 f({\mathbf w}) \nabla f({\mathbf w})}{\|\nabla f({\mathbf w})\|}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla \tilde f({\mathbf w}_t) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: 近傍内の勾配ノルムの最大値（1次の平坦さ）の最小化

---

## Lion (EvoLved Sign Momentum)

- **ID**: `lion`
- **発表年**: 2023
- **Citation数（概算）**: 500
- **分野タグ**: 符号ベース，メモリ効率
- **参考文献**: https://arxiv.org/abs/2302.06675

**概要**

プログラム探索によって自動的に発見された最適化手法である．現在の勾配と慣性項を補間した方向の符号のみを用いて更新し，慣性項は別の減衰率で更新する．2次モーメントを保持しないためAdamよりメモリ効率が高く，更新量の大きさがすべての成分で等しいため，AdamWより小さな学習率と大きな重み減衰を組み合わせて用いる．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf c}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \mathrm{sign}({\mathbf c}_t) + \lambda {\mathbf w}_t \right), \quad {\mathbf m}_t = \beta_2 {\mathbf m}_{t-1} + (1 - \beta_2) {\mathbf g}_t $$

**派生元と改善内容**

- signSGD / Signum（`signsgd`）から［慣性項・加速，符号化・正規化・直交化］: 勾配と慣性項の補間方向の符号による更新（2つの異なる減衰率の使い分け）
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［符号化・正規化・直交化，圧縮・量子化・低ランク］: 2次モーメントの除去と分離型重み減衰の維持（プログラム探索による発見）
- Neural Optimizer Search (PowerSign / AddSign)（`neural_optimizer_search`）から［問題設定への適用］: 数式としての更新則のプログラム探索（記号的探索）の発展

---

## Lion-K (Lion as Constrained Optimization)

- **ID**: `lion_k`
- **発表年**: 2023
- **Citation数（概算）**: 50
- **分野タグ**: 符号ベース，正則化
- **参考文献**: https://arxiv.org/abs/2310.05898

**概要**

Lionが，分離型の重み減衰と組み合わせることで，∞ノルムが重み減衰係数の逆数以下という制約の下での最適化を暗黙的に解いていることを，リアプノフ関数を用いて示した研究である．符号関数を一般の凸関数の劣勾配に置き換えたLion-Kという族に一般化し，異なる制約や正則化を持つ手法を系統的に導出する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf c}_t = \beta_1 {\mathbf m}_{t-1} - (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t + \eta \left( \nabla K({\mathbf c}_t) - \lambda {\mathbf w}_t \right), \quad {\mathbf m}_t = \beta_2 {\mathbf m}_{t-1} - (1 - \beta_2) {\mathbf g}_t \quad (K = \|\cdot\|_1 \Rightarrow \text{Lion}) $$

**派生元と改善内容**

- Lion (EvoLved Sign Momentum)（`lion`）から［理論的再解釈・一般化］: ∞ノルム制約付き最適化としての理論的解釈と一般の凸関数Kへの拡張

---

## LOMO (LOw-Memory Optimization)

- **ID**: `lomo`
- **発表年**: 2023
- **Citation数（概算）**: 200
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2306.09782

**概要**

大規模言語モデルの全パラメータのファインチューニングにおいて，全パラメータの勾配を保持してから更新するのではなく，誤差逆伝播で各層の勾配が計算された直後にその層のパラメータをSGDで更新して勾配を破棄する手法である．勾配のメモリをほぼ不要にし，限られたGPU資源で数百億パラメータ規模のモデルの全パラメータ学習を可能にした．

**更新式**

$$ \text{for } \ell = L, \dots, 1 : \;\; {\mathbf g}^\ell_t = \nabla_{{\mathbf w}^\ell} f_t, \quad {\mathbf w}^\ell_{t+1} = {\mathbf w}^\ell_t - \eta \, {\mathbf g}^\ell_t, \quad \text{直後に} \; {\mathbf g}^\ell_t \; \text{を破棄} $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［圧縮・量子化・低ランク］: 勾配計算とパラメータ更新の融合による勾配メモリの削減

---

## Mechanic

- **ID**: `mechanic`
- **発表年**: 2023
- **Citation数（概算）**: 60
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2306.00144

**概要**

任意の最適化手法と学習率スケジュールに対し，その更新量全体にかかるスケール係数を，オンライン凸最適化への帰着とパラメータフリーなチューナー（コインベッティング型）によって学習中に自動調整する手法である．多様な大規模タスクで，手動で調整した学習率に近いか，それを上回る性能を示す．

**更新式**

$$ \boldsymbol\Delta_t = \mathrm{Base}({\mathbf g}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_{\mathrm{ref}} + s_{t+1} \sum_{i \le t} \boldsymbol\Delta_i, \quad s_{t+1} = \mathrm{Tuner}\left( h_t = \langle \textstyle\sum_{i<t} \boldsymbol\Delta_i, {\mathbf g}_t \rangle \right) $$

**派生元と改善内容**

- COCOB (COntinuous COin Betting)（`cocob`）から［学習率の自動化・スケジュール］: パラメータフリーなチューナーによる任意の最適化手法の学習率スケールの自動調整

---

## MeZO (Memory-efficient Zeroth-order Optimizer)

- **ID**: `mezo`
- **発表年**: 2023
- **Citation数（概算）**: 400
- **分野タグ**: ゼロ次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2305.17333

**概要**

SPSAによるゼロ次の勾配推定を大規模言語モデルのファインチューニングに適用し，ランダムな摂動ベクトルを乱数シードから毎回再生成することで，推論時と同じメモリ量のみで学習を行う手法である．誤差逆伝播を一切用いずに，事前学習済みモデルの微調整で逆伝播によるファインチューニングに近い性能を示した．

**更新式**

$$ {\mathbf z} \sim \mathcal{N}({\mathbf 0}, {\mathbf I}) \;\; (\text{シードから再生成}), \quad \hat{\mathbf g}_t = \frac{f_B({\mathbf w}_t + \epsilon {\mathbf z}) - f_B({\mathbf w}_t - \epsilon {\mathbf z})}{2 \epsilon} {\mathbf z}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \hat{\mathbf g}_t $$

**派生元と改善内容**

- SPSA (Simultaneous Perturbation Stochastic Approximation)（`spsa`）から［圧縮・量子化・低ランク，確率化・部分化］: 乱数シードの再利用によるインプレースな摂動と大規模言語モデルへの適用

---

## MoMo (Momentum Models for Adaptive Learning Rates)

- **ID**: `momo`
- **発表年**: 2023
- **Citation数（概算）**: 50
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2305.07583

**概要**

各反復でサンプルした損失と勾配の慣性項（移動平均）から損失関数のモデルを構築し，損失の既知の下界（通常は0）でモデルを切り詰めた上で最小化することで，Polyak型の適応的学習率を得る手法である．SGD-M版（MoMo）とAdam版（MoMo-Adam）があり，学習率の選択に対する頑健性を改善する．

**更新式**

$$ \bar f_t = \beta \bar f_{t-1} + (1 - \beta) f_{i_t}({\mathbf w}_t), \quad {\mathbf d}_t = \beta {\mathbf d}_{t-1} + (1 - \beta) {\mathbf g}_t, \quad \tau_t = \min\left( \eta, \, \frac{(\bar f_t + \langle {\mathbf d}_t, {\mathbf w}_t \rangle - \gamma_t - f^*)_+}{\|{\mathbf d}_t\|^2} \right), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \tau_t {\mathbf d}_t $$

**派生元と改善内容**

- SPS (Stochastic Polyak Step-size)（`sps`）から［慣性項・加速，学習率の自動化・スケジュール］: 慣性項による損失・勾配のモデルを用いたPolyak型の学習率
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速，学習率の自動化・スケジュール］: 慣性項付き手法への適応的学習率の導入

---

## mSAM (Micro-batch Averaged SAM)

- **ID**: `msam`
- **発表年**: 2023
- **Citation数（概算）**: 60
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2302.09693

**概要**

ミニバッチをさらに小さなマイクロバッチに分割し，各マイクロバッチで独立にSAMの摂動と勾配を計算して平均する手法である．データ並列のSAMで各デバイスの摂動を共有しない場合の効果の理論的な説明を与え，SAMより平坦な解と良い汎化性能を示す．

**更新式**

$$ \hat{\boldsymbol\epsilon}_j = \rho \frac{\nabla f_{B_j}({\mathbf w}_t)}{\|\nabla f_{B_j}({\mathbf w}_t)\|}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{1}{m} \sum_{j=1}^{m} \nabla f_{B_j}({\mathbf w}_t + \hat{\boldsymbol\epsilon}_j) \quad (B_j : \text{マイクロバッチ}) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: マイクロバッチごとの独立な摂動とその平均

---

## Prodigy

- **ID**: `prodigy`
- **発表年**: 2023
- **Citation数（概算）**: 200
- **分野タグ**: 学習率自動調整
- **参考文献**: https://arxiv.org/abs/2306.06101
- **備考**: 更新式は勾配降下法版（Prodigy GD）の簡略表記である．

**概要**

D-Adaptationにおける距離Dの推定を，推定値自体で重み付けした形に修正することで，推定値の増加を速め，学習率が適切な値に到達するまでの時間を短縮した手法である．Adam版はDiffusionモデルのLoRA学習などで学習率調整不要のオプティマイザとして広く利用されている．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \eta_t = \frac{d_t^2}{\sqrt{\sum_{i \le t} d_i^2 \|{\mathbf g}_i\|^2}}, \quad \hat d_{t+1} = \frac{\sum_{i \le t} \eta_i \langle {\mathbf g}_i, {\mathbf w}_0 - {\mathbf w}_i \rangle}{\|\sum_{i \le t} \eta_i {\mathbf g}_i\|}, \quad d_{t+1} = \max(d_t, \hat d_{t+1}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t {\mathbf g}_t $$

**派生元と改善内容**

- D-Adaptation（`d_adaptation`）から［学習率の自動化・スケジュール］: 距離推定の推定値自身による重み付け（推定値の増加の高速化）

---

## ReLoRA (High-Rank Training Through Low-Rank Updates)

- **ID**: `relora`
- **発表年**: 2023
- **Citation数（概算）**: 150
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2307.05695

**概要**

低ランクの更新（LoRA）を一定ステップごとに元の重みに統合（マージ）し，新しい低ランク行列で学習を再開することを繰り返すことで，低ランクの更新の積み重ねにより高ランクの更新を実現する事前学習手法である．統合時にはオプティマイザの状態量の部分的なリセットと学習率の再ウォームアップを行う．

**更新式**

$$ {\mathbf W} = {\mathbf W}_0 + {\mathbf B}{\mathbf A}, \quad ({\mathbf A}, {\mathbf B}) \leftarrow \mathrm{AdamW}({\mathbf A}, {\mathbf B}), \quad \text{every } T : \; {\mathbf W}_0 \leftarrow {\mathbf W}_0 + {\mathbf B}{\mathbf A}, \;\; {\mathbf A}, {\mathbf B} \leftarrow \text{再初期化}, \;\; \text{状態量の部分リセット} $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［圧縮・量子化・低ランク］: 低ランク更新の周期的な統合と再初期化による高ランク化

---

## SINGD (Structured Inverse-Free Natural Gradient Descent)

- **ID**: `singd`
- **発表年**: 2023
- **Citation数（概算）**: 40
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2312.05705
- **備考**: 更新式は論文の手続きを簡略化した表記である．

**概要**

K-FACの逆行列計算をクロネッカー因子の逆行列の行列対数空間での引き算による直接更新に置き換えた逆行列不要のK-FAC（IKFAC）に，対角・ブロック対角・低ランク・Toeplitz等の構造を課すことで，メモリ効率と数値安定性を改善した手法である．半精度でもしばしばAdamWを上回る性能を示す．

**更新式**

$$ {\mathbf K} \leftarrow {\mathbf K} \left( {\mathbf I} - \frac{\beta_1}{2} \left( {\mathbf K}^\top {\mathbf A} {\mathbf K} + \lambda {\mathbf K}^\top {\mathbf K} - {\mathbf I} \right) \right), \;\; {\mathbf C} \leftarrow \cdots, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf C}{\mathbf C}^\top \nabla_{\mathbf W} f \, {\mathbf K}{\mathbf K}^\top \quad ({\mathbf K}, {\mathbf C} : \text{構造化された因子}) $$

**派生元と改善内容**

- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理，圧縮・量子化・低ランク］: 逆行列不要な因子の直接更新と因子への構造の付与

---

## Sketchy (Frequent Directions Shampoo)

- **ID**: `sketchy`
- **発表年**: 2023
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2302.03764

**概要**

全行列版AdaGradやShampooの前処理行列（勾配の外積の累積）の固有値スペクトルが少数の大きな値に集中することに着目し，ストリーミングの低ランク近似法であるFrequent Directionsで前処理行列を近似する手法である．Shampooの前処理行列のメモリを大幅に削減しつつ，同等の性能を示す．

**更新式**

$$ {\mathbf L}_t \approx \mathrm{FD}_\ell({\mathbf L}_{t-1}, {\mathbf G}_t) + \rho_t {\mathbf I}, \quad {\mathbf R}_t \approx \mathrm{FD}_\ell({\mathbf R}_{t-1}, {\mathbf G}_t^\top) + \rho'_t {\mathbf I}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf L}_t^{-1/4} {\mathbf G}_t {\mathbf R}_t^{-1/4} \quad (\mathrm{FD}_\ell : \text{ランク}\ell\text{のFrequent Directions}) $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［圧縮・量子化・低ランク］: Frequent Directionsによる前処理行列の低ランク近似とメモリ削減

---

## Sophia (Second-order Clipped Stochastic Optimization)

- **ID**: `sophia`
- **発表年**: 2023
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2305.14342

**概要**

大規模言語モデルの事前学習に向けて，ヘッセ行列の対角推定値を数ステップごとに更新し，その指数移動平均で慣性項を割った値を要素ごとにクリッピングして更新する手法である．曲率の大きい方向では小さく，平坦な方向では大きく更新しつつ，クリッピングにより非凸な領域や推定誤差による過大な更新を防ぐことで，Adamに比べ学習ステップ数を削減する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf h}_t = \beta_2 {\mathbf h}_{t-k} + (1 - \beta_2) \hat{\mathbf h}_t \;\; (k\text{ステップごと}), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \lambda {\mathbf w}_t - \eta \, \mathrm{clip}\left( \frac{{\mathbf m}_t}{\max(\gamma {\mathbf h}_t, \epsilon)}, 1 \right) $$

**派生元と改善内容**

- AdaHessian（`adahessian`）から［曲率・前処理，クリッピング・安定化］: ヘッセ対角推定の間欠的な更新と，要素ごとのクリッピングによる安定化
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［曲率・前処理］: 2次モーメントの曲率推定への置き換えと分離型重み減衰の維持

---

## StableAdamW

- **ID**: `stable_adamw`
- **発表年**: 2023
- **Citation数（概算）**: 200
- **分野タグ**: 学習安定化，適応的学習率
- **参考文献**: https://arxiv.org/abs/2304.13013
- **備考**: 低精度学習（SwitchBack）と併せて提案された論文であり，Citation数は論文全体の概算である．

**概要**

大規模な視覚言語モデルの学習で生じる損失スパイクが，AdamWの2次モーメントが勾配の2乗を過小評価した数ステップ後に起こることを示し，AdafactorのUpdate Clippingを組み合わせた手法である．勾配の2乗と2次モーメントの比が大きい場合にテンソルごとに学習率を下げることで，勾配クリッピングより効果的に損失スパイクを抑える．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \mathrm{RMS}_t = \sqrt{\mathbb{E}\left[ {\mathbf g}_t^2 / \hat{\mathbf v}_t \right]}, \quad \eta_t = \frac{\eta}{\max(1, \mathrm{RMS}_t)}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \left( \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} + \lambda {\mathbf w}_t \right) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［クリッピング・安定化］: テンソルごとの学習率の自動縮小による損失スパイクの抑制
- Adafactor（`adafactor`）から［クリッピング・安定化］: Update Clipping（勾配2乗と2次モーメントの比によるクリッピング）の導入

---

## AdaFisher

- **ID**: `adafisher`
- **発表年**: 2024
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2405.16397

**概要**

Adamの2次モーメントを，フィッシャー情報行列の対角ブロック・クロネッカー積による近似で置き換えた適応的な2次最適化手法である．クロネッカー因子の対角成分のみを用いることで，1次手法と同程度のメモリと計算時間で，画像分類や言語モデルにおいてAdam系の手法より高い精度と速い収束を示す．

**更新式**

$$ \tilde{\mathbf F}_t = \mathrm{diag}(\mathbb{E}[{\mathbf a}^2]) \otimes \mathrm{diag}(\mathbb{E}[{\mathbf g}^2]), \quad \hat{\mathbf F}_t = \beta_2 \hat{\mathbf F}_{t-1} + (1 - \beta_2) \tilde{\mathbf F}_t, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{\hat{\mathbf m}_t}{\hat{\mathbf F}_t + \epsilon} $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［曲率・前処理］: 2次モーメントのフィッシャー情報行列の近似への置き換え
- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理］: フィッシャー情報行列の対角ブロック・クロネッカー近似

---

## Adam-atan2

- **ID**: `adam_atan2`
- **発表年**: 2024
- **Citation数（概算）**: 150
- **分野タグ**: 適応的学習率，学習安定化
- **参考文献**: https://arxiv.org/abs/2407.05872
- **備考**: 大規模なパラメータ化と最適化手法のスケーリング則に関する論文（Everett et al., 2024）の中で提案された．Citation数は論文全体の概算である．

**概要**

Adamのゼロ除算を防ぐためのεは，勾配が非常に小さい場合やモデルの大規模化に伴い更新量の大きさを変化させ，ハイパーパラメータの転移を妨げる．本手法は，除算とεを逆正接関数atan2に置き換えることで，εを不要にし，スケール不変で有界な更新量を得る．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, a \cdot \mathrm{atan2}(\hat{\mathbf m}_t, \, b \sqrt{\hat{\mathbf v}_t}) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［クリッピング・安定化］: 除算とεの逆正接関数（atan2）による置き換え

---

## Adam-mini

- **ID**: `adam_mini`
- **発表年**: 2024
- **Citation数（概算）**: 150
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2406.16793

**概要**

Adamのパラメータごとの学習率（2次モーメント）の大部分は冗長であるという観察に基づき，ヘッシアンの構造に沿ってパラメータをブロックに分割し，ブロックごとに単一の2次モーメント（勾配2乗の平均）を共有する手法である．Adamと同等以上の性能を保ちながら，2次モーメントのメモリをほぼ不要にする．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad v_{t,b} = \beta_2 v_{t-1,b} + (1 - \beta_2) \, \mathrm{mean}({\mathbf g}_{t,b}^2), \quad {\mathbf w}_{t+1,b} = {\mathbf w}_{t,b} - \frac{\eta}{\sqrt{\hat v_{t,b}} + \epsilon} \hat{\mathbf m}_{t,b} \quad (b : \text{パラメータブロック}) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，圧縮・量子化・低ランク］: ヘッシアン構造に基づくパラメータブロックごとの2次モーメントの共有

---

## AdEMAMix

- **ID**: `ademamix`
- **発表年**: 2024
- **Citation数（概算）**: 80
- **分野タグ**: 適応的学習率，高速化
- **参考文献**: https://arxiv.org/abs/2409.03137

**概要**

単一の指数移動平均による1次モーメントでは，直近の勾配を重視すること（速い減衰）と，古い勾配を長く活用すること（遅い減衰）を両立できない問題に対し，減衰率の異なる2つの指数移動平均を混合する手法である．非常に長い時間スケールの勾配情報を活用することで，大規模言語モデルの学習を高速化し，忘却も抑制する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}^{(1)}_t = \beta_1 {\mathbf m}^{(1)}_{t-1} + (1 - \beta_1) {\mathbf g}_t, \quad {\mathbf m}^{(2)}_t = \beta_3 {\mathbf m}^{(2)}_{t-1} + (1 - \beta_3) {\mathbf g}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf g}_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \frac{\hat{\mathbf m}^{(1)}_t + \alpha {\mathbf m}^{(2)}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} + \lambda {\mathbf w}_t \right) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［慣性項・加速］: 減衰率の異なる2つの1次モーメント（速い・遅い指数移動平均）の混合

---

## ADOPT (Adaptive Gradient Method with the Optimal Convergence Rate)

- **ID**: `adopt`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: 適応的学習率
- **参考文献**: https://arxiv.org/abs/2411.02853

**概要**

Adamが収束しない原因が，現在の勾配と2次モーメントの推定値との相関にあることを指摘した手法である．2次モーメントの推定から現在の勾配を除外し（1ステップ前の推定値で正規化し），さらに正規化を慣性項の計算より前に行うよう順序を入れ替えることで，β2の値によらず最適な収束率を達成する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \frac{{\mathbf g}_t}{\max(\sqrt{{\mathbf v}_{t-1}}, \epsilon)}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, {\mathbf m}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) {\mathbf g}_t^2 $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，理論的再解釈・一般化］: 2次モーメントからの現在の勾配の除外と，正規化・慣性項の計算順序の入れ替え

---

## APOLLO (Approximated Gradient Scaling for Memory-Efficient LLM Optimization)

- **ID**: `apollo`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2412.05270

**概要**

AdamWの要素ごとの学習率スケーリングは冗長であり，チャンネル（行・列）単位の粗いスケーリングで十分であるという観察に基づき，ランダム射影による低ランクの補助的なオプティマイザ状態からスケーリング係数を推定する手法である．SVDを必要とせず，ランク1版（APOLLO-Mini）はSGD並みのメモリでAdamWと同等以上の事前学習性能を示す．

**更新式**

$$ {\mathbf R}_t = {\mathbf P}_t {\mathbf G}_t \;\; ({\mathbf P}_t : \text{ランダム射影}), \quad \tilde{\mathbf R}_t = \mathrm{AdamW}({\mathbf R}_t), \quad s_j = \frac{\|\tilde{\mathbf R}_{t,:,j}\|}{\|{\mathbf R}_{t,:,j}\|}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf G}_t \, \mathrm{diag}({\mathbf s}) $$

**派生元と改善内容**

- GaLore (Gradient Low-Rank Projection)（`galore`）から［圧縮・量子化・低ランク，確率化・部分化］: SVDのランダム射影への置き換えと，射影空間での推定値によるチャンネルごとのスケーリング
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［適応的スケーリング，圧縮・量子化・低ランク］: チャンネル単位の学習率スケーリングによる要素ごとの状態量の削減

---

## BAdam (Block Coordinate Adam)

- **ID**: `badam`
- **発表年**: 2024
- **Citation数（概算）**: 50
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2404.02827

**概要**

モデルのパラメータを複数のブロック（層のまとまり）に分割し，ブロック座標降下法の枠組みで1つのブロックのみを一定ステップ数Adamで更新して次のブロックへ移る手法である．オプティマイザの状態量と勾配は現在のブロック分のみ保持すればよいため，単一のGPUで数十億パラメータのモデルの全パラメータ学習を可能にする．

**更新式**

$$ \text{for } i = 1, \dots, D : \;\; {\mathbf w}_{\pi_i} \leftarrow \mathrm{Adam}^{K}({\mathbf w}_{\pi_i}; {\mathbf w}_{-\pi_i} \text{は固定}), \quad (\pi : \text{ブロックの順序}, \; K : \text{ブロックあたりのステップ数}) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［圧縮・量子化・低ランク，確率化・部分化］: ブロック座標降下法による状態量の削減
- ランダム座標降下法 (Randomized Coordinate Descent)（`coordinate_descent`）から［確率化・部分化，圧縮・量子化・低ランク］: ブロック座標降下法の枠組みの利用

---

## CASPR (Combining Axes Preconditioners through Kronecker Approximation)

- **ID**: `caspr`
- **発表年**: 2024
- **Citation数（概算）**: 30
- **分野タグ**: 2次手法
- **参考文献**: https://proceedings.iclr.cc/paper_files/paper/2024/hash/df927a06a0d9f5f06d9cd4a91ce58e56-Abstract-Conference.html
- **備考**: arXiv版が見つからなかったためICLR 2024の会議録を参照した．更新式は簡略表記である．

**概要**

行列形状のパラメータの各軸（行・列）ごとの前処理行列を，Shampooのクロネッカー積ではなくクロネッカー和に基づいて組み合わせる手法である．全行列版AdaGradの勾配2次モーメント行列をShampooやAdamより正確に近似でき，同程度の計算量で言語モデルの学習性能を改善する．

**更新式**

$$ {\mathbf L}_t = {\mathbf L}_{t-1} + {\mathbf G}_t {\mathbf G}_t^\top, \;\; {\mathbf R}_t = {\mathbf R}_{t-1} + {\mathbf G}_t^\top {\mathbf G}_t, \quad \mathrm{vec}({\mathbf W}_{t+1}) = \mathrm{vec}({\mathbf W}_t) - \eta \left( {\mathbf R}_t^{1/2} \oplus {\mathbf L}_t^{1/2} \right)^{-1} \mathrm{vec}({\mathbf G}_t) \quad ({\mathbf A} \oplus {\mathbf B} = {\mathbf A} \otimes {\mathbf I} + {\mathbf I} \otimes {\mathbf B} : \text{クロネッカー和}) $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［曲率・前処理］: 軸ごとの前処理行列のクロネッカー和による結合

---

## Cautious Optimizers (C-AdamW等)

- **ID**: `cautious`
- **発表年**: 2024
- **Citation数（概算）**: 50
- **分野タグ**: 適応的学習率，高速化
- **参考文献**: https://arxiv.org/abs/2411.16085

**概要**

慣性項を持つ最適化手法において，更新方向と現在の勾配の符号が一致しない成分の更新を打ち消すマスクを適用する手法である．1行程度の修正で既存のAdamWやLionに適用でき，損失を単調に減少させる性質を保ちながら，大規模言語モデルの事前学習等を高速化する．

**更新式**

$$ {\mathbf u}_t = \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon}, \quad \boldsymbol\phi_t = \mathbb{1}[{\mathbf u}_t \odot \nabla f_t({\mathbf w}_t) > 0], \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \frac{\dim(\boldsymbol\phi_t)}{\|\boldsymbol\phi_t\|_0 + 1} (\boldsymbol\phi_t \odot {\mathbf u}_t) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［符号化・正規化・直交化，クリッピング・安定化］: 更新方向と勾配の符号が不一致な成分を打ち消すマスクの適用
- Lion (EvoLved Sign Momentum)（`lion`）から［符号化・正規化・直交化，クリッピング・安定化］: 符号ベースの手法への同一マスクの適用

---

## DeMo (Decoupled Momentum Optimization)

- **ID**: `demo`
- **発表年**: 2024
- **Citation数（概算）**: 40
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/2411.19870

**概要**

データ並列学習における勾配のAll-Reduceを廃し，各アクセラレータが独立に慣性項を保持した上で，慣性項に離散コサイン変換を適用し，変化の速い上位の成分のみを抽出して同期する手法である．同期した成分は慣性項から差し引いて誤差フィードバックとして扱い，AdamWと同等の性能を保ちつつ，GPUあたりの通信量を数十分の1に削減する．

**更新式**

$$ {\mathbf m}^k_t = \beta {\mathbf m}^k_{t-1} + {\mathbf g}^k_t, \quad {\mathbf q}^k_t = \mathrm{top}_k(\mathrm{DCT}({\mathbf m}^k_t)), \quad {\mathbf m}^k_t \leftarrow {\mathbf m}^k_t - \mathrm{DCT}^{-1}({\mathbf q}^k_t), \quad {\mathbf Q}_t = \mathrm{DCT}^{-1}(\mathrm{AllGather}(\{ {\mathbf q}^k_t \})), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \, \mathrm{sign}({\mathbf Q}_t) $$

**派生元と改善内容**

- DGC (Deep Gradient Compression)（`dgc`）から［圧縮・量子化・低ランク，分散化・通信削減］: 上位成分のみの同期と残差の慣性項への保持（周波数領域での疎化）
- signSGD / Signum（`signsgd`）から［符号化・正規化・直交化］: 同期した成分の符号による更新

---

## Fira

- **ID**: `fira`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: メモリ効率，学習安定化
- **参考文献**: https://arxiv.org/abs/2410.01623

**概要**

GaLoreでは低ランク部分空間の外側の勾配成分が捨てられ，実質的に低ランクの学習になる問題に対し，Adamによる勾配ノルムのスケーリングが低ランクと全ランクで同程度であるという観察に基づき，部分空間外の勾配成分を低ランク空間でのスケーリング係数で補正して加える手法である．勾配ノルムの急増を抑える制限器も導入し，低ランクのメモリ制約下で全ランクの学習を実現する．

**更新式**

$$ {\mathbf R}_t = {\mathbf P}_t^\top {\mathbf G}_t, \quad \psi_t = \frac{\|\mathrm{Adam}({\mathbf R}_t)\|}{\|{\mathbf R}_t\|}, \quad {\mathbf S}_t = \mathrm{Limiter}\left( {\mathbf G}_t - {\mathbf P}_t {\mathbf R}_t \right), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \left( {\mathbf P}_t \, \mathrm{Adam}({\mathbf R}_t) + \psi_t {\mathbf S}_t \right) $$

**派生元と改善内容**

- GaLore (Gradient Low-Rank Projection)（`galore`）から［圧縮・量子化・低ランク］: 部分空間外の勾配成分のノルムに基づくスケーリング補正（全ランク学習化）
- 勾配クリッピング (Gradient Norm Clipping)（`gradient_clipping`）から［クリッピング・安定化］: 勾配ノルムの相対的な増加を制限する制限器

---

## Flora (Low-Rank Adapters Are Secretly Gradient Compressors)

- **ID**: `flora`
- **発表年**: 2024
- **Citation数（概算）**: 50
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2402.03293

**概要**

LoRAの更新が勾配のランダム射影による圧縮とみなせることを示し，その知見に基づき，勾配の蓄積や慣性項をランダム射影で低次元に圧縮して保持し，射影行列を定期的に再サンプリングする手法である．LoRAのような低ランク制約を課さずに高ランクの更新を実現しつつ，オプティマイザの状態量のメモリを削減する．

**更新式**

$$ {\mathbf A}_t \sim \mathcal{N}(0, 1/r) \;\; (\text{定期的に再サンプリング}), \quad {\mathbf C}_t = \beta {\mathbf C}_{t-1} {\mathbf A}_{t-1}^\top {\mathbf A}_t + (1 - \beta) {\mathbf G}_t {\mathbf A}_t^\top, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf C}_t {\mathbf A}_t $$

**派生元と改善内容**

- Adafactor（`adafactor`）から［圧縮・量子化・低ランク］: ランダム射影による慣性項・勾配蓄積の圧縮によるメモリ削減

---

## F-SAM (Friendly Sharpness-Aware Minimization)

- **ID**: `friendly_sam`
- **発表年**: 2024
- **Citation数（概算）**: 50
- **分野タグ**: 平坦解探索
- **参考文献**: https://arxiv.org/abs/2403.12350

**概要**

SAMの汎化性能の向上は，敵対的摂動に含まれるミニバッチ固有の確率的勾配の雑音成分によるものであり，全勾配の成分はむしろ汎化を損なうことを示した手法である．過去の確率的勾配の指数移動平均で全勾配を推定して摂動から差し引き，雑音成分のみで摂動を構成することで，SAMより高い汎化性能と頑健性を示す．

**更新式**

$$ {\mathbf m}_t = \lambda {\mathbf m}_{t-1} + (1 - \lambda) {\mathbf g}_t, \quad {\mathbf d}_t = {\mathbf g}_t - \sigma {\mathbf m}_t, \quad \hat{\boldsymbol\epsilon} = \rho \frac{{\mathbf d}_t}{\|{\mathbf d}_t\|}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_B({\mathbf w}_t + \hat{\boldsymbol\epsilon}) $$

**派生元と改善内容**

- SAM (Sharpness-Aware Minimization)（`sam`）から［平坦化・雑音］: 摂動からの全勾配成分（移動平均推定）の除去

---

## GaLore (Gradient Low-Rank Projection)

- **ID**: `galore`
- **発表年**: 2024
- **Citation数（概算）**: 600
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2403.03507

**概要**

重み行列の勾配が学習中に低ランク構造を持つことに着目し，勾配を定期的に計算した射影行列で低ランク部分空間へ射影した上で，その部分空間内でAdam等の最適化手法を実行する手法である．オプティマイザの状態量が低ランク空間の大きさで済むため，全パラメータを学習しつつメモリ使用量を大幅に削減でき，一般向けGPUでの大規模言語モデルの事前学習を可能にする．

**更新式**

$$ {\mathbf G}_t = \nabla f_t({\mathbf W}_t), \quad {\mathbf P}_t = \mathrm{SVD}_r({\mathbf G}_t) \;\; (T\text{ステップごとに更新}), \quad {\mathbf R}_t = {\mathbf P}_t^\top {\mathbf G}_t, \quad {\mathbf N}_t = \mathrm{Adam}({\mathbf R}_t), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf P}_t {\mathbf N}_t $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［圧縮・量子化・低ランク］: 勾配の低ランク部分空間への射影とその空間内での最適化状態の保持

---

## Grokfast

- **ID**: `grokfast`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: 高速化
- **参考文献**: https://arxiv.org/abs/2405.20233

**概要**

パラメータごとの勾配の時系列を信号とみなし，変化の速い成分が過学習に，遅い成分が汎化に寄与するという仮説に基づき，勾配の低周波成分（指数移動平均）を増幅して元の勾配に加える手法である．既存の任意の最適化手法の前段に適用でき，Grokking（遅延汎化）を大幅に加速する．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \boldsymbol\mu_t = \alpha \boldsymbol\mu_{t-1} + (1 - \alpha) {\mathbf g}_t, \quad \tilde{\mathbf g}_t = {\mathbf g}_t + \lambda \boldsymbol\mu_t, \quad {\mathbf w}_{t+1} = \mathrm{Optimizer}({\mathbf w}_t, \tilde{\mathbf g}_t) $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［慣性項・加速］: 勾配の低周波成分（指数移動平均）の増幅による汎化の加速

---

## GRPO (Group Relative Policy Optimization)

- **ID**: `grpo`
- **発表年**: 2024
- **Citation数（概算）**: 1,500
- **分野タグ**: 方策最適化，メモリ効率
- **参考文献**: https://arxiv.org/abs/2402.03300
- **備考**: DeepSeekMathの論文の中で提案された．Citation数は論文全体の概算である．

**概要**

大規模言語モデルの強化学習において，PPOで必要な価値関数（クリティック）モデルを廃し，同じ入力に対して生成した複数の出力の報酬のグループ内での平均と標準偏差で正規化した値をアドバンテージとして用いる手法である．クリティックのメモリと計算を不要にし，数学的推論などの検証可能な報酬による言語モデルの学習で広く用いられている．

**更新式**

$$ \hat A_{i} = \frac{r_i - \mathrm{mean}(\{r_j\}_{j=1}^{G})}{\mathrm{std}(\{r_j\}_{j=1}^{G})}, \quad J(\boldsymbol\theta) = \mathbb{E}\left[ \frac{1}{G} \sum_{i=1}^{G} \min\left( \rho_i \hat A_i, \mathrm{clip}(\rho_i, 1 \pm \epsilon) \hat A_i \right) - \beta \, \mathrm{KL}(\pi_{\boldsymbol\theta} \| \pi_{\mathrm{ref}}) \right] $$

**派生元と改善内容**

- PPO (Proximal Policy Optimization)（`ppo`）から［圧縮・量子化・低ランク］: 価値関数の廃止とグループ内の相対的な報酬によるアドバンテージ推定

---

## HiZOO (Hessian Informed Zeroth-Order Optimizer)

- **ID**: `hizoo`
- **発表年**: 2024
- **Citation数（概算）**: 50
- **分野タグ**: ゼロ次手法，2次手法
- **参考文献**: https://arxiv.org/abs/2402.15173

**概要**

ゼロ次最適化は次元ごとの曲率の違い（異質性）により収束が遅くなる問題に対し，関数値のみからヘッセ行列の対角成分を推定し，それを前処理として摂動の分布と更新に用いる手法である．MeZOと比べ1ステップあたり1回の順伝播を追加するだけで，大規模言語モデルのファインチューニングを大幅に高速化する．

**更新式**

$$ {\mathbf u} \sim \mathcal{N}({\mathbf 0}, {\mathbf I}), \quad \hat{\mathbf g}_t = \frac{f({\mathbf w}_t + \mu \boldsymbol\Sigma_t^{1/2} {\mathbf u}) - f({\mathbf w}_t - \mu \boldsymbol\Sigma_t^{1/2} {\mathbf u})}{2\mu} \boldsymbol\Sigma_t^{1/2} {\mathbf u}, \quad \boldsymbol\Sigma_{t+1}^{-1} = (1 - \alpha) \boldsymbol\Sigma_t^{-1} + \alpha \, \widehat{\mathrm{diag}}(\nabla^2 f), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \hat{\mathbf g}_t $$

**派生元と改善内容**

- MeZO (Memory-efficient Zeroth-order Optimizer)（`mezo`）から［曲率・前処理］: 関数値から推定したヘッセ対角による前処理
- AdaHessian（`adahessian`）から［曲率・前処理］: ヘッセ行列の対角推定の移動平均による前処理

---

## IVON (Improved Variational Online Newton)

- **ID**: `ivon`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: ベイズ推論，2次手法
- **参考文献**: https://arxiv.org/abs/2402.17641

**概要**

変分学習（重みの事後分布をガウス分布で近似する学習）を，Adamとほぼ同じ計算コスト・メモリでGPT-2やResNetなどの大規模なネットワークに適用可能にした手法である．Hessの対角推定を再パラメータ化トリックで求め，更新の安定化の工夫を加えることで，Adamと同等以上の精度とより良い較正・不確実性推定を示した．

**更新式**

$$ {\mathbf w} \sim \mathcal{N}({\mathbf m}_t, \boldsymbol\sigma_t^2), \;\; \boldsymbol\sigma_t^2 = \frac{1}{\lambda ({\mathbf h}_t + \delta)}, \quad \hat{\mathbf h} = \nabla f({\mathbf w}) \odot \frac{{\mathbf w} - {\mathbf m}_t}{\boldsymbol\sigma_t^2}, \quad {\mathbf h}_{t+1} = \beta_2 {\mathbf h}_t + (1 - \beta_2) \hat{\mathbf h} + \frac{(1 - \beta_2)^2}{2} \frac{({\mathbf h}_t - \hat{\mathbf h})^2}{{\mathbf h}_t + \delta}, \quad {\mathbf m}_{t+1} = {\mathbf m}_t - \eta \frac{\hat{\mathbf g}_t + \delta {\mathbf m}_t}{{\mathbf h}_{t+1} + \delta} $$

**派生元と改善内容**

- Vadam (Variational Adam)（`vadam`）から［曲率・前処理，クリッピング・安定化］: 再パラメータ化によるヘッセ対角推定と安定化による大規模ネットワークへの適用
- AdaHessian（`adahessian`）から［曲率・前処理］: 勾配のみを用いたヘッセ対角の推定

---

## LDAdam (Low-Dimensional Adam)

- **ID**: `ldadam`
- **発表年**: 2024
- **Citation数（概算）**: 30
- **分野タグ**: メモリ効率，適応的学習率
- **参考文献**: https://arxiv.org/abs/2410.16103

**概要**

GaLoreと同様に勾配を低次元の部分空間に射影して最適化状態を保持するが，射影の部分空間を変更する際に，最適化状態（モーメント）を新しい部分空間へ射影し直して引き継ぐ手法である．射影で失われた勾配の成分は誤差フィードバックで次ステップに持ち越し，AMSGradと同じ漸近的な収束率を保つ．

**更新式**

$$ {\mathbf P}_t = \mathrm{PowerIter}({\mathbf G}_t + {\mathbf E}_t), \quad {\mathbf m}_{t} = \beta_1 {\mathbf P}_t^\top {\mathbf P}_{t-1} {\mathbf m}_{t-1} + (1 - \beta_1) {\mathbf P}_t^\top ({\mathbf G}_t + {\mathbf E}_t), \quad {\mathbf E}_{t+1} = ({\mathbf G}_t + {\mathbf E}_t) - {\mathbf P}_t {\mathbf P}_t^\top ({\mathbf G}_t + {\mathbf E}_t), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf P}_t \frac{{\mathbf m}_t}{\sqrt{{\mathbf v}_t} + \epsilon} $$

**派生元と改善内容**

- GaLore (Gradient Low-Rank Projection)（`galore`）から［圧縮・量子化・低ランク］: 部分空間変更時の最適化状態の射影による引き継ぎ
- EF-SignSGD (Error Feedback)（`ef_signsgd`）から［圧縮・量子化・低ランク］: 射影誤差の誤差フィードバックによる持ち越し

---

## LISA (Layerwise Importance Sampled AdamW)

- **ID**: `lisa`
- **発表年**: 2024
- **Citation数（概算）**: 100
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2403.17919

**概要**

LoRAで学習した際の層ごとの重みの変化量が埋め込み層と出力層に偏っていることに着目し，埋め込み層と出力層は常に更新しつつ，中間層はランダムに選んだ少数の層のみを一定期間ごとに切り替えながらAdamWで更新する手法である．LoRAと同程度のメモリで，LoRAや全パラメータ学習を上回るファインチューニング性能を示す．

**更新式**

$$ \mathcal{S}_k \subset \{1, \dots, L\}, \; |\mathcal{S}_k| = \gamma \;\; (K\text{ステップごとに一様に再サンプリング}), \quad {\mathbf W}^\ell_{t+1} = \begin{cases} \mathrm{AdamW}({\mathbf W}^\ell_t) & (\ell \in \mathcal{S}_k \cup \{\mathrm{emb}, \mathrm{head}\}) \\ {\mathbf W}^\ell_t & (\mathrm{otherwise}) \end{cases} $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［圧縮・量子化・低ランク，確率化・部分化］: 層の重要度サンプリングによる一部の層のみの更新

---

## MARS (Make vAriance Reduction Shine)

- **ID**: `mars`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: 勾配分散低減，適応的学習率
- **参考文献**: https://arxiv.org/abs/2411.10438

**概要**

分散低減手法は深層学習ではあまり有効でないとされてきたが，STORM型の再帰的な分散低減とAdamW等の前処理付き最適化手法を統合した枠組みにより，大規模言語モデルの事前学習でAdamWを上回る性能を示した手法である．同一バッチで評価した勾配差による補正をスケーリング・クリッピングした上で，Adam型の1次・2次モーメントを計算する．

**更新式**

$$ {\mathbf c}_t = \nabla f({\mathbf w}_t; \xi_t) + \gamma \frac{\beta_1}{1 - \beta_1} \left( \nabla f({\mathbf w}_t; \xi_t) - \nabla f({\mathbf w}_{t-1}; \xi_t) \right), \quad \tilde{\mathbf c}_t = \mathrm{clip}({\mathbf c}_t, 1), \quad {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \tilde{\mathbf c}_t, \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \tilde{\mathbf c}_t^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \left( \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} + \lambda {\mathbf w}_t \right) $$

**派生元と改善内容**

- STORM (STOchastic Recursive Momentum)（`storm`）から［分散低減，クリッピング・安定化］: 再帰的分散低減のスケーリング・クリッピングによる深層学習向けの安定化
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［適応的スケーリング，分散低減］: 分散低減した勾配推定値への前処理（適応的学習率）の適用

---

## モジュラー双対化 (Modular Duality)

- **ID**: `modular_duality`
- **発表年**: 2024
- **Citation数（概算）**: 40
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2410.21265

**概要**

層の意味に基づいて各層に作用素ノルムを割り当て，それらを再帰的に組み合わせてネットワーク全体の重み空間上の双対写像（勾配を更新量に変換する写像）を構成する手順を提案した研究である．勾配を正しい幾何で双対化することで学習率がモデルの幅や深さの間で転移し，その一実装はNanoGPTの学習速度記録の更新に用いられた．

**更新式**

$$ \Delta {\mathbf W} = -\eta \, \mathrm{dualize}_{\mathcal{M}}(\nabla f), \quad \|{\mathbf W}\|_{\mathcal{M}} = \max_\ell \, s_\ell \|{\mathbf W}_\ell\|_{\ell} \;\; (\text{モジュラーノルム}), \quad \text{Linear} : \|\cdot\|_{\mathrm{RMS} \to \mathrm{RMS}} \Rightarrow \sqrt{d_{\mathrm{out}}/d_{\mathrm{in}}} \, {\mathbf U}{\mathbf V}^\top $$

**派生元と改善内容**

- Old Optimizer, New Norm (ノルムに基づく最急降下法としての再解釈)（`old_optimizer_new_norm`）から［理論的再解釈・一般化，符号化・正規化・直交化］: 層ごとのノルムの再帰的な合成による全体の双対写像の構成
- μP (Maximal Update Parametrization, μTransfer)（`mup`）から［理論的再解釈・一般化］: 幅に対する更新量のスケーリングのノルムによる一般化

---

## μLO (μP Learned Optimizers)

- **ID**: `mulo`
- **発表年**: 2024
- **Citation数（概算）**: 20
- **分野タグ**: 自動探索・メタ学習
- **参考文献**: https://arxiv.org/abs/2406.00153

**概要**

学習された最適化手法が，メタ学習時より大きなモデルや長い学習に汎化しにくい問題に対し，ハイパーパラメータのゼロショット転移を可能にする最大更新パラメータ化（μP）を学習された最適化手法に拡張した研究である．約100GPU時間のメタ学習で，4000TPU月のメタ学習を要したVeLOに幅の大きなモデルで匹敵する性能を示す．

**更新式**

$$ {\mathbf w}^\ell_{t+1} = {\mathbf w}^\ell_t - s_\ell \cdot \mathrm{LO}_{\boldsymbol\phi}({\mathbf g}^\ell_t, \dots) \quad (s_\ell : \mu\text{Pに基づく層ごとの更新量のスケーリング}) $$

**派生元と改善内容**

- VeLO (Versatile Learned Optimizer)（`velo`）から［問題設定への適用，学習率の自動化・スケジュール］: μPに基づく層ごとのスケーリングによる大きなモデルへのメタ汎化
- μP (Maximal Update Parametrization, μTransfer)（`mup`）から［学習率の自動化・スケジュール，問題設定への適用］: μPの学習された最適化手法への拡張

---

## Muon (MomentUm Orthogonalized by Newton-Schulz)

- **ID**: `muon`
- **発表年**: 2024
- **Citation数（概算）**: 400
- **分野タグ**: 2次手法，高速化
- **参考文献**: https://kellerjordan.github.io/posts/muon/
- **備考**: 原典は論文ではなく著者（Keller Jordan）のブログ記事であり，Citation数は引用文献数の概算である．

**概要**

行列形状のパラメータについて，慣性項付きの勾配をNewton-Schulz反復によって近似的に直交化（特異値をすべて1にする）した行列を更新量とする手法である．更新量の特異値を揃えることで，勾配で支配的な少数の方向以外も学習が進み，スペクトルノルムに関する最急降下法とみなせる．NanoGPTの学習速度記録の更新や大規模言語モデルの事前学習で注目されており，埋め込み層・出力層などにはAdamWを併用する．

**更新式**

$$ {\mathbf M}_t = \mu {\mathbf M}_{t-1} + \nabla f_t({\mathbf W}_t), \quad {\mathbf O}_t = \mathrm{NewtonSchulz5}({\mathbf M}_t) \approx {\mathbf U}{\mathbf V}^\top \;\; ({\mathbf M}_t = {\mathbf U} \boldsymbol\Sigma {\mathbf V}^\top), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf O}_t $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［符号化・正規化・直交化，曲率・前処理］: 前処理行列の累積を省いた勾配の直交化（累積なしのShampooに相当）
- Nesterovの加速勾配法 (Nesterov Accelerated Gradient Method, NAG)（`nesterov`）から［慣性項・加速］: Nesterov型慣性項を直交化の対象とすることによる加速
- Old Optimizer, New Norm (ノルムに基づく最急降下法としての再解釈)（`old_optimizer_new_norm`）から［理論的再解釈・一般化］: スペクトルノルムの下での最急降下法という理論的な位置付け

---

## Old Optimizer, New Norm (ノルムに基づく最急降下法としての再解釈)

- **ID**: `old_optimizer_new_norm`
- **発表年**: 2024
- **Citation数（概算）**: 60
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2409.20325

**概要**

Adam，Shampoo，Prodigyなどの手法は，指数移動平均を無効にすると，それぞれ特定のノルム（∞ノルム，スペクトルノルム等）の下での最急降下法に帰着することを示し，凸性を仮定しない1次手法として再解釈した研究である．ネットワーク内の役割に応じてテンソルごとに異なる作用素ノルムを割り当てる設計指針を示し，Muonの理論的な背景となった．

**更新式**

$$ \Delta {\mathbf W} = \arg\min_{\Delta} \left\{ \langle {\mathbf G}, \Delta \rangle + \frac{\lambda}{2} \|\Delta\|^2 \right\} = -\frac{\|{\mathbf G}\|^{\dagger}}{\lambda} \cdot \mathrm{dual}({\mathbf G}), \quad \|\cdot\| = \|\cdot\|_{\infty} \Rightarrow \mathrm{sign}({\mathbf G}), \quad \|\cdot\| = \|\cdot\|_{2 \to 2} \Rightarrow {\mathbf U}{\mathbf V}^\top $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［理論的再解釈・一般化］: 累積なしのShampooのスペクトルノルムの下での最急降下法としての再解釈
- Adam (Adaptive Moment Estimation)（`adam`）から［理論的再解釈・一般化］: 慣性なしのAdamの∞ノルムの下での最急降下法（符号更新）としての再解釈

---

## Q-GaLore

- **ID**: `q_galore`
- **発表年**: 2024
- **Citation数（概算）**: 40
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2407.08296

**概要**

GaLoreの射影行列の計算（SVD）のコストとメモリをさらに削減するため，層ごとの勾配の部分空間の収束の速さに応じてSVDの頻度を適応的に減らし，射影行列を4bit，重みを8bitで保持する手法である．低精度の重みの更新には確率的丸めを用い，16GBのGPUでLLaMA-7Bを事前学習可能にした．

**更新式**

$$ {\mathbf P}_t = Q_4(\mathrm{SVD}_r({\mathbf G}_t)) \;\; (\text{部分空間の変化が大きい層のみ更新}), \quad {\mathbf N}_t = \mathrm{Adam}({\mathbf P}_t^\top {\mathbf G}_t), \quad {\mathbf W}^{\mathrm{int8}}_{t+1} = \mathrm{SR}\left( {\mathbf W}_t - \eta \, {\mathbf P}_t {\mathbf N}_t \right) \quad (\mathrm{SR} : \text{確率的丸め}) $$

**派生元と改善内容**

- GaLore (Gradient Low-Rank Projection)（`galore`）から［圧縮・量子化・低ランク］: 射影行列・重みの低ビット量子化と層ごとに適応的なSVD頻度

---

## Schedule-Free (Schedule-Free SGD / AdamW)

- **ID**: `schedule_free`
- **発表年**: 2024
- **Citation数（概算）**: 150
- **分野タグ**: 重み平均化，学習率自動調整
- **参考文献**: https://arxiv.org/abs/2405.15682

**概要**

学習率スケジュール（コサイン減衰等）を不要にする手法である．勾配を評価する点を，SGDで更新される系列と，その平均系列との補間点とすることで，Polyak平均化とモーメント法を統一的に扱う．学習の停止時刻を事前に決めずとも，スケジュールを用いた場合と同等以上の性能が得られる．AdamWへの適用版（Schedule-Free AdamW）も提案されている．

**更新式**

$$ {\mathbf y}_t = (1 - \beta) {\mathbf z}_t + \beta {\mathbf x}_t, \quad {\mathbf z}_{t+1} = {\mathbf z}_t - \eta \nabla f_t({\mathbf y}_t), \quad {\mathbf x}_{t+1} = (1 - c_{t+1}) {\mathbf x}_t + c_{t+1} {\mathbf z}_{t+1}, \quad c_{t+1} = \frac{1}{t+1} $$

**派生元と改善内容**

- Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)（`polyak_averaging`）から［重みの平均化・補間，学習率の自動化・スケジュール］: 平均系列と更新系列の補間点での勾配評価による学習率スケジュールの不要化
- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から［重みの平均化・補間，慣性項・加速］: 補間による慣性効果の置き換え（モーメント法と平均化の統一）

---

## 4-bit Shampoo

- **ID**: `shampoo_4bit`
- **発表年**: 2024
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2405.18144

**概要**

Shampooの前処理行列を4bitで保持する，初の4bitの2次最適化手法である．前処理行列そのものを量子化すると小さな特異値が大きく変化して性能が劣化することを示し，代わりに前処理行列の固有ベクトル行列を量子化し，直交性を補正して復元することで，32bit版に近い性能を保ちつつメモリを削減する．

**更新式**

$$ {\mathbf L}_t = {\mathbf U}_t \boldsymbol\Lambda_t {\mathbf U}_t^\top, \quad \bar{\mathbf U}_t = Q_4({\mathbf U}_t), \quad \hat{\mathbf U}_t = \mathrm{OrthRect}(Q_4^{-1}(\bar{\mathbf U}_t)), \quad {\mathbf L}_t^{-1/4} \approx \hat{\mathbf U}_t \boldsymbol\Lambda_t^{-1/4} \hat{\mathbf U}_t^\top, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf L}_t^{-1/4} {\mathbf G}_t {\mathbf R}_t^{-1/4} $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［圧縮・量子化・低ランク］: 前処理行列の固有ベクトル行列の4bit量子化と直交性の補正
- 4-bit Adam (Memory Efficient Optimizers with 4-bit States)（`adam_4bit`）から［圧縮・量子化・低ランク］: 1次手法の低ビット量子化の2次手法への拡張

---

## SOAP (ShampoO with Adam in the Preconditioner's eigenbasis)

- **ID**: `soap`
- **発表年**: 2024
- **Citation数（概算）**: 150
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2409.11321

**概要**

Shampooの前処理行列の固有基底で張られる回転した空間においてAdam（Adafactor）を実行することと，Shampooがほぼ等価であることを示し，これに基づく手法である．固有基底は低頻度でのみ更新し，その間は回転空間でAdamの2次モーメントを継続的に更新することで，Shampooより少ないハイパーパラメータと計算量で，より高い性能を示す．

**更新式**

$$ {\mathbf L}_t = \beta_2 {\mathbf L}_{t-1} + (1 - \beta_2) {\mathbf G}_t {\mathbf G}_t^\top, \quad {\mathbf R}_t = \beta_2 {\mathbf R}_{t-1} + (1 - \beta_2) {\mathbf G}_t^\top {\mathbf G}_t, \quad {\mathbf Q}_L, {\mathbf Q}_R = \mathrm{eigvec}({\mathbf L}_t), \mathrm{eigvec}({\mathbf R}_t) \;\; (\text{低頻度で更新}), \quad {\mathbf G}'_t = {\mathbf Q}_L^\top {\mathbf G}_t {\mathbf Q}_R, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf Q}_L \, \mathrm{Adam}({\mathbf G}'_t) \, {\mathbf Q}_R^\top $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［曲率・前処理］: 前処理行列の固有基底による回転空間でのAdamの実行と，固有基底の低頻度更新
- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング］: 回転空間における対角の2次モーメント推定の利用

---

## SWAN (SGD with Whitening And Normalization)

- **ID**: `swan`
- **発表年**: 2024
- **Citation数（概算）**: 30
- **分野タグ**: メモリ効率，2次手法
- **参考文献**: https://arxiv.org/abs/2412.13148

**概要**

Adamのモーメントを一切保持せず，各ステップの確率的勾配そのものに行ごとの正規化と白色化（行列の逆平方根による変換）を適用する，状態を持たない最適化手法である．正規化が勾配分布を安定させ，白色化が損失地形の局所的な曲率を打ち消すことで，SGDと同じメモリ使用量でAdamと同等以上の性能を示す．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \tilde{\mathbf G}_t = \mathrm{RowNorm}({\mathbf G}_t) = \frac{{\mathbf G}_t - \mathrm{mean}_{\mathrm{row}}({\mathbf G}_t)}{\mathrm{std}_{\mathrm{row}}({\mathbf G}_t)}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, (\tilde{\mathbf G}_t \tilde{\mathbf G}_t^\top)^{-1/2} \tilde{\mathbf G}_t $$

**派生元と改善内容**

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から［符号化・正規化・直交化，曲率・前処理］: 状態を持たない勾配の正規化と白色化の前処理
- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化］: 勾配の白色化（直交化に相当）による曲率の打ち消し

---

## WSDスケジュール (Warmup-Stable-Decay)

- **ID**: `wsd`
- **発表年**: 2024
- **Citation数（概算）**: 400
- **分野タグ**: 学習率スケジュール
- **参考文献**: https://arxiv.org/abs/2404.06395
- **備考**: MiniCPMの論文の中で提案された．Citation数は論文全体の概算である．

**概要**

学習率をウォームアップ後に一定値で長く保ち（安定期），学習の最後の短い期間（全体の1割程度）でのみ急速に減衰させるスケジュールである．コサイン減衰と異なり総ステップ数を事前に決める必要がなく，安定期のチェックポイントから減衰を始めることで，学習の継続やデータ量に関するスケーリング則の調査を少ない再学習で行える．

**更新式**

$$ \eta_t = \begin{cases} \frac{t}{T_w} \eta & (t < T_w) \\ \eta & (T_w \le t < T_s) \\ f(t - T_s) \, \eta & (T_s \le t \le T) \end{cases}, \quad f : \text{短期間での急速な減衰（指数・線形等）} $$

**派生元と改善内容**

- 線形スケーリング則と学習率ウォームアップ (Linear Scaling Rule & Warmup)（`linear_scaling_warmup`）から［学習率の自動化・スケジュール］: ウォームアップ後の一定学習率の維持と終盤のみの減衰
- SGDR (Stochastic Gradient Descent with Warm Restarts, コサイン減衰)（`sgdr`）から［学習率の自動化・スケジュール］: 総ステップ数に依存するコサイン減衰の，減衰開始時刻の自由な選択への置き換え

---

## AdamC (Corrected Weight Decay)

- **ID**: `adamc`
- **発表年**: 2025
- **Citation数（概算）**: 20
- **分野タグ**: 正則化，学習安定化
- **参考文献**: https://arxiv.org/abs/2506.02285

**概要**

大規模言語モデルの学習終盤に勾配ノルムが急増する現象が，重み減衰・正規化層・学習率スケジュールの意図しない相互作用によって生じることを示し，正規化層の後に続く重みについて，重み減衰の係数を学習率に比例させて補正する手法である．勾配ノルムの急増を解消し，学習全体を通じて損失を改善する．

**更新式**

$$ \lambda_t = \lambda \frac{\eta_t}{\eta_{\max}}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \left( \frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t} + \epsilon} + \lambda_t {\mathbf w}_t \right) \quad (\text{正規化層の後の重みに適用}) $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［正則化・重み減衰，学習率の自動化・スケジュール］: 学習率スケジュールに比例した重み減衰係数の補正

---

## AdaMuon

- **ID**: `adamuon`
- **発表年**: 2025
- **Citation数（概算）**: 40
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2507.11005

**概要**

Muonで直交化された更新量に対して，要素ごとの2次モーメントによる適応的なスケーリングを加え，さらに更新量のRMSをAdamに合わせて再スケーリングする手法である．Muonの行列構造に基づく更新とAdamの要素ごとの適応性を組み合わせることで，Muonより高速に収束する．

**更新式**

$$ {\mathbf O}_t = \mathrm{NewtonSchulz5}({\mathbf M}_t), \quad {\mathbf V}_t = \beta_2 {\mathbf V}_{t-1} + (1 - \beta_2) {\mathbf O}_t^2, \quad \hat{\mathbf O}_t = \frac{{\mathbf O}_t}{\sqrt{{\mathbf V}_t} + \epsilon}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \frac{0.2 \sqrt{mn}}{\|\hat{\mathbf O}_t\|_F} \hat{\mathbf O}_t $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［適応的スケーリング］: 直交化された更新量への要素ごとの2次モーメントによる適応化
- Adam (Adaptive Moment Estimation)（`adam`）から［適応的スケーリング，符号化・正規化・直交化］: 2次モーメントによる正規化とRMSの整合

---

## 慎重な重み減衰 (Cautious Weight Decay)

- **ID**: `cautious_wd`
- **発表年**: 2025
- **Citation数（概算）**: 10
- **分野タグ**: 正則化
- **参考文献**: https://arxiv.org/abs/2510.12402

**概要**

分離型の重み減衰を全パラメータに一様に適用するのではなく，最適化手法の更新方向とパラメータの符号が一致する座標にのみ適用する，1行の修正で任意の最適化手法に使える手法である．元の損失関数を正則化された代理問題に置き換えることなく，AdamW，Lion，Muonのいずれでも最終的な検証損失と精度を改善する．

**更新式**

$$ {\mathbf u}_t = \mathrm{Optimizer}({\mathbf g}_t), \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \left( {\mathbf u}_t + \lambda \, \mathbb{1}[{\mathbf u}_t \odot {\mathbf w}_t > 0] \odot {\mathbf w}_t \right) $$

**派生元と改善内容**

- Cautious Optimizers (C-AdamW等)（`cautious`）から［正則化・重み減衰，符号化・正規化・直交化］: 符号の一致に基づくマスクの重み減衰への適用
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［正則化・重み減衰］: 分離型重み減衰の座標ごとの選択的な適用

---

## Celo

- **ID**: `celo`
- **発表年**: 2025
- **Citation数（概算）**: 10
- **分野タグ**: 自動探索・メタ学習
- **参考文献**: https://arxiv.org/abs/2501.12670
- **備考**: 更新式は論文の構造を簡略化した表記である．

**概要**

学習された最適化手法のメタ学習に莫大な計算資源を要する問題に対し，更新則の構造の設計（学習率スケジュールの分離，正規化等）とメタ学習の手順の工夫により，約24GPU時間のメタ学習で，分布外の多様なタスクにおいて調整済みの既存の最適化手法を上回る性能を示した研究である．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta_t \cdot \mathrm{normalize}\left( \mathrm{MLP}_{\boldsymbol\phi}({\mathbf g}_t, {\mathbf m}_t, {\mathbf v}_t, \dots) \right) \quad (\eta_t : \text{学習されたスケジュールとは分離した学習率}) $$

**派生元と改善内容**

- VeLO (Versatile Learned Optimizer)（`velo`）から［問題設定への適用］: メタ学習の計算量を大幅に削減する更新則の構造と手順の設計

---

## Conda (Column-Normalized Adam)

- **ID**: `conda`
- **発表年**: 2025
- **Citation数（概算）**: 10
- **分野タグ**: 適応的学習率，2次手法
- **参考文献**: https://arxiv.org/abs/2509.24218
- **備考**: 更新式は論文の手続きを簡略化した表記である．

**概要**

Adamの更新量はスペクトル的な条件数が悪く，Muonは全方向を一様に正規化するためAdamの要素ごとの適応性を失うという両者の欠点に対し，更新量を直交部分空間に射影した上で，射影後の勾配の2次モーメントを用いて列ごとに正規化する手法である．Adamの適応性を保ちつつ穏やかなスペクトル正規化を導入し，LLaMA・GPT-2の事前学習でAdamWより2倍以上高速に収束する．

**更新式**

$$ {\mathbf U}_t = \mathrm{SVD}_{\mathrm{left}}({\mathbf M}_t) \;\; (\text{低頻度で更新}), \quad \tilde{\mathbf M}_t = {\mathbf U}_t^\top {\mathbf M}_t, \quad \tilde{\mathbf V}_t = \beta_2 \tilde{\mathbf V}_{t-1} + (1 - \beta_2) ({\mathbf U}_t^\top {\mathbf G}_t)^2, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf U}_t \frac{\tilde{\mathbf M}_t}{\sqrt{\tilde{\mathbf V}_t} + \epsilon} $$

**派生元と改善内容**

- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［符号化・正規化・直交化，圧縮・量子化・低ランク］: 直交部分空間に射影した勾配での要素ごとの正規化
- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化］: 全方向一様ではない穏やかなスペクトル正規化
- GaLore (Gradient Low-Rank Projection)（`galore`）から［圧縮・量子化・低ランク］: 勾配のSVDに基づく射影行列の低頻度での更新

---

## Dion (Distributed Orthonormalized Updates)

- **ID**: `dion`
- **発表年**: 2025
- **Citation数（概算）**: 50
- **分野タグ**: 2次手法，分散学習
- **参考文献**: https://arxiv.org/abs/2504.05295

**概要**

Muonの直交化は行列全体を必要とするため，パラメータを分割して保持する分散学習（FSDP，テンソル並列）では各デバイスで冗長な計算や通信が生じる問題に対し，Newton-Schulz反復の代わりに慣性項バッファに対する償却された冪乗反復による低ランクの直交化を用いる手法である．誤差フィードバックで低ランク近似の誤差を慣性項に戻すことで，性能を保ちつつ大規模化での実行時間を短縮する．

**更新式**

$$ {\mathbf B}_t = {\mathbf M}_{t-1} + {\mathbf G}_t, \quad {\mathbf P}_t = {\mathbf B}_t {\mathbf Q}_{t-1}, \;\; {\mathbf P}_t \leftarrow \mathrm{orth}({\mathbf P}_t), \quad {\mathbf R}_t = {\mathbf B}_t^\top {\mathbf P}_t, \quad {\mathbf M}_t = {\mathbf B}_t - (1 - \mu) {\mathbf P}_t {\mathbf R}_t^\top, \quad {\mathbf Q}_t = \mathrm{normalize}({\mathbf R}_t), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \sqrt{m/n} \, {\mathbf P}_t {\mathbf Q}_t^\top $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［圧縮・量子化・低ランク，分散化・通信削減］: 冪乗反復による低ランク直交化と誤差フィードバックによる分散環境への対応
- PowerSGD（`powersgd`）から［圧縮・量子化・低ランク，符号化・正規化・直交化］: 冪乗反復による低ランク近似と誤差フィードバックの直交化への応用

---

## Gluon

- **ID**: `gluon`
- **発表年**: 2025
- **Citation数（概算）**: 30
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2505.13416

**概要**

MuonやScionの既存の理論解析が，実際の層ごとのLMOの適用や層ごとの幾何構造を反映していない問題に対し，層ごとの一般化された滑らかさのモデルを導入したLMOベースの最適化手法の枠組みである．理論から導かれる層ごとのステップ幅が，実験的に調整された値とよく一致することを示した．

**更新式**

$$ {\mathbf W}^{i}_{t+1} = {\mathbf W}^{i}_t + \eta^i_t \, \mathrm{lmo}_{\|\cdot\|_{(i)}}({\mathbf M}^i_t), \quad \eta^i_t = \frac{\| \nabla_i f({\mathbf W}_t) \|_{(i)\star}}{L^0_i + L^1_i \| \nabla_i f({\mathbf W}_t) \|_{(i)\star}} $$

**派生元と改善内容**

- Scion (Stochastic Conditional Gradient with Norm-Constrained LMOs)（`scion`）から［学習率の自動化・スケジュール，理論的再解釈・一般化］: 層ごとの一般化された滑らかさに基づくステップ幅の理論的な導出

---

## KL-Shampoo / KL-SOAP

- **ID**: `kl_shampoo`
- **発表年**: 2025
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2509.03378

**概要**

Shampooの2次モーメントの推定を，KLダイバージェンスの最小化による構造化された共分散推定として再解釈し，その観点から従来の推定則の限界を指摘して，QR分解を用いたKLに基づく推定則に置き換えた手法である．Shampooで通常必要なAdamによるステップ幅のグラフティングが不要となりメモリを削減しつつ，SOAPやShampooを上回る性能を示す．SOAPへの同様の改良版（KL-SOAP）も提案されている．

**更新式**

$$ ({\mathbf L}_t, {\mathbf R}_t) = \arg\min_{{\mathbf L}, {\mathbf R}} \mathrm{KL}\left( \mathcal{N}({\mathbf 0}, \mathbb{E}[\mathrm{vec}({\mathbf G})\mathrm{vec}({\mathbf G})^\top]) \, \| \, \mathcal{N}({\mathbf 0}, {\mathbf R} \otimes {\mathbf L}) \right), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, {\mathbf L}_t^{-1/2} {\mathbf G}_t {\mathbf R}_t^{-1/2} $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［曲率・前処理，理論的再解釈・一般化］: KLダイバージェンス最小化に基づく前処理行列の推定則への置き換え
- SOAP (ShampoO with Adam in the Preconditioner's eigenbasis)（`soap`）から［曲率・前処理，理論的再解釈・一般化］: 固有基底上の推定へのKL推定の適用（KL-SOAP）

---

## Muon (Moonlight版，Muon is Scalable)

- **ID**: `moonlight_muon`
- **発表年**: 2025
- **Citation数（概算）**: 300
- **分野タグ**: 2次手法，大規模バッチ
- **参考文献**: https://arxiv.org/abs/2502.16982

**概要**

Muonを大規模言語モデルの学習に拡張するため，分離型の重み減衰を追加し，パラメータごとの更新量のRMSをAdamWと一致するようにスケーリングした手法である．これによりAdamWのハイパーパラメータをそのまま流用でき，計算最適な学習においてAdamWの約2倍の計算効率を示した．16B規模のMoEモデル（Moonlight）の学習に用いられた．

**更新式**

$$ {\mathbf M}_t = \mu {\mathbf M}_{t-1} + \nabla f_t({\mathbf W}_t), \quad {\mathbf O}_t = \mathrm{NewtonSchulz5}({\mathbf M}_t) \cdot 0.2 \sqrt{\max(m, n)}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta ({\mathbf O}_t + \lambda {\mathbf W}_t) $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［正則化・重み減衰，適応的スケーリング］: 分離型重み減衰の追加と更新量のRMSのAdamWへの整合
- AdamW (Adam with Decoupled Weight Decay)（`adamw`）から［正則化・重み減衰］: AdamWとのハイパーパラメータ互換性の確保

---

## MuonBP (Block-Periodic Orthogonalization)

- **ID**: `muonbp`
- **発表年**: 2025
- **Citation数（概算）**: 10
- **分野タグ**: 2次手法，分散学習
- **参考文献**: https://arxiv.org/abs/2510.16981

**概要**

テンソル並列等で分割された行列について，通常のステップでは各デバイスが保持するブロック（シャード）ごとに独立に直交化を行い，一定周期ごとにのみ全体を集めて完全な直交化を行う手法である．ブロック直交化と完全な直交化で異なる学習率を用いることで，Muonと同等の性能を保ちつつ通信コストを削減し，スループットを改善する．

**更新式**

$$ {\mathbf O}_t = \begin{cases} \mathrm{Orth}({\mathbf M}_t) & (t \bmod P = 0) \\ \mathrm{blockdiag}\left( \mathrm{Orth}({\mathbf M}_t^{(1)}), \dots, \mathrm{Orth}({\mathbf M}_t^{(k)}) \right) & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta_{(t)} {\mathbf O}_t $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［分散化・通信削減］: シャードごとのブロック直交化と周期的な完全直交化による通信削減

---

## MuonClip (Muon + QK-Clip)

- **ID**: `muonclip`
- **発表年**: 2025
- **Citation数（概算）**: 300
- **分野タグ**: 学習安定化，2次手法
- **参考文献**: https://arxiv.org/abs/2507.20534
- **備考**: Kimi K2の技術報告書の中で提案された．Citation数は報告書全体の概算である．

**概要**

Muonで大規模言語モデルを学習する際に，Attentionのロジット（クエリとキーの内積）が爆発して学習が不安定になる問題に対し，各更新の後にヘッドごとの最大ロジットを監視し，閾値を超えた場合にクエリ・キーの射影重みを縮小するQK-Clipを組み合わせた手法である．1兆パラメータ規模のMoEモデル（Kimi K2）を損失スパイクなしで学習した．

**更新式**

$$ {\mathbf W}_{t+1} = \mathrm{Muon}({\mathbf W}_t), \quad S^h_{\max} = \max_{i,j} \frac{{\mathbf q}^h_i \cdot {\mathbf k}^h_j}{\sqrt{d}}, \quad {\mathbf W}^h_q \leftarrow \sqrt{\gamma_h} \, {\mathbf W}^h_q, \;\; {\mathbf W}^h_k \leftarrow \sqrt{\gamma_h} \, {\mathbf W}^h_k, \quad \gamma_h = \min\left( 1, \frac{\tau}{S^h_{\max}} \right) $$

**派生元と改善内容**

- Muon (Moonlight版，Muon is Scalable)（`moonlight_muon`）から［クリッピング・安定化］: Attentionロジットの上限によるクエリ・キー重みの事後的な縮小（QK-Clip）

---

## NorMuon (Neuron-wise Normalized Muon)

- **ID**: `normuon`
- **発表年**: 2025
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法，適応的学習率
- **参考文献**: https://arxiv.org/abs/2510.05491

**概要**

Muonの直交化は更新行列の条件数を改善する一方，ニューロン（行）ごとの更新量のノルムは大きくばらつき，一部のニューロンが学習を支配するという問題を指摘した手法である．直交化の後にニューロンごとの2次モーメントで行ごとに正規化することで，Muonとほぼ同じメモリで学習効率を改善する．

**更新式**

$$ {\mathbf O}_t = \mathrm{NewtonSchulz5}({\mathbf M}_t), \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \, \mathrm{mean}_{\mathrm{cols}}({\mathbf O}_t^2), \quad \hat{\mathbf O}_t = \mathrm{diag}\left( \frac{1}{\sqrt{{\mathbf v}_t} + \epsilon} \right) {\mathbf O}_t, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \frac{0.2 \sqrt{mn}}{\|\hat{\mathbf O}_t\|_F} \hat{\mathbf O}_t $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［適応的スケーリング，符号化・正規化・直交化］: 直交化後のニューロン（行）ごとの2次モーメントによる正規化
- Adam-mini（`adam_mini`）から［適応的スケーリング］: ブロック（ニューロン）単位で共有した2次モーメントの利用

---

## Polar Express

- **ID**: `polar_express`
- **発表年**: 2025
- **Citation数（概算）**: 30
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2505.16932

**概要**

Muonの直交化（極分解の直交因子の計算）に用いる反復法について，各反復の多項式をミニマックス最適化で決めることで，最悪ケースの誤差を最小にする反復法を提案した研究である．Newton-Schulz反復と同様に行列積のみで計算でき，bfloat16での数値的な問題にも対処しており，MuonでGPT-2を学習した際に他の手法より低い検証損失を示す．

**更新式**

$$ {\mathbf X}_0 = \frac{{\mathbf M}}{\|{\mathbf M}\|_F}, \quad {\mathbf X}_{k+1} = p_k({\mathbf X}_k) = a_k {\mathbf X}_k + b_k {\mathbf X}_k {\mathbf X}_k^\top {\mathbf X}_k + c_k ({\mathbf X}_k {\mathbf X}_k^\top)^2 {\mathbf X}_k, \quad p_k = \arg\min_{p} \max_{x \in [\ell_k, u_k]} |1 - p(x)| $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化］: ミニマックス最適な反復ごとの多項式による直交化の高精度化

---

## PolarGrad

- **ID**: `polargrad`
- **発表年**: 2025
- **Citation数（概算）**: 30
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2505.21799

**概要**

行列形状の勾配の極分解に基づく前処理付き最適化手法の族である．Muonを，勾配の極分解の直交因子のみを用いる特殊ケースと位置付け，直交因子を勾配の核ノルムでスケーリングすることで更新量の大きさの情報を回復する．極分解の計算には調整の少ない数値解法（QDWH等）を用いる．

**更新式**

$$ {\mathbf M}_t = {\mathbf U}_t {\mathbf H}_t \;\; (\text{極分解}), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, \|{\mathbf M}_t\|_{*} \, {\mathbf U}_t $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化，適応的スケーリング］: 極分解の直交因子への核ノルムによるスケーリングの導入

---

## SCALE (Stochastic Column-normalized Last-layer Momentum)

- **ID**: `scale_opt`
- **発表年**: 2025
- **Citation数（概算）**: 10
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2506.16659

**概要**

大規模言語モデルの事前学習に必要な最適化手法の最小限の構成要素を調べ，勾配の列ごとの正規化と，最も勾配の雑音が大きい出力層のみに慣性項を用いることの2つで十分であることを示した手法である．SGDに近いメモリ量で，Adamと同等以上の性能を，AdamやMuonより少ないメモリで達成する．

**更新式**

$$ \tilde{\mathbf G}_t = {\mathbf G}_t \, \mathrm{diag}\left( \frac{1}{\|{\mathbf G}_{t,:,j}\|} \right)_j, \quad {\mathbf M}_t = \begin{cases} \beta {\mathbf M}_{t-1} + (1 - \beta) \tilde{\mathbf G}_t & (\text{出力層}) \\ \tilde{\mathbf G}_t & (\text{その他}) \end{cases}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta {\mathbf M}_t $$

**派生元と改善内容**

- 正規化SGD＋慣性項 (Momentum Improves Normalized SGD)（`normalized_sgd_momentum`）から［符号化・正規化・直交化，圧縮・量子化・低ランク］: 列ごとの正規化と出力層のみへの慣性項の限定
- SinkGD (Sinkhorn Gradient Descent)（`sinkgd`）から［符号化・正規化・直交化］: 状態を持たない勾配の正規化による簡素化

---

## Scion (Stochastic Conditional Gradient with Norm-Constrained LMOs)

- **ID**: `scion`
- **発表年**: 2025
- **Citation数（概算）**: 80
- **分野タグ**: 2次手法，メモリ効率
- **参考文献**: https://arxiv.org/abs/2502.07529

**概要**

ノルム球上の線形最小化オラクル（LMO）に基づく確率的最適化手法の枠組みを提案し，層ごとに適切なノルム（隠れ層にはスペクトルノルム，入出力層には∞ノルム等）を選ぶことで，Muonや符号ベースの手法を統一的に扱う手法である．ノルムの明示的な選択によりハイパーパラメータがモデルサイズ間で転移し，Adamを用いずにnanoGPTの学習を高速化する．

**更新式**

$$ {\mathbf M}_t = (1 - \alpha) {\mathbf M}_{t-1} + \alpha \nabla f_t({\mathbf W}_t), \quad \mathrm{lmo}({\mathbf M}) = \arg\min_{\|{\mathbf S}\| \le \rho} \langle {\mathbf M}, {\mathbf S} \rangle, \quad {\mathbf W}_{t+1} = {\mathbf W}_t + \eta \, \mathrm{lmo}({\mathbf M}_t) $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化，理論的再解釈・一般化］: スペクトルノルム球上のLMOとしての解釈と層ごとのノルム選択への一般化
- signSGD / Signum（`signsgd`）から［符号化・正規化・直交化，理論的再解釈・一般化］: ∞ノルム球上のLMO（符号更新）の統一的な扱い
- モジュラー双対化 (Modular Duality)（`modular_duality`）から［符号化・正規化・直交化］: 層ごとのノルム選択とLMOによる双対化の実装
- Frank-Wolfe法 (Conditional Gradient Method)（`frank_wolfe`）から［符号化・正規化・直交化］: 線形最小化オラクル（条件付き勾配法）に基づく更新

---

## SinkGD (Sinkhorn Gradient Descent)

- **ID**: `sinkgd`
- **発表年**: 2025
- **Citation数（概算）**: 20
- **分野タグ**: メモリ効率
- **参考文献**: https://arxiv.org/abs/2502.06742

**概要**

勾配を複数のノルムの下で同時に正規化する多重正規化勾配降下法の枠組みを提案し，その実例として，勾配行列の行方向と列方向の正規化を交互に繰り返す手法である．この反復はSinkhornアルゴリズムの平方根反復に一致し，SWANの白色化を安価な正規化に置き換えることで，SGDと同じメモリとAdam程度の計算量で大規模言語モデルを効率的に学習する．

**更新式**

$$ {\mathbf X} \leftarrow {\mathbf G}_t, \quad \text{for } \ell = 1, \dots, L : \;\; {\mathbf X} \leftarrow \sqrt{n} \, Q({\mathbf X})^{-1} {\mathbf X}, \;\; {\mathbf X} \leftarrow \sqrt{m} \, {\mathbf X} R({\mathbf X})^{-1}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta {\mathbf X} \;\; (Q, R : \text{行・列ノルムの対角行列}) $$

**派生元と改善内容**

- SWAN (SGD with Whitening And Normalization)（`swan`）から［符号化・正規化・直交化］: 白色化の行・列の交互正規化（Sinkhorn反復）への置き換え

---

## SPAM (Spike-Aware Adam with Momentum Reset)

- **ID**: `spam`
- **発表年**: 2025
- **Citation数（概算）**: 40
- **分野タグ**: 学習安定化，適応的学習率
- **参考文献**: https://arxiv.org/abs/2501.06842

**概要**

大規模言語モデルの学習で生じる，通常の数百倍から千倍にも達する勾配スパイクがAdamのモーメントに蓄積して長期間悪影響を及ぼす問題に対し，モーメントを定期的にリセットし，2次モーメントに基づく閾値で突出した勾配成分を適応的に縮小する手法である．

**更新式**

$$ {\mathbf g}_t = \nabla f_t({\mathbf w}_t), \quad \tilde g_{t,i} = \begin{cases} \mathrm{sign}(g_{t,i}) \sqrt{\theta v_{t-1,i}} & (g_{t,i}^2 > \theta v_{t-1,i}) \\ g_{t,i} & (\mathrm{otherwise}) \end{cases}, \quad {\mathbf m}_t, {\mathbf v}_t \leftarrow {\mathbf 0} \;\; (t \bmod \Delta T = 0), \quad {\mathbf w}_{t+1} = \mathrm{Adam}({\mathbf w}_t, \tilde{\mathbf g}_t) $$

**派生元と改善内容**

- Adam (Adaptive Moment Estimation)（`adam`）から［クリッピング・安定化］: モーメントの定期的なリセット
- 勾配クリッピング (Gradient Norm Clipping)（`gradient_clipping`）から［クリッピング・安定化］: 2次モーメントに基づく成分ごとのスパイク検出と縮小

---

## SPlus

- **ID**: `splus`
- **発表年**: 2025
- **Citation数（概算）**: 20
- **分野タグ**: 2次手法，学習安定化
- **参考文献**: https://arxiv.org/abs/2506.07254

**概要**

Shampoo系の手法の不安定性やハイパーパラメータの転移の難しさに対し，前処理行列の固有基底で回転した勾配の符号をとる正規化，行列の形状に応じた学習率のスケーリング，パラメータの反復平均の3つを導入した手法である．Transformerの言語モデル・画像分類・拡散モデルにおいて，Adamより少ないステップ数で同等の性能に到達する．

**更新式**

$$ {\mathbf L}_t = \beta {\mathbf L}_{t-1} + (1-\beta) {\mathbf G}_t {\mathbf G}_t^\top, \;\; {\mathbf R}_t = \beta {\mathbf R}_{t-1} + (1-\beta) {\mathbf G}_t^\top {\mathbf G}_t, \quad {\mathbf U}_t = {\mathbf Q}_L \, \mathrm{sign}({\mathbf Q}_L^\top {\mathbf M}_t {\mathbf Q}_R) \, {\mathbf Q}_R^\top, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \frac{2 \eta}{m + n} {\mathbf U}_t, \quad \bar{\mathbf W}_{t+1} = \mathrm{EMA}({\mathbf W}_{t+1}) $$

**派生元と改善内容**

- Shampoo（`shampoo`）から［符号化・正規化・直交化，曲率・前処理］: 固有基底上での符号による正規化（瞬時の符号正規化）と形状に応じたスケーリング
- Polyak-Ruppert平均化 (Polyak-Ruppert Averaging)（`polyak_averaging`）から［重みの平均化・補間］: パラメータの反復平均による雑音の抑制

---

## Streaming DiLoCo

- **ID**: `streaming_diloco`
- **発表年**: 2025
- **Citation数（概算）**: 60
- **分野タグ**: 分散学習
- **参考文献**: https://arxiv.org/abs/2501.18512

**概要**

DiLoCoでは同期の際に全パラメータを一度に交換するため，ピーク帯域が大きくなる問題に対し，パラメータの一部（層の断片）ずつを時間をずらして同期し，通信を計算と重ね合わせ，交換するデータを低ビットに量子化する手法である．データ並列の学習と同等の性能を，必要な帯域を数百分の1にして達成する．

**更新式**

$$ \text{断片} \; p \; \text{を} \; t \equiv t_p \pmod H \; \text{で同期} : \;\; \Delta^{(p)} = Q\left( \frac{1}{K} \sum_k ({\mathbf w}^{(p)}_{\mathrm{global}} - {\mathbf w}^{k,(p)}) \right), \quad {\mathbf w}^{(p)} \leftarrow \mathrm{Nesterov}({\mathbf w}^{(p)}_{\mathrm{global}}, \Delta^{(p)}) \;\; (\text{計算と重ね合わせて通信}) $$

**派生元と改善内容**

- DiLoCo (Distributed Low-Communication Training)（`diloco`）から［分散化・通信削減，圧縮・量子化・低ランク］: パラメータ断片ごとの時間差同期，通信と計算の重ね合わせ，通信の量子化

---

## 緩和3次Newton-Schulz版Muon (How Much Orthogonalization Does Muon Need?)

- **ID**: `muon_cubic_ns`
- **発表年**: 2026
- **Citation数（概算）**: 3
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2606.00371

**概要**

Muonの学習品質は直交化（極分解）の精度に単調には依存しないことを示し，特異値を[0.7, 1.3]程度の帯域に収めればよいという緩和した目標の下で，係数を最悪ケースの特異値の下界から決める3次のNewton-Schulz反復を提案した研究である．5ステップの3次反復は，従来の5次の反復より少ない行列積で，約40億パラメータまでのモデルで同等の学習品質を示す．

**更新式**

$$ {\mathbf X}_{k+1} = a_k {\mathbf X}_k + b_k {\mathbf X}_k {\mathbf X}_k^\top {\mathbf X}_k \;\; (k = 1, \dots, 5), \quad (a_k, b_k) : \sigma_i({\mathbf X}_5) \in [0.7, 1.3] \text{となるよう最悪ケースの下界から決定}, \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta {\mathbf X}_5 $$

**派生元と改善内容**

- Polar Express（`polar_express`）から［符号化・正規化・直交化］: 高精度な極分解から緩和した目標帯域への変更と3次反復による計算量の削減
- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化，理論的再解釈・一般化］: 直交化の精度と学習品質の関係の再検討

---

## Muon+

- **ID**: `muon_plus`
- **発表年**: 2026
- **Citation数（概算）**: 5
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2602.21545

**概要**

Muonで直交化した更新量に対して，さらに列ごと（または行ごと）の正規化を1回加える手法である．直交化された更新量は行や列のスケールが不均一になり得ることを補正し，追加の最適化状態なしで，60Mから7B規模のGPT・LLaMAモデルの学習においてMuonより一貫して低いパープレキシティを示す．

**更新式**

$$ {\mathbf O}_t = \mathrm{NewtonSchulz5}({\mathbf M}_t), \quad \hat{\mathbf O}_t = {\mathbf O}_t \, \mathrm{diag}\left( \frac{1}{\|{\mathbf O}_{t,:,j}\|} \right)_j \;\; (\text{列正規化}), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, \hat{\mathbf O}_t $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［符号化・正規化・直交化］: 直交化後の列・行ごとの正規化の追加
- NorMuon (Neuron-wise Normalized Muon)（`normuon`）から［符号化・正規化・直交化］: 直交化後の正規化を状態量なしで行う簡略化

---

## Newton-Muon

- **ID**: `newton_muon`
- **発表年**: 2026
- **Citation数（概算）**: 5
- **分野タグ**: 2次手法
- **参考文献**: https://arxiv.org/abs/2604.01472

**概要**

Muonを，入力データの幾何構造を無視した暗黙のニュートン型手法として解釈し，層への入力の2次モーメント行列による補正を加えた手法である．入力の2次モーメント行列とその逆行列は低頻度でのみ更新するため，1ステップあたりの計算量をAdamWやMuonに近く保ちつつ，GPT-2の事前学習でMuonより少ないステップ数で目標の損失に到達する．

**更新式**

$$ {\mathbf C}_t = \mathbb{E}[{\mathbf Z} {\mathbf Z}^\top] \;\; (\text{入力の2次モーメント，低頻度で更新}), \quad {\mathbf W}_{t+1} = {\mathbf W}_t - \eta \, \mathrm{msgn}\left( {\mathbf M}_t \, {\mathbf C}_t^{-1} \right) $$

**派生元と改善内容**

- Muon (MomentUm Orthogonalized by Newton-Schulz)（`muon`）から［曲率・前処理］: 入力データの2次モーメントによるニュートン型の補正
- K-FAC (Kronecker-Factored Approximate Curvature)（`kfac`）から［曲率・前処理］: 層への入力の共分散（K-FACのA因子に相当）による前処理

---
