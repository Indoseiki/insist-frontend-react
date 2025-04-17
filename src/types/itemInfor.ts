export interface ItemInfor {
  code: string;
  description: string;
  uom: string;
}

export interface ItemInforParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
