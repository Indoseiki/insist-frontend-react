import { User } from "./user";

export interface ActivityLog {
  id: number;
  id_user?: number;
  username?: string;
  ip_address?: string;
  action?: string;
  is_success?: boolean;
  message?: string;
  user_agent?: string;
  os?: string;
  created_at?: string;
  user?: User;
}

export interface ActivityLogParams {
  page: number;
  rows: string;
  search?: string;
  action?: string | null;
  isSuccess?: string | null;
  rangeDate?: string | null;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ActivityLogRequest {
  username?: string;
  action?: string;
  is_success?: boolean;
  message?: string;
  user_agent?: string;
  os?: string;
}
