from __future__ import annotations

from functools import lru_cache
from typing import Any

import requests

from .shared import fallback_minutes_from_km, haversine_km, parse_float

OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"


@lru_cache(maxsize=2048)
def route_minutes_osrm(lat1: float, lon1: float, lat2: float, lon2: float) -> dict[str, Any]:
    try:
        response = requests.get(
            OSRM_ROUTE_URL.format(lat1=lat1, lon1=lon1, lat2=lat2, lon2=lon2),
            params={"overview": "false", "alternatives": "false", "steps": "false"},
            timeout=12,
        )
        response.raise_for_status()
        payload = response.json()
        routes = payload.get("routes") or []
        if routes:
            duration_sec = routes[0].get("duration")
            distance_m = routes[0].get("distance")
            if duration_sec is not None and distance_m is not None:
                return {
                    "status": "ok",
                    "road_minutes": round(float(duration_sec) / 60.0, 2),
                    "road_km": round(float(distance_m) / 1000.0, 2),
                    "source": "osrm",
                }
    except Exception as exc:  # best-effort enrichment
        return {
            "status": "fallback",
            "road_minutes": None,
            "road_km": None,
            "source": f"osrm_error:{type(exc).__name__}",
        }

    distance_km = haversine_km(lat1, lon1, lat2, lon2)
    return {
        "status": "fallback",
        "road_minutes": fallback_minutes_from_km(distance_km),
        "road_km": round(distance_km, 2),
        "source": "haversine",
    }


def travel_minutes_between_points(origin: dict[str, Any], destination: dict[str, Any]) -> dict[str, Any]:
    lat1 = parse_float(origin.get("latitude"))
    lon1 = parse_float(origin.get("longitude"))
    lat2 = parse_float(destination.get("latitude"))
    lon2 = parse_float(destination.get("longitude"))
    if None in {lat1, lon1, lat2, lon2}:
        return {
            "status": "missing_coordinates",
            "road_minutes": None,
            "road_km": None,
            "source": "missing_coordinates",
        }
    return route_minutes_osrm(lat1, lon1, lat2, lon2)
