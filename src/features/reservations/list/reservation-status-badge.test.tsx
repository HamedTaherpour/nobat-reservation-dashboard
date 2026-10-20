import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReservationStatusBadge } from "./reservation-status-badge";

describe("ReservationStatusBadge", () => {
  it.each([
    ["PENDING", "در انتظار تأیید", "clock-3"],
    ["CONFIRMED", "تأیید شده", "circle-check"],
    ["CANCELLED", "لغو شده", "circle-x"],
  ] as const)("renders %s with its Persian label and icon", (status, label, iconName) => {
    const { container } = render(<ReservationStatusBadge status={status} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(
      container.querySelector(`svg.lucide-${iconName}[aria-hidden='true']`),
    ).toBeInTheDocument();
  });
});
