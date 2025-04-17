import { Item } from "./item";
import { ItemGroupType } from "./itemGroupType";
import { ItemProcess } from "./itemProcess";
import { ItemProductType } from "./itemProductType";
import { ItemSource } from "./itemSource";
import { ItemSurface } from "./itemSurface";
import { User } from "./user";

export interface ItemRawMaterial {
  id: number;
  id_item: number | string;
  id_item_product_type: number | string;
  id_item_group_type: number | string;
  id_item_process: number | string;
  id_item_surface: number | string;
  id_item_source: number | string;
  diameter_size: string;
  length_size: string;
  inner_diameter_size: string;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  item?: Item;
  item_product_type?: ItemProductType;
  item_group_type?: ItemGroupType;
  item_process?: ItemProcess;
  item_surface?: ItemSurface;
  item_source?: ItemSource;
  created_by?: User;
  updated_by?: User;
}

export interface ItemRawMaterialParams {
  categoryCode: string;
  page: number;
  rows: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}
