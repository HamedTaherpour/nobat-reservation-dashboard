import type { ReservationListSort, ReservationListStatusFilter } from "./reservation-list.types";

export const RESERVATIONS_PER_PAGE = 10;
export const SEARCH_DEBOUNCE_DELAY = 300;

export const ICON_SELECT_TRIGGER_CLASS =
  "size-8 !p-0 justify-center gap-0 [&>svg]:hidden data-[active=true]:!border-primary";
export const ACTIVE_STATUS_SELECT_TRIGGER_CLASS =
  "h-8 max-w-36 gap-1.5 px-2 [&>svg]:hidden data-[active=true]:!border-primary sm:max-w-none";

export const RESERVATION_STATUS_OPTIONS = [
  { value: "ALL", label: "همه رزروها" },
  { value: "PENDING", label: "در انتظار" },
  { value: "CONFIRMED", label: "تأییدشده" },
  { value: "CANCELLED", label: "لغوشده" },
] as const satisfies ReadonlyArray<{ value: ReservationListStatusFilter; label: string }>;

export const RESERVATION_SORT_OPTIONS = [
  { value: "NEWEST", label: "جدیدترین ابتدا" },
  { value: "OLDEST", label: "قدیمی‌ترین ابتدا" },
] as const satisfies ReadonlyArray<{ value: ReservationListSort; label: string }>;
