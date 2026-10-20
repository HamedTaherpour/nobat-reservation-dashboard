import { CalendarDaysIcon, Clock3Icon } from "lucide-react";
import React from "react";
import { formatGregorianDateAsJalali, formatTimeAsPersian } from "@/lib/date/date.utils";

import type { ReservationDateTimeProps } from "./reservation-list.types";

export function ReservationDateTime(props: ReservationDateTimeProps) {
  const { date, time } = props;

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDaysIcon aria-hidden="true" className="size-4" />
        <span>{formatGregorianDateAsJalali(date)}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3Icon aria-hidden="true" className="size-4" />
        <span>{formatTimeAsPersian(time)}</span>
      </span>
    </span>
  );
}
