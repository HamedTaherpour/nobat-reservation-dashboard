import {
  CalendarDaysIcon,
  Clock3Icon,
  ClipboardListIcon,
  FileTextIcon,
  PhoneIcon,
  UserRoundIcon,
} from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { formatGregorianDateAsJalali, formatTimeAsPersian } from "@/lib/date/date.utils";
import { cn } from "@/lib/utils";
import { getServiceLabel } from "../domain/reservation.utils";
import { ReservationStatusBadge } from "./reservation-status-badge";
import type { DetailItemProps, ReservationDetailsProps } from "./reservation-details.types";

function DetailItem(props: DetailItemProps) {
  const { icon: Icon, label, children, className } = props;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        {label}
      </dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </div>
  );
}

export function ReservationDetails(props: ReservationDetailsProps) {
  const { reservation, children } = props;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <h2 className="text-base font-semibold">{reservation.customerName}</h2>
        <ReservationStatusBadge status={reservation.status} />
      </header>
      <dl className="flex flex-col gap-4 text-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <DetailItem icon={UserRoundIcon} label="نام مشتری">
            {reservation.customerName}
          </DetailItem>
          <DetailItem icon={PhoneIcon} label="شماره موبایل">
            <bdi dir="ltr">{reservation.customerPhone}</bdi>
          </DetailItem>
        </div>
        <Separator />
        <div>
          <DetailItem icon={ClipboardListIcon} label="خدمت">
            {getServiceLabel(reservation.service)}
          </DetailItem>
        </div>
        <Separator />
        <div className="grid gap-5 sm:grid-cols-2">
          <DetailItem icon={CalendarDaysIcon} label="تاریخ رزرو">
            {formatGregorianDateAsJalali(reservation.date)}
          </DetailItem>
          <DetailItem icon={Clock3Icon} label="ساعت رزرو">
            {formatTimeAsPersian(reservation.time)}
          </DetailItem>
        </div>
        <Separator />
        <div>
          <DetailItem icon={FileTextIcon} label="یادداشت">
            {reservation.notes || "یادداشتی برای این رزرو ثبت نشده است."}
          </DetailItem>
        </div>
      </dl>
      {children}
    </div>
  );
}
