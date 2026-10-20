import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UseReservationsResult } from "../hooks/use-reservations.types";
import { CreateReservationForm } from "./create-reservation-form";

const createdReservation = {
  id: "res-new",
  customerName: "مریم رضایی",
  customerPhone: "09121234567",
  service: "HAIRCUT" as const,
  date: "2026-11-01",
  time: "09:30",
  status: "PENDING" as const,
  createdAt: "2026-10-17T10:00:00.000Z",
};

function mockMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      media: "(min-width: 768px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

const successfulCreate: UseReservationsResult["create"] = () => ({
  ok: true,
  reservation: createdReservation,
});

function renderForm(createReservation: UseReservationsResult["create"] = successfulCreate) {
  return {
    createReservation,
    ...render(<CreateReservationForm createReservation={createReservation} />),
  };
}

async function fillRequiredFields(
  user: ReturnType<typeof userEvent.setup>,
  serviceLabel = "کوتاهی و اصلاح مو",
) {
  await user.type(screen.getByLabelText(/^نام مشتری/), "مریم رضایی");
  await user.type(screen.getByLabelText(/^شماره موبایل/), "۰۹۱۲۱۲۳۴۵۶۷");
  await user.click(screen.getByRole("combobox", { name: "خدمت" }));
  await user.click(screen.getByRole("option", { name: serviceLabel }));
  await user.click(await screen.findByRole("button", { name: /^تاریخ رزرو/ }));
  const firstAvailableDay = document.querySelector<HTMLElement>(".rmdp-day:not(.rmdp-disabled)");
  if (!firstAvailableDay) throw new Error("No selectable Jalali calendar day was rendered.");
  await user.click(firstAvailableDay);
  await user.type(screen.getByLabelText(/^ساعت رزرو/), "۰۹:۳۰");
}

describe("CreateReservationForm", () => {
  beforeEach(mockMatchMedia);
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens, validates required fields, and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));
    await user.click(screen.getByRole("button", { name: "ثبت رزرو" }));

    expect(await screen.findByText("نام مشتری الزامی است.")).toBeVisible();
    expect(screen.getByText("شماره موبایل ایران معتبر نیست.")).toBeVisible();
    expect(screen.getByLabelText(/^نام مشتری/)).toHaveFocus();
  });

  it("submits Persian digit input through the existing creation action and resets after success", async () => {
    const user = userEvent.setup();
    const createReservation = vi.fn<UseReservationsResult["create"]>(() => ({
      ok: true,
      reservation: createdReservation,
    }));
    renderForm(createReservation);

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "ثبت رزرو" }));

    expect(createReservation).toHaveBeenCalledWith({
      customerName: "مریم رضایی",
      customerPhone: "۰۹۱۲۱۲۳۴۵۶۷",
      service: "HAIRCUT",
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "۰۹:۳۰",
      notes: "",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));
    expect(screen.getByLabelText(/^نام مشتری/)).toHaveValue("");
  });

  it("shows the canonical Persian service label while preserving the selected service ID", async () => {
    const user = userEvent.setup();
    const createReservation = vi.fn<UseReservationsResult["create"]>(() => ({
      ok: true,
      reservation: createdReservation,
    }));
    renderForm(createReservation);

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));
    await fillRequiredFields(user, "مراقبت و طراحی ناخن");

    const serviceTrigger = screen.getByRole("combobox", { name: "خدمت" });
    expect(serviceTrigger).toHaveTextContent("مراقبت و طراحی ناخن");
    expect(serviceTrigger).not.toHaveTextContent("NAIL_CARE");

    await user.click(screen.getByRole("button", { name: "ثبت رزرو" }));
    expect(createReservation).toHaveBeenCalledWith(
      expect.objectContaining({ service: "NAIL_CARE" }),
    );
  });

  it("uses a two-column wide form grid without persistent date or time descriptions", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));

    const formGrid = document.querySelector("#create-reservation-form > div");
    expect(formGrid).toHaveClass("grid", "grid-cols-1", "min-[400px]:grid-cols-2");
    expect(screen.getByRole("combobox", { name: "خدمت" }).closest("div")).toHaveClass(
      "min-[400px]:col-span-2",
    );
    expect(screen.getByLabelText(/توضیحات/).closest("div")).toHaveClass("min-[400px]:col-span-2");
    expect(screen.queryByText("تاریخ را در تقویم شمسی انتخاب کنید.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("ساعت را به‌صورت ۲۴ ساعته، مانند ۰۹:۳۰، وارد کنید."),
    ).not.toBeInTheDocument();
  });

  it("keeps entered values available when persistence fails", async () => {
    const user = userEvent.setup();
    const createReservation = vi.fn<UseReservationsResult["create"]>(() => ({
      ok: false,
      reason: "STORAGE_WRITE",
    }));
    renderForm(createReservation);

    await user.click(screen.getByRole("button", { name: "رزرو جدید" }));
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "ثبت رزرو" }));

    expect(screen.getByRole("alert")).toHaveTextContent("ذخیره‌سازی رزرو انجام نشد");
    expect(screen.getByLabelText(/^نام مشتری/)).toHaveValue("مریم رضایی");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
