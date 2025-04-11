import { ItemProduct } from "./itemProduct";
import { User } from "./user";

export interface ItemProductType {
  id: number;
  id_item_product: number;
  code: string;
  description: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  item_product?: ItemProduct;
  created_by?: User;
  updated_by?: User;
}

export interface ItemProductTypeParams {
  idItemProduct?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
