import { Badge, Card, CardContent, CardHeader, CardTitle } from '@databricks/appkit-ui/react';

const schemaRows = [
  ['shortlist_items', 'district_name, specialty, score, band, note, created_at'],
  ['planner_notes', 'target_type, target_name, note, author, created_at'],
  ['review_decisions', 'facility_id, evidence_status, override_reason, created_at'],
];

export function LakebasePage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader className="space-y-2">
          <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">
            Lakebase plan
          </Badge>
          <CardTitle className="text-2xl tracking-tight">Persistent shortlist and notes</CardTitle>
          <p className="text-sm text-muted-foreground">
            This surface will store what the planner saves while reviewing districts and facilities.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {schemaRows.map(([table, columns]) => (
          <Card key={table} className="border-slate-200/70 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{table}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{columns}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/70 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">What should be persisted</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <InfoPill title="Shortlists" text="Save promising districts with a score and band." />
          <InfoPill title="Notes" text="Attach a planner note to a district or facility." />
          <InfoPill title="Overrides" text="Record when evidence should be downgraded or upgraded." />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="font-medium text-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
