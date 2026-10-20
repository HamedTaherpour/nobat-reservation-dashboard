import React from "react";
import { formatGregorianDateAsJalali, formatTimeAsPersian } from "@/lib/date/date.utils";
import { getServiceLabel } from "../domain/reservation.utils";
import { ReservationStatusBadge } from "./reservation-status-badge";
import type { ReservationMobileCardProps } from "./reservation-list.types";

export function ReservationMobileCard(props: ReservationMobileCardProps) {
  const { reservation, onViewDetails } = props;

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-1.5 rounded-xl border border-border bg-card p-3 text-start text-sm text-card-foreground shadow-xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
      aria-label={`مشاهده جزئیات رزرو ${reservation.customerName}`}
      onClick={() => onViewDetails(reservation)}
    >
      <span className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 truncate font-medium">{reservation.customerName}</span>
        <ReservationStatusBadge status={reservation.status} />
      </span>
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="min-w-0 truncate font-medium">{getServiceLabel(reservation.service)}</span>
        <bdi dir="ltr" className="min-w-0 truncate text-xs text-muted-foreground">
          {reservation.customerPhone}
        </bdi>
      </span>
      <span className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{formatGregorianDateAsJalali(reservation.date)}</span>
        <bdi dir="ltr">{formatTimeAsPersian(reservation.time)}</bdi>
      </span>
    </button>
  );
}
