import { RoleMenu } from "./roleMenu";
import { RolePermission } from "./rolePermission";
import { User } from "./user";

export interface Role {
  id: number;
  name?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  role_menus?: RoleMenu[];
  role_permissions?: RolePermission[];
}

export interface RoleParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface RoleRequest {
  name?: string;
}
