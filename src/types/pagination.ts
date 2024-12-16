interface Pagination {
  current_page: number;
  next_page: number | null;
  total_pages: number;
  rows_per_page: number;
  total_rows: number;
  from: number;
  to: number;
}

export interface Result<T> {
  items: T;
  pagination: Pagination;
}
