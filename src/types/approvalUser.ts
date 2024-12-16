import { Approval } from "./approval";
import { User } from "./user";

export interface ApprovalUser {
  id_approval?: number;
  id_user?: number;

  approval?: Approval;
  user?: User;
}

export interface ApprovalUserRequest {
  id_approval?: number;
  id_user?: number[];
}
