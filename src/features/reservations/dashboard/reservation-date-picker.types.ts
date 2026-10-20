export type ReservationDatePickerProps = {
  id: string;
  labelId: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
