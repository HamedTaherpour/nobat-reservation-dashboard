"use client";

import { Loader2Icon } from "lucide-react";
import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { AppAlert } from "@/components/shared/app-alert";
import { AppInput } from "@/components/shared/app-input";
import { AppSelect } from "@/components/shared/app-select";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RESERVATION_SERVICES } from "../domain/reservation.constants";
import { validateReservation } from "../domain/reservation.utils";
import type {
  ReservationField,
  ReservationInput,
  ReservationValidationErrors,
} from "../domain/reservation.types";
import {
  EMPTY_RESERVATION_FORM_VALUES,
  RESERVATION_FORM_FIELD_IDS,
} from "./create-reservation-form.constants";
import type { CreateReservationFormProps } from "./create-reservation-form.types";

const ReservationDatePicker = dynamic(
  () => import("./reservation-date-picker").then((module) => module.ReservationDatePicker),
  {
    ssr: false,
    loading: () => (
      <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
        در حال بارگذاری تقویم...
      </div>
    ),
  },
);

function getFirstError(errors: ReservationValidationErrors, field: ReservationField) {
  return errors[field]?.[0];
}

function getCreationErrorMessage(reason: string) {
  if (reason === "STORAGE_UNAVAILABLE") return "فضای ذخیره‌سازی مرورگر در دسترس نیست.";
  if (reason === "STORAGE_WRITE") return "ذخیره‌سازی رزرو انجام نشد. لطفاً دوباره تلاش کنید.";
  if (reason === "NOT_READY")
    return "اطلاعات رزروها هنوز آماده نشده است. لطفاً چند لحظه دیگر تلاش کنید.";
  return "ثبت رزرو انجام نشد. لطفاً اطلاعات را بررسی و دوباره تلاش کنید.";
}

export function CreateReservationForm(props: CreateReservationFormProps) {
  const { createReservation } = props;

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ReservationInput>(EMPTY_RESERVATION_FORM_VALUES);
  const [errors, setErrors] = useState<ReservationValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  function resetForm() {
    setValues(EMPTY_RESERVATION_FORM_VALUES);
    setErrors({});
    setSubmitError(undefined);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    setOpen(nextOpen);
  }

  function handleOpen() {
    resetForm();
    setOpen(true);
  }

  function updateField(field: ReservationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError(undefined);
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...remaining } = current;
      return remaining;
    });
  }

  function focusFirstInvalidField(nextErrors: ReservationValidationErrors) {
    const firstField = Object.keys(RESERVATION_FORM_FIELD_IDS).find(
      (field) => nextErrors[field as ReservationField],
    );
    if (!firstField) return;
    window.requestAnimationFrame(() =>
      document.getElementById(RESERVATION_FORM_FIELD_IDS[firstField as ReservationField])?.focus(),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const validation = validateReservation(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      focusFirstInvalidField(validation.errors);
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setSubmitError(undefined);
    const result = createReservation(values);
    submissionInProgress.current = false;
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.reason === "VALIDATION") {
        const validationErrors = result.errors ?? {};
        setErrors(validationErrors);
        focusFirstInvalidField(validationErrors);
      } else {
        setSubmitError(getCreationErrorMessage(result.reason));
      }
      return;
    }

    toast.success("رزرو جدید با موفقیت ثبت شد.");
    resetForm();
    setOpen(false);
  }

  const serviceError = getFirstError(errors, "service");
  const notesError = getFirstError(errors, "notes");
  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenChange(false)}
        disabled={isSubmitting}
      >
        انصراف
      </Button>
      <Button type="submit" form="create-reservation-form" disabled={isSubmitting}>
        {isSubmitting ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : null}
        ثبت رزرو
      </Button>
    </>
  );

  return (
    <>
      <Button size="lg" onClick={handleOpen}>
        رزرو جدید
      </Button>
      <ResponsiveDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="ثبت رزرو جدید"
        description="اطلاعات مشتری و زمان رزرو را وارد کنید. فیلدهای دارای ستاره الزامی هستند."
        footer={footer}
      >
        <form
          id="create-reservation-form"
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit}
        >
          {submitError ? (
            <AppAlert
              variant="error"
              role="alert"
              title="ثبت رزرو ناموفق بود"
              message={submitError}
            />
          ) : null}
          <div className="grid grid-cols-1 gap-5 min-[400px]:grid-cols-2">
            <AppInput
              id={RESERVATION_FORM_FIELD_IDS.customerName}
              label="نام مشتری"
              required
              autoComplete="name"
              value={values.customerName}
              error={getFirstError(errors, "customerName")}
              onChange={(event) => updateField("customerName", event.target.value)}
            />
            <AppInput
              id={RESERVATION_FORM_FIELD_IDS.customerPhone}
              label="شماره موبایل"
              required
              type="tel"
              inputMode="numeric"
              dir="ltr"
              autoComplete="tel"
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              value={values.customerPhone}
              error={getFirstError(errors, "customerPhone")}
              onChange={(event) => updateField("customerPhone", event.target.value)}
            />
            <div
              className="flex flex-col gap-2 min-[400px]:col-span-2"
              data-invalid={serviceError ? true : undefined}
            >
              <Label htmlFor={RESERVATION_FORM_FIELD_IDS.service}>
                خدمت <span aria-hidden="true">*</span>
              </Label>
              <AppSelect
                options={RESERVATION_SERVICES.map((service) => ({
                  value: service.id,
                  label: service.label,
                }))}
                value={values.service}
                onValueChange={(value) => updateField("service", value ?? "")}
                placeholder="یک خدمت را انتخاب کنید"
                triggerClassName="w-full"
                triggerProps={{
                  id: RESERVATION_FORM_FIELD_IDS.service,
                  "aria-label": "خدمت",
                  "aria-invalid": serviceError ? true : undefined,
                  "aria-describedby": serviceError
                    ? `${RESERVATION_FORM_FIELD_IDS.service}-error`
                    : undefined,
                }}
              />
              {serviceError ? (
                <p
                  id={`${RESERVATION_FORM_FIELD_IDS.service}-error`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {serviceError}
                </p>
              ) : null}
            </div>
            {open ? (
              <ReservationDatePicker
                id={RESERVATION_FORM_FIELD_IDS.date}
                labelId={`${RESERVATION_FORM_FIELD_IDS.date}-label`}
                value={values.date}
                error={getFirstError(errors, "date")}
                onChange={(value) => updateField("date", value)}
              />
            ) : null}
            <AppInput
              id={RESERVATION_FORM_FIELD_IDS.time}
              label="ساعت رزرو"
              required
              inputMode="numeric"
              dir="ltr"
              placeholder="۰۹:۳۰"
              value={values.time}
              error={getFirstError(errors, "time")}
              onChange={(event) => updateField("time", event.target.value)}
            />
            <div
              className="flex flex-col gap-2 min-[400px]:col-span-2"
              data-invalid={notesError ? true : undefined}
            >
              <Label htmlFor={RESERVATION_FORM_FIELD_IDS.notes}>
                توضیحات <span className="font-normal text-muted-foreground">(اختیاری)</span>
              </Label>
              <Textarea
                id={RESERVATION_FORM_FIELD_IDS.notes}
                value={values.notes}
                aria-invalid={notesError ? true : undefined}
                aria-describedby={
                  notesError ? `${RESERVATION_FORM_FIELD_IDS.notes}-error` : undefined
                }
                onChange={(event) => updateField("notes", event.target.value)}
              />
              {notesError ? (
                <p
                  id={`${RESERVATION_FORM_FIELD_IDS.notes}-error`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {notesError}
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </ResponsiveDialog>
    </>
  );
}
