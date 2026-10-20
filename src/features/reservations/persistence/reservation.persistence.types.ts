import type { Reservation, ReservationValidationErrors } from "../domain/reservation.types";

export type ReservationStorage = Pick<Storage, "getItem" | "setItem">;

export type ReservationStorageError =
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_READ"
  | "STORAGE_PARSE"
  | "STORAGE_INVALID"
  | "STORAGE_WRITE";

export type ReservationLoadResult = {
  reservations: Reservation[];
  source: "storage" | "default" | "recovery";
  error?: ReservationStorageError;
  requiresPersistence?: boolean;
};

export type ReservationOperationResult =
  | { ok: true; reservation: Reservation }
  | {
      ok: false;
      reason:
        | "NOT_READY"
        | "VALIDATION"
        | "NOT_FOUND"
        | "INVALID_TRANSITION"
        | "STORAGE_UNAVAILABLE"
        | "STORAGE_WRITE";
      errors?: ReservationValidationErrors;
    };
