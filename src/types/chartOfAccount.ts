import { User } from "./user";

export interface ChartOfAccount {
  id: number;
  account: number;
  description?: string;
  type?: string;
  class?: string;
  exchange_rate_type?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
}

export interface ChartOfAccountParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
