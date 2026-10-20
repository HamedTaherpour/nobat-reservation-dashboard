import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { ResponsiveDialog } from "./responsive-dialog";

type MediaQueryController = { setMatches: (matches: boolean) => void };

function LocallyOwnedState() {
  const [count, setCount] = React.useState(0);

  return (
    <button type="button" onClick={() => setCount((current) => current + 1)}>
      شمارنده: {count}
    </button>
  );
}

function mockMatchMedia(initialMatches: boolean): MediaQueryController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const matchMedia = vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;

  vi.stubGlobal("matchMedia", matchMedia);
  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      act(() => {
        listeners.forEach((listener) =>
          listener({ matches, media: "(min-width: 768px)" } as MediaQueryListEvent),
        );
      });
    },
  };
}

describe("ResponsiveDialog", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders one centered dialog on mobile and one right-side sheet on desktop", async () => {
    const user = userEvent.setup();
    const media = mockMatchMedia(false);
    const onOpenChange = vi.fn();
    render(
      <ResponsiveDialog open onOpenChange={onOpenChange} title="رزرو جدید">
        <input aria-label="نام" />
      </ResponsiveDialog>,
    );

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog")).not.toHaveAttribute("data-side");

    media.setMatches(true);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "right");

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it("keeps the public content and footer API across breakpoints", () => {
    const media = mockMatchMedia(true);
    render(
      <ResponsiveDialog
        open
        onOpenChange={vi.fn()}
        title="رزرو"
        description="توضیحات"
        footer={<button type="button">ثبت</button>}
      >
        <p>محتوا</p>
      </ResponsiveDialog>,
    );

    expect(screen.getByText("توضیحات")).toBeInTheDocument();
    expect(screen.getByText("محتوا")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ثبت" })).toBeInTheDocument();
    media.setMatches(false);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "ثبت" })).toBeInTheDocument();
  });

  it("documents the remount contract for locally owned child state", async () => {
    const user = userEvent.setup();
    const media = mockMatchMedia(false);
    render(
      <ResponsiveDialog open onOpenChange={vi.fn()} title="رزرو">
        <LocallyOwnedState />
      </ResponsiveDialog>,
    );

    await user.click(screen.getByRole("button", { name: "شمارنده: 0" }));
    expect(screen.getByRole("button", { name: "شمارنده: 1" })).toBeInTheDocument();

    media.setMatches(true);
    expect(screen.getByRole("button", { name: "شمارنده: 0" })).toBeInTheDocument();
  });

  it("preserves parent-owned controlled state across breakpoints", async () => {
    const user = userEvent.setup();
    const media = mockMatchMedia(false);
    function ControlledStateHarness() {
      const [value, setValue] = React.useState("");

      return (
        <ResponsiveDialog open onOpenChange={vi.fn()} title="رزرو">
          <input
            aria-label="نام"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </ResponsiveDialog>
      );
    }

    render(<ControlledStateHarness />);
    await user.type(screen.getByRole("textbox", { name: "نام" }), "مریم");
    media.setMatches(true);

    expect(screen.getByRole("textbox", { name: "نام" })).toHaveValue("مریم");
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("restores focus to the previously focused control after close", async () => {
    const user = userEvent.setup();
    mockMatchMedia(false);
    function FocusRestorationHarness() {
      const [open, setOpen] = React.useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            باز کردن
          </button>
          <ResponsiveDialog open={open} onOpenChange={setOpen} title="رزرو">
            <input aria-label="نام" />
          </ResponsiveDialog>
        </>
      );
    }

    render(<FocusRestorationHarness />);
    const trigger = screen.getByRole("button", { name: "باز کردن" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(trigger).toHaveFocus();
  });
});
