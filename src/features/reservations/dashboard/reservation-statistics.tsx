import React from "react";
import { Card } from "@/components/ui/card";
import { ReservationStatisticCard } from "./reservation-stat-card";
import { RESERVATION_STATISTICS } from "./reservation-dashboard.constants";
import type { ReservationStatisticsProps } from "./reservation-dashboard.types";

export function ReservationStatistics(props: ReservationStatisticsProps) {
  const { metrics } = props;

  return (
    <section aria-labelledby="reservation-statistics-title">
      <div className="mb-4 flex flex-col gap-1">
        <h2 id="reservation-statistics-title" className="text-lg font-semibold tracking-tight">
          نمای کلی رزروها
        </h2>
        <p className="text-sm text-muted-foreground">وضعیت رزروهای کسب‌وکار شما در یک نگاه</p>
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
              "min-w-0 border-border",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <ReservationStatisticCard
              statistic={statistic}
              value={metrics[statistic.key]}
              compact
            />
          </div>
        ))}
      </Card>
      <div
        data-testid="reservation-statistics-desktop-grid"
        className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4"
      >
        {RESERVATION_STATISTICS.map((statistic) => (
          <ReservationStatisticCard
            key={statistic.key}
            statistic={statistic}
            value={metrics[statistic.key]}
          />
        ))}
      </div>
    </section>
  );
}
