import type { Reservation, ReservationInput, ReservationStatus } from "../domain/reservation.types";
import type {
  ReservationOperationResult,
  ReservationStorage,
  ReservationStorageError,
} from "../persistence/reservation.persistence.types";

export type UseReservationsOptions = {
  storage?: ReservationStorage | null;
};

export type UseReservationsResult = {
  reservations: readonly Reservation[];
  isLoading: boolean;
  initializationError?: ReservationStorageError;
  getReservationById: (id: string) => Reservation | undefined;
  create: (input: ReservationInput) => ReservationOperationResult;
  updateStatus: (id: string, status: ReservationStatus) => ReservationOperationResult;
};
