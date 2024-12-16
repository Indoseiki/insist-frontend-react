export interface StateTable<T> {
  activePage: number;
  rowsPerPage: string;
  selected: T | null;
  sortBy: string | null;
  sortDirection: boolean;
}
