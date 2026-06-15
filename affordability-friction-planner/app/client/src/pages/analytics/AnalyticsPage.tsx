import { Badge, Card, CardContent, CardHeader, CardTitle, useAnalyticsQuery } from '@databricks/appkit-ui/react';
import { useMemo } from 'react';
import { bandLabel } from '../../lib/careGap';
import {
  buildLiveCareGapScenarios,
  buildLiveSnapshotSummary,
  toRow,
  type UnknownRow,
} from '../../lib/databricksData';

function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function AnalyticsPage() {
  const queryParams = useMemo(() => ({}), []);

  const facilitiesQuery = useAnalyticsQuery('facilities_snapshot', queryParams);
  const districtQuery = useAnalyticsQuery('district_health_snapshot', queryParams);
  const pincodeQuery = useAnalyticsQuery('pincode_snapshot', queryParams);

  const facilities = useMemo(
    () => (facilitiesQuery.data ?? []).map(toRow).filter((row): row is UnknownRow => Boolean(row)),
    [facilitiesQuery.data],
  );
  const districts = useMemo(
    () => (districtQuery.data ?? []).map(toRow).filter((row): row is UnknownRow => Boolean(row)),
    [districtQuery.data],
  );
  const pincodes = useMemo(
    () => (pincodeQuery.data ?? []).map(toRow).filter((row): row is UnknownRow => Boolean(row)),
    [pincodeQuery.data],
  );

  const scenarios = useMemo(
    () => buildLiveCareGapScenarios({ facilities, districts, pincodes }),
    [facilities, districts, pincodes],
  );
  const summary = useMemo(
    () => buildLiveSnapshotSummary({ facilities, districts, pincodes, scenarios }),
    [districts, facilities, pincodes, scenarios],
  );

  const highest = scenarios[0];
  const hasLiveRows = facilities.length + districts.length + pincodes.length > 0;
  const queryError = facilitiesQuery.error ?? districtQuery.error ?? pincodeQuery.error;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <Badge className="w-fit border-rose-200 bg-rose-50 text-rose-700" variant="outline">
            Live analytics
          </Badge>
          <CardTitle className="text-2xl tracking-tight">Care gap scoring</CardTitle>
          <p className="text-sm text-muted-foreground">
            This page is now wired to actual warehouse snapshots from the facility, district, and pincode tables.
          </p>
        </CardHeader>
      </Card>

      {queryError ? (
        <Card className="border-rose-200 bg-rose-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-rose-900">Query error</CardTitle>
            <p className="text-sm text-rose-700">{queryError}</p>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current highest gap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highest ? (
              <>
                <div className="text-xl font-semibold">{highest.districtName}</div>
                <div className="text-sm text-muted-foreground">{highest.specialty}</div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {bandLabel(highest.band)} gap
                </Badge>
                <div className="grid grid-cols-2 gap-2">
                  <ScoreRow label="Score" value={String(highest.total)} />
                  <ScoreRow label="Travel" value={`${highest.travelMinutes} min`} />
                  <ScoreRow label="Trust" value={highest.trustStrength} />
                  <ScoreRow label="Rows" value={`${highest.sourceCount}`} />
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No live ranking rows yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Snapshot coverage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <ScoreRow label="Facilities" value={String(summary.facilityCount)} />
            <ScoreRow label="Maternal facilities" value={String(summary.maternalFacilityCount)} />
            <ScoreRow label="Districts" value={String(summary.districtCount)} />
            <ScoreRow label="Pincodes" value={String(summary.pincodeCount)} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Top live rows</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {scenarios.length > 0 ? (
            scenarios.slice(0, 3).map((scenario) => (
              <div key={scenario.districtName} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{scenario.districtName}</div>
                    <div className="text-sm text-muted-foreground">{scenario.specialty}</div>
                  </div>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    {bandLabel(scenario.band)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <ScoreRow label="Score" value={String(scenario.total)} />
                  <ScoreRow label="Why" value={scenario.summary} />
                </div>
                <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Example facility: {scenario.exampleFacility}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground md:col-span-3">
              {hasLiveRows
                ? 'Warehouse rows are present, but no maternal signals were strong enough to score yet.'
                : 'No live rows loaded yet.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
