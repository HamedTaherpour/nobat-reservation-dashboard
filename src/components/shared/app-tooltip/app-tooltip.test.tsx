import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppTooltip } from "./app-tooltip";

describe("AppTooltip", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders its trigger and preserves its accessible name", () => {
    render(
      <TooltipProvider>
        <AppTooltip content="مشاهده جزئیات">
          <button type="button" aria-label="مشاهده جزئیات">
            مشاهده
          </button>
        </AppTooltip>
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: "مشاهده جزئیات" })).toBeInTheDocument();
  });

  it("shows content on hover and dismisses it when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <AppTooltip content="مرتب‌سازی رزروها">
          <button type="button" aria-label="مرتب‌سازی رزروها">
            مرتب‌سازی
          </button>
        </AppTooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "مرتب‌سازی رزروها" });
    await user.hover(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("مرتب‌سازی رزروها");

    await user.unhover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows content on keyboard focus, dismisses it with Escape, and preserves RTL", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <div dir="rtl">
          <AppTooltip content="فیلتر وضعیت رزروها">
            <button type="button" aria-label="فیلتر وضعیت رزروها">
              فیلتر
            </button>
          </AppTooltip>
        </div>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "فیلتر وضعیت رزروها" });
    trigger.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("فیلتر وضعیت رزروها");
    expect(trigger.closest("[dir='rtl']")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
