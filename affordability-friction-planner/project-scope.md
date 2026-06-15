# Project Scope

## Working Title

Affordability Friction Planner

## One-line Pitch

Help NGOs and planners find places where care is not truly accessible because trusted facilities are far away, weakly evidenced, or financially out of reach.

## Target User

- NGO healthcare planners
- public health program managers
- developers or researchers deciding where to place outreach or referral support

## Narrow Wedge

Focus on **maternal delivery care deserts** first.

That keeps the project:

- specific
- measurable
- easy to explain
- aligned with the current hackathon data

## Core Question

Where are the real highest gaps in care after combining:

- facility trust
- affordability pressure
- travel time
- district burden
- geospatial access friction

## Core Inputs

- Databricks facility data
- district health indicators
- pincode and district geography
- OpenStreetMap road network
- travel-time matrix from OSRM or another routing source
- optional Earth Engine geospatial signals

## MVP Outputs

- ranked districts or pincode clusters
- care-friction score
- travel time to nearest trusted facility
- evidence-backed facility list
- affordability labels
- shortlist and notes

## MVP Features

### 1. Care Friction Map

Show districts ranked by apparent access difficulty.

### 2. Trust-Aware Facility Search

Show nearby facilities with evidence labels:

- strong
- partial
- weak
- unsupported

### 3. Travel-Time Layer

Show minutes to the nearest trusted option.

### 4. Affordability Lens

Show where care is likely lower-cost, mixed, or premium.

### 5. District Detail View

Show burden, facility density, travel time, and evidence context in one place.

### 6. Shortlist and Notes

Allow the user to save promising districts or facilities.

## Scoring Dimensions

- facility supply gap
- evidence gap
- affordability gap
- travel-time gap
- district burden
- optional climate or terrain friction

## What Not to Claim

The MVP should not claim:

- real-time appointment availability
- live staffing availability
- exact treatment pricing
- precise household spend
- verified accreditation

## Success Criteria

The app is successful if a judge can answer, within 3 minutes:

- where the biggest hidden gaps are
- why those gaps are real
- why the app is better than a simple facility map
