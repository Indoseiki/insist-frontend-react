import { Dayjs } from "dayjs";
import { Currency } from "./currency";
import { User } from "./user";

export interface CurrencyRate {
  id: number;
  id_from_currency?: number | string;
  id_to_currency?: number | string;
  buy_rate?: number;
  sell_rate?: number;
  effective_date?: string | Dayjs;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  from_currency?: Currency;
  to_currency?: Currency;
  created_by?: User;
  updated_by?: User;
}

export interface CurrencyRateParams {
  idCurrency?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
