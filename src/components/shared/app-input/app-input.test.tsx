import { createRef } from "react";
import React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppInput } from "./app-input";

describe("AppInput", () => {
  it("associates its label with the input", () => {
    render(<AppInput label="نام" />);

    expect(screen.getByLabelText("نام")).toBeInTheDocument();
  });

  it("associates description and error text with the input", () => {
    render(
      <AppInput label="ایمیل" description="ایمیل کاری خود را وارد کنید" error="ایمیل معتبر نیست" />,
    );

    const input = screen.getByLabelText("ایمیل");
    expect(input).toHaveAccessibleDescription("ایمیل کاری خود را وارد کنید ایمیل معتبر نیست");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("ایمیل معتبر نیست");
  });

  it("supports required, disabled, and read-only states", () => {
    render(<AppInput label="کد" required disabled readOnly defaultValue="۱۲۳" />);

    const input = screen.getByRole("textbox", { name: /^کد/ });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("readonly");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("forwards native props and a ref", async () => {
    const ref = createRef<HTMLInputElement>();
    const user = userEvent.setup();
    render(
      <AppInput
        ref={ref}
        aria-label="جستجو"
        name="query"
        placeholder="جستجو کنید"
        data-testid="app-input"
      />,
    );

    const input = screen.getByTestId("app-input");
    expect(input).toHaveAttribute("name", "query");
    expect(input).toHaveAttribute("placeholder", "جستجو کنید");
    expect(ref.current).toBe(input);

    await user.type(input, "نوبت");
    expect(input).toHaveValue("نوبت");
  });

  it("generates a stable id when one is not provided", () => {
    const { rerender } = render(<AppInput label="عنوان" />);
    const firstId = screen.getByLabelText("عنوان").getAttribute("id");

    rerender(<AppInput label="عنوان" />);
    expect(screen.getByLabelText("عنوان")).toHaveAttribute("id", firstId);
  });
});
