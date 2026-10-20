import React, { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSelect } from "./app-select";

const options = [
  { value: "all", label: "همه رزروها" },
  { value: "pending", label: "در انتظار" },
] as const;

function ControlledSelect() {
  const [value, setValue] = useState<string | null>("all");

  return (
    <AppSelect
      options={options}
      value={value}
      onValueChange={setValue}
      placeholder="وضعیت را انتخاب کنید"
      active={value !== "all"}
      triggerProps={{ "aria-label": "فیلتر وضعیت رزروها" }}
    />
  );
}

describe("AppSelect", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Persian labels and updates its controlled value", async () => {
    const user = userEvent.setup();
    render(<ControlledSelect />);

    const trigger = screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    expect(trigger).toHaveTextContent("همه رزروها");
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "در انتظار" }));

    expect(trigger).toHaveTextContent("در انتظار");
    expect(trigger).toHaveAttribute("data-active", "true");
  });

  it("preserves placeholder, disabled options, and accessible trigger naming", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <AppSelect
          options={[{ value: "disabled", label: "غیرفعال", disabled: true }]}
          placeholder="وضعیت را انتخاب کنید"
          triggerProps={{ "aria-label": "انتخاب وضعیت", disabled: true }}
        />
      </div>,
    );

    const trigger = screen.getByRole("combobox", { name: "انتخاب وضعیت" });
    expect(trigger).toHaveTextContent("وضعیت را انتخاب کنید");
    expect(trigger).toBeDisabled();
    expect(trigger.closest("[dir='rtl']")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("shows the tooltip on hover and focus, then dismisses it on Escape", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <AppSelect
          options={options}
          value="all"
          tooltip="فیلتر وضعیت رزروها"
          triggerProps={{ "aria-label": "فیلتر وضعیت رزروها" }}
        />
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    await user.hover(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("فیلتر وضعیت رزروها");

    await user.unhover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    trigger.focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("فیلتر وضعیت رزروها");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
