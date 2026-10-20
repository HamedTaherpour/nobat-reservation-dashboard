import { act, renderHook, waitFor } from "@testing-library/react";
import React, { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import { RESERVATIONS_STORAGE_KEY } from "../persistence/reservation.persistence";
import type { ReservationStorage } from "../persistence/reservation.persistence.types";
import { useReservations } from "./use-reservations";

class MemoryStorage implements ReservationStorage {
  readonly values = new Map<string, string>();
  getItemCalls = 0;
  failWrites = false;

  getItem(key: string): string | null {
    this.getItemCalls += 1;
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error("Storage quota exceeded");
    this.values.set(key, value);
  }
}

const validInput = {
  customerName: "کاربر تازه",
  customerPhone: "۰۹۱۲۱۲۳۴۵۶۷",
  service: "HAIRCUT",
  date: "۲۰۲۶-۱۱-۰۱",
  time: "٠٩:٣٠",
};

function renderReservations(storage: ReservationStorage | null) {
  return renderHook(() => useReservations({ storage }));
}

describe("useReservations", () => {
  it("renders an empty, hydration-safe initial state on the server", () => {
    const storage = new MemoryStorage();
    function ServerProbe() {
      const { isLoading, reservations } = useReservations({ storage });
      return <output>{JSON.stringify({ isLoading, count: reservations.length })}</output>;
    }

    expect(renderToString(<ServerProbe />)).toContain("isLoading&quot;:true,&quot;count&quot;:0");
  });

  it("initializes and persists the deterministic mock reservations on first use", async () => {
    const storage = new MemoryStorage();
    const { result } = renderReservations(storage);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservations).toEqual(MOCK_RESERVATIONS);
    expect(JSON.parse(storage.values.get(RESERVATIONS_STORAGE_KEY)!)).toEqual(MOCK_RESERVATIONS);
  });

  it("uses previously saved data, including an intentionally empty array", async () => {
    const storage = new MemoryStorage();
    storage.values.set(RESERVATIONS_STORAGE_KEY, JSON.stringify([]));
    const { result } = renderReservations(storage);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservations).toEqual([]);
  });

  it("recovers malformed or invalid saved data with mock reservations", async () => {
    const malformedStorage = new MemoryStorage();
    malformedStorage.values.set(RESERVATIONS_STORAGE_KEY, "not json");
    const malformed = renderReservations(malformedStorage);
    await waitFor(() => expect(malformed.result.current.isLoading).toBe(false));
    expect(malformed.result.current.initializationError).toBe("STORAGE_PARSE");
    expect(malformed.result.current.reservations).toEqual(MOCK_RESERVATIONS);

    const invalidStorage = new MemoryStorage();
    invalidStorage.values.set(RESERVATIONS_STORAGE_KEY, JSON.stringify([{ id: "invalid" }]));
    const invalid = renderReservations(invalidStorage);
    await waitFor(() => expect(invalid.result.current.isLoading).toBe(false));
    expect(invalid.result.current.initializationError).toBe("STORAGE_INVALID");
    expect(invalid.result.current.reservations).toEqual(MOCK_RESERVATIONS);
  });

  it("exposes unavailable storage without preventing in-memory initialization", async () => {
    const { result } = renderReservations(null);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.initializationError).toBe("STORAGE_UNAVAILABLE");
    expect(result.current.reservations).toEqual(MOCK_RESERVATIONS);

    let outcome: ReturnType<typeof result.current.create>;
    act(() => {
      outcome = result.current.create(validInput);
    });
    expect(outcome!).toEqual({ ok: false, reason: "STORAGE_UNAVAILABLE" });
  });

  it("creates canonical pending reservations without a status input and persists them across remounts", async () => {
    const storage = new MemoryStorage();
    const first = renderReservations(storage);
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));

    let outcome: ReturnType<typeof first.result.current.create>;
    act(() => {
      outcome = first.result.current.create(validInput);
    });

    expect(outcome!).toMatchObject({
      ok: true,
      reservation: {
        status: "PENDING",
        customerPhone: "09121234567",
        date: "2026-11-01",
        time: "09:30",
      },
    });
    expect(first.result.current.reservations).toHaveLength(13);
    const createdId = outcome!.ok ? outcome!.reservation.id : "";
    expect(first.result.current.getReservationById(createdId)).toEqual(
      outcome!.ok ? outcome!.reservation : undefined,
    );

    first.unmount();
    const reloaded = renderReservations(storage);
    await waitFor(() => expect(reloaded.result.current.isLoading).toBe(false));
    expect(reloaded.result.current.getReservationById(createdId)).toEqual(
      outcome!.ok ? outcome!.reservation : undefined,
    );
  });

  it("normalizes legacy digit forms, preserves valid reservation fields, and rewrites storage", async () => {
    const storage = new MemoryStorage();
    const legacyReservation = {
      ...MOCK_RESERVATIONS[0],
      date: "٢٠٢٦-١٠-١٧",
      time: "٠٩:٠٠",
    };
    storage.values.set(RESERVATIONS_STORAGE_KEY, JSON.stringify([legacyReservation]));

    const { result } = renderReservations(storage);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const expectedReservation = { ...legacyReservation, date: "2026-10-17", time: "09:00" };
    expect(result.current.reservations).toEqual([expectedReservation]);
    expect(JSON.parse(storage.values.get(RESERVATIONS_STORAGE_KEY)!)).toEqual([
      expectedReservation,
    ]);
  });

  it("preserves canonicalized legacy reservations in memory when their storage rewrite fails", async () => {
    const storage = new MemoryStorage();
    const legacyReservation = {
      ...MOCK_RESERVATIONS[0],
      date: "۲۰۲۶-۱۰-۱۷",
      time: "۰۹:۰۰",
    };
    const savedLegacyValue = JSON.stringify([legacyReservation]);
    storage.values.set(RESERVATIONS_STORAGE_KEY, savedLegacyValue);
    storage.failWrites = true;

    const { result } = renderReservations(storage);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.initializationError).toBe("STORAGE_WRITE");
    expect(result.current.reservations).toEqual([
      { ...legacyReservation, date: "2026-10-17", time: "09:00" },
    ]);
    expect(storage.values.get(RESERVATIONS_STORAGE_KEY)).toBe(savedLegacyValue);
  });

  it("rejects invalid creation without persisting it and generates unique IDs", async () => {
    const storage = new MemoryStorage();
    const { result } = renderReservations(storage);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const savedBefore = storage.values.get(RESERVATIONS_STORAGE_KEY);

    let invalid: ReturnType<typeof result.current.create>;
    let first: ReturnType<typeof result.current.create>;
    let second: ReturnType<typeof result.current.create>;
    act(() => {
      invalid = result.current.create({ ...validInput, customerName: "", time: "25:00" });
      first = result.current.create(validInput);
      second = result.current.create(validInput);
    });

    expect(invalid!).toMatchObject({ ok: false, reason: "VALIDATION" });
    expect(first!.ok && second!.ok && first!.reservation.id).not.toBe(
      second!.ok ? second!.reservation.id : "",
    );
    expect(storage.values.get(RESERVATIONS_STORAGE_KEY)).not.toBe(savedBefore);
  });

  it("allows valid status transitions and rejects unknown or terminal transitions immutably", async () => {
    const storage = new MemoryStorage();
    const { result } = renderReservations(storage);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const pending = result.current.getReservationById("res-002")!;

    let confirmed: ReturnType<typeof result.current.updateStatus>;
    let cancelled: ReturnType<typeof result.current.updateStatus>;
    let terminal: ReturnType<typeof result.current.updateStatus>;
    let unknown: ReturnType<typeof result.current.updateStatus>;
    let directCancellation: ReturnType<typeof result.current.updateStatus>;
    act(() => {
      confirmed = result.current.updateStatus("res-002", "CONFIRMED");
      cancelled = result.current.updateStatus("res-002", "CANCELLED");
      terminal = result.current.updateStatus("res-002", "CONFIRMED");
      unknown = result.current.updateStatus("missing", "CANCELLED");
      directCancellation = result.current.updateStatus("res-005", "CANCELLED");
    });

    expect(confirmed!).toMatchObject({ ok: true, reservation: { status: "CONFIRMED" } });
    expect(cancelled!).toMatchObject({ ok: true, reservation: { status: "CANCELLED" } });
    expect(terminal!).toMatchObject({ ok: false, reason: "INVALID_TRANSITION" });
    expect(unknown!).toMatchObject({ ok: false, reason: "NOT_FOUND" });
    expect(directCancellation!).toMatchObject({ ok: true, reservation: { status: "CANCELLED" } });
    expect(pending.status).toBe("PENDING");
    expect(result.current.getReservationById("res-002")!.status).toBe("CANCELLED");
  });

  it("does not update memory when a persistence write fails", async () => {
    const storage = new MemoryStorage();
    const { result } = renderReservations(storage);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    storage.failWrites = true;
    const countBefore = result.current.reservations.length;

    let outcome: ReturnType<typeof result.current.create>;
    act(() => {
      outcome = result.current.create(validInput);
    });

    expect(outcome!).toEqual({ ok: false, reason: "STORAGE_WRITE" });
    expect(result.current.reservations).toHaveLength(countBefore);
  });

  it("loads once in Strict Mode without overwriting saved reservations", async () => {
    const storage = new MemoryStorage();
    storage.values.set(RESERVATIONS_STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => useReservations({ storage }), {
      wrapper: StrictMode,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservations).toEqual([]);
    expect(storage.getItemCalls).toBe(1);
  });
});
