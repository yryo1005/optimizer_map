"""Optimizer Mapのノードデータを検証するPydanticスキーマを定義するモジュール．

`data/nodes/*.json`に格納される各最適化手法のデータは，本モジュールの`OptimizerNode`
スキーマに準拠する．Claude Codeによる手動生成，および将来のGemini APIによる自動生成の
いずれの経路でも，同一のスキーマで検証することで，データの構造的な一貫性を保証する．
"""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, field_validator


class OptimizerCategory(str, Enum):
    """最適化手法の大枠の分野を表す列举型．

    ノードの色分け・クラスタリングの基準として利用する．自由記述によるタグの揺れを防ぐため，
    生成AIによるデータ生成時もこの列举型の値のみを許可する．
    """

    ACCELERATION = "高速化"
    ADAPTIVE_LEARNING_RATE = "適応的学習率"
    SECOND_ORDER = "2次手法"
    VARIANCE_REDUCTION = "勾配分散低減"
    REGULARIZATION = "正則化"


class DerivedFrom(BaseModel):
    """派生元の手法と，その改善内容を表すモデル．

    `OptimizerNode.derived_from`の要素として用いる．可視化時のエッジ（派生関係）は，
    全ノードの`derived_from`を走査することで動的に構築する．
    """

    parent_id: str = Field(..., description="派生元ノードの`id`．")
    relation: str = Field(..., description="派生元から何を改善したかを表す短い名詞句．")


class OptimizerNode(BaseModel):
    """最適化手法1件分のノードデータを表すモデル．

    `data/nodes/{id}.json`として1手法1ファイルで保存する．`derived_from`により
    親手法への参照を持つことで，エッジ情報をノードデータ内に内包し，手法追加時に
    既存ファイルへの差分編集が発生しない構成にしている．
    """

    id: str = Field(..., description="手法のスラッグ（ファイル名と一致させる，例: `adam`）．")
    name: str = Field(..., description="手法の正式名称（例: `Adam`）．")
    year: int = Field(..., description="初出論文の発表年．")
    citation_count: int = Field(..., ge=0, description="参考文献のCitation数．")
    category: list[OptimizerCategory] = Field(
        ..., min_length=1, description="大枠の分野タグ（複数可）．"
    )
    summary: str = Field(..., description="手法の動機と核となる改善点の要約（2〜3文程度）．")
    update_rule: str = Field(..., description="パラメータ更新式（LaTeX記法）．")
    paper_url: str = Field(..., description="初出論文のURL．")
    derived_from: list[DerivedFrom] = Field(
        default_factory=list, description="派生元ノードとその改善内容のリスト．起点となる手法は空リスト．"
    )

    @field_validator("id")
    @classmethod
    def validate_id_is_slug(cls, value: str) -> str:
        """`id`が小文字の英数字とアンダースコアのみで構成されるスラッグであることを検証する関数．

        引数:
            value (str): 検証対象の`id`．
        戻り値:
            str: 検証を通過した`id`．
        例外:
            ValueError: `id`に大文字や空白等，スラッグとして不正な文字が含まれる場合．
        """
        if not value.replace("_", "").isalnum() or not value.islower():
            raise ValueError(f"idはスラッグ形式（小文字英数字とアンダースコア）である必要があります: {value}")
        return value
