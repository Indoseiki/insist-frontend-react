import { ItemCategory } from "./itemCategory";
import { UoM } from "./uom";
import { User } from "./user";

export interface Item {
  id: number;
  id_item_category: number;
  id_uom: number | string;
  code: string;
  description: string;
  infor_code: string;
  infor_description: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  item_category?: ItemCategory;
  uom?: UoM;
  created_by?: User;
  updated_by?: User;
}

export interface ItemParams {
  idItemCategory?: number | null;
  categoryCode?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
