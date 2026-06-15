# Affordability Friction Planner

Databricks App scaffold for finding where care is effectively hard to reach because travel time,
affordability, and evidence strength all work against access.

## Focus

- maternal delivery deserts first
- trust-aware facility evidence
- travel time to trusted care
- affordability pressure by district
- persisted shortlist and notes in Lakebase

## Local setup

Defaults are already wired in `package.json`:

1. Make sure the repo-root Databricks config file exists at `../../.databrickscfg.local`.
2. If needed, create or refresh the profile:

```bash
databricks auth login --host https://dbc-d71b1eb4-7457.cloud.databricks.com --profile codex-file
```

3. Run the app from `affordability-friction-planner/app`:

```bash
npm run dev
```

Optional overrides:

- `DATABRICKS_WAREHOUSE_ID` for analytics queries
- `DATABRICKS_CONFIG_FILE` if you want a different local auth file
- `DATABRICKS_CONFIG_PROFILE` if you want a different profile name
- `LAKEBASE_ENDPOINT`, `PGHOST`, and `PGDATABASE` for Lakebase

## What is in the scaffold

- `client/` React frontend
- `server/` AppKit server entry
- `app.yaml` app runtime command
- `databricks.yml` bundle config
- `scaffold/` planning notes for the team

## What to build next

1. Tune the live warehouse snapshots and ranking logic against the real tables.
2. Add Lakebase tables for shortlist and planner notes.
3. Replace any remaining proxy metrics with OSRM travel times or other routing data.
