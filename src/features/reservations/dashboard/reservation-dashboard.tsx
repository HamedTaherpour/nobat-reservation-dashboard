"use client";

import React, { useEffect, useState } from "react";
import {
  getLocalGregorianDate,
  getMillisecondsUntilNextLocalMidnight,
} from "@/lib/date/date.utils";
import { getReservationMetrics } from "../domain/reservation.utils";
import { useReservations } from "../hooks/use-reservations";
import { ReservationList } from "../list/reservation-list";
import { CreateReservationForm } from "./create-reservation-form";
import { ReservationStatistics } from "./reservation-statistics";
import { ReservationStatisticsSkeleton } from "./reservation-statistics-skeleton";

function useLocalGregorianDate(): string {
  const [localDate, setLocalDate] = useState(() => getLocalGregorianDate());

  useEffect(() => {
    let timeoutId: number | undefined;

    function refreshLocalDate() {
      setLocalDate((currentDate) => {
        const nextDate = getLocalGregorianDate();
        return currentDate === nextDate ? currentDate : nextDate;
      });
    }

    function scheduleNextMidnight() {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        refreshLocalDate();
        scheduleNextMidnight();
      }, getMillisecondsUntilNextLocalMidnight());
    }

    function handleFocus() {
      refreshLocalDate();
      scheduleNextMidnight();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      refreshLocalDate();
      scheduleNextMidnight();
    }

    scheduleNextMidnight();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return localDate;
}

export function ReservationDashboard() {
  const { reservations, isLoading, initializationError, create, updateStatus } = useReservations();
  const localDate = useLocalGregorianDate();
  const metrics = isLoading ? undefined : getReservationMetrics(reservations, localDate);

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">مدیریت رزرو</p>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">داشبورد نوبت</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                برنامه‌ریزی روزانه و وضعیت رزروهای مشتریان را از اینجا پیگیری کنید.
              </p>
            </div>
          </div>
          <CreateReservationForm createReservation={create} />
        </header>

        {metrics ? <ReservationStatistics metrics={metrics} /> : <ReservationStatisticsSkeleton />}

        <ReservationList
          reservations={reservations}
          isLoading={isLoading}
          notice={
            initializationError
              ? {
                  kind: "recoverable",
                  message:
                    "اطلاعات ذخیره‌شده در دسترس نبود؛ داده‌های قابل استفاده برای ادامه نمایش داده می‌شوند.",
                }
              : undefined
          }
          onUpdateStatus={updateStatus}
        />
      </div>
    </main>
  );
}
