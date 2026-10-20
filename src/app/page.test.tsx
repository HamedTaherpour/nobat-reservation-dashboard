import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "./page";

describe("Nobat dashboard homepage", () => {
  afterEach(cleanup);

  it("renders the dashboard and its reservation statistics", async () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "داشبورد نوبت" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "رزرو جدید" })).toBeInTheDocument();

    await waitFor(() =>
      expect(
        within(screen.getByTestId("reservation-statistics-desktop-grid")).getByText("کل رزروها"),
      ).toBeInTheDocument(),
    );
  });

  it("opens the new reservation form", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));

    expect(screen.getByRole("dialog", { name: "ثبت رزرو جدید" })).toBeInTheDocument();
  });
});
