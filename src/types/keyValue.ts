import { User } from "./user";

export interface KeyValue {
  id: number;
  key?: string;
  value?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
}

export interface KeyValueParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface KeyValueRequest {
  idMenu?: number;
  key?: string;
  code?: string;
  description?: string;
  remarks?: string;
}
