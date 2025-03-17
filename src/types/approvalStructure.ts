export interface ApprovalStructureParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface ApprovalStructureByMenuParams {
  path?: string;
}

export interface ViewApprovalStructure {
  id_approval: number;
  id_user: number;
  path: string;
  name: string;
  count: number;
  action: string;
  status: string;
  level: number;
}
