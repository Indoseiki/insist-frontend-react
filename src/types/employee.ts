export interface Employee {
  number: string;
  name?: string;
  division?: string;
  department?: string;
  position?: string;
  is_active?: boolean;
  service?: string;
  education?: string;
  birthday?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
