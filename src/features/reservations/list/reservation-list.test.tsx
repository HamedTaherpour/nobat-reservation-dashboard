import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import { ReservationList } from "./reservation-list";

function getDesktopRows() {
  return Array.from(document.querySelectorAll("tbody tr[data-row-id]"));
}

function getMobileRows() {
  return Array.from(document.querySelectorAll(".md\\:hidden li"));
}

describe("ReservationList", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows ten matching reservations on the first page in both table and mobile views", () => {
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    expect(getDesktopRows()).toHaveLength(10);
    expect(getMobileRows()).toHaveLength(10);
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-012");
    expect(document.querySelector('[data-row-id="res-001"]')).not.toBeInTheDocument();
    expect(screen.getByText("صفحه 1 از 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeEnabled();
  });

  it("navigates to the two remaining reservations and disables the final next control", async () => {
    const user = userEvent.setup();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));

    expect(getDesktopRows()).toHaveLength(2);
    expect(getMobileRows()).toHaveLength(2);
    expect(screen.getAllByText("سارا محمدی")).toHaveLength(2);
    expect(screen.getAllByText("مریم احمدی")).toHaveLength(2);
    expect(screen.getByText("صفحه 2 از 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeDisabled();
  });

  it("preserves scheduled-date sorting when a newly created reservation is added", async () => {
    const user = userEvent.setup();
    const newReservation = {
      ...MOCK_RESERVATIONS[0],
      id: "res-new",
      customerName: "رزرو تازه",
      date: "2026-01-01",
      time: "08:00",
      createdAt: "2026-10-17T12:00:00.000Z",
    };
    const { rerender } = render(
      <ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />,
    );

    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    rerender(
      <ReservationList reservations={[...MOCK_RESERVATIONS, newReservation]} isLoading={false} />,
    );

    expect(await screen.findByText("صفحه 1 از 2")).toBeInTheDocument();
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-012");
    expect(screen.queryByText("رزرو تازه")).not.toBeInTheDocument();
  });

  it("supports both scheduled-date sort directions when creation timestamps conflict", async () => {
    const user = userEvent.setup();
    const reservations = [
      { ...MOCK_RESERVATIONS[0], id: "res-early", date: "2026-01-01", time: "08:00" },
      { ...MOCK_RESERVATIONS[1], id: "res-late", date: "2026-12-01", time: "08:00" },
    ];
    const { rerender } = render(<ReservationList reservations={reservations} isLoading={false} />);

    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-late");

    await user.click(screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ }));
    await user.click(screen.getByRole("option", { name: "قدیمی‌ترین ابتدا" }));
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-early");

    rerender(<ReservationList reservations={reservations} isLoading={false} />);
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-early");
  });

  it("preserves an explicit oldest-first sort and its page when reservations are added", async () => {
    const user = userEvent.setup();
    const newReservation = {
      ...MOCK_RESERVATIONS[0],
      id: "res-new",
      customerName: "رزرو تازه",
      createdAt: "2026-10-17T12:00:00.000Z",
    };
    const { rerender } = render(
      <ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />,
    );

    await user.click(screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ }));
    await user.click(await screen.findByRole("option", { name: "قدیمی‌ترین ابتدا" }));
    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    rerender(
      <ReservationList reservations={[...MOCK_RESERVATIONS, newReservation]} isLoading={false} />,
    );

    expect(screen.getByText("صفحه 2 از 2")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /مرتب‌سازی رزروها: قدیمی‌ترین ابتدا/ }),
    ).toHaveAttribute("data-active", "true");
  });

  it("keeps the search input responsive, then filters with the debounced Persian-digit query", () => {
    vi.useFakeTimers();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    fireEvent.click(screen.getByRole("button", { name: "صفحه بعد" }));
    fireEvent.change(screen.getByLabelText("جستجوی رزروها"), {
      target: { value: "۹۱۲۱۲۳۴۵۶۷" },
    });

    const searchInput = screen.getByLabelText("جستجوی رزروها");
    expect(searchInput).toHaveValue("۹۱۲۱۲۳۴۵۶۷");
    expect(document.querySelector("svg.lucide-search[aria-hidden='true']")).toBeInTheDocument();
    expect(screen.getByText("صفحه 1 از 2")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(300));
    expect(screen.getAllByText("سارا محمدی")).toHaveLength(2);
    expect(screen.getByText("صفحه 1 از 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeDisabled();
  });

  it("uses accessible icon controls for status filtering and canonical sorting", async () => {
    const user = userEvent.setup();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    const filterTrigger = screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    expect(filterTrigger.querySelector("svg.lucide-funnel")).toBeInTheDocument();
    expect(filterTrigger).not.toHaveAttribute("data-active");
    await user.click(filterTrigger);
    const selectedDefaultStatus = screen.getByRole("option", {
      name: "همه رزروها",
      selected: true,
    });
    expect(selectedDefaultStatus.querySelector(".lucide-check")).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "لغوشده" }));

    const activeFilterTrigger = screen.getByRole("combobox", {
      name: "فیلتر وضعیت رزروها: لغوشده",
    });
    expect(activeFilterTrigger).not.toHaveAttribute("title");
    expect(activeFilterTrigger).toHaveAttribute("data-active", "true");
    expect(activeFilterTrigger.querySelector("svg.lucide-funnel")).toBeInTheDocument();
    expect(activeFilterTrigger.querySelector(".lucide-check")).not.toBeInTheDocument();
    expect(activeFilterTrigger).toHaveTextContent("لغوشده");
    expect(getDesktopRows()).toHaveLength(3);
    expect(getMobileRows()).toHaveLength(3);
    expect(screen.getByText("صفحه 1 از 1")).toBeInTheDocument();

    await user.click(activeFilterTrigger);
    await user.click(await screen.findByRole("option", { name: "همه رزروها" }));
    const defaultFilterTrigger = screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    expect(defaultFilterTrigger).not.toHaveAttribute("data-active");
    expect(defaultFilterTrigger.querySelector("svg.lucide-funnel")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" }));
    await user.click(await screen.findByRole("option", { name: "لغوشده" }));
    const sortTrigger = screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ });
    expect(sortTrigger).not.toHaveAttribute("data-active");
    await user.click(sortTrigger);
    await user.click(screen.getByRole("option", { name: "قدیمی‌ترین ابتدا" }));

    expect(screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-003");
  });

  it("keeps filter and sort names accessible while exposing Persian tooltips", async () => {
    const user = userEvent.setup();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    const filterTrigger = screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    const sortTrigger = screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ });

    await user.hover(filterTrigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("فیلتر وضعیت رزروها");
    await user.unhover(filterTrigger);
    sortTrigger.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("مرتب‌سازی رزروها");
    expect(sortTrigger).toHaveAccessibleName("مرتب‌سازی رزروها: جدیدترین ابتدا");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("resets pagination after changing the sort", async () => {
    const user = userEvent.setup();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    await user.click(screen.getByRole("combobox", { name: /مرتب‌سازی رزروها/ }));
    await user.click(screen.getByRole("option", { name: "قدیمی‌ترین ابتدا" }));

    expect(screen.getByText("صفحه 1 از 2")).toBeInTheDocument();
    expect(getDesktopRows()[0]).toHaveAttribute("data-row-id", "res-001");
    expect(getMobileRows()[0]).toHaveTextContent("سارا محمدی");
  });

  it("clamps an invalid page after data shrinks and keeps it clamped when data grows", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />,
    );

    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    rerender(<ReservationList reservations={MOCK_RESERVATIONS.slice(0, 10)} isLoading={false} />);

    expect(screen.getByText("صفحه 1 از 1")).toBeInTheDocument();
    expect(getDesktopRows()).toHaveLength(10);
    expect(getMobileRows()).toHaveLength(10);

    rerender(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    expect(screen.getByText("صفحه 1 از 2")).toBeInTheDocument();
    expect(getDesktopRows()).toHaveLength(10);
    expect(getMobileRows()).toHaveLength(10);
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDisabled();
  });

  it("shows localized reservation details, loading placeholders, and distinct empty states", () => {
    const { rerender } = render(
      <ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByLabelText("فهرست رزروها در موبایل")).toBeInTheDocument();
    expect(screen.getAllByText("۱۴۰۵/۰۸/۰۱")).toHaveLength(2);
    expect(screen.getAllByText("۱۱:۳۰")).toHaveLength(2);
    expect(document.querySelectorAll("svg.lucide-calendar-days[aria-hidden='true']")).toHaveLength(
      10,
    );
    expect(
      document.querySelectorAll("svg.lucide-clock-3[aria-hidden='true']").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("09221234567")[0]).toHaveAttribute("dir", "ltr");

    rerender(<ReservationList reservations={[]} isLoading />);
    expect(screen.getAllByRole("status", { name: "در حال دریافت فهرست رزروها" })).toHaveLength(2);
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی رزروها" })).not.toBeInTheDocument();

    rerender(<ReservationList reservations={[]} isLoading={false} />);
    expect(screen.getByText("هنوز رزروی ثبت نشده است")).toBeInTheDocument();
    expect(screen.queryByText("رزروی مطابق جستجو پیدا نشد")).not.toBeInTheDocument();
  });

  it("keeps recovered reservations usable while announcing a recoverable warning", () => {
    render(
      <ReservationList
        reservations={MOCK_RESERVATIONS}
        isLoading={false}
        notice={{ kind: "recoverable", message: "اطلاعات ذخیره‌شده بازیابی شد." }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("اطلاعات ذخیره‌شده بازیابی شد.");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders a fatal list error without exposing stale list controls", () => {
    render(
      <ReservationList
        reservations={[]}
        isLoading={false}
        notice={{ kind: "fatal", message: "امکان دریافت فهرست وجود ندارد." }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("امکان دریافت فهرست وجود ندارد.");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows no pagination controls for zero search results and resets criteria", () => {
    vi.useFakeTimers();
    render(<ReservationList reservations={MOCK_RESERVATIONS} isLoading={false} />);

    fireEvent.change(screen.getByLabelText("جستجوی رزروها"), { target: { value: "ناموجود" } });
    act(() => vi.advanceTimersByTime(300));

    expect(screen.getAllByText("رزروی مطابق جستجو پیدا نشد")).toHaveLength(2);
    expect(screen.queryByRole("navigation", { name: "صفحه‌بندی رزروها" })).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "حذف جستجو و فیلتر" })[0]);
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText("صفحه 1 از 2")).toBeInTheDocument();
  });
});
