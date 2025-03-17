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
