import { Department } from "./department";
import { UserRole } from "./userRole";

export interface User {
  id: number;
  id_dept?: number;
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  refresh_token?: string;
  otp_key?: string;
  otp_url?: string;
  is_active?: boolean;
  is_two_fa?: boolean;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  dept?: Department;
  created_by?: User;
  updated_by?: User;
  user_roles?: UserRole[];
}

export interface UserParams {
  page: number;
  rows: string;
  search?: string;
  idDept?: string | null;
  isActive?: string | null;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface UserRequest {
  id_dept?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  is_active: boolean;
  is_two_fa: boolean;
}
