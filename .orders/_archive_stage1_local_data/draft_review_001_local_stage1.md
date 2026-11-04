# Optimizer Map データレビュー（ドラフト）

本資料は，`data/nodes/`に格納された最適化手法データを確認するためのレビュー用資料である．
Citation数は生成時点（本資料の作成セッション）での概算値であり，Semantic Scholar等のAPIによる
自動取得に置き換えるまでの暫定値として扱う．内容を確認し，修正が必要な場合は指示すること．

---

## 確率的勾配降下法 (Stochastic Gradient Descent, SGD)

- **ID**: `sgd`
- **発表年**: 1951
- **Citation数（概算）**: 25,000
- **分野タグ**: 高速化
- **参考文献**: https://www.jstor.org/stable/2236626

**概要**

目的関数全体の勾配の代わりに，1サンプルまたは少数のミニバッチから計算した勾配の推定値を用いてパラメータを更新する確率的近似法である．全データを用いる最急降下法と比べ，1回の更新に要する計算量を大幅に削減できるため，大規模データセットに対する最適化の基礎となった．

**更新式**

$$ {\mathbf w}_{t+1} = {\mathbf w}_t - \eta \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

なし（起点となる手法）

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

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から: 慣性項（過去の更新方向の蓄積）の追加

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

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から: 慣性項に基づく先読み位置での勾配評価

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

- 確率的勾配降下法 (Stochastic Gradient Descent, SGD)（`sgd`）から: 勾配2乗の累積によるパラメータごとの学習率スケジューリング

---

## RMSprop (Root Mean Square Propagation)

- **ID**: `rmsprop`
- **発表年**: 2012
- **Citation数（概算）**: 22,000
- **分野タグ**: 適応的学習率
- **参考文献**: http://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf

**概要**

AdaGradが学習開始からの勾配2乗を単純に累積するため，学習が進むにつれ学習率が過度に減衰する問題を解決する手法である．勾配の2乗の指数移動平均（直近の勾配を重視した移動平均）を用いて学習率をスケジューリングすることで，非定常な目的関数に対しても学習率が過度に減衰しないようにする．

**更新式**

$$ {\mathbf r}_t = \rho {\mathbf r}_{t-1} + (1 - \rho) \nabla f_t({\mathbf w}_t)^2, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{{\mathbf r}_t} + \epsilon} \nabla f_t({\mathbf w}_t) $$

**派生元と改善内容**

- AdaGrad (Adaptive Gradient Algorithm)（`adagrad`）から: 勾配2乗の指数移動平均による学習率スケジューリングへの変更

---

## Adam (Adaptive Moment Estimation)

- **ID**: `adam`
- **発表年**: 2014
- **Citation数（概算）**: 190,000
- **分野タグ**: 高速化，適応的学習率
- **参考文献**: https://arxiv.org/abs/1412.6980

**概要**

モーメント法が導入する勾配の1次モーメント（慣性項）と，RMSpropが導入する勾配の2次モーメント（学習率のスケジューリング）の両方を組み合わせた手法である．さらに，学習初期にモーメントの推定値が0に偏るバイアスを補正する機構を導入しており，幅広いタスクで安定して高速に収束するため，深層学習における最も標準的な最適化手法の一つとなっている．

**更新式**

$$ {\mathbf m}_t = \beta_1 {\mathbf m}_{t-1} + (1 - \beta_1) \nabla f_t({\mathbf w}_t), \quad {\mathbf v}_t = \beta_2 {\mathbf v}_{t-1} + (1 - \beta_2) \nabla f_t({\mathbf w}_t)^2, \quad \hat{\mathbf m}_t = \frac{{\mathbf m}_t}{1 - \beta_1^t}, \quad \hat{\mathbf v}_t = \frac{{\mathbf v}_t}{1 - \beta_2^t}, \quad {\mathbf w}_{t+1} = {\mathbf w}_t - \frac{\eta}{\sqrt{\hat{\mathbf v}_t} + \epsilon} \hat{\mathbf m}_t $$

**派生元と改善内容**

- モーメント法 (Momentum，Heavy Ball法)（`momentum`）から: 1次モーメント（慣性項）の導入とバイアス補正
- RMSprop (Root Mean Square Propagation)（`rmsprop`）から: 2次モーメントによる学習率スケジューリングの導入とバイアス補正

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

- Adam (Adaptive Moment Estimation)（`adam`）から: 重み減衰(Weight Decay)のモーメント計算からの分離

---
