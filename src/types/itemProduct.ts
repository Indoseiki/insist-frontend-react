import { ItemCategory } from "./itemCategory";
import { ItemSubCategory } from "./itemSubCategory";
import { User } from "./user";

export interface ItemProduct {
  id: number;
  id_item_category: number;
  id_item_sub_category?: number | null;
  code: string;
  description: string;
  remarks?: string;
  id_createdby: number;
  id_updatedby: number;
  created_at?: string;
  updated_at?: string;

  item_category?: ItemCategory;
  item_sub_category?: ItemSubCategory;
  created_by?: User;
  updated_by?: User;
}

export interface ItemProductParams {
  categoryCode?: string;
  subCategoryCode?: string;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
