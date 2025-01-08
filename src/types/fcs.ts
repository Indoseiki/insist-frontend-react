import { Building } from "./building";
import { User } from "./user";

export interface FCS {
  id: number;
  id_building?: number;
  code?: string;
  description?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  building?: Building;
}

export interface FCSParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface FCSRequest {
  id_building?: number;
  code?: string;
  description?: string;
  remarks?: string;
}
