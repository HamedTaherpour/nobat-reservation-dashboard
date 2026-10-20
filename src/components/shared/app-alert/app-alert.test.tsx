import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppAlert } from "./app-alert";

describe("AppAlert", () => {
  afterEach(cleanup);

  it.each([
    ["info", "اطلاع‌رسانی"],
    ["success", "عملیات موفق"],
    ["warning", "توجه لازم است"],
    ["error", "عملیات ناموفق"],
  ] as const)("renders the %s variant with a meaningful icon", (variant, message) => {
    const { container } = render(<AppAlert variant={variant} message={message} />);

    expect(screen.getByText(message)).toBeInTheDocument();
    expect(container.querySelector("svg[aria-hidden='true']")).toBeInTheDocument();
  });

  it("renders an optional title and children content", () => {
    render(
      <AppAlert variant="success" title="ذخیره شد">
        اطلاعات شما با موفقیت ذخیره شد.
      </AppAlert>,
    );

    expect(screen.getByText("ذخیره شد")).toBeInTheDocument();
    expect(screen.getByText("اطلاعات شما با موفقیت ذخیره شد.")).toBeInTheDocument();
  });

  it("uses an assertive alert role only for errors by default", () => {
    const { rerender } = render(<AppAlert variant="info" message="پیام عادی" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(<AppAlert variant="error" message="خطا رخ داد" />);
    expect(screen.getByRole("alert")).toHaveTextContent("خطا رخ داد");
  });

  it("accepts an explicit role for important recoverable warnings", () => {
    render(<AppAlert variant="warning" role="alert" message="داده‌ها بازیابی شدند" />);

    expect(screen.getByRole("alert")).toHaveTextContent("داده‌ها بازیابی شدند");
  });

  it("preserves custom layout classes and RTL text without interactive controls", () => {
    const { container } = render(
      <div dir="rtl">
        <AppAlert className="mt-4" title="اطلاع" message="پیام فارسی" />
      </div>,
    );

    expect(container.querySelector("[data-slot='alert']")).toHaveClass("mt-4");
    expect(screen.getByText("پیام فارسی").closest("[dir='rtl']")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
