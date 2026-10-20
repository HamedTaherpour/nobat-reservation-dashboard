import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import type { ChangedValue } from "react-multi-date-picker";

export function getLocalGregorianDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMillisecondsUntilNextLocalMidnight(now = new Date()): number {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
}

export function formatGregorianDateAsJalali(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(localDate);
}

/** Converts a persisted Gregorian day into a Persian-calendar picker value without using UTC. */
export function getJalaliDatePickerValue(value: string): DateObject {
  return new DateObject({ date: value, format: "YYYY-MM-DD", calendar: gregorian }).convert(
    persian,
  );
}

/** Converts the picker selection back to the reservation domain's canonical Gregorian day. */
export function getCanonicalGregorianDate(value: ChangedValue): string | null {
  return value ? value.convert(gregorian, gregorianEn).format("YYYY-MM-DD") : null;
}

export function formatTimeAsPersian(value: string): string {
  return [...value]
    .map((character) =>
      /[0-9]/.test(character) ? Number(character).toLocaleString("fa-IR") : character,
    )
    .join("");
}
