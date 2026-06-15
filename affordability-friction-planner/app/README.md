# Affordability Friction Planner

Databricks App scaffold for finding where care is effectively hard to reach because travel time,
affordability, and evidence strength all work against access.

## Focus

- maternal delivery deserts first
- trust-aware facility evidence
- travel time to trusted care
- affordability pressure by district
- persisted shortlist and notes in Lakebase

## Environment variables

Set these in `.env` when running locally:

- `DATABRICKS_WAREHOUSE_ID` for analytics queries
- `LAKEBASE_ENDPOINT` for the Lakebase plugin
- `PGHOST` and `PGDATABASE` if you connect to Lakebase directly

## What is in the scaffold

- `client/` React frontend
- `server/` AppKit server entry
- `app.yaml` app runtime command
- `databricks.yml` bundle config
- `scaffold/` planning notes for the team

## What to build next

1. Wire analytics queries for district friction ranking.
2. Add Lakebase tables for shortlist and planner notes.
3. Replace placeholder metrics with real evidence and travel-time outputs.
