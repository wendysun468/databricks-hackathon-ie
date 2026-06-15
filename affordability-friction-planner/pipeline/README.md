# Affordability Friction Planner ETL

Python Lakeflow pipeline for cleaning the Databricks hackathon source tables and publishing
shared feature tables for the app and the other teammates.

## What it reads

- `databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.facilities`
- `databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.nfhs_5_district_health_indicators`
- `databricks_virtue_foundation_dataset_dais_2026.virtue_foundation_dataset.india_post_pincode_directory`

## What it writes

All outputs go to:

- catalog: `workspace`
- schema: `affordability_friction_planner`

This shared schema now exists in the Databricks workspace and is the team-wide target for the
pipeline outputs.

The WorldPop population source is also stored here:

- raw file: `dbfs:/Volumes/workspace/affordability_friction_planner/worldpop_raw/ind_pop_2026_CN_1km_R2025A_UA_v1.tif`
- metadata table: `workspace.affordability_friction_planner.worldpop_india_population_metadata`

Planned tables:

- `bronze_facilities_raw`
- `bronze_district_health_raw`
- `bronze_pincode_directory_raw`
- `silver_facilities_clean`
- `silver_district_health_clean`
- `silver_pincode_directory_clean`
- `silver_facilities_geocoded`
- `gold_district_access_features`
- `gold_facility_trust_index`

## Travel-time approach

The first pass uses OpenStreetMap-compatible routing through the public OSRM API when
possible. If routing fails, the pipeline falls back to a coordinate-based travel estimate
so the tables still materialize.

## Local workflow

This project is structured as a Databricks bundle. Deploy it, then start the pipeline update.

```bash
databricks bundle validate --profile codex-file
databricks bundle deploy -t dev --profile codex-file
databricks bundle run affordability_friction_planner_etl -t dev --profile codex-file
```

## Notes

- No source data is stored in git.
- The pipeline reads the live Unity Catalog tables and writes cleaned/feature tables back to
  Unity Catalog.
- The shared output location is `workspace.affordability_friction_planner`.
- WorldPop India 2026 1km population data is available in the shared volume for population
  normalization and observability scoring.
- The OSM/OSRM step is best-effort; the fallback keeps the gold table usable if routing is slow
  or unavailable.
