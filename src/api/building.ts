import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Building, BuildingParams, BuildingRequest } from "../types/building";
import apiClient from "./apiClient";

const url = "/prd/master/building";

const getBuildings = async (
  params: BuildingParams
): Promise<ApiResponse<Result<Building[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Building[]>>>(url, {
    params,
  });
  return response.data;
};

const createBuilding = async (
  params: BuildingRequest
): Promise<ApiResponse<Building>> => {
  const response = await apiClient.post<ApiResponse<Building>>(url, params);
  return response.data;
};

const updateBuilding = async (
  id: number,
  params: BuildingRequest
): Promise<ApiResponse<BuildingRequest>> => {
  const response = await apiClient.put<ApiResponse<BuildingRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteBuilding = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getBuildings, createBuilding, updateBuilding, deleteBuilding };
