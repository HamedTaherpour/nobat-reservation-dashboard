"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createReservation,
  loadReservations,
  persistReservations,
  updateReservationStatus,
} from "../persistence/reservation.persistence";
import type {
  ReservationOperationResult,
  ReservationStorage,
  ReservationStorageError,
} from "../persistence/reservation.persistence.types";
import type { Reservation, ReservationInput, ReservationStatus } from "../domain/reservation.types";
import type { UseReservationsOptions, UseReservationsResult } from "./use-reservations.types";

function getBrowserStorage(): ReservationStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useReservations(options: UseReservationsOptions = {}): UseReservationsResult {
  const { storage: configuredStorage } = options;
  const reservationsRef = useRef<Reservation[]>([]);
  const initializedRef = useRef(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<ReservationStorageError>();

  useEffect(() => {
    // Server rendering always returns the empty loading state; browser storage is read only after mount.
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storage = configuredStorage === undefined ? getBrowserStorage() : configuredStorage;
    const loaded = loadReservations(storage);
    let error = loaded.error;

    if (loaded.source !== "storage" || loaded.requiresPersistence) {
      const persistenceError = persistReservations(storage, loaded.reservations);
      if (persistenceError) error = persistenceError;
    }

    reservationsRef.current = loaded.reservations;
    setReservations(loaded.reservations);
    setInitializationError(error);
    setIsLoading(false);
  }, [configuredStorage]);

  const getReservationById = useCallback(
    (id: string) => reservationsRef.current.find((reservation) => reservation.id === id),
    [],
  );

  const create = useCallback(
    (input: ReservationInput): ReservationOperationResult => {
      if (isLoading) return { ok: false, reason: "NOT_READY" };

      const result = createReservation(input);
      if (!result.ok) return result;

      const nextReservations = [...reservationsRef.current, result.reservation];
      const persistenceError = persistReservations(
        configuredStorage === undefined ? getBrowserStorage() : configuredStorage,
        nextReservations,
      );
      if (persistenceError) {
        return {
          ok: false,
          reason: persistenceError === "STORAGE_UNAVAILABLE" ? persistenceError : "STORAGE_WRITE",
        };
      }

      reservationsRef.current = nextReservations;
      setReservations(nextReservations);
      return result;
    },
    [configuredStorage, isLoading],
  );

  const updateStatus = useCallback(
    (id: string, status: ReservationStatus): ReservationOperationResult => {
      if (isLoading) return { ok: false, reason: "NOT_READY" };

      const result = updateReservationStatus(reservationsRef.current, id, status);
      if (!result.ok) return result;

      const nextReservations = reservationsRef.current.map((reservation) =>
        reservation.id === id ? result.reservation : reservation,
      );
      const persistenceError = persistReservations(
        configuredStorage === undefined ? getBrowserStorage() : configuredStorage,
        nextReservations,
      );
      if (persistenceError) {
        return {
          ok: false,
          reason: persistenceError === "STORAGE_UNAVAILABLE" ? persistenceError : "STORAGE_WRITE",
        };
      }

      reservationsRef.current = nextReservations;
      setReservations(nextReservations);
      return result;
    },
    [configuredStorage, isLoading],
  );

  return {
    reservations,
    isLoading,
    ...(initializationError ? { initializationError } : {}),
    getReservationById,
    create,
    updateStatus,
  };
}
