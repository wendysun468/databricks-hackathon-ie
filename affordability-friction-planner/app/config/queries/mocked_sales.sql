{{if .plugins.analytics -}}
-- @param max_rank INT
WITH mock_data AS (
  SELECT 'Purnia' AS district_name, 1 AS rank, 91 AS care_gap_score, 'critical' AS band
  UNION ALL SELECT 'Rural referral belt', 2, 88, 'critical'
  UNION ALL SELECT 'Kolkata fringe', 3, 44, 'moderate'
  UNION ALL SELECT 'Coastal access zone', 4, 32, 'low'
)
SELECT *
FROM mock_data
WHERE rank <= :max_rank
ORDER BY rank;
{{- end}}
