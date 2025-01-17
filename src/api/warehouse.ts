import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  Warehouse,
  WarehouseParams,
  WarehouseRequest,
} from "../types/warehouse";
import apiClient from "./apiClient";

const url = "/pid/master/warehouse";

const getWarehouses = async (
  params: WarehouseParams
): Promise<ApiResponse<Result<Warehouse[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Warehouse[]>>>(url, {
    params,
  });
  return response.data;
};

const createWarehouse = async (
  params: WarehouseRequest
): Promise<ApiResponse<Warehouse>> => {
  const response = await apiClient.post<ApiResponse<Warehouse>>(url, params);
  return response.data;
};

const updateWarehouse = async (
  id: number,
  params: WarehouseRequest
): Promise<ApiResponse<WarehouseRequest>> => {
  const response = await apiClient.put<ApiResponse<WarehouseRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteWarehouse = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };
