import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { AppPagination } from "./app-pagination";

describe("AppPagination", () => {
  afterEach(cleanup);

  it("disables the first-page previous control and reports the next page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <AppPagination
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
        ariaLabel="صفحه‌بندی رزروها"
      />,
    );

    expect(screen.getByRole("navigation", { name: "صفحه‌بندی رزروها" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "صفحه بعد" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables the last-page next control while remaining controlled", () => {
    const onPageChange = vi.fn();
    render(<AppPagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeEnabled();
    expect(screen.getByRole("button", { current: "page" })).toHaveTextContent("3");
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
