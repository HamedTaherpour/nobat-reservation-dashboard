import { CircleCheckIcon, CircleXIcon, Clock3Icon } from "lucide-react";
import type { ReservationStatus } from "../domain/reservation.types";

export const RESERVATION_STATUS_BADGE_VARIANTS = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
} as const satisfies Record<ReservationStatus, "secondary" | "default" | "destructive">;

export const RESERVATION_STATUS_BADGE_ICONS = {
  PENDING: Clock3Icon,
  CONFIRMED: CircleCheckIcon,
  CANCELLED: CircleXIcon,
} as const satisfies Record<ReservationStatus, typeof Clock3Icon>;
