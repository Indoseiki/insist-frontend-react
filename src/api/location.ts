import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Location, LocationParams, LocationRequest } from "../types/location";
import apiClient from "./apiClient";

const url = "/pid/master/location";

const getLocations = async (
  params: LocationParams
): Promise<ApiResponse<Result<Location[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Location[]>>>(url, {
    params,
  });
  return response.data;
};

const createLocation = async (
  params: LocationRequest
): Promise<ApiResponse<Location>> => {
  const response = await apiClient.post<ApiResponse<Location>>(url, params);
  return response.data;
};

const updateLocation = async (
  id: number,
  params: LocationRequest
): Promise<ApiResponse<LocationRequest>> => {
  const response = await apiClient.put<ApiResponse<LocationRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteLocation = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getLocations, createLocation, updateLocation, deleteLocation };
