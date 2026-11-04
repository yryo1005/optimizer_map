"""`data/nodes/*.json`の構造的な整合性を検証するテストモジュール．

各ノードJSONが`OptimizerNode`スキーマに準拠していること，`manifest.json`との対応関係，
`derived_from`が参照するノードIDが実在すること，`id`とファイル名が一致することを確認する．
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from pydantic import ValidationError

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
NODES_DIR = DATA_DIR / "nodes"

import sys

sys.path.insert(0, str(PROJECT_ROOT / "programs" / "data_generation"))
from schema import OptimizerNode  # noqa: E402


def _load_manifest_ids() -> list[str]:
    """`data/manifest.json`に列挙されたノードIDの一覧を取得する関数．

    引数:
        なし．
    戻り値:
        list[str]: `manifest.json`の`nodes`フィールドに記載されたノードIDのリスト．
    """
    manifest_path = DATA_DIR / "manifest.json"
    with manifest_path.open(encoding="utf-8") as f:
        manifest = json.load(f)
    return manifest["nodes"]


def _load_node(node_id: str) -> OptimizerNode:
    """指定したノードIDに対応するJSONファイルを読み込み，スキーマで検証する関数．

    引数:
        node_id (str): 読み込むノードのID（ファイル名から拡張子を除いたもの）．
    戻り値:
        OptimizerNode: 検証済みのノードデータ．
    """
    node_path = NODES_DIR / f"{node_id}.json"
    with node_path.open(encoding="utf-8") as f:
        raw = json.load(f)
    return OptimizerNode.model_validate(raw)


@pytest.fixture(scope="module")
def manifest_ids() -> list[str]:
    """`manifest.json`のノードID一覧を提供するフィクスチャ．"""
    return _load_manifest_ids()


def test_manifest_matches_node_files(manifest_ids: list[str]) -> None:
    """`manifest.json`に列挙されたIDと，`data/nodes/`内のファイルが1対1で対応することを検証する．"""
    file_ids = {p.stem for p in NODES_DIR.glob("*.json")}
    assert set(manifest_ids) == file_ids


@pytest.mark.parametrize("node_id", _load_manifest_ids())
def test_node_conforms_to_schema(node_id: str) -> None:
    """各ノードJSONが`OptimizerNode`スキーマに準拠することを検証する．"""
    try:
        node = _load_node(node_id)
    except ValidationError as exc:
        pytest.fail(f"{node_id}.jsonがスキーマに準拠していません: {exc}")
    assert node.id == node_id


@pytest.mark.parametrize("node_id", _load_manifest_ids())
def test_derived_from_references_exist(node_id: str, manifest_ids: list[str]) -> None:
    """`derived_from`が参照する`parent_id`が，実在するノードIDであることを検証する．"""
    node = _load_node(node_id)
    for derived in node.derived_from:
        assert derived.parent_id in manifest_ids, (
            f"{node_id}.jsonのderived_fromが参照する{derived.parent_id}が存在しません"
        )


def test_no_self_reference(manifest_ids: list[str]) -> None:
    """ノードが自分自身を`derived_from`に含めていないことを検証する．"""
    for node_id in manifest_ids:
        node = _load_node(node_id)
        parent_ids = {derived.parent_id for derived in node.derived_from}
        assert node_id not in parent_ids
