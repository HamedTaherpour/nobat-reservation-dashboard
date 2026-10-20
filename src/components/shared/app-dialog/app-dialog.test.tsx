import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppDialog } from "./app-dialog";

describe("AppDialog", () => {
  it("renders its controlled content, description, and footer", () => {
    render(
      <AppDialog
        open
        onOpenChange={vi.fn()}
        title="افزودن رزرو"
        description="اطلاعات رزرو را وارد کنید"
        footer={<button type="button">ذخیره</button>}
      >
        <p>محتوای فرم</p>
      </AppDialog>,
    );

    expect(screen.getByRole("dialog", { name: "افزودن رزرو" })).toBeInTheDocument();
    expect(screen.getByText("اطلاعات رزرو را وارد کنید")).toBeInTheDocument();
    expect(screen.getByText("محتوای فرم")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ذخیره" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("closes through the primitive close control and Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AppDialog open onOpenChange={onOpenChange} title="جزئیات">
        <p>جزئیات رزرو</p>
      </AppDialog>,
    );

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
