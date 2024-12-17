import { Menu } from "./menu";
import { Role } from "./role";

export interface RolePermission {
  id_role?: number;
  id_menu?: number;
  is_create?: boolean;
  is_update?: boolean;
  is_delete?: boolean;

  role?: Role;
  menu?: Menu;
}

export interface RolePermissionRequest {
  id_role?: number;
  id_menu?: number;
  is_create?: boolean;
  is_update?: boolean;
  is_delete?: boolean;
}
