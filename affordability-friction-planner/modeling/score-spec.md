# Care Gap Score Spec

## Inputs

- `travelMinutes`
- `trustStrength`
- `outOfPocketRatio`
- `insuranceCoveragePct`
- `burdenScore`
- `facilityDensity`

## Component weights

- travel: 28%
- trust: 28%
- affordability: 20%
- burden: 14%
- supply: 10%

## Travel curve

- `0-15` minutes = low friction
- `16-30` minutes = noticeable friction
- `31-60` minutes = high friction
- `61-90` minutes = severe friction
- `90+` minutes = extreme friction

## Bands

- `0-34` = low
- `35-59` = moderate
- `60-79` = high
- `80-100` = critical

## Intended use

Use the score to:

- rank areas
- explain why an area is a hidden gap
- compare tradeoffs between trust, travel, and affordability
- surface candidate areas for NGO intervention
