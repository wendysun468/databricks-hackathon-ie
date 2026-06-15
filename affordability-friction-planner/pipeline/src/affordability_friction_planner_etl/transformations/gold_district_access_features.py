from __future__ import annotations

import pandas as pd
from pyspark import pipelines as dp

from ..osm import travel_minutes_between_points
from ..shared import (
    burden_score_from_row,
    district_score_band,
    fallback_minutes_from_km,
    haversine_km,
    normalize_percent,
    trust_score_for_evidence,
)


def _to_float(value):
    if value is None or pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _best_facility_for_district(district_row, facilities):
    if facilities.empty:
        return None
    if district_row["latitude"] is None or district_row["longitude"] is None:
        return facilities.iloc[0]
    distances = facilities.apply(
        lambda row: haversine_km(
            district_row["latitude"],
            district_row["longitude"],
            row["latitude_clean"],
            row["longitude_clean"],
        )
        if row["latitude_clean"] is not None and row["longitude_clean"] is not None
        else float("inf"),
        axis=1,
    )
    idx = distances.idxmin()
    if pd.isna(idx):
        return None
    return facilities.loc[idx]


@dp.materialized_view(
    name="gold_district_access_features",
    comment="District-level access and friction features with OSM/OSRM travel estimates.",
)
def gold_district_access_features():
    districts_pdf = spark.read.table("silver_district_health_clean").toPandas()
    pincode_pdf = spark.read.table("silver_pincode_directory_clean").toPandas()
    facilities_pdf = spark.read.table("silver_facilities_geocoded").toPandas()

    district_groups = pincode_pdf.groupby(["district_key", "state_key"], dropna=False)
    facility_groups = facilities_pdf.groupby(["resolved_district_key", "resolved_state_key"], dropna=False)
    state_only_facilities = facilities_pdf.groupby(["resolved_state_key"], dropna=False)

    results = []

    for _, district in districts_pdf.iterrows():
        district_key = district.get("district_key")
        state_key = district.get("state_key")
        district_pincodes = pincode_pdf[
            (pincode_pdf["district_key"] == district_key) & (pincode_pdf["state_key"] == state_key)
        ]
        if district_pincodes.empty:
            district_pincodes = pincode_pdf[pincode_pdf["state_key"] == state_key]

        centroid_lat = district_pincodes["latitude"].dropna().mean() if not district_pincodes.empty else None
        centroid_lon = district_pincodes["longitude"].dropna().mean() if not district_pincodes.empty else None

        district_facilities = facilities_pdf[
            (facilities_pdf["resolved_district_key"] == district_key)
            & (facilities_pdf["resolved_state_key"] == state_key)
        ]
        if district_facilities.empty:
            district_facilities = facilities_pdf[facilities_pdf["resolved_state_key"] == state_key]
        if district_facilities.empty:
            district_facilities = facilities_pdf

        trusted_facilities = district_facilities[district_facilities["trust_score"] >= 60]
        maternal_facilities = district_facilities[district_facilities["has_maternal_signal"] == True]

        facility_count = len(district_facilities)
        maternal_facility_count = len(maternal_facilities)
        trusted_facility_count = len(trusted_facilities)

        nearest = None
        route_result = {"status": "missing_coordinates", "road_minutes": None, "road_km": None, "source": "missing"}

        if centroid_lat is not None and centroid_lon is not None and not trusted_facilities.empty:
            nearest = _best_facility_for_district(
                {
                    "latitude": centroid_lat,
                    "longitude": centroid_lon,
                },
                trusted_facilities,
            )
        elif centroid_lat is not None and centroid_lon is not None and not district_facilities.empty:
            nearest = _best_facility_for_district(
                {
                    "latitude": centroid_lat,
                    "longitude": centroid_lon,
                },
                district_facilities,
            )

        if nearest is not None and centroid_lat is not None and centroid_lon is not None:
            route_result = travel_minutes_between_points(
                {"latitude": centroid_lat, "longitude": centroid_lon},
                {
                    "latitude": _to_float(nearest.get("latitude_clean")),
                    "longitude": _to_float(nearest.get("longitude_clean")),
                },
            )

        nearest_distance_km = None
        if nearest is not None and centroid_lat is not None and centroid_lon is not None:
            nearest_distance_km = haversine_km(
                centroid_lat,
                centroid_lon,
                _to_float(nearest.get("latitude_clean")),
                _to_float(nearest.get("longitude_clean")),
            )

        travel_minutes = route_result.get("road_minutes")
        if travel_minutes is None and nearest_distance_km is not None:
            travel_minutes = fallback_minutes_from_km(nearest_distance_km)

        travel_minutes = travel_minutes if travel_minutes is not None else 55.0
        travel_score = 8 if travel_minutes <= 15 else 36 if travel_minutes <= 30 else 64 if travel_minutes <= 60 else 82 if travel_minutes <= 90 else 94

        trust_strength = district_facilities["evidence_strength"].mode().iloc[0] if not district_facilities.empty else "none"
        trust_score = int(round(district_facilities["trust_score"].mean())) if not district_facilities.empty else trust_score_for_evidence("none")

        district_row = district.to_dict()
        burden_score = burden_score_from_row(district_row)
        affordability_score = normalize_percent(district_row.get("average_out_of_pocket_expenditure_per_delivery_in_a_public_fac"), default=45.0)
        insurance_relief = 100.0 - normalize_percent(district_row.get("hh_member_covered_health_insurance_pct"), default=50.0)
        affordability_component = round(affordability_score * 0.65 + insurance_relief * 0.35, 2)

        pincode_count = len(district_pincodes) if not district_pincodes.empty else 0
        supply_component = 92 if facility_count == 0 else 78 if facility_count < 3 else 54 if facility_count < 8 else 32 if facility_count < 20 else 16

        total = round(
            travel_score * 0.28
            + trust_score * 0.28
            + affordability_component * 0.2
            + burden_score * 0.14
            + supply_component * 0.1,
            2,
        )

        results.append(
            {
                "district_name": district.get("district_name"),
                "state_ut": district.get("state_ut"),
                "district_key": district_key,
                "state_key": state_key,
                "district_centroid_latitude": centroid_lat,
                "district_centroid_longitude": centroid_lon,
                "pincode_count": pincode_count,
                "facility_count": facility_count,
                "maternal_facility_count": maternal_facility_count,
                "trusted_facility_count": trusted_facility_count,
                "nearest_trusted_facility_name": None if nearest is None else nearest.get("facility_name"),
                "nearest_trusted_facility_district": None if nearest is None else nearest.get("resolved_district_name"),
                "nearest_trusted_facility_state": None if nearest is None else nearest.get("resolved_state_name"),
                "nearest_trusted_facility_latitude": None if nearest is None else _to_float(nearest.get("latitude_clean")),
                "nearest_trusted_facility_longitude": None if nearest is None else _to_float(nearest.get("longitude_clean")),
                "nearest_trusted_facility_haversine_km": None if nearest_distance_km is None else round(nearest_distance_km, 2),
                "nearest_trusted_facility_route_minutes": None if route_result.get("road_minutes") is None else round(route_result.get("road_minutes"), 2),
                "route_status": route_result.get("status"),
                "route_source": route_result.get("source"),
                "travel_score": travel_score,
                "trust_strength": trust_strength,
                "trust_score": trust_score,
                "burden_score": burden_score,
                "affordability_component": affordability_component,
                "supply_component": supply_component,
                "care_gap_score": total,
                "care_gap_band": district_score_band(total),
                "feature_confidence": "high" if route_result.get("status") == "ok" else "medium" if route_result.get("status") == "fallback" else "low",
                "reason_summary": "Travel, trust, affordability, burden, and supply were combined into the district score.",
            }
        )

    return spark.createDataFrame(pd.DataFrame(results))
