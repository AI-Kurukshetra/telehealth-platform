import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  description
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="surface-panel flex h-full min-h-[11.5rem] flex-col overflow-hidden">
      <CardHeader className="relative flex-1">
        <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-primary">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <CardDescription className="text-xs uppercase tracking-[0.24em]">{title}</CardDescription>
        <CardTitle className="pr-12 text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );
}
