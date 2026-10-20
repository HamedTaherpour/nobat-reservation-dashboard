"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AppTable } from "../app-table";
import type { ResponsiveTableProps } from "./responsive-table.types";

function ResponsiveTable<TData>(props: ResponsiveTableProps<TData>) {
  const {
    className,
    renderMobileRow,
    mobileLabel = "فهرست داده‌ها",
    columns,
    data,
    getRowId,
    caption,
    emptyState,
    loading = false,
    loadingRowCount = 3,
    loadingLabel = "در حال بارگذاری",
  } = props;

  const safeLoadingRowCount = Math.max(1, loadingRowCount);

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:block">
        <AppTable
          columns={columns}
          data={data}
          getRowId={getRowId}
          caption={caption}
          emptyState={emptyState}
          loading={loading}
          loadingRowCount={loadingRowCount}
          loadingLabel={loadingLabel}
        />
      </div>
      <div className="md:hidden" aria-label={mobileLabel}>
        {loading ? (
          <>
            <span className="sr-only" role="status" aria-label={loadingLabel}>
              {loadingLabel}
            </span>
            <ul aria-busy="true" className="flex flex-col gap-3">
              {Array.from({ length: safeLoadingRowCount }, (_, index) => (
                <li key={`loading-${index}`} aria-hidden="true">
                  <Skeleton className="h-20 w-full" />
                </li>
              ))}
            </ul>
          </>
        ) : data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {data.map((row, index) => (
              <li key={getRowId(row, index)}>{renderMobileRow(row, index)}</li>
            ))}
          </ul>
        ) : (
          <div>{emptyState}</div>
        )}
      </div>
    </div>
  );
}

export { ResponsiveTable };
