import { ApprovalUser } from "./approvalUser";
import { Menu } from "./menu";
import { User } from "./user";

export interface Approval {
  id: number;
  id_menu?: number;
  status?: string;
  action?: string;
  count?: number;
  level?: number;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
  menu?: Menu;
  approval_users?: ApprovalUser[];
}

export interface ApprovalRequest {
  id?: number;
  id_menu?: number;
  status?: string;
  action?: string;
  count?: number;
  level?: number;
}
