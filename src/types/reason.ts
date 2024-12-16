import { Menu } from "./menu";
import { User } from "./user";

export interface Reason {
  id: number;
  id_menu?: number;
  key?: string;
  code?: string;
  description?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  menu?: Menu;
  created_by?: User;
  updated_by?: User;
}

export interface ReasonParams {
  page: number;
  rows: string;
  search?: string;
  id_menu?: string | null;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ReasonRequest {
  idMenu?: number;
  key?: string;
  code?: string;
  description?: string;
  remarks?: string;
}
