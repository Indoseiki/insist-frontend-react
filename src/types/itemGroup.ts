import { ItemProductType } from "./itemProductType";
import { User } from "./user";

export interface ItemGroup {
  id: number;
  id_item_product_type: number | string;
  code: string;
  description: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;
  item_product_type?: ItemProductType;
  created_by?: User;
  updated_by?: User;
}

export interface ItemGroupParams {
  categoryCode?: string;
  idProductType?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
