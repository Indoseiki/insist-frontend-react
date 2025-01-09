import { Building } from "./building";
import { Section } from "./section";
import { User } from "./user";

export interface SubSection {
  id: number;
  id_section: number;
  id_building: number;
  code?: string;
  description?: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;

  section?: Section;
  building?: Building;
}

export interface SubSectionParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface SubSectionRequest {
  id_section: number;
  id_building: number;
  code?: string;
  description?: string;
  remarks?: string;
}
