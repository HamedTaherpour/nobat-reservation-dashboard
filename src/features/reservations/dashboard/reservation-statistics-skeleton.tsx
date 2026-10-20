import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RESERVATION_STATISTICS } from "./reservation-dashboard.constants";

export function ReservationStatisticsSkeleton() {
  return (
    <section aria-labelledby="reservation-statistics-title" aria-busy="true">
      <div className="mb-4 flex flex-col gap-1">
        <h2 id="reservation-statistics-title" className="text-lg font-semibold tracking-tight">
          نمای کلی رزروها
        </h2>
        <p className="text-sm text-muted-foreground">در حال دریافت آمار رزروها</p>
      </div>
      <Card
        data-testid="reservation-statistics-mobile-grid"
        className="grid grid-cols-2 gap-0 overflow-hidden p-0 sm:hidden"
      >
        {RESERVATION_STATISTICS.map((statistic, index) => (
          <div
            key={statistic.key}
            className={[
              index < 2 ? "border-b" : "",
              index % 2 === 1 ? "border-s" : "",
              "min-w-0 border-border p-3",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        ))}
      </Card>
      <div
        data-testid="reservation-statistics-desktop-grid"
        className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4"
      >
        {RESERVATION_STATISTICS.map((statistic) => (
          <Card key={statistic.key} className="min-w-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-14" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
