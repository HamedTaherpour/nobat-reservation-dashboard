import React from "react";
import { Badge } from "@/components/ui/badge";
import { getReservationStatusLabel } from "../domain/reservation.utils";
import {
  RESERVATION_STATUS_BADGE_ICONS,
  RESERVATION_STATUS_BADGE_VARIANTS,
} from "./reservation-status-badge.constants";
import type { ReservationStatusBadgeProps } from "./reservation-list.types";

export function ReservationStatusBadge(props: ReservationStatusBadgeProps) {
  const { status } = props;

  const StatusIcon = RESERVATION_STATUS_BADGE_ICONS[status];

  return (
    <Badge variant={RESERVATION_STATUS_BADGE_VARIANTS[status]}>
      <StatusIcon aria-hidden="true" data-icon="inline-start" />
      {getReservationStatusLabel(status)}
    </Badge>
  );
}
