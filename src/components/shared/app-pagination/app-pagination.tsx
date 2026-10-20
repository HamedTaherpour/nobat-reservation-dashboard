import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

import type { AppPaginationProps } from "./app-pagination.types";

function AppPagination(props: AppPaginationProps) {
  const { currentPage, totalPages, onPageChange, ariaLabel = "صفحه‌بندی" } = props;

  return (
    <Pagination aria-label={ariaLabel} className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <Button
            aria-label="صفحه قبل"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            size="icon"
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button aria-current="page" size="icon" variant="outline">
            {currentPage}
          </Button>
        </PaginationItem>
        <PaginationItem>
          <Button
            aria-label="صفحه بعد"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            size="icon"
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { AppPagination };
