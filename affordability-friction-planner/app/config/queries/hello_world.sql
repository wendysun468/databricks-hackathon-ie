{{if .plugins.analytics -}}
-- @param district_name STRING
SELECT
  :district_name AS district_name,
  'care gap monitor' AS panel,
  'district friction ranking' AS use_case;
{{- end}}
