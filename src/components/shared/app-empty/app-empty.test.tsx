import { Search } from "lucide-react";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppEmpty } from "./app-empty";

describe("AppEmpty", () => {
  it("renders its title and optional description", () => {
    render(<AppEmpty title="رزروی پیدا نشد" description="فیلترهای خود را بررسی کنید" />);

    expect(screen.getByRole("heading", { name: "رزروی پیدا نشد" })).toBeInTheDocument();
    expect(screen.getByText("فیلترهای خود را بررسی کنید")).toBeInTheDocument();
  });

  it("renders an optional icon and caller-provided action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AppEmpty
        title="هنوز رزروی ثبت نشده است"
        icon={<Search aria-label="جستجو" />}
        action={<button onClick={onClick}>افزودن رزرو</button>}
      />,
    );

    expect(screen.getByLabelText("جستجو")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "افزودن رزرو" })).toBeInTheDocument();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("exposes the empty state title to assistive technology", () => {
    render(<AppEmpty title="بدون نتیجه" />);

    expect(screen.getByLabelText("بدون نتیجه")).toBeInTheDocument();
  });
});
