import { Approval } from "./approval";
import { User } from "./user";

export interface ApprovalHistory {
  id: number;
  id_approval: number;
  ref_table: string;
  ref_id: number;
  key: string;
  message: string;
  id_createdby?: number;
  created_at?: Date;

  approval?: Approval;
  created_by?: User;
}

export interface ApprovalHistoryParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ApprovalHistoryByRefParams {
  ref_table: string;
}

export interface ViewApprovalNotification {
  id: number;
  menu_name: string;
  menu_path: string;
  ref_table: string;
  ref_id: number;
  key: string;
  message: string;
  approval_id: number;
  current_level: number;
  status: string;
  action: string;
  current_approver_id?: number;
  current_approver_name?: string;
  next_approval_id?: number;
  next_level?: number;
  next_id_user?: number;
  next_approval_name?: string;
  next_action?: string;
  next_status?: string;
}
