import { RESERVATION_FIELDS, RESERVATION_STATUSES } from "./reservation.constants";

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export type ReservationField = (typeof RESERVATION_FIELDS)[number];

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  service: ServiceId;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
};

export type ReservationInput = Omit<
  Reservation,
  "id" | "createdAt" | "customerPhone" | "service" | "status"
> & {
  customerPhone: string;
  service: string;
};

export type ReservationValidationErrors = Partial<Record<ReservationField, string[]>>;

export type ReservationValidationResult = {
  valid: boolean;
  errors: ReservationValidationErrors;
  normalizedPhone?: string;
  normalizedDate?: string;
  normalizedTime?: string;
};

export type ServiceId = "HAIRCUT" | "FACIAL" | "MASSAGE" | "NAIL_CARE" | "SKIN_CONSULTATION";

export type ReservationService = {
  id: ServiceId;
  label: string;
};
