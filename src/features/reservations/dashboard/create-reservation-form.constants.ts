import type { ReservationField, ReservationInput } from "../domain/reservation.types";

export const EMPTY_RESERVATION_FORM_VALUES: ReservationInput = {
  customerName: "",
  customerPhone: "",
  service: "",
  date: "",
  time: "",
  notes: "",
};

export const RESERVATION_FORM_FIELD_IDS: Record<ReservationField, string> = {
  customerName: "reservation-customer-name",
  customerPhone: "reservation-customer-phone",
  service: "reservation-service",
  date: "reservation-date",
  time: "reservation-time",
  notes: "reservation-notes",
};
