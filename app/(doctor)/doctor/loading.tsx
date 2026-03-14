import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorLoading() {
  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>Loading doctor workspace</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Preparing your queue, conversations, and patient records.
      </CardContent>
    </Card>
  );
}
