import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppDrawer } from "./app-drawer";

describe("AppDrawer", () => {
  it("renders an accessible right-side sheet with its content and footer", () => {
    render(
      <AppDrawer
        open
        onOpenChange={vi.fn()}
        title="فیلترها"
        description="رزروها را فیلتر کنید"
        footer={<button type="button">اعمال</button>}
      >
        <p>محتوای فیلتر</p>
      </AppDrawer>,
    );

    const dialog = screen.getByRole("dialog", { name: "فیلترها" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-side", "right");
    expect(screen.getByText("رزروها را فیلتر کنید")).toBeInTheDocument();
    expect(screen.getByText("محتوای فیلتر")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "اعمال" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("uses the controlled close callback", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AppDrawer open onOpenChange={onOpenChange} title="فیلترها">
        <p>محتوا</p>
      </AppDrawer>,
    );

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
