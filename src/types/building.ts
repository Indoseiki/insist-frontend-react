import { User } from "./user";

export interface Building {
  id: number;
  code?: string;
  description?: string;
  plant?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
}

export interface BuildingParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface BuildingRequest {
  code?: string;
  description?: string;
  plant?: string;
  remarks?: string;
}
