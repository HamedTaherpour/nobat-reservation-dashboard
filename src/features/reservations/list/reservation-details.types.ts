import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Reservation } from "../domain/reservation.types";

export type DetailItemProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
};

export type ReservationDetailsProps = {
  reservation: Reservation;
  children?: ReactNode;
};
