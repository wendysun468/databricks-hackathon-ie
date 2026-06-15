# Affordability Friction Planner

An NGO-oriented planning app that identifies places where care is effectively unaffordable because the nearest trustworthy option is too far away, too weakly evidenced, or too expensive for the local context.

## Core idea

The app is not just a hospital map. It combines:

- facility evidence quality
- maternal or specialty care burden
- district affordability signals
- travel time to trusted care
- optional geospatial friction signals

## Primary wedge

Start with **maternal delivery care deserts**. That gives the team one clear user, one clear decision, and one story that can be explained quickly in a demo.

## What the app should answer

- Where is care available on paper but not truly accessible?
- Where are the nearest trusted facilities?
- How much travel time is required to reach them?
- Which areas are cheap-but-unsafe, safe-but-unaffordable, or both?

## Suggested repo structure

```text
affordability-friction-planner/
  README.md
  project-scope.md
  task-split.md
  scaffold/
    app-flow.md
    data-sources.md
    scoring.md
```

## Next step

Use the scope doc to lock the MVP, then split the work into data, scoring, and app/demo tracks.
