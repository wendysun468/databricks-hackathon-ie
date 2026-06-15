# GeoGap Planner - Project Scope

## Overview

GeoGap Planner is a geospatial expansion-planning app for doctors and hospital organizations. It helps users identify underserved locations for a chosen specialty or multi-specialty profile by combining facility supply data, district-level health burden signals, and pincode geography.

It also includes a coarse affordability lens so users can understand whether a location is more likely to fit a lower-cost, mixed-cost, or premium care model.

For maternal care, the app can also surface a modeled delivery-cost view using district-level out-of-pocket expenditure data and insurance coverage context.

The app is designed to answer:

- Where is a specialty under-served?
- Which nearby facilities already exist?
- How strong is the evidence that a facility truly offers the specialty?
- Which locations are the best candidates for expansion?
- Which candidate areas appear more affordable for the local patient base?
- For maternal care, what does delivery affordability look like in this district?

## Target Users

- Individual doctors planning to open or relocate a private practice
- Hospital groups evaluating new branches or specialty centers
- Medical strategy teams looking for underserved geographies

## Core Problem

Healthcare providers often need to make expansion decisions without a clear view of:

- specialty supply density
- nearby competitor facilities
- evidence quality behind facility claims
- local health burden and demand pressure

GeoGap Planner helps turn noisy healthcare records into a usable decision map.

## Data We Will Use

### `facilities`

Main supply dataset.

Available signals:

- facility name
- facility type
- operator type
- address and coordinates
- specialties
- procedures
- capabilities
- equipment
- description
- contact information
- source URLs
- numberDoctors
- capacity
- yearEstablished

### `india_post_pincode_directory`

Geography normalization dataset.

Available signals:

- pincode
- district
- state
- postal geography fields
- approximate coordinates

### `nfhs_5_district_health_indicators`

Demand and burden dataset.

Available signals:

- maternal health indicators
- child health indicators
- anemia
- diabetes / blood sugar
- hypertension
- sanitation
- insurance
- education
- nutrition
- tobacco / alcohol indicators
- insurance coverage and related access context

## MVP Scope

The MVP will support a clear specialty-expansion workflow using only the existing data.

### 1. Specialty Gap Map

Show a map of candidate geographies ranked by apparent specialty supply gap.

### 2. Specialty and Multi-Specialty Search

Allow users to filter by:

- one specialty
- multiple specialties
- multi-specialty facilities
- facility type
- operator type
- geography

### 3. Evidence-Backed Facility Shortlist

For each candidate facility, show:

- why it matched the specialty
- supporting text evidence
- contact information
- location
- trust label

Trust labels should reflect evidence strength, such as:

- strong evidence
- partial evidence
- weak evidence
- no clear evidence

### 4. Opportunity Ranking

Rank candidate locations using:

- low nearby specialty supply
- higher district health burden
- data confidence
- geographic clustering

### 5. Facility Detail View

For any facility, show:

- map pin
- specialty tags
- claims found in the text
- contact info
- source URLs
- trust summary

### 6. Shortlist and Notes

Allow users to save candidate locations and add notes for later review.

### 7. Data Quality Flags

Surface records with issues such as:

- missing coordinates
- noisy or conflicting specialty values
- odd facility type values
- incomplete contact fields
- weak or unsupported claims

### 8. District Demand Lens

Show district-level health indicators to provide context for expansion planning.

### 9. Affordability Lens

Show a basic affordability signal using the data we already have.

This can be based on:

- facility type
- operator type
- public vs private split
- district insurance coverage
- claims like cashless or Mediclaim in facility text
- service category, such as maternity or diagnostics

The goal is to label areas as:

- likely lower cost
- mixed cost profile
- likely premium

This is a directional planning signal, not a treatment price engine.

### 10. Maternal Care Affordability

When the user selects maternal care or maternity-related specialties, show a delivery-cost model using:

- `average_out_of_pocket_expenditure_per_delivery_in_a_public_fac`
- district health insurance coverage
- public vs private facility mix
- maternal health burden indicators

The app should help users:

- identify districts where childbirth care may be expensive for patients
- compare public-facility delivery affordability across locations
- recommend lower-cost or better-covered care options where appropriate
- expand maternal care in a way that is more accessible to local patients

## Recommended User Workflow

1. User selects a specialty or specialty bundle.
2. User chooses a geography such as state, district, city, or pincode.
3. App identifies relevant facilities nearby.
4. App scores facility evidence strength.
5. App overlays district-level health burden signals.
6. App ranks candidate expansion zones.
7. User saves promising locations to a shortlist.

## What We Will Not Claim in MVP

The current dataset does **not** support these as live features:

- live doctor vacancy lookup
- appointment availability
- real-time staffing availability
- patient wait times
- exact treatment pricing
- insurer contract pricing
- licensing verification
- accreditation validation
- exact revenue prediction
- exact catchment population modeling

## Future Enhancements If More Data Becomes Available

### Market Sizing

If we had population, income, insurance mix, and utilization data, we could estimate:

- addressable market
- specialty revenue potential
- break-even potential
- commercial viability by region

### Treatment Affordability

If we had fee schedules, procedure prices, reimbursement rates, and patient out-of-pocket data, we could estimate:

- consultation affordability
- procedure affordability
- patient cost burden by specialty
- provider price competitiveness

### Real Competitive Density

If we had live provider, appointment, and clinic schedule data, we could show:

- true competition intensity
- appointment access gaps
- wait-time pressure

### Better Demand Modeling

If we had finer-grained population and trend data, we could estimate:

- catchment size
- specialty-specific demand forecasts
- seasonal opportunity scores

### Facility Validation

If we had licensing, accreditation, and audit data, we could verify:

- whether a facility truly offers a claimed service
- whether claims are current
- whether the facility meets quality thresholds

### Referral Optimization

If we had routing and referral-outcome data, we could optimize:

- fastest referral destination
- best service match by urgency
- travel-aware care planning

### Investment Planning

If we had lease, rent, labor, and operating cost data, we could recommend:

- lower-cost expansion zones
- optimal site selection by business constraints

## Product Positioning

GeoGap Planner helps doctors and hospital groups identify underserved geographies for specialty expansion using trust-scored facility data and district health signals.

## Demo Story

A private internal medicine group wants to expand into a new district. They open GeoGap Planner, choose internal medicine, and immediately see areas where specialty supply is thin but district disease burden is high. Each recommendation includes nearby competitor facilities, evidence from source records, and a confidence label. The team saves the best two locations and exports a shortlist for further evaluation.
