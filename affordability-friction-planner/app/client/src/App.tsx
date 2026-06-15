import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  useAnalyticsQuery,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@databricks/appkit-ui/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { MapPinned, ShieldAlert, WalletCards, Waves } from 'lucide-react';
import { bandLabel, sampleScenarios } from './lib/careGap';
import {
  buildLiveCareGapScenarios,
  buildLiveSnapshotSummary,
  type LiveCareGapScenario,
  isMaternalRecord,
  pickString,
  pickStringList,
  toRow,
  type UnknownRow,
} from './lib/databricksData';

function Metric({
  icon,
  title,
  value,
  note,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </div>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{note}</CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-slate-200/70 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-50">{value}</div>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function RowPreview({ row, label }: { row: UnknownRow; label: string }) {
  const name = pickString(row, ['facility_name', 'name', 'hospital_name', 'provider_name']);
  const district = pickString(row, ['district', 'district_name', 'city', 'state']);
  const text = pickString(row, ['description', 'capabilities', 'capability', 'procedure', 'procedures']);
  const sources = pickStringList(row, ['source_urls', 'source_url', 'website']);
  const maternal = isMaternalRecord(row);

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-foreground">{name || label}</div>
          <div className="text-sm text-muted-foreground">{district || 'No district field found'}</div>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
          {maternal ? 'Maternal signal' : 'General record'}
        </Badge>
      </div>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <div>{text || 'No evidence text found in the first snapshot row.'}</div>
        {sources.length > 0 ? <div>{sources.slice(0, 2).join(' • ')}</div> : null}
      </div>
    </div>
  );
}

function isLiveScenario(
  scenario: (typeof sampleScenarios)[number] | LiveCareGapScenario,
): scenario is LiveCareGapScenario {
  return 'sourceCount' in scenario;
}

export default function App() {
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

  const liveScenarios = useMemo(
    () => buildLiveCareGapScenarios({ facilities, districts, pincodes }),
    [facilities, districts, pincodes],
  );
  const liveSummary = useMemo(
    () =>
      buildLiveSnapshotSummary({
        facilities,
        districts,
        pincodes,
        scenarios: liveScenarios,
      }),
    [districts, facilities, liveScenarios, pincodes],
  );

  const hasLiveRows = facilities.length + districts.length + pincodes.length > 0;
  const activeScenarios = liveScenarios.length > 0 ? liveScenarios.slice(0, 3) : hasLiveRows ? [] : sampleScenarios;
  const isLive = hasLiveRows;
  const queryError = facilitiesQuery.error ?? districtQuery.error ?? pincodeQuery.error;
  const queryLoading = facilitiesQuery.loading || districtQuery.loading || pincodeQuery.loading;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(242,247,245,0.96),rgba(255,255,255,1))] text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <header className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                  <MapPinned className="h-3.5 w-3.5" />
                  Live Databricks data
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  Care friction
                </Badge>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  {queryLoading ? 'Live query loading' : 'Live query ready'}
                </Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-4xl tracking-tight">Affordability Friction Planner</CardTitle>
                <CardDescription className="max-w-3xl text-base">
                  A Databricks App for finding where care looks nearby on a map but is still too far, too
                  fragile, or too expensive to count as real access.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <MapPinned className="h-4 w-4 text-emerald-600" />
                Travel time to trusted care
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <WalletCards className="h-4 w-4 text-rose-600" />
                Affordability pressure
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Evidence strength
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-slate-950 text-slate-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-50">Live snapshot</CardTitle>
              <CardDescription className="text-slate-300">
                Snapshot counts and live ranking are read from Databricks warehouse tables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p>{queryLoading ? 'Loading live tables...' : 'The app is reading real Databricks records.'}</p>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Facilities" value={String(liveSummary.facilityCount)} />
                <MiniStat label="Maternal rows" value={String(liveSummary.maternalFacilityCount)} />
                <MiniStat label="District rows" value={String(liveSummary.districtCount)} />
                <MiniStat label="Pincodes" value={String(liveSummary.pincodeCount)} />
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric
            icon={<ShieldAlert className="h-4 w-4" />}
            title="Live gap zones"
            value={String(liveSummary.liveCoverageCount || activeScenarios.length)}
            note="Ranked from actual Databricks rows, not static sample districts"
          />
          <Metric
            icon={<WalletCards className="h-4 w-4" />}
            title="Average score"
            value={liveSummary.averageScore ? String(liveSummary.averageScore) : 'TBD'}
            note="Care gap score across the current live ranking set"
          />
          <Metric
            icon={<Waves className="h-4 w-4" />}
            title="Evidence signal"
            value={isLive ? liveScenarios[0]?.trustStrength ?? 'review' : 'TBD'}
            note="Derived from text, procedures, capabilities, and source URLs"
          />
          <Metric
            icon={<MapPinned className="h-4 w-4" />}
            title="Trusted facilities"
            value={String(Math.max(0, liveSummary.maternalFacilityCount || liveSummary.facilityCount))}
            note="Rows with a maternal signal in the current snapshot"
          />
        </section>

        {queryError ? (
          <Card className="border-rose-200 bg-rose-50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-rose-900">Live query error</CardTitle>
              <CardDescription className="text-rose-700">
                {queryError}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Scope" description="One clear question for the hackathon demo.">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Where are the real gaps after travel time, affordability, and evidence are all considered?</li>
                <li>Which facilities look present but do not have strong evidence behind them?</li>
                <li>Which districts become the highest-priority NGO intervention zones?</li>
              </ul>
            </SectionCard>

            <SectionCard title="Initial user flow" description="A short flow that is easy to demo in under three minutes.">
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Select a care type and geography.</li>
                <li>See the highest-friction districts or pincode clusters.</li>
                <li>Inspect travel time, evidence strength, and affordability pressure.</li>
                <li>Save promising areas to a shortlist with notes.</li>
              </ol>
            </SectionCard>
          </TabsContent>

          <TabsContent value="model" className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Scoring logic" description="Keep the model interpretable and easy to defend.">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Facility evidence score from text claims and source URLs.</li>
                <li>Travel-time proxy to the nearest trusted facility.</li>
                <li>Affordability pressure from cost and insurance signals.</li>
                <li>Optional geospatial friction from climate or terrain data.</li>
              </ul>
            </SectionCard>

            <SectionCard
              title="Live highest gaps"
              description={isLive ? 'These are computed from the warehouse snapshots now.' : 'Live data is not available yet, so the demo fallback is shown.'}
            >
              {activeScenarios.length > 0 ? (
                <div className="space-y-3">
                  {activeScenarios.map((scenario) => (
                    <div key={scenario.districtName} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-foreground">{scenario.districtName}</div>
                          <div className="text-sm text-muted-foreground">{scenario.specialty}</div>
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          {bandLabel(scenario.band)} gap
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <MiniScore label="Score" value={String(scenario.total)} />
                        <MiniScore label="Travel" value={`${scenario.travelMinutes} min`} />
                        <MiniScore label="Trust" value={scenario.trustStrength} />
                        <MiniScore label="Why" value={scenario.summary} />
                      </div>
                      {isLiveScenario(scenario) ? (
                        <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                          {scenario.sourceCount} live rows, example {scenario.exampleFacility}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Live rows are loaded, but this snapshot does not expose enough maternal signals to rank
                  districts yet.
                </div>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="data" className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Databricks tables" description="The app is reading the actual source tables.">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Facility claims and location fields</li>
                <li>District health burden indicators</li>
                <li>Pincode and district geography</li>
              </ul>
            </SectionCard>

            <SectionCard title="External data" description="Optional enrichments.">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>OpenStreetMap road network</li>
                <li>OSRM travel-time matrix</li>
                <li>Earth Engine geospatial layers</li>
              </ul>
            </SectionCard>

            <SectionCard title="Persistence" description="Why Lakebase matters.">
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Shortlisted districts</li>
                <li>Planner notes and overrides</li>
                <li>Review decisions on weak evidence</li>
              </ul>
            </SectionCard>

            <SectionCard title="Facility snapshot" description="First live rows from the facilities table.">
              <div className="space-y-3">
                {facilities.slice(0, 3).map((row, index) => (
                  <RowPreview key={`${index}-${pickString(row, ['facility_name', 'name', 'hospital_name']) || index}`} row={row} label={`Facility ${index + 1}`} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="District snapshot" description="First live rows from the district indicators table.">
              <div className="space-y-3">
                {districts.slice(0, 3).map((row, index) => (
                  <RowPreview key={`${index}-${pickString(row, ['district', 'district_name', 'state']) || index}`} row={row} label={`District ${index + 1}`} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Pincode snapshot" description="First live rows from the pincode directory table.">
              <div className="space-y-3">
                {pincodes.slice(0, 3).map((row, index) => (
                  <RowPreview key={`${index}-${pickString(row, ['pincode', 'postcode', 'district']) || index}`} row={row} label={`Pincode ${index + 1}`} />
                ))}
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
