import { User } from "./user";

export interface BillingTerm {
  id: number;
  code: string;
  description: string;
  due_days?: number;
  discount_days?: number;
  is_cash_only?: boolean;
  prox_due_day?: number;
  prox_discount_day?: number;
  prox_months_forward?: number;
  prox_discount_months_forward?: number;
  cutoff_day?: number;
  discount_percent?: number;
  holiday_offset_method?: string;
  is_advanced_terms?: boolean;
  prox_code?: number;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
}

export interface BillingTermParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
