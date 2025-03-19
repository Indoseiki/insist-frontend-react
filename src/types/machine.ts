import { Reason } from "./reason";
import { UoM } from "./uom";
import { User } from "./user";

export interface Machine {
  id: number;
  id_createdby?: number;
  id_updatedby?: number;
  created_at?: string;
  updated_at?: string;

  created_by?: User;
  updated_by?: User;
}

export interface MachineDetail {
  id: number;
  id_machine: number;
  rev_no: number;
  code: string;
  code_old?: string;
  asset_num: string;
  asset_num_old?: string;
  description: string;
  name: string;
  maker: string;
  power: number;
  id_power_uom: number;
  electricity: number;
  id_electricity_uom: number;
  cavity: number;
  lubricant: string;
  lubricant_capacity: number;
  id_lubricant_uom: number;
  sliding: string;
  sliding_capacity: number;
  id_sliding_uom: number;
  coolant: string;
  coolant_capacity: number;
  id_coolant_uom: number;
  hydraulic: string;
  hydraulic_capacity: number;
  id_hydraulic_uom: number;
  dimension_front: number;
  id_dimension_front_uom: number;
  dimension_side: number;
  id_dimension_side_uom: number;
  id_createdby: number;
  id_updatedby: number;
  created_at?: string;
  updated_at?: string;

  machine?: Machine;
  power_uom?: UoM;
  electricity_uom?: UoM;
  lubricant_uom?: UoM;
  sliding_uom?: UoM;
  coolant_uom?: UoM;
  hydraulic_uom?: UoM;
  dimension_front_uom?: UoM;
  dimension_side_uom?: UoM;
  created_by?: User;
  updated_by?: User;
}

export interface MachineStatus {
  id: number;
  id_machine: number;
  id_reason: number;
  remarks?: string;
  id_createdby: number;
  id_updatedby: number;
  created_at?: string;
  updated_at?: string;

  machine?: Machine;
  reason?: Reason;
  created_by?: User;
  updated_by?: User;
}

export interface ViewMachine {
  id: number;
  id_createdby: number;
  machine_createdby_name: string;
  id_updatedby: number;
  machine_updatedby_name: string;
  machine_created_at: string;
  machine_updated_at: string;
  detail_id: number;
  rev_no: number;
  code: string;
  code_old: string;
  asset_num: string;
  asset_num_old: string;
  description: string;
  name: string;
  maker: string;
  power: number;
  id_power_uom: number;
  power_uom_code: string;
  power_uom_description: string;
  electricity: number;
  id_electricity_uom: number;
  electricity_uom_code: string;
  electricity_uom_description: string;
  cavity: number;
  lubricant: string;
  lubricant_capacity: number;
  id_lubricant_uom: number;
  lubricant_uom_code: string;
  lubricant_uom_description: string;
  sliding: string;
  sliding_capacity: number;
  id_sliding_uom: number;
  sliding_uom_code: string;
  sliding_uom_description: string;
  coolant: string;
  coolant_capacity: number;
  id_coolant_uom: number;
  coolant_uom_code: string;
  coolant_uom_description: string;
  hydraulic: string;
  hydraulic_capacity: number;
  id_hydraulic_uom: number;
  hydraulic_uom_code: string;
  hydraulic_uom_description: string;
  dimension_front: number;
  id_dimension_front_uom: number;
  dimension_front_uom_code: string;
  dimension_front_uom_description: string;
  dimension_side: number;
  id_dimension_side_uom: number;
  dimension_side_uom_code: string;
  dimension_side_uom_description: string;
  detail_id_createdby: number;
  detail_createdby_name: string;
  detail_id_updatedby: number;
  detail_updatedby_name: string;
  detail_created_at: string;
  detail_updated_at: string;
  id_reason: number;
  remarks: string;
  status_created_at: string;
  status_updated_at: string;
  reason_key: string;
  reason_code: string;
  reason_description: string;
  reason_remarks: string;
  approval_id: number;
  ref_table: string;
  ref_id: number;
  approval_key: string;
  approval_message: string;
  approval_createdby: number;
  approval_createdby_name: string;
  approval_created_at: string;
  approval_status: string;
  approval_action: string;
  approval_count: number;
  approval_level: number;
}

export interface ViewMachineDetail {
  id: number;
  id_machine: number;
  rev_no: number;
  code: string;
  code_old: string;
  asset_num: string;
  asset_num_old: string;
  description: string;
  name: string;
  maker: string;
  power: number;
  id_power_uom: number;
  power_uom_code: string;
  power_uom_description: string;
  electricity: number;
  id_electricity_uom: number;
  electricity_uom_code: string;
  electricity_uom_description: string;
  cavity: number;
  lubricant: string;
  lubricant_capacity: number;
  id_lubricant_uom: number;
  lubricant_uom_code: string;
  lubricant_uom_description: string;
  sliding: string;
  sliding_capacity: number;
  id_sliding_uom: number;
  sliding_uom_code: string;
  sliding_uom_description: string;
  coolant: string;
  coolant_capacity: number;
  id_coolant_uom: number;
  coolant_uom_code: string;
  coolant_uom_description: string;
  hydraulic: string;
  hydraulic_capacity: number;
  id_hydraulic_uom: number;
  hydraulic_uom_code: string;
  hydraulic_uom_description: string;
  dimension_front: number;
  id_dimension_front_uom: number;
  dimension_front_uom_code: string;
  dimension_front_uom_description: string;
  dimension_side: number;
  id_dimension_side_uom: number;
  dimension_side_uom_code: string;
  dimension_side_uom_description: string;
  detail_created_at: string;
  detail_updated_at: string;
  detail_createdby: number;
  detail_createdby_name: string;
  detail_updatedby: number;
  detail_updatedby_name: string;
  id_reason: number;
  remarks: string;
  status_created_at: string;
  status_updated_at: string;
  reason_key: string;
  reason_code: string;
  reason_description: string;
  reason_remarks: string;
  approval_id: number;
  ref_table: string;
  ref_id: number;
  approval_key: string;
  approval_message: string;
  approval_createdby: number;
  approval_createdby_name: string;
  approval_created_at: string;
  approval_status: string;
  approval_action: string;
  approval_count: number;
  approval_level: number;
}

export interface MachineParams {
  page: number;
  rows: string;
  id_reason?: number;
  approval?: string;
  search?: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface MachineDetailParams {
  page: number;
  rows: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface MachineStatusParams {
  page: number;
  rows: string;
  sortBy?: string | null;
  sortDirection?: boolean;
}

export interface CreateMachineRequest {
  machine: Record<string, unknown>;
  machine_detail: MachineDetailRequest;
  machine_status: MachineStatusRequest;
}

export interface MachineDetailRequest {
  id_machine: number;
  rev_no: number;
  code: string;
  code_old: string;
  asset_num: string;
  asset_num_old: string;
  description: string;
  name: string;
  maker: string;
  power: number;
  id_power_uom: string | number;
  electricity: number;
  id_electricity_uom: string | number;
  cavity: number;
  lubricant: string;
  lubricant_capacity: number;
  id_lubricant_uom: string | number;
  sliding: string;
  sliding_capacity: number;
  id_sliding_uom: string | number;
  coolant: string;
  coolant_capacity: number;
  id_coolant_uom: string | number;
  hydraulic: string;
  hydraulic_capacity: number;
  id_hydraulic_uom: string | number;
  dimension_front: number;
  id_dimension_front_uom: string | number;
  dimension_side: number;
  id_dimension_side_uom: string | number;
}

export interface MachineStatusRequest {
  id_reason: number | string;
  remarks: string;
}
