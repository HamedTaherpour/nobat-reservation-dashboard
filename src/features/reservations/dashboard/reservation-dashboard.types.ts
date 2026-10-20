import type { LucideIcon } from "lucide-react";
import type { ReservationMetrics } from "../domain/reservation.utils";

export type ReservationStatistic = {
  key: keyof ReservationMetrics;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type ReservationStatisticsProps = {
  metrics: ReservationMetrics;
};

export type ReservationStatisticCardProps = {
  statistic: ReservationStatistic;
  value: number;
  compact?: boolean;
};
