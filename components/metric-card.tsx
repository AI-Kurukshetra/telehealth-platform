import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  description,
  href
}: {
  title: string;
  value: string;
  description: string;
  href?: string;
}) {
  const card = (
    <Card className="surface-panel ai-highlight flex h-full min-h-[11.5rem] flex-col overflow-hidden">
      <CardHeader className="relative flex-1">
        <div className="mb-5 flex items-start justify-between gap-4">
          <CardDescription className="pt-1 text-xs uppercase tracking-[0.24em]">
            {title}
          </CardDescription>
          <div className="pulse-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${title}: open ${title.toLowerCase()}`}
      >
        {card}
      </Link>
    );
  }

  return card;
}
