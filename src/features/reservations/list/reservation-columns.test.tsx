import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MOCK_RESERVATIONS } from "../domain/reservation.mock";
import { getReservationColumns } from "./reservation-columns";

describe("reservation table columns", () => {
  it("isolates customer phone numbers from the Persian RTL table direction", () => {
    const customerCell = getReservationColumns(vi.fn())[0].cell;

    if (!customerCell) throw new Error("Expected the customer column to render a cell");
    render(customerCell(MOCK_RESERVATIONS[0], 0));

    expect(screen.getByText(MOCK_RESERVATIONS[0].customerPhone)).toHaveAttribute("dir", "ltr");
  });
});
