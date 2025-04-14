import { ItemCategory } from "./itemCategory";
import { User } from "./user";

export interface ItemProcess {
  id: number;
  id_item_category: number;
  code: string;
  description: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string | null;
  updated_at?: string | null;
  item_category?: ItemCategory;
  created_by?: User;
  updated_by?: User;
}

export interface ItemProcessParams {
  categoryCode?: string;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
