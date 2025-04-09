import { ChartOfAccount } from "./chartOfAccount";
import { Currency } from "./currency";
import { User } from "./user";

export interface Bank {
  id: number;
  code: string;
  name: string;
  account_num: string;
  id_account: number | string;
  id_currency: number | string;
  bic?: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  account?: ChartOfAccount;
  currency?: Currency;
  created_by?: User;
  updated_by?: User;
}

export interface BankParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
