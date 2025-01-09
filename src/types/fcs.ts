import { FCSBuilding } from "./fcsBuilding";
import { User } from "./user";

export interface FCS {
  id: number;
  code?: string;
  description?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  buildings?: FCSBuilding[];
}

export interface FCSParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface FCSRequest {
  code?: string;
  description?: string;
  remarks?: string;
}
