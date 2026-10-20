import React, { StrictMode } from "react";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import * as reservationUtils from "../domain/reservation.utils";
import { ReservationDashboard } from "./reservation-dashboard";
import { useReservations } from "../hooks/use-reservations";
import type { UseReservationsResult } from "../hooks/use-reservations.types";

vi.mock("../hooks/use-reservations", () => ({ useReservations: vi.fn() }));

const mockedUseReservations = vi.mocked(useReservations);

function mockReservations(result: Partial<UseReservationsResult> = {}) {
  mockedUseReservations.mockReturnValue({
    reservations: MOCK_RESERVATIONS,
    isLoading: false,
    getReservationById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    ...result,
  });
}

describe("ReservationDashboard", () => {
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, "visibilityState");
    vi.restoreAllMocks();
    mockedUseReservations.mockReset();
    vi.useRealTimers();
  });

  it("owns reservation state once and passes derived metrics to all four statistic cards", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 12));
    mockReservations();
    const metricsSpy = vi.spyOn(reservationUtils, "getReservationMetrics");

    render(<ReservationDashboard />);

    expect(mockedUseReservations).toHaveBeenCalledTimes(1);
    expect(metricsSpy).toHaveBeenCalledOnce();
    const desktopGrid = within(screen.getByTestId("reservation-statistics-desktop-grid"));
    expect(desktopGrid.getByText("کل رزروها").parentElement?.parentElement).toHaveTextContent("12");
    expect(desktopGrid.getByText("رزروهای امروز").parentElement?.parentElement).toHaveTextContent(
      "3",
    );
    expect(desktopGrid.getByText("تأییدشده").parentElement?.parentElement).toHaveTextContent("5");
    expect(desktopGrid.getByText("لغوشده").parentElement?.parentElement).toHaveTextContent("3");
  });

  it("groups the four statistics in one compact mobile card while preserving the desktop grid", () => {
    mockReservations();

    render(<ReservationDashboard />);

    const mobileGrid = screen.getByTestId("reservation-statistics-mobile-grid");
    const desktopGrid = screen.getByTestId("reservation-statistics-desktop-grid");

    expect(mobileGrid).toHaveClass("grid-cols-2", "sm:hidden");
    expect(mobileGrid).toHaveAttribute("data-slot", "card");
    expect(
      Array.from(mobileGrid.children).filter((child) => child.classList.contains("border-b")),
    ).toHaveLength(2);
    expect(within(mobileGrid).getByText("کل رزروها")).toBeInTheDocument();
    expect(within(mobileGrid).getByText("رزروهای امروز")).toBeInTheDocument();
    expect(within(mobileGrid).getByText("تأییدشده")).toBeInTheDocument();
    expect(within(mobileGrid).getByText("لغوشده")).toBeInTheDocument();
    expect(desktopGrid).toHaveClass("hidden", "sm:grid", "xl:grid-cols-4");
    expect(desktopGrid.querySelectorAll('[data-slot="card"]')).toHaveLength(4);
  });

  it("uses the browser-local Gregorian calendar date for today's metric", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 23, 59));
    mockReservations();
    const metricsSpy = vi.spyOn(reservationUtils, "getReservationMetrics");

    render(<ReservationDashboard />);

    expect(metricsSpy).toHaveBeenCalledWith(MOCK_RESERVATIONS, "2026-10-17");
  });

  it("updates today's metric at the next local midnight", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 23, 55));
    mockReservations();

    render(<ReservationDashboard />);

    expect(
      within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("رزروهای امروز")
        .parentElement?.parentElement,
    ).toHaveTextContent("3");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    });

    expect(
      within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("رزروهای امروز")
        .parentElement?.parentElement,
    ).toHaveTextContent("2");
  });

  it("refreshes when the tab becomes visible on a new day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 23, 55));
    mockReservations();
    render(<ReservationDashboard />);

    vi.setSystemTime(new Date(2026, 9, 18, 0, 5));
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    act(() => document.dispatchEvent(new Event("visibilitychange")));

    expect(
      within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("رزروهای امروز")
        .parentElement?.parentElement,
    ).toHaveTextContent("2");
  });

  it("refreshes when the window regains focus on a new day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 23, 55));
    mockReservations();
    render(<ReservationDashboard />);

    vi.setSystemTime(new Date(2026, 9, 18, 0, 5));
    act(() => window.dispatchEvent(new Event("focus")));

    expect(
      within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("رزروهای امروز")
        .parentElement?.parentElement,
    ).toHaveTextContent("2");
  });

  it("does not recalculate metrics when focus occurs without a date change", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 17, 12));
    mockReservations();
    const metricsSpy = vi.spyOn(reservationUtils, "getReservationMetrics");
    render(<ReservationDashboard />);

    act(() => window.dispatchEvent(new Event("focus")));

    expect(metricsSpy).toHaveBeenCalledOnce();
  });

  it("cleans up the midnight timeout and date-refresh event listeners", () => {
    vi.useFakeTimers();
    mockReservations();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const removeWindowListenerSpy = vi.spyOn(window, "removeEventListener");
    const removeDocumentListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<ReservationDashboard />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(removeWindowListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(removeDocumentListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("keeps one active timeout and listener set in React Strict Mode", () => {
    vi.useFakeTimers();
    mockReservations();
    const addWindowListenerSpy = vi.spyOn(window, "addEventListener");
    const addDocumentListenerSpy = vi.spyOn(document, "addEventListener");
    const removeWindowListenerSpy = vi.spyOn(window, "removeEventListener");
    const removeDocumentListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <StrictMode>
        <ReservationDashboard />
      </StrictMode>,
    );

    expect(vi.getTimerCount()).toBe(1);
    expect(addWindowListenerSpy.mock.calls.filter(([type]) => type === "focus")).toHaveLength(2);
    expect(
      addDocumentListenerSpy.mock.calls.filter(([type]) => type === "visibilitychange"),
    ).toHaveLength(2);
    expect(removeWindowListenerSpy.mock.calls.filter(([type]) => type === "focus")).toHaveLength(1);
    expect(
      removeDocumentListenerSpy.mock.calls.filter(([type]) => type === "visibilitychange"),
    ).toHaveLength(1);

    unmount();

    expect(removeWindowListenerSpy.mock.calls.filter(([type]) => type === "focus")).toHaveLength(2);
    expect(
      removeDocumentListenerSpy.mock.calls.filter(([type]) => type === "visibilitychange"),
    ).toHaveLength(2);
  });

  it("keeps initial SSR output in its hydration-safe loading state", () => {
    mockReservations({ reservations: [], isLoading: true });
    const metricsSpy = vi.spyOn(reservationUtils, "getReservationMetrics");

    const output = renderToString(<ReservationDashboard />);

    expect(output).toContain("در حال دریافت آمار رزروها");
    expect(output).not.toContain("کل رزروها</div>");
    expect(metricsSpy).not.toHaveBeenCalled();
  });

  it("shows skeletons rather than zero-valued statistics while reservations load", () => {
    mockReservations({ reservations: [], isLoading: true });

    render(<ReservationDashboard />);

    expect(screen.getByRole("region", { name: "نمای کلی رزروها" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.queryByText("کل رزروها")).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("region", { name: "نمای کلی رزروها" })
        .querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(20);
  });

  it("announces recovered data without hiding the usable statistics", () => {
    mockReservations({ initializationError: "STORAGE_PARSE" });

    render(<ReservationDashboard />);

    expect(screen.getByRole("alert")).toHaveTextContent("داده‌های رزرو بازیابی شد");
    expect(
      within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("کل رزروها"),
    ).toBeInTheDocument();
  });
});
