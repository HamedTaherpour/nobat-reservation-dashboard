"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { AppTableColumn, AppTableProps } from "./app-table.types";

function getCellValue<TData>(column: AppTableColumn<TData>, row: TData): React.ReactNode {
  if (column.accessor) return column.accessor(row);
  if (column.accessorKey) {
    const value = row[column.accessorKey];
    return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
      ? value
      : React.isValidElement(value)
        ? value
        : null;
  }
  return null;
}

function renderHeader<TData>(column: AppTableColumn<TData>) {
  return typeof column.header === "function" ? column.header(column) : column.header;
}

function AppTable<TData>(props: AppTableProps<TData>) {
  const {
    columns,
    data,
    getRowId,
    caption,
    emptyState,
    loading = false,
    loadingRowCount = 3,
    loadingLabel = "در حال بارگذاری",
    className,
  } = props;

  const safeLoadingRowCount = Math.max(1, loadingRowCount);

  return (
    <div className={cn("w-full", className)}>
      {loading ? (
        <span className="sr-only" role="status" aria-label={loadingLabel}>
          {loadingLabel}
        </span>
      ) : null}
      <Table aria-busy={loading}>
        {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} scope="col">
                {renderHeader(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: safeLoadingRowCount }, (_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`} aria-hidden="true">
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length > 0 ? (
            data.map((row, index) => {
              const rowId = getRowId(row, index);

              return (
                <TableRow key={rowId} data-row-id={rowId}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell ? column.cell(row, index) : getCellValue(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={Math.max(columns.length, 1)} className="h-24 text-center">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { AppTable };
