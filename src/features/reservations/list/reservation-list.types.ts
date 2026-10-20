import type { Reservation, ReservationStatus } from "../domain/reservation.types";
import type { ReservationOperationResult } from "../persistence/reservation.persistence.types";

export type ReservationListNotice =
  | { kind: "recoverable"; message: string }
  | { kind: "fatal"; message: string };

export type ReservationListProps = {
  reservations: readonly Reservation[];
  isLoading: boolean;
  notice?: ReservationListNotice;
  onUpdateStatus?: (id: string, status: ReservationStatus) => ReservationOperationResult;
};

export type ReservationListStatusFilter = "ALL" | ReservationStatus;

export type ReservationListSort = "NEWEST" | "OLDEST";

export type ReservationDateTimeProps = {
  date: string;
  time: string;
};

export type ReservationMobileCardProps = {
  reservation: Reservation;
  onViewDetails: (reservation: Reservation) => void;
};

export type ReservationStatusBadgeProps = {
  status: ReservationStatus;
};

export type ReservationListViewDetailsParams = Pick<Reservation, "id">;
