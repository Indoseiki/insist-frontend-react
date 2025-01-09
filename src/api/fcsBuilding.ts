import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { User } from "../types/user";
import { FCSBuildingParams, FCSBuildingRequest } from "../types/fcsBuilding";
import apiClient from "./apiClient";

const url = "/prd/master/fcs-building";

const getFCSBuildings = async (
  params: FCSBuildingParams
): Promise<ApiResponse<Result<User[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<User[]>>>(url, {
    params,
  });
  return response.data;
};

const updateFCSBuilding = async (
  id: number,
  params: FCSBuildingRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

export { getFCSBuildings, updateFCSBuilding };
