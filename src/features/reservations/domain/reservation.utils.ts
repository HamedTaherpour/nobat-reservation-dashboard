import {
  ALLOWED_STATUS_TRANSITIONS,
  MAX_CUSTOMER_NAME_LENGTH,
  MAX_NOTES_LENGTH,
  RESERVATION_SERVICES,
  RESERVATION_SERVICE_IDS,
  RESERVATION_STATUS_LABELS,
} from "./reservation.constants";
import type {
  Reservation,
  ReservationInput,
  ReservationStatus,
  ReservationValidationErrors,
  ReservationValidationResult,
  ServiceId,
} from "./reservation.types";

const DIGIT_MAP: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function toLatinDigits(value: string): string {
  return [...value].map((character) => DIGIT_MAP[character] ?? character).join("");
}

export function normalizeIranianPhone(value: string): string | null {
  const normalized = toLatinDigits(value)
    .trim()
    .replace(/[\s()-]/g, "");
  const canonical = normalized.startsWith("+98")
    ? `0${normalized.slice(3)}`
    : normalized.startsWith("0098")
      ? `0${normalized.slice(4)}`
      : normalized;

  return /^09\d{9}$/.test(canonical) ? canonical : null;
}

export function isValidIranianPhone(value: string): boolean {
  return normalizeIranianPhone(value) !== null;
}

export function isValidGregorianDate(value: string): boolean {
  return normalizeGregorianDate(value) !== null;
}

export function normalizeGregorianDate(value: string): string | null {
  const normalized = toLatinDigits(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? normalized
    : null;
}

export function isValid24HourTime(value: string): boolean {
  return normalize24HourTime(value) !== null;
}

export function normalize24HourTime(value: string): string | null {
  const normalized = toLatinDigits(value);
  const match = /^(\d{2}):(\d{2})$/.exec(normalized);
  if (!match) return null;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59 ? normalized : null;
}

export function isServiceId(value: string): value is ServiceId {
  return RESERVATION_SERVICE_IDS.includes(value as ServiceId);
}

export function getServiceLabel(serviceId: ServiceId): string {
  return RESERVATION_SERVICES.find((service) => service.id === serviceId)!.label;
}

export function isStatusTransitionAllowed(from: ReservationStatus, to: ReservationStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function getAvailableNextStatuses(status: ReservationStatus): readonly ReservationStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[status];
}

export function getReservationStatusLabel(status: ReservationStatus): string {
  return RESERVATION_STATUS_LABELS[status];
}

export function validateReservation(input: ReservationInput): ReservationValidationResult {
  const { customerName, customerPhone, service, date, time, notes } = input;
  const errors: ReservationValidationErrors = {};
  const name = customerName.trim();
  const normalizedPhone = normalizeIranianPhone(customerPhone);
  const normalizedDate = normalizeGregorianDate(date);
  const normalizedTime = normalize24HourTime(time);

  if (!name) errors.customerName = ["نام مشتری الزامی است."];
  else if (name.length > MAX_CUSTOMER_NAME_LENGTH)
    errors.customerName = [`نام مشتری نباید بیشتر از ${MAX_CUSTOMER_NAME_LENGTH} نویسه باشد.`];
  if (!normalizedPhone) errors.customerPhone = ["شماره موبایل ایران معتبر نیست."];
  if (!isServiceId(service)) errors.service = ["خدمت انتخاب‌شده معتبر نیست."];
  if (!normalizedDate) errors.date = ["تاریخ میلادی معتبر نیست."];
  if (!normalizedTime) errors.time = ["ساعت باید در قالب ۲۴ ساعته معتبر باشد."];
  if (notes && notes.length > MAX_NOTES_LENGTH)
    errors.notes = [`توضیحات نباید بیشتر از ${MAX_NOTES_LENGTH} نویسه باشد.`];

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    ...(normalizedPhone ? { normalizedPhone } : {}),
    ...(normalizedDate ? { normalizedDate } : {}),
    ...(normalizedTime ? { normalizedTime } : {}),
  };
}

export function compareReservationsByDateTime(a: Reservation, b: Reservation): number {
  return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`) || a.id.localeCompare(b.id);
}

export function compareReservationsByCreatedAt(a: Reservation, b: Reservation): number {
  const createdAtComparison = a.createdAt.localeCompare(b.createdAt);
  return createdAtComparison || a.id.localeCompare(b.id);
}

export function filterReservationsByStatus(
  reservations: readonly Reservation[],
  status: ReservationStatus,
): Reservation[] {
  return reservations.filter((reservation) => reservation.status === status);
}

export function searchReservationsByCustomerName(
  reservations: readonly Reservation[],
  query: string,
): Reservation[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("fa");
  if (!normalizedQuery) return [...reservations];
  const phoneQuery = toLatinDigits(normalizedQuery).replace(/[\s()-]/g, "");

  return reservations.filter(
    (reservation) =>
      reservation.customerName.toLocaleLowerCase("fa").includes(normalizedQuery) ||
      reservation.customerPhone.includes(phoneQuery),
  );
}

export type ReservationMetrics = {
  total: number;
  today: number;
  confirmed: number;
  cancelled: number;
};

export function getReservationMetrics(
  reservations: readonly Reservation[],
  referenceDate: string,
): ReservationMetrics {
  return {
    total: reservations.length,
    today: reservations.filter((reservation) => reservation.date === referenceDate).length,
    confirmed: reservations.filter((reservation) => reservation.status === "CONFIRMED").length,
    cancelled: reservations.filter((reservation) => reservation.status === "CANCELLED").length,
  };
}
