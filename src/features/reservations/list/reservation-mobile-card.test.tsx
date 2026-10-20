import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import { ReservationMobileCard } from "./reservation-mobile-card";

describe("ReservationMobileCard", () => {
  afterEach(cleanup);

  it("renders a compact three-row reservation item with status and truncated text", () => {
    render(
      <ReservationMobileCard
        reservation={{
          ...MOCK_RESERVATIONS[0],
          customerName: "نام مشتری بسیار طولانی برای بررسی برش متن",
        }}
        onViewDetails={vi.fn()}
      />,
    );

    const card = screen.getByRole("button", {
      name: "مشاهده جزئیات رزرو نام مشتری بسیار طولانی برای بررسی برش متن",
    });

    expect(card).toHaveClass("flex", "flex-col", "p-3");
    expect(within(card).getByText("نام مشتری بسیار طولانی برای بررسی برش متن")).toHaveClass(
      "truncate",
    );
    expect(within(card).getByText("کوتاهی و اصلاح مو")).toHaveClass("truncate");
    expect(within(card).getByText("تأیید شده")).toBeInTheDocument();
    expect(within(card).getByText("۱۴۰۵/۰۷/۲۵")).toBeInTheDocument();
    expect(within(card).getByText("۰۹:۰۰")).toHaveAttribute("dir", "ltr");
    expect(within(card).queryByRole("button", { name: "مشاهده جزئیات" })).not.toBeInTheDocument();
  });

  it.each([
    ["{Enter}", "تأیید شده"],
    [" ", "در انتظار تأیید"],
  ])("opens details when activated with %s", async (key, status) => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    render(
      <ReservationMobileCard
        reservation={{
          ...MOCK_RESERVATIONS[0],
          status: status === "تأیید شده" ? "CONFIRMED" : "PENDING",
        }}
        onViewDetails={onViewDetails}
      />,
    );

    const card = screen.getByRole("button", { name: /مشاهده جزئیات رزرو/ });
    card.focus();
    await user.keyboard(key);

    expect(onViewDetails).toHaveBeenCalledOnce();
  });
});
