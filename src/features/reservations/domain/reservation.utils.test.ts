import { describe, expect, it } from "vitest";
import { MOCK_RESERVATIONS } from "./reservation.mock";
import {
  compareReservationsByCreatedAt,
  compareReservationsByDateTime,
  filterReservationsByStatus,
  getAvailableNextStatuses,
  getReservationMetrics,
  isStatusTransitionAllowed,
  isValidGregorianDate,
  isValidIranianPhone,
  normalize24HourTime,
  normalizeGregorianDate,
  normalizeIranianPhone,
  searchReservationsByCustomerName,
  validateReservation,
} from "./reservation.utils";

const validInput = {
  customerName: MOCK_RESERVATIONS[0].customerName,
  customerPhone: MOCK_RESERVATIONS[0].customerPhone,
  service: MOCK_RESERVATIONS[0].service,
  date: MOCK_RESERVATIONS[0].date,
  time: MOCK_RESERVATIONS[0].time,
};

describe("reservation domain utilities", () => {
  it("normalizes valid Iranian phone formats and Persian digits", () => {
    expect(normalizeIranianPhone("+98 912 123 4567")).toBe("09121234567");
    expect(normalizeIranianPhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
    expect(isValidIranianPhone("09121234567")).toBe(true);
    expect(isValidIranianPhone("0912123456")).toBe(false);
    expect(isValidIranianPhone("+9891212345678")).toBe(false);
  });

  it("validates required fields and calendar/time values", () => {
    const result = validateReservation({
      ...validInput,
      customerName: "  ",
      date: "2026-02-30",
      time: "24:00",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.customerName).toBeDefined();
    expect(result.errors.date).toBeDefined();
    expect(result.errors.time).toBeDefined();
    expect(isValidGregorianDate("2024-02-29")).toBe(true);
    expect(isValidGregorianDate("2025-02-29")).toBe(false);
  });

  it("normalizes Persian and Arabic-Indic Gregorian dates and times to canonical Latin values", () => {
    expect(normalizeGregorianDate("۲۰۲۶-۱۰-۱۷")).toBe("2026-10-17");
    expect(normalizeGregorianDate("٢٠٢٦-١٠-١٧")).toBe("2026-10-17");
    expect(normalize24HourTime("۱۴:۳۰")).toBe("14:30");
    expect(normalize24HourTime("١٤:٣٠")).toBe("14:30");

    const invalid = validateReservation({
      ...validInput,
      date: "۲۰۲۶-۰۲-۳۰",
      time: "۲۴:۰۰",
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.date).toBeDefined();
    expect(invalid.errors.time).toBeDefined();
  });

  it("enforces status transitions", () => {
    expect(isStatusTransitionAllowed("PENDING", "CONFIRMED")).toBe(true);
    expect(isStatusTransitionAllowed("CONFIRMED", "PENDING")).toBe(false);
    expect(isStatusTransitionAllowed("CANCELLED", "CONFIRMED")).toBe(false);
    expect(getAvailableNextStatuses("CANCELLED")).toEqual([]);
  });

  it("filters and searches reservations", () => {
    expect(filterReservationsByStatus(MOCK_RESERVATIONS, "CONFIRMED")).toHaveLength(5);
    expect(searchReservationsByCustomerName(MOCK_RESERVATIONS, "مریم")[0].id).toBe("res-002");
    expect(searchReservationsByCustomerName(MOCK_RESERVATIONS, "۹۱۲۱۲۳۴۵۶۷")[0].id).toBe("res-001");
    expect(searchReservationsByCustomerName(MOCK_RESERVATIONS, "")).toHaveLength(12);
  });

  it("compares date/time and calculates explicit-date metrics", () => {
    const sorted = [...MOCK_RESERVATIONS].sort(compareReservationsByDateTime);
    expect(sorted[0].id).toBe("res-001");
    expect(getReservationMetrics(MOCK_RESERVATIONS, "2026-10-17")).toEqual({
      total: 12,
      today: 3,
      confirmed: 5,
      cancelled: 3,
    });
  });

  it("breaks equal scheduled date/time ties deterministically by reservation ID", () => {
    const [first, second] = MOCK_RESERVATIONS;

    expect(
      compareReservationsByDateTime(
        { ...first, id: "res-b", date: "2026-10-17", time: "09:00" },
        { ...second, id: "res-a", date: "2026-10-17", time: "09:00" },
      ),
    ).toBeGreaterThan(0);
  });

  it("orders equal creation timestamps deterministically by reservation ID", () => {
    const [first, second] = MOCK_RESERVATIONS;
    const sameCreatedAt = "2026-10-17T10:00:00.000Z";

    expect(
      compareReservationsByCreatedAt(
        { ...first, id: "res-b", createdAt: sameCreatedAt },
        { ...second, id: "res-a", createdAt: sameCreatedAt },
      ),
    ).toBeGreaterThan(0);
  });

  it("keeps deterministic mock data valid and complete", () => {
    expect(MOCK_RESERVATIONS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(MOCK_RESERVATIONS.map((reservation) => reservation.id)).size).toBe(
      MOCK_RESERVATIONS.length,
    );
    expect(new Set(MOCK_RESERVATIONS.map((reservation) => reservation.status))).toEqual(
      new Set(["PENDING", "CONFIRMED", "CANCELLED"]),
    );
    expect(
      MOCK_RESERVATIONS.every((reservation) => isValidIranianPhone(reservation.customerPhone)),
    ).toBe(true);
  });
});
