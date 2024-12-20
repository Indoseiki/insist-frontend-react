import { Approval } from "./approval";
import { RolePermission } from "./rolePermission";
import { User } from "./user";

export interface Menu {
  id: number;
  label?: string;
  path?: string;
  id_parent?: number;
  icon?: string;
  sort?: number;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
  menu_approvals?: Approval[];
  parent?: Menu;
  children?: Menu[];
  role_permissions?: RolePermission;
}

export interface MenuParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface MenuRequest {
  label?: string;
  path?: string;
  id_parent?: number;
  icon?: string;
  sort?: number;
}
