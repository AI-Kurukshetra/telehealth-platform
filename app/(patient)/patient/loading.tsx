import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PatientLoading() {
  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>Loading patient workspace</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Fetching appointments, messages, and records.
      </CardContent>
    </Card>
  );
}
