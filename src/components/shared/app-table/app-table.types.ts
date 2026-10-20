import type { ReactNode } from "react";

/**
 * A presentational column definition. Data operations such as sorting and
 * filtering belong to the caller, before data is passed to AppTable.
 */
export type AppTableColumn<TData> = {
  id: string;
  header: ReactNode | ((column: AppTableColumn<TData>) => ReactNode);
  accessorKey?: keyof TData;
  accessor?: (row: TData) => ReactNode;
  cell?: (row: TData, index: number) => ReactNode;
};

export type AppTableProps<TData> = {
  columns: readonly AppTableColumn<TData>[];
  data: readonly TData[];
  getRowId: (row: TData, index: number) => string;
  caption?: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRowCount?: number;
  loadingLabel?: string;
  className?: string;
};

/**
 * Rows are intentionally not keyboard-interactive. If a row needs an action,
 * render a real button or link from a column's `cell` function instead.
 */
