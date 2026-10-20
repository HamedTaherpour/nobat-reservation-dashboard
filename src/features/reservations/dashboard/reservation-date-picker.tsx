"use client";

import { CalendarDaysIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DatePicker, { type DatePickerRef } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCanonicalGregorianDate, getJalaliDatePickerValue } from "@/lib/date/date.utils";
import type { ReservationDatePickerProps } from "./reservation-date-picker.types";

export function ReservationDatePicker(props: ReservationDatePickerProps) {
  const { id, labelId, value, error, onChange } = props;
  const datePickerRef = useRef<DatePickerRef>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!isCalendarOpen) return;

    function handleCalendarEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      // Base UI dismisses Dialog and Sheet from a document-level Escape listener.
      // The picker is not a nested Base UI overlay, so it must consume this first Escape.
      event.preventDefault();
      event.stopImmediatePropagation();
      shouldRestoreFocusRef.current = true;
      datePickerRef.current?.closeCalendar();
    }

    document.addEventListener("keydown", handleCalendarEscape, true);
    return () => document.removeEventListener("keydown", handleCalendarEscape, true);
  }, [isCalendarOpen]);

  function handleCalendarOpen() {
    setIsCalendarOpen(true);
  }

  function handleCalendarClose() {
    setIsCalendarOpen(false);
    if (!shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className="flex flex-col gap-2" data-invalid={error ? true : undefined}>
      <Label id={labelId}>
        تاریخ رزرو <span aria-hidden="true">*</span>
      </Label>
      <DatePicker
        ref={datePickerRef}
        id={id}
        value={value ? getJalaliDatePickerValue(value) : undefined}
        calendar={persian}
        locale={persianFa}
        format="YYYY/MM/DD"
        editable={false}
        inputMode="none"
        calendarPosition="bottom-right"
        onOpen={handleCalendarOpen}
        onClose={handleCalendarClose}
        onChange={(nextValue) => onChange(getCanonicalGregorianDate(nextValue) ?? "")}
        render={(displayValue, openCalendar) => (
          <Button
            type="button"
            ref={triggerRef}
            variant="outline"
            className="w-full justify-between font-normal"
            aria-label="انتخاب تاریخ رزرو"
            aria-labelledby={labelId}
            aria-haspopup="dialog"
            aria-describedby={error ? `${id}-error` : undefined}
            onClick={openCalendar}
          >
            <span>{displayValue || "تاریخ رزرو را انتخاب کنید"}</span>
            <CalendarDaysIcon data-icon="inline-end" />
          </Button>
        )}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
