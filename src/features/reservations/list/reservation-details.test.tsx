import React, { useState } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import type { Reservation } from "../domain/reservation.types";
import { updateReservationStatus } from "../persistence/reservation.persistence";
import { ReservationList } from "./reservation-list";

type StatefulReservationListProps = {
  initialReservations: readonly Reservation[];
};

function StatefulReservationList(props: StatefulReservationListProps) {
  const { initialReservations } = props;
  const [reservations, setReservations] = useState<readonly Reservation[]>(initialReservations);

  return (
    <ReservationList
      reservations={reservations}
      isLoading={false}
      onUpdateStatus={(id, status) => {
        const result = updateReservationStatus(reservations, id, status);
        if (result.ok) {
          setReservations((current) =>
            current.map((reservation) =>
              reservation.id === id ? result.reservation : reservation,
            ),
          );
        }
        return result;
      }}
    />
  );
}

function getDesktopRow(customerName: string) {
  return within(screen.getByRole("table")).getByText(customerName).closest("tr")!;
}

describe("Reservation details and status actions", () => {
  afterEach(cleanup);

  it("opens Persian Jalali details from the desktop table and shows a missing-notes state", async () => {
    const user = userEvent.setup();
    render(<StatefulReservationList initialReservations={MOCK_RESERVATIONS} />);

    const row = getDesktopRow("ترانه حسینی");
    await user.click(within(row).getByRole("button", { name: "مشاهده جزئیات" }));

    expect(screen.getByRole("dialog", { name: "جزئیات رزرو" })).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("۱۴۰۵/۰۷/۲۶")).toBeInTheDocument();
    expect(within(dialog).getByText("یادداشتی برای این رزرو ثبت نشده است.")).toBeInTheDocument();
    expect(within(dialog).getByText("09211234567")).toHaveAttribute("dir", "ltr");
    expect(within(dialog).getAllByRole("separator")).toHaveLength(3);
  });

  it("opens details from anywhere on a mobile reservation item", async () => {
    const user = userEvent.setup();
    render(<StatefulReservationList initialReservations={MOCK_RESERVATIONS} />);

    const mobileList = screen.getByLabelText("فهرست رزروها در موبایل");
    const mobileCard = within(mobileList).getByRole("button", {
      name: "مشاهده جزئیات رزرو کیمیا مرادی",
    });
    await user.click(within(mobileCard).getByText("پاکسازی پوست"));

    expect(screen.getByRole("dialog", { name: "جزئیات رزرو" })).toBeInTheDocument();
  });

  it("confirms a pending reservation and exposes its updated status", async () => {
    const user = userEvent.setup();
    render(<StatefulReservationList initialReservations={MOCK_RESERVATIONS} />);

    await user.click(within(getDesktopRow("ترانه حسینی")).getByRole("button"));
    await user.click(screen.getByRole("combobox", { name: "وضعیت جدید" }));
    await user.click(await screen.findByRole("option", { name: "تأیید شده" }));
    expect(screen.getByRole("combobox", { name: "وضعیت جدید" })).toHaveTextContent("تأیید شده");
    await user.click(screen.getByRole("button", { name: "ثبت تغییر وضعیت" }));

    expect(within(screen.getByRole("dialog")).getByText("تأیید شده")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "تأیید رزرو" })).not.toBeInTheDocument();
  });

  it("requires confirmation to cancel and permits dismissal", async () => {
    const user = userEvent.setup();
    render(<StatefulReservationList initialReservations={MOCK_RESERVATIONS} />);

    await user.click(within(getDesktopRow("ترانه حسینی")).getByRole("button"));
    await user.click(screen.getByRole("combobox", { name: "وضعیت جدید" }));
    await user.click(await screen.findByRole("option", { name: "لغو شده" }));
    await user.click(screen.getByRole("button", { name: "ثبت تغییر وضعیت" }));
    expect(screen.getByRole("dialog", { name: "تأیید لغو رزرو" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "بازگشت" }));
    expect(screen.getByRole("dialog", { name: "جزئیات رزرو" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "ثبت تغییر وضعیت" }));
    await user.click(screen.getByRole("button", { name: "تأیید لغو رزرو" }));
    expect(within(screen.getByRole("dialog")).getByText("لغو شده")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "لغو رزرو" })).not.toBeInTheDocument();
  });

  it("keeps the prior status when an update fails", async () => {
    const user = userEvent.setup();
    const failedUpdate = vi.fn(() => ({ ok: false as const, reason: "STORAGE_WRITE" as const }));
    render(
      <ReservationList
        reservations={MOCK_RESERVATIONS}
        isLoading={false}
        onUpdateStatus={failedUpdate}
      />,
    );

    await user.click(within(getDesktopRow("ترانه حسینی")).getByRole("button"));
    await user.click(screen.getByRole("combobox", { name: "وضعیت جدید" }));
    await user.click(await screen.findByRole("option", { name: "تأیید شده" }));
    await user.click(screen.getByRole("button", { name: "ثبت تغییر وضعیت" }));

    expect(screen.getByRole("alert")).toHaveTextContent("ذخیره‌سازی تغییر وضعیت انجام نشد");
    expect(within(screen.getByRole("dialog")).getByText("در انتظار تأیید")).toBeInTheDocument();
  });

  it("does not show terminal-state actions for a cancelled reservation", async () => {
    const user = userEvent.setup();
    render(<StatefulReservationList initialReservations={MOCK_RESERVATIONS} />);

    await user.click(within(getDesktopRow("نگار رضایی")).getByRole("button"));

    expect(screen.queryByRole("button", { name: "تأیید رزرو" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "لغو رزرو" })).not.toBeInTheDocument();
  });
});
