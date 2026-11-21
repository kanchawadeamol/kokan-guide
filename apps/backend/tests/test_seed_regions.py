"""Seed file validation (no database)."""

import copy
import json
from typing import Any

import pytest
from pydantic import ValidationError

from app.seed.regions import DEFAULT_SEED_FILE, RegionSeed, load_region_seed


@pytest.fixture(scope="module")
def raw() -> dict[str, Any]:
    data: dict[str, Any] = json.loads(DEFAULT_SEED_FILE.read_text(encoding="utf-8"))
    return data


def _districts(seed: RegionSeed) -> dict[str, Any]:
    return {d.slug: d for d in seed.countries[0].states[0].districts}


def test_shipped_seed_file_is_valid() -> None:
    seed = load_region_seed()

    assert [c.code for c in seed.countries] == ["IN"]
    assert seed.countries[0].states[0].code == "IN-MH"


def test_ratnagiri_and_raigad_talukas() -> None:
    districts = _districts(load_region_seed())

    assert set(districts) == {"ratnagiri", "raigad"}
    assert len(districts["ratnagiri"].talukas) == 9
    assert len(districts["raigad"].talukas) == 15
    assert {t.slug for t in districts["raigad"].talukas} >= {"alibag", "panvel", "shrivardhan"}


def test_every_taluka_has_at_least_its_headquarters() -> None:
    for district in _districts(load_region_seed()).values():
        for taluka in district.talukas:
            assert taluka.places, f"{district.slug}/{taluka.slug} has no places"


def test_seed_does_not_invent_unverified_data(raw: dict[str, Any]) -> None:
    """Hindi place names, LGD codes and coordinates must come from an authoritative source."""
    text = json.dumps(raw)
    for forbidden in ('"lgd_code"', '"centroid"', '"lat"', '"lng"'):
        assert forbidden not in text
    for district in raw["countries"][0]["states"][0]["districts"]:
        assert "hi" not in district["name"]


def _mutate(raw: dict[str, Any], change: Any) -> dict[str, Any]:
    data = copy.deepcopy(raw)
    change(data)
    return data


def _first_taluka(data: dict[str, Any]) -> dict[str, Any]:
    taluka: dict[str, Any] = data["countries"][0]["states"][0]["districts"][0]["talukas"][0]
    return taluka


@pytest.mark.parametrize(
    ("case", "change"),
    [
        (
            "duplicate sibling slug",
            lambda d: d["countries"][0]["states"][0]["districts"][0]["talukas"].append(
                copy.deepcopy(_first_taluka(d))
            ),
        ),
        ("slug with uppercase", lambda d: _first_taluka(d).update(slug="Dapoli")),
        ("slug with spaces", lambda d: _first_taluka(d).update(slug="new town")),
        ("Marathi not in Devanagari", lambda d: _first_taluka(d)["name"].update(mr="Dapoli")),
        ("English in Devanagari", lambda d: _first_taluka(d)["name"].update(en="दापोली")),
        ("blank English name", lambda d: _first_taluka(d)["name"].update(en="   ")),
        ("missing Marathi name", lambda d: _first_taluka(d)["name"].pop("mr")),
        ("unknown field", lambda d: _first_taluka(d).update(population=1000)),
        ("invalid place kind", lambda d: _first_taluka(d)["places"][0].update(kind="metropolis")),
        (
            "district without talukas",
            lambda d: d["countries"][0]["states"][0]["districts"][0].update(talukas=[]),
        ),
        ("bad state code", lambda d: d["countries"][0]["states"][0].update(code="Maharashtra")),
    ],
)
def test_invalid_seed_data_is_rejected(raw: dict[str, Any], case: str, change: Any) -> None:
    with pytest.raises(ValidationError):
        RegionSeed.model_validate(_mutate(raw, change))


def test_same_slug_allowed_under_different_parents(raw: dict[str, Any]) -> None:
    # "ratnagiri" is both a district and a taluka (and a city) in the real data.
    seed = RegionSeed.model_validate(raw)
    ratnagiri = _districts(seed)["ratnagiri"]
    assert any(t.slug == "ratnagiri" for t in ratnagiri.talukas)
