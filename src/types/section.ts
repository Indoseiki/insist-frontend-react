import { FCS } from "./fcs";
import { User } from "./user";

export interface Section {
  id: number;
  id_fcs: number;
  code?: string;
  description?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  fcs?: FCS;
}

export interface SectionParams {
  page: number;
  rows: string;
  id_fcs?: string | null;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface SectionRequest {
  id_fcs: number;
  code?: string;
  description?: string;
  remarks?: string;
}
