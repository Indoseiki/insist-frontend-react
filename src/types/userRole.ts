import { Role } from "./role";
import { User } from "./user";

export interface UserRole {
  id_user?: number;
  id_role?: number;

  user?: User;
  role?: Role;
}

export interface UserRoleParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface UserRoleRequest {
  id_role?: number[];
}
