import { Badge, Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';
import { bandLabel, sampleScenarios } from '../../lib/careGap';

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
  const highest = [...sampleScenarios].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6">
      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <Badge className="w-fit border-rose-200 bg-rose-50 text-rose-700" variant="outline">
            Model monitor
          </Badge>
          <CardTitle className="text-2xl tracking-tight">Care gap scoring</CardTitle>
          <p className="text-sm text-muted-foreground">
            This page will later point at warehouse-backed ranking queries. For now it shows the scoring
            logic and the first scenario outputs.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current highest gap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highest && (
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
                  <ScoreRow label="Burden" value={String(highest.burdenScore)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Scoring ingredients</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <ScoreRow label="Travel time" value="Penalty rises past 30, 60, and 90 minutes" />
            <ScoreRow label="Evidence strength" value="Strong, partial, weak, or none" />
            <ScoreRow label="Affordability" value="Out-of-pocket cost plus insurance relief" />
            <ScoreRow label="Supply" value="Facility density and nearby trusted options" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">First scenario set</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {sampleScenarios.map((scenario) => (
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
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
