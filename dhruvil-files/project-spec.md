# GeoGap Planner Project Spec

## 1. Product Overview

GeoGap Planner is a geospatial expansion-intelligence app for:

- individual doctors planning a new private practice location
- hospital organizations evaluating where to expand their footprint

The app helps users identify underserved areas for a chosen specialty or multi-specialty profile by combining:

- facility-level supply signals
- district-level health burden signals
- pincode geography
- evidence-backed trust scoring
- a lightweight affordability lens

For maternal care, the affordability lens also uses delivery-cost modeling based on district-level out-of-pocket expenditure per delivery in public facilities.

This is not a live vacancy or appointment-availability product. It infers expansion opportunity from the data we have.

## 2. Data Available Today

We can build the app using these existing tables:

### `facilities`
Use this as the main supply dataset.

Available signals:

- facility name and identity
- facility type
- operator type
- address fields
- latitude / longitude
- specialties
- procedures
- equipment
- capabilities
- description text
- phone, email, website, source URLs
- numberDoctors
- capacity
- yearEstablished
- social / web presence indicators

### `india_post_pincode_directory`
Use this for pincode and geography normalization.

Available signals:

- pincode
- office name
- district
- state
- postal circle / region / division
- approximate latitude / longitude

### `nfhs_5_district_health_indicators`
Use this as the demand / burden dataset.

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

## 3. MVP Goals

The MVP should answer:

- Where is a specialty under-served?
- Which facilities currently exist nearby?
- How strong is the evidence that a facility actually offers the selected specialty?
- Which areas should a doctor or hospital group investigate first?
- Which candidate areas appear more affordable for the local patient base?
- For maternal care, what does delivery affordability look like in this district?

## 4. MVP Features We Can Build Now

### A. Specialty Gap Map

Show a map with regions ranked by apparent supply gap for the selected specialty or specialty bundle.

What it uses:

- facility coordinates
- specialty / procedure / capability text
- pincode geography
- district health indicators

### B. Specialty and Multi-Specialty Search

Let users search by:

- one specialty
- multiple specialties
- multi-specialty facilities
- facility type
- operator type

### C. Evidence-Backed Facility Shortlist

For each candidate facility, show:

- why it matched the specialty
- relevant supporting text
- contact information
- location
- trust label

Trust labels should be based on evidence strength, such as:

- strong evidence
- partial evidence
- weak evidence
- no clear evidence

### D. Opportunity Ranking

Rank candidate locations using:

- low nearby specialty supply
- higher district burden
- stronger data confidence
- reasonable geographic clustering

### E. Affordability Lens

Show a coarse affordability signal for a location or facility using the data we already have.

What it can use:

- facility type
- operator type
- public vs private split
- district health insurance coverage
- claims such as cashless or Mediclaim in the text
- service category, such as maternity or diagnostics

Suggested labels:

- likely lower cost
- mixed cost profile
- likely premium

This should be presented as a directional planning signal, not a price quote or treatment-cost engine.

### F. Maternal Care Affordability

When the user selects maternal care or maternity-related specialties, show a modeled delivery-cost view using:

- `average_out_of_pocket_expenditure_per_delivery_in_a_public_fac`
- district health insurance coverage
- public vs private provider mix
- maternal health burden indicators

This view should help the user:

- understand how much childbirth care may cost patients in a district
- compare public-facility delivery affordability across regions
- prefer lower-cost or better-covered service areas when planning maternal care expansion
- communicate how the practice can serve patients better on cost and access
### G. Facility Detail View

For any facility, show:

- map pin
- specialty tags
- claims found in the text
- contact info
- source URLs
- trust summary

### H. Shortlist and Notes

Allow users to save candidate locations and add notes such as:

- “good for internal medicine”
- “needs more competitors checked”
- “strong demand, weak supply”
- “affordability looks favorable”

### I. Data Quality Flags

Surface suspicious or low-confidence records:

- missing coordinates
- conflicting or noisy specialty values
- odd facility type values
- incomplete contact fields
- weak or unsupported claims

### J. District Demand Lens

Show district-level health context to support expansion decisions, for example:

- diabetes burden
- hypertension burden
- maternal health indicators
- anemia burden
- child health burden

### K. Affordability Context

Show affordability-related context at the district or facility level, for example:

- public vs private provider mix
- health insurance coverage in the district
- high-level cost signals in the text
- maternity-related out-of-pocket proxy fields where available

## 5. Recommended MVP User Workflow

1. User selects a specialty or specialty bundle.
2. User chooses a geography such as state, district, city, or pincode.
3. App identifies relevant facilities in or near that geography.
4. App scores the facilities by evidence strength.
5. App overlays district-level health burden signals.
6. App ranks candidate expansion zones.
7. User saves promising locations to a shortlist.

## 6. Data We Should Normalize Before Building

These are important cleanup steps for reliable results:

- normalize specialties into a controlled specialty taxonomy
- normalize facility types
- normalize state and district names
- parse and clean location strings
- ignore or flag suspicious coordinates
- deduplicate repeated websites, phones, and source URLs
- treat description / capability / procedure as evidence claims, not truth

## 7. Non-Goals for the MVP

We should not claim the app can do these things yet:

- live doctor vacancy lookup
- appointment availability
- staffing availability
- real-time patient wait times
- exact treatment pricing
- insurer contract pricing
- exact revenue potential
- licensing verification
- accreditation validation
- exact catchment population modeling

## 8. What We Could Add With More Data

This section should remain in the project doc as future scope only.

### A. Market Sizing and Revenue Modeling

If we had:

- population by pincode or ward
- household income proxies
- payer mix / insurance mix
- patient flow data
- utilization data

We could estimate:

- addressable market
- specialty revenue potential
- break-even potential
- expansion priority by commercial viability

### Treatment Affordability

If we had fee schedules, procedure prices, reimbursement rates, and patient out-of-pocket data, we could estimate:

- consultation affordability
- procedure affordability
- patient cost burden by specialty
- provider price competitiveness

### B. Real Competitive Density

If we had:

- live doctor directory data
- appointment availability
- clinic schedules
- patient review / volume signals

We could show:

- true competition intensity
- appointment-access gaps
- wait-time pressure
- near-real-time service availability

### C. Better Demand Modeling

If we had:

- sub-district population counts
- age-band population breakdowns
- migration patterns
- seasonal disease trends
- insurance claims data

We could create:

- more precise catchment estimates
- specialty-specific demand forecasts
- seasonal opportunity scoring

### D. Better Facility Validation

If we had:

- licensing registry data
- accreditation data
- medical council registrations
- hospital bed registry
- audit or inspection data

We could verify:

- whether a facility truly offers a claimed service
- whether claims are current
- whether facilities meet quality thresholds

### E. Referral and Care Navigation

If we had:

- patient referral outcomes
- travel time / routing data
- ambulance routing
- service acceptance data

We could optimize:

- fastest referral destination
- best service match by urgency
- travel-aware care planning

### F. Investment Planning

If we had:

- lease / property data
- local rent data
- labor market data
- operating expense benchmarks

We could recommend:

- lower-cost expansion zones
- optimal site selection by business constraints

## 9. Product Positioning Statement

GeoGap Planner helps doctors and hospital groups identify underserved geographies for specialty expansion using trust-scored facility data and district health signals.

## 10. Suggested Demo Story

“A private internal medicine group wants to expand into a new district. They open GeoGap Planner, choose internal medicine, and immediately see areas where specialty supply is thin but district disease burden is high. Each recommendation includes nearby competing facilities, evidence from the source records, and a confidence label. The team saves the best two locations and exports a shortlist for further evaluation.”
