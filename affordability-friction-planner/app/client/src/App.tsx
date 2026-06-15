import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@databricks/appkit-ui/react';
import type { ReactNode } from 'react';
import { MapPinned, ShieldAlert, WalletCards, Waves } from 'lucide-react';
import { bandLabel, sampleScenarios } from './lib/careGap';

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

export default function App() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(242,247,245,0.96),rgba(255,255,255,1))] text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <header className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="overflow-hidden border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                  <MapPinned className="h-3.5 w-3.5" />
                  NGO planning tool
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  Care friction
                </Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-4xl tracking-tight">Affordability Friction Planner</CardTitle>
                <CardDescription className="max-w-3xl text-base">
                  A Databricks App scaffold for finding where care looks nearby on a map but is still too
                  far, too fragile, or too expensive to count as real access.
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
              <CardTitle className="text-lg text-slate-50">What this version will do</CardTitle>
              <CardDescription className="text-slate-300">
                The first pass focuses on maternal delivery deserts, then expands to other care gaps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p>
                The app will combine facility trust, district burden, travel time, and affordability signals
                into one gap score.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Gap type" value="Hidden access" />
                <MiniStat label="Primary user" value="NGO planner" />
                <MiniStat label="Data layers" value="3+" />
                <MiniStat label="Storage" value="Lakebase" />
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric icon={<ShieldAlert className="h-4 w-4" />} title="High-friction zones" value="TBD" note="Ranked by trust, travel, and cost" />
          <Metric icon={<WalletCards className="h-4 w-4" />} title="Affordability layer" value="TBD" note="Out-of-pocket and insurance context" />
          <Metric icon={<Waves className="h-4 w-4" />} title="Geospatial risk" value="TBD" note="Earth Engine or routing enrichment" />
          <Metric icon={<MapPinned className="h-4 w-4" />} title="Trusted facilities" value="TBD" note="Evidence-backed shortlist and notes" />
        </section>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Scope"
              description="One clean question for the hackathon demo."
            >
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Where are the real gaps after travel time, affordability, and evidence are all considered?</li>
                <li>Which facilities look present but do not have strong evidence behind them?</li>
                <li>Which districts become the highest-priority NGO intervention zones?</li>
              </ul>
            </SectionCard>

            <SectionCard
              title="Initial user flow"
              description="A short flow that is easy to demo in under three minutes."
            >
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Select a care type and geography.</li>
                <li>See the highest-friction districts or pincode clusters.</li>
                <li>Inspect travel time, evidence strength, and affordability pressure.</li>
                <li>Save promising areas to a shortlist with notes.</li>
              </ol>
            </SectionCard>
          </TabsContent>

          <TabsContent value="model" className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Scoring logic"
              description="Keep the model interpretable and easy to defend."
            >
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Facility evidence score from text claims and source URLs.</li>
                <li>Travel-time penalty to the nearest trusted facility.</li>
                <li>Affordability pressure from cost and insurance signals.</li>
                <li>Optional geospatial friction from climate or terrain data.</li>
              </ul>
            </SectionCard>

            <SectionCard
              title="Worked examples"
              description="These are the first scoring scenarios for the project."
            >
              <div className="space-y-3">
                {sampleScenarios.map((scenario) => (
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
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="data" className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="Internal data" description="Already in Databricks.">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
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
