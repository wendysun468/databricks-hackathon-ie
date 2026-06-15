from __future__ import annotations

import json
import math
import re
from typing import Any, Iterable

import pandas as pd

SOURCE_FACILITIES = "databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.facilities"
SOURCE_DISTRICT_HEALTH = (
    "databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.nfhs_5_district_health_indicators"
)
SOURCE_PINCODE = (
    "databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.india_post_pincode_directory"
)

MATERNAL_KEYWORDS = (
    "maternal",
    "maternity",
    "delivery",
    "obstetric",
    "obstetrics",
    "antenatal",
    "postnatal",
    "newborn",
    "gyne",
    "gynec",
)

TRUST_SCORES = {
    "strong": 90,
    "partial": 68,
    "weak": 40,
    "none": 12,
}


def _clean_part(value: Any) -> str:
    return normalize_key(value)

def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    text = str(value).strip()
    if text in {"", "NA", "N/A", "null", "None", "*"}:
        return ""
    return text


def normalize_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", normalize_text(value).lower())


def parse_float(value: Any) -> float | None:
    text = normalize_text(value)
    if not text:
        return None
    cleaned = re.sub(r"[^0-9.\-]+", "", text)
    if cleaned in {"", "-", "."}:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_int(value: Any) -> int | None:
    number = parse_float(value)
    return None if number is None else int(round(number))


def parse_json_list(value: Any) -> list[str]:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return []
    if isinstance(value, list):
        return [normalize_text(item) for item in value if normalize_text(item)]
    text = normalize_text(value)
    if not text:
        return []
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, list):
        return [normalize_text(item) for item in parsed if normalize_text(item)]
    parts = re.split(r"[,;|]", text)
    return [normalize_text(part) for part in parts if normalize_text(part)]


def list_count(value: Any) -> int:
    return len(parse_json_list(value))


def combine_key(*parts: Any) -> str:
    key_parts = [normalize_key(part) for part in parts if normalize_key(part)]
    return "__".join(key_parts)


def text_blob(values: Iterable[Any]) -> str:
    return " | ".join(normalize_text(value) for value in values if normalize_text(value))


def has_maternal_signal(values: Iterable[Any]) -> bool:
    blob = normalize_text(text_blob(values)).lower()
    return any(keyword in blob for keyword in MATERNAL_KEYWORDS)


def classify_evidence(
    *,
    source_urls: Any,
    operational_fields: Iterable[Any],
    text_fields: Iterable[Any],
) -> str:
    urls = parse_json_list(source_urls)
    has_provenance = bool(urls)
    operational_count = sum(1 for value in operational_fields if normalize_text(value))
    rich_text_count = sum(
        1 for value in text_fields if len(normalize_text(value)) >= 18 and not normalize_text(value).startswith("http")
    )

    if has_provenance and operational_count >= 1 and rich_text_count >= 2:
        return "strong"
    if (has_provenance and rich_text_count >= 1) or (operational_count >= 2 and rich_text_count >= 1):
        return "partial"
    if operational_count >= 1 or rich_text_count >= 1:
        return "weak"
    return "none"


def trust_score_for_evidence(evidence: str) -> int:
    return TRUST_SCORES.get(evidence, TRUST_SCORES["none"])


def normalize_percent(value: Any, default: float = 50.0) -> float:
    number = parse_float(value)
    if number is None:
        return default
    if 0 <= number <= 1:
        return round(number * 100, 2)
    if number > 100:
        return 100.0
    return max(0.0, min(100.0, round(number, 2)))


def normalize_ratio(value: Any, default: float = 0.45) -> float:
    number = parse_float(value)
    if number is None:
        return default
    if number > 1:
        return max(0.0, min(1.0, number / 10000))
    return max(0.0, min(1.0, number))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radians = math.radians
    earth_radius_km = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(radians(lat1)) * math.cos(radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    return 2 * earth_radius_km * math.asin(min(1.0, math.sqrt(a)))


def fallback_minutes_from_km(distance_km: float) -> float:
    return max(5.0, round(distance_km * 2.4 + 8.0, 2))


def burden_score_from_row(row: dict[str, Any]) -> float:
    positive = []
    negative = []

    insurance = parse_float(row.get("hh_member_covered_health_insurance_pct"))
    if insurance is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(insurance)))

    institutional = parse_float(row.get("institutional_birth_in_public_facility_5y_pct"))
    if institutional is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(institutional)))

    anc1 = parse_float(row.get("mothers_who_had_an_anc_visit_in_the_first_trimester_lb5y_pct"))
    if anc1 is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(anc1)))

    anc4 = parse_float(row.get("mothers_who_had_at_least_4_anc_visits_lb5y_pct"))
    if anc4 is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(anc4)))

    anemia = parse_float(row.get("all_w15_49_who_are_anaemic_pct"))
    if anemia is not None:
        negative.append(normalize_percent(anemia))

    literacy = parse_float(row.get("women_age_15_49_who_are_literate_pct"))
    if literacy is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(literacy)))

    schooling = parse_float(row.get("women_age_15_49_with_10_or_more_years_of_schooling_pct"))
    if schooling is not None:
        positive.append(max(0.0, 100.0 - normalize_percent(schooling)))

    oop = parse_float(row.get("average_out_of_pocket_expenditure_per_delivery_in_a_public_fac"))
    if oop is not None:
        positive.append(min(100.0, (math.log10(oop + 1) / 4) * 100))

    if not positive and not negative:
        return 52.0

    average = (sum(positive) + sum(negative)) / max(1, len(positive) + len(negative))
    return max(0.0, min(100.0, round(average, 2)))


def facility_trust_from_row(row: dict[str, Any]) -> tuple[str, int]:
    evidence = classify_evidence(
        source_urls=row.get("source_urls"),
        operational_fields=(
            row.get("capability"),
            row.get("procedure"),
            row.get("equipment"),
        ),
        text_fields=(
            row.get("specialties"),
            row.get("description"),
            row.get("capability"),
            row.get("procedure"),
            row.get("equipment"),
            row.get("source_urls"),
        ),
    )
    return evidence, trust_score_for_evidence(evidence)


def district_score_band(score: float) -> str:
    if score >= 80:
        return "critical"
    if score >= 60:
        return "high"
    if score >= 35:
        return "moderate"
    return "low"


def evidence_band(evidence: str) -> str:
    return {
        "strong": "Strong",
        "partial": "Partial",
        "weak": "Weak",
        "none": "None",
    }.get(evidence, "None")
