import type { ReservationService, ReservationStatus, ServiceId } from "./reservation.types";

export const RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

export const RESERVATION_FIELDS = [
  "customerName",
  "customerPhone",
  "service",
  "date",
  "time",
  "notes",
] as const;

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "در انتظار تأیید",
  CONFIRMED: "تأیید شده",
  CANCELLED: "لغو شده",
};

export const RESERVATION_SERVICES = [
  { id: "HAIRCUT", label: "کوتاهی و اصلاح مو" },
  { id: "FACIAL", label: "پاکسازی پوست" },
  { id: "MASSAGE", label: "ماساژ آرامش‌بخش" },
  { id: "NAIL_CARE", label: "مراقبت و طراحی ناخن" },
  { id: "SKIN_CONSULTATION", label: "مشاوره تخصصی پوست" },
] as const satisfies readonly ReservationService[];

export const RESERVATION_SERVICE_IDS = RESERVATION_SERVICES.map(
  (service) => service.id,
) as readonly ServiceId[];

export const ALLOWED_STATUS_TRANSITIONS: Record<ReservationStatus, readonly ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
};

export const MAX_CUSTOMER_NAME_LENGTH = 100;
export const MAX_NOTES_LENGTH = 500;
