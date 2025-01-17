import { User } from "./user";
import { Warehouse } from "./warehouse";

export interface Location {
  id: number;
  id_warehouse?: number;
  location?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  warehouse?: Warehouse;
}

export interface LocationParams {
  page: number;
  rows: string;
  id_warehouse?: string | null;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface LocationRequest {
  id_warehouse?: number;
  location?: string;
  remarks?: string;
}
