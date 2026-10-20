import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReservationStatisticCardProps } from "./reservation-dashboard.types";

export function ReservationStatisticCard(props: ReservationStatisticCardProps) {
  const { statistic, value, compact = false } = props;

  const Icon = statistic.icon;

  if (compact) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <p className="truncate text-xs font-medium text-muted-foreground">{statistic.label}</p>
        </div>
        <p className="text-xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        <p className="sr-only">{statistic.description}</p>
      </div>
    );
  }

  return (
    <Card className="min-w-0 shadow-sm">
      <CardHeader>
        <CardTitle>{statistic.label}</CardTitle>
        <CardDescription>{statistic.description}</CardDescription>
        <CardAction aria-hidden="true" className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon className="size-5" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
