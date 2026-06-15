# 3-Person Task Split

## Person 1: Data and Geospatial Pipelines

- clean and normalize facility, district, and pincode data
- build joins for geography and burden indicators
- add travel-time enrichment using OpenStreetMap and OSRM or a similar routing source
- optional: add Earth Engine features for climate or access friction
- own feature tables and data quality flags

## Person 2: Scoring and Model Logic

- define the care-friction score
- build the trust/evidence classifier or rule-based fallback
- compute nearest trusted facility and travel-time penalties
- expose confidence and explanation fields
- own evaluation checks and sanity tests

## Person 3: App and Demo

- build the dashboard UI
- implement filters, map, detail views, shortlist, and notes
- wire the model outputs into the UI
- own the README polish, demo script, and final presentation

## Parallel Work Strategy

- Person 1 can start on data before the UI exists.
- Person 2 can work from mocked tables or exported CSVs.
- Person 3 can build the shell UI against sample data and swap in real outputs later.

## Suggested Milestone Split

### Day 1

- lock the MVP
- finalize data sources
- build the feature tables

### Day 2

- wire the score and travel-time logic
- finish the primary UI flow

### Day 3

- tighten the demo
- add guardrails and fallback behavior
- write the submission text
