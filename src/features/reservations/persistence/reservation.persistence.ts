import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import type {
  ReservationLoadResult,
  ReservationOperationResult,
  ReservationStorage,
  ReservationStorageError,
} from "./reservation.persistence.types";
import type { Reservation, ReservationInput, ReservationStatus } from "../domain/reservation.types";
import {
  isServiceId,
  isStatusTransitionAllowed,
  validateReservation,
} from "../domain/reservation.utils";

export const RESERVATIONS_STORAGE_KEY = "nobat.reservations.v1";

function getMockReservations(): Reservation[] {
  return MOCK_RESERVATIONS.map((reservation) => ({ ...reservation }));
}

function isReservationStatus(value: unknown): value is ReservationStatus {
  return value === "PENDING" || value === "CONFIRMED" || value === "CANCELLED";
}

function normalizeStoredReservation(
  value: unknown,
): { reservation: Reservation; changed: boolean } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    !candidate.id.trim() ||
    typeof candidate.customerName !== "string" ||
    typeof candidate.customerPhone !== "string" ||
    typeof candidate.service !== "string" ||
    typeof candidate.date !== "string" ||
    typeof candidate.time !== "string" ||
    typeof candidate.createdAt !== "string" ||
    !isReservationStatus(candidate.status) ||
    (candidate.notes !== undefined && typeof candidate.notes !== "string") ||
    Number.isNaN(Date.parse(candidate.createdAt))
  ) {
    return null;
  }

  const validation = validateReservation({
    customerName: candidate.customerName,
    customerPhone: candidate.customerPhone,
    service: candidate.service,
    date: candidate.date,
    time: candidate.time,
    ...(candidate.notes === undefined ? {} : { notes: candidate.notes }),
  });

  if (
    !validation.valid ||
    validation.normalizedPhone !== candidate.customerPhone ||
    !validation.normalizedDate ||
    !validation.normalizedTime ||
    !isServiceId(candidate.service)
  ) {
    return null;
  }

  return {
    reservation: {
      id: candidate.id,
      customerName: candidate.customerName,
      customerPhone: candidate.customerPhone,
      service: candidate.service,
      date: validation.normalizedDate,
      time: validation.normalizedTime,
      status: candidate.status,
      ...(candidate.notes === undefined ? {} : { notes: candidate.notes }),
      createdAt: candidate.createdAt,
    },
    changed:
      candidate.date !== validation.normalizedDate || candidate.time !== validation.normalizedTime,
  };
}

function normalizeStoredReservationList(
  value: unknown,
): { reservations: Reservation[]; changed: boolean } | null {
  if (!Array.isArray(value)) return null;

  const normalizedReservations: { reservation: Reservation; changed: boolean }[] = [];
  for (const reservation of value) {
    const normalized = normalizeStoredReservation(reservation);
    if (!normalized) return null;
    normalizedReservations.push(normalized);
  }

  const reservations = normalizedReservations.map((result) => result.reservation);
  if (new Set(reservations.map((reservation) => reservation.id)).size !== reservations.length)
    return null;

  return {
    reservations,
    changed: normalizedReservations.some((result) => result.changed),
  };
}

export function loadReservations(storage: ReservationStorage | null): ReservationLoadResult {
  if (!storage) {
    return {
      reservations: getMockReservations(),
      source: "recovery",
      error: "STORAGE_UNAVAILABLE",
    };
  }

  let savedReservations: string | null;
  try {
    savedReservations = storage.getItem(RESERVATIONS_STORAGE_KEY);
  } catch {
    return { reservations: getMockReservations(), source: "recovery", error: "STORAGE_READ" };
  }

  if (savedReservations === null) {
    return { reservations: getMockReservations(), source: "default" };
  }

  let parsedReservations: unknown;
  try {
    parsedReservations = JSON.parse(savedReservations);
  } catch {
    return { reservations: getMockReservations(), source: "recovery", error: "STORAGE_PARSE" };
  }

  const normalized = normalizeStoredReservationList(parsedReservations);
  if (!normalized) {
    return { reservations: getMockReservations(), source: "recovery", error: "STORAGE_INVALID" };
  }

  return {
    reservations: normalized.reservations,
    source: "storage",
    ...(normalized.changed ? { requiresPersistence: true } : {}),
  };
}

export function persistReservations(
  storage: ReservationStorage | null,
  reservations: readonly Reservation[],
): ReservationStorageError | null {
  if (!storage) return "STORAGE_UNAVAILABLE";

  try {
    storage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    return null;
  } catch {
    return "STORAGE_WRITE";
  }
}

let reservationIdSequence = 0;

export function createReservation(
  input: ReservationInput,
  now = new Date(),
): ReservationOperationResult {
  const { customerName, service, notes } = input;
  const validation = validateReservation(input);
  if (
    !validation.valid ||
    !validation.normalizedPhone ||
    !validation.normalizedDate ||
    !validation.normalizedTime ||
    !isServiceId(service)
  ) {
    return { ok: false, reason: "VALIDATION", errors: validation.errors };
  }

  reservationIdSequence += 1;
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${now.getTime()}-${reservationIdSequence}`;

  return {
    ok: true,
    reservation: {
      id: `res-${randomId}`,
      customerName: customerName.trim(),
      customerPhone: validation.normalizedPhone,
      service,
      date: validation.normalizedDate,
      time: validation.normalizedTime,
      status: "PENDING",
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
      createdAt: now.toISOString(),
    },
  };
}

export function updateReservationStatus(
  reservations: readonly Reservation[],
  id: string,
  status: ReservationStatus,
): ReservationOperationResult {
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) return { ok: false, reason: "NOT_FOUND" };
  if (!isStatusTransitionAllowed(reservation.status, status)) {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }

  return { ok: true, reservation: { ...reservation, status } };
}
