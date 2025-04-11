import { ItemCategory } from "./itemCategory";
import { User } from "./user";

export interface ItemSubCategory {
  id: number;
  id_item_category: number;
  code: string;
  description: string;
  remarks?: string;
  id_createdby: number;
  id_updatedby: number;
  created_at?: string;
  updated_at?: string;

  item_category?: ItemCategory;
  created_by?: User;
  updated_by?: User;
}

export interface ItemSubCategoryParams {
  idItemCategory?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
