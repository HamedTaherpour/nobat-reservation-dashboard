import { CalendarDaysIcon, CheckCircle2Icon, CircleXIcon, ClipboardListIcon } from "lucide-react";
import type { ReservationStatistic } from "./reservation-dashboard.types";

export const RESERVATION_STATISTICS = [
  {
    key: "total",
    label: "کل رزروها",
    description: "تمام نوبت‌های ثبت‌شده",
    icon: ClipboardListIcon,
  },
  {
    key: "today",
    label: "رزروهای امروز",
    description: "نوبت‌های برنامه‌ریزی‌شده برای امروز",
    icon: CalendarDaysIcon,
  },
  {
    key: "confirmed",
    label: "تأییدشده",
    description: "رزروهای تأییدشده",
    icon: CheckCircle2Icon,
  },
  {
    key: "cancelled",
    label: "لغوشده",
    description: "رزروهای لغوشده",
    icon: CircleXIcon,
  },
] as const satisfies readonly ReservationStatistic[];
