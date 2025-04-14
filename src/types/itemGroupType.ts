import { ItemGroup } from "./itemGroup";
import { User } from "./user";

export interface ItemGroupType {
  id: number;
  id_item_group: number;
  code: string;
  description: string;
  remarks?: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;
  item_group?: ItemGroup;
  created_by?: User;
  updated_by?: User;
}

export interface ItemGroupTypeParams {
  idItemGroup?: string | null;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
