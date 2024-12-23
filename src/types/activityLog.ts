import { User } from "./user";

export interface ActivityLog {
  id: number;
  id_user?: number;
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
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ActivityLogRequest {
  action?: string;
  is_success?: boolean;
  message?: string;
  user_agent?: string;
  os?: string;
}
