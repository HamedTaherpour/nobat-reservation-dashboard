export type AppPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
};
