# Modeling

This folder holds the scoring logic for the hidden-access / care-friction model.

## Goal

Rank districts or pincode clusters by how hard it is to reach trustworthy care after combining:

- travel time
- evidence strength
- affordability pressure
- burden
- facility supply

## First-pass outputs

- `total` score from 0-100
- `band` label: low, moderate, high, critical
- component scores
- short explanation strings

## Current rule set

The current implementation lives in:

- [client/src/lib/careGap.ts](/Users/maggieschultz/databricks-hackathon-ie/affordability-friction-planner/app/client/src/lib/careGap.ts)

That file is the source of truth for the app UI and future warehouse-backed scoring.
