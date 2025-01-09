import { Building } from "./building";
import { FCS } from "./fcs";

export interface FCSBuilding {
  id_fcs?: number;
  id_building?: number;

  fcs?: FCS;
  building?: Building;
}

export interface FCSBuildingParams {
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface FCSBuildingRequest {
  id_building?: number[];
}
