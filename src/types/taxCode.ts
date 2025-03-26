import { ChartOfAccount } from "./chartOfAccount";
import { User } from "./user";

export interface TaxCode {
  id: number;
  name: string;
  description: string;
  type: string;
  rate: number | string;
  include_price: boolean;
  include_discount: boolean;
  include_restock_fee: boolean;
  deductible: boolean;
  include_freight: boolean;
  include_duty: boolean;
  include_brokerage: boolean;
  include_insurance: boolean;
  include_local_freight: boolean;
  include_misc: boolean;
  include_surcharge: boolean;
  assess_on_return: boolean;
  include_tax_on_prev_system: boolean;
  id_account_ar: number | string;
  id_account_ar_process: number | string;
  id_account_ap: number | string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at: string;
  updated_at: string;

  account_ar?: ChartOfAccount;
  account_ar_process?: ChartOfAccount;
  account_ap?: ChartOfAccount;
  created_by?: User;
  updated_by?: User;
}
export interface TaxCodeParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
