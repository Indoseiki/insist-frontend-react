import { User } from "./user";

export interface Process {
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
}

export interface ProcessParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ProcessRequest {
  code?: string;
  description?: string;
  remarks?: string;
}
