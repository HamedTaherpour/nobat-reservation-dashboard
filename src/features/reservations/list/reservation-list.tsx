"use client";

import { ArrowDownUpIcon, FunnelIcon, SearchIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppAlert } from "@/components/shared/app-alert";
import { AppEmpty } from "@/components/shared/app-empty";
import { AppInput } from "@/components/shared/app-input";
import { AppPagination } from "@/components/shared/app-pagination";
import { AppSelect } from "@/components/shared/app-select";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import {
  compareReservationsByDateTime,
  filterReservationsByStatus,
  getAvailableNextStatuses,
  getReservationStatusLabel,
  searchReservationsByCustomerName,
} from "../domain/reservation.utils";
import type { ReservationStatus } from "../domain/reservation.types";
import { getReservationColumns } from "./reservation-columns";
import { ReservationDetails } from "./reservation-details";
import { ReservationMobileCard } from "./reservation-mobile-card";
import {
  ACTIVE_STATUS_SELECT_TRIGGER_CLASS,
  ICON_SELECT_TRIGGER_CLASS,
  RESERVATIONS_PER_PAGE,
  RESERVATION_SORT_OPTIONS,
  RESERVATION_STATUS_OPTIONS,
  SEARCH_DEBOUNCE_DELAY,
} from "./reservation-list.constants";
import type {
  ReservationListProps,
  ReservationListViewDetailsParams,
  ReservationListSort,
  ReservationListStatusFilter,
} from "./reservation-list.types";

function getStatusUpdateErrorMessage(reason: string) {
  if (reason === "STORAGE_UNAVAILABLE") return "فضای ذخیره‌سازی مرورگر در دسترس نیست.";
  if (reason === "STORAGE_WRITE") return "ذخیره‌سازی تغییر وضعیت انجام نشد. لطفاً دوباره تلاش کنید.";
  if (reason === "NOT_READY") return "اطلاعات رزروها هنوز آماده نشده است. لطفاً دوباره تلاش کنید.";
  if (reason === "INVALID_TRANSITION") return "تغییر وضعیت این رزرو مجاز نیست.";
  return "تغییر وضعیت رزرو انجام نشد. لطفاً دوباره تلاش کنید.";
}

export function ReservationList(props: ReservationListProps) {
  const {
    reservations,
    isLoading,
    notice,
    onUpdateStatus = () => ({ ok: false, reason: "NOT_READY" }),
  } = props;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationListStatusFilter>("ALL");
  const [sort, setSort] = useState<ReservationListSort>("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservationId, setSelectedReservationId] = useState<string>();
  const [isCancellationConfirmationOpen, setIsCancellationConfirmationOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<ReservationStatus>();
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string>();
  const previousReservationCount = useRef(reservations.length);
  const statusUpdateInProgress = useRef(false);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_DELAY);

  useEffect(() => {
    const hasNewReservation = reservations.length > previousReservationCount.current;
    previousReservationCount.current = reservations.length;

    if (hasNewReservation && sort === "NEWEST" && statusFilter === "ALL" && !debouncedQuery) {
      setCurrentPage(1);
    }
  }, [debouncedQuery, reservations.length, sort, statusFilter]);

  const searchedReservations = searchReservationsByCustomerName(reservations, debouncedQuery);
  const filteredReservations =
    statusFilter === "ALL"
      ? searchedReservations
      : filterReservationsByStatus(searchedReservations, statusFilter);
  const displayedReservations = filteredReservations.sort((first, second) =>
    sort === "NEWEST"
      ? compareReservationsByDateTime(second, first)
      : compareReservationsByDateTime(first, second),
  );
  const totalPages = Math.ceil(displayedReservations.length / RESERVATIONS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));

  // Keep a page request that becomes invalid from returning if the collection grows later.
  if (page !== currentPage) setCurrentPage(page);

  const pageStart = (page - 1) * RESERVATIONS_PER_PAGE;
  const paginatedReservations = displayedReservations.slice(
    pageStart,
    pageStart + RESERVATIONS_PER_PAGE,
  );
  const hasNoReservations = !isLoading && reservations.length === 0;
  const hasNoResults = !isLoading && !hasNoReservations && displayedReservations.length === 0;
  const activeStatusLabel = RESERVATION_STATUS_OPTIONS.find(
    (option) => option.value === statusFilter,
  )?.label;
  const activeSortLabel = RESERVATION_SORT_OPTIONS.find((option) => option.value === sort)?.label;
  const selectedReservation = reservations.find(
    (reservation) => reservation.id === selectedReservationId,
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(value: string | null) {
    if (value === null || !RESERVATION_STATUS_OPTIONS.some((option) => option.value === value)) {
      return;
    }
    setStatusFilter(value as ReservationListStatusFilter);
    setCurrentPage(1);
  }

  function handleSortChange(value: string | null) {
    if (value === null || !RESERVATION_SORT_OPTIONS.some((option) => option.value === value)) {
      return;
    }
    setSort(value as ReservationListSort);
    setCurrentPage(1);
  }

  function handleResetFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  }

  function handleViewDetails(reservation: ReservationListViewDetailsParams) {
    setStatusUpdateError(undefined);
    setIsCancellationConfirmationOpen(false);
    setSelectedNextStatus(undefined);
    setSelectedReservationId(reservation.id);
  }

  function handleDetailsOpenChange(open: boolean) {
    if (open) return;
    setSelectedReservationId(undefined);
    setIsCancellationConfirmationOpen(false);
    setSelectedNextStatus(undefined);
    setStatusUpdateError(undefined);
  }

  function applyStatus(status: ReservationStatus) {
    if (!selectedReservation || statusUpdateInProgress.current) return;
    statusUpdateInProgress.current = true;
    setIsSubmittingStatus(true);
    setStatusUpdateError(undefined);
    const result = onUpdateStatus(selectedReservation.id, status);
    statusUpdateInProgress.current = false;
    setIsSubmittingStatus(false);

    if (!result.ok) {
      setStatusUpdateError(getStatusUpdateErrorMessage(result.reason));
      return;
    }

    setSelectedNextStatus(undefined);
    toast.success(status === "CONFIRMED" ? "رزرو با موفقیت تأیید شد." : "رزرو با موفقیت لغو شد.");
  }

  function handleApplyStatus() {
    if (!selectedNextStatus || isSubmittingStatus) return;
    if (selectedNextStatus === "CANCELLED") {
      setIsCancellationConfirmationOpen(true);
      return;
    }
    applyStatus(selectedNextStatus);
  }

  function handleCancelStatus() {
    if (selectedNextStatus !== "CANCELLED") return;
    applyStatus(selectedNextStatus);
    setIsCancellationConfirmationOpen(false);
  }

  const nextStatuses = selectedReservation
    ? getAvailableNextStatuses(selectedReservation.status)
    : [];
  const statusManagement =
    selectedReservation && nextStatuses.length > 0 && !isCancellationConfirmationOpen ? (
      <section
        aria-labelledby="reservation-status-management"
        className="flex flex-col gap-3 border-t border-border pt-4"
      >
        <h3 id="reservation-status-management" className="text-sm font-semibold">
          مدیریت وضعیت رزرو
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AppSelect
            options={nextStatuses.map((status) => ({
              value: status,
              label: getReservationStatusLabel(status),
            }))}
            value={selectedNextStatus ?? ""}
            onValueChange={(value) =>
              setSelectedNextStatus(value === null ? undefined : (value as ReservationStatus))
            }
            placeholder="وضعیت جدید را انتخاب کنید"
            triggerClassName="w-full sm:flex-1"
            triggerProps={{ "aria-label": "وضعیت جدید" }}
          />
          <Button disabled={!selectedNextStatus || isSubmittingStatus} onClick={handleApplyStatus}>
            ثبت تغییر وضعیت
          </Button>
        </div>
      </section>
    ) : null;

  if (notice?.kind === "fatal") {
    return (
      <section aria-labelledby="upcoming-reservations-title">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle id="upcoming-reservations-title">فهرست رزروهای پیش‌رو</CardTitle>
          </CardHeader>
          <CardContent>
            <AppAlert
              variant="error"
              role="alert"
              title="دریافت فهرست رزروها ناموفق بود"
              message={notice.message}
            />
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="upcoming-reservations-title">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle id="upcoming-reservations-title">فهرست رزروهای پیش‌رو</CardTitle>
          <CardDescription>رزروها را بر اساس نام، شماره تماس و وضعیت پیگیری کنید.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {notice?.kind === "recoverable" ? (
            <AppAlert
              variant="warning"
              role="alert"
              title="داده‌های رزرو بازیابی شد"
              message={notice.message}
            />
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="relative w-full md:w-80">
              <AppInput
                className="ps-9"
                label="جستجوی رزروها"
                placeholder="نام یا شماره موبایل"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
              />
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 start-2.5 size-4 text-muted-foreground"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end md:self-auto">
              <AppSelect
                options={RESERVATION_STATUS_OPTIONS}
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
                icon={<FunnelIcon aria-hidden="true" />}
                active={statusFilter !== "ALL"}
                triggerClassName={
                  statusFilter === "ALL"
                    ? ICON_SELECT_TRIGGER_CLASS
                    : ACTIVE_STATUS_SELECT_TRIGGER_CLASS
                }
                valueClassName={statusFilter === "ALL" ? "sr-only" : "truncate"}
                triggerProps={{
                  "aria-label": `فیلتر وضعیت رزروها${statusFilter !== "ALL" ? `: ${activeStatusLabel}` : ""}`,
                }}
                tooltip="فیلتر وضعیت رزروها"
                contentProps={{ align: "end", alignItemWithTrigger: false }}
              />

              <AppSelect
                options={RESERVATION_SORT_OPTIONS}
                value={sort}
                onValueChange={handleSortChange}
                icon={<ArrowDownUpIcon />}
                active={sort !== "NEWEST"}
                triggerClassName={ICON_SELECT_TRIGGER_CLASS}
                valueClassName="sr-only"
                triggerProps={{
                  "aria-label": `مرتب‌سازی رزروها: ${activeSortLabel}`,
                }}
                tooltip="مرتب‌سازی رزروها"
                contentProps={{ align: "end", alignItemWithTrigger: false }}
              />
            </div>
          </div>

          {hasNoReservations ? (
            <AppEmpty
              icon={<SearchIcon aria-hidden="true" />}
              title="هنوز رزروی ثبت نشده است"
              description="با ثبت اولین رزرو، فهرست آن در این بخش نمایش داده می‌شود."
            />
          ) : (
            <ResponsiveTable
              columns={getReservationColumns(handleViewDetails)}
              data={paginatedReservations}
              getRowId={(reservation) => reservation.id}
              caption="فهرست رزروهای پیش‌رو"
              loading={isLoading}
              loadingLabel="در حال دریافت فهرست رزروها"
              mobileLabel="فهرست رزروها در موبایل"
              emptyState={
                hasNoResults ? (
                  <AppEmpty
                    icon={<SearchIcon aria-hidden="true" />}
                    title="رزروی مطابق جستجو پیدا نشد"
                    description="جستجو یا فیلتر وضعیت را تغییر دهید."
                    action={
                      <Button variant="outline" onClick={handleResetFilters}>
                        حذف جستجو و فیلتر
                      </Button>
                    }
                  />
                ) : null
              }
              renderMobileRow={(reservation) => (
                <ReservationMobileCard
                  reservation={reservation}
                  onViewDetails={handleViewDetails}
                />
              )}
            />
          )}

          {!isLoading && totalPages > 0 ? (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                صفحه {page} از {totalPages}
              </p>
              <AppPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                ariaLabel="صفحه‌بندی رزروها"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
      {selectedReservation ? (
        <ResponsiveDialog
          open
          onOpenChange={handleDetailsOpenChange}
          title={isCancellationConfirmationOpen ? "تأیید لغو رزرو" : "جزئیات رزرو"}
          description={
            isCancellationConfirmationOpen
              ? `آیا از لغو رزرو ${selectedReservation.customerName} مطمئن هستید؟`
              : "اطلاعات رزرو و گزینه‌های مدیریت وضعیت را بررسی کنید."
          }
          footer={
            isCancellationConfirmationOpen ? (
              <>
                <Button variant="outline" onClick={() => setIsCancellationConfirmationOpen(false)}>
                  بازگشت
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelStatus}
                  disabled={isSubmittingStatus}
                >
                  تأیید لغو رزرو
                </Button>
              </>
            ) : undefined
          }
        >
          {isCancellationConfirmationOpen ? (
            <p>
              رزرو <strong>{selectedReservation.customerName}</strong> لغو خواهد شد و پس از آن امکان
              تغییر وضعیت ندارد.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {statusUpdateError ? (
                <p role="alert" className="text-sm text-destructive">
                  {statusUpdateError}
                </p>
              ) : null}
              <ReservationDetails reservation={selectedReservation}>
                {statusManagement}
              </ReservationDetails>
            </div>
          )}
        </ResponsiveDialog>
      ) : null}
    </section>
  );
}
