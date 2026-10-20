import type { ReactNode } from "react";

import type { AppTableColumn, AppTableProps } from "../app-table/app-table.types";

export type ResponsiveTableProps<TData> = Omit<AppTableProps<TData>, "className"> & {
  className?: string;
  renderMobileRow: (row: TData, index: number) => ReactNode;
  mobileLabel?: string;
};

export type { AppTableColumn };
