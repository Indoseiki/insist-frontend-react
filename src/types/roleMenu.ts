import { Menu } from "./menu";
import { Role } from "./role";

export interface RoleMenu {
  id_role?: number;
  id_menu?: number;

  role?: Role;
  menu?: Menu;
}

export interface RoleMenuParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface RoleMenuRequest {
  id_menu?: number[];
}
