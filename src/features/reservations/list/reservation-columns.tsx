import React from "react";
import { EyeIcon } from "lucide-react";
import type { AppTableColumn } from "@/components/shared/app-table";
import { AppTooltip } from "@/components/shared/app-tooltip";
import { Button } from "@/components/ui/button";
import { getServiceLabel } from "../domain/reservation.utils";
import type { Reservation } from "../domain/reservation.types";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { ReservationDateTime } from "./reservation-date-time";

export function getReservationColumns(
  onViewDetails: (reservation: Reservation) => void,
): readonly AppTableColumn<Reservation>[] {
  return [
    {
      id: "customer",
      header: "مشتری",
      cell: (reservation) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{reservation.customerName}</span>
          <bdi dir="ltr" className="text-sm text-muted-foreground">
            {reservation.customerPhone}
          </bdi>
        </div>
      ),
    },
    {
      id: "service",
      header: "خدمت",
      cell: (reservation) => getServiceLabel(reservation.service),
    },
    {
      id: "date-time",
      header: "تاریخ و ساعت",
      cell: (reservation) => (
        <ReservationDateTime date={reservation.date} time={reservation.time} />
      ),
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (reservation) => <ReservationStatusBadge status={reservation.status} />,
    },
    {
      id: "actions",
      header: "عملیات",
      cell: (reservation) => (
        <AppTooltip content="مشاهده جزئیات">
          <Button
            aria-label="مشاهده جزئیات"
            variant="outline"
            size="icon"
            onClick={() => onViewDetails(reservation)}
          >
            <EyeIcon aria-hidden="true" />
          </Button>
        </AppTooltip>
      ),
    },
  ];
}
