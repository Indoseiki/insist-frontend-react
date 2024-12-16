import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Role, RoleParams, RoleRequest } from "../types/role";
import apiClient from "./apiClient";

const url = "/admin/master/role";

const getRoles = async (
  params: RoleParams
): Promise<ApiResponse<Result<Role[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Role[]>>>(url, {
    params,
  });
  return response.data;
};

const createRole = async (params: RoleRequest): Promise<ApiResponse<Role>> => {
  const response = await apiClient.post<ApiResponse<Role>>(url, params);
  return response.data;
};

const updateRole = async (
  id: number,
  params: RoleRequest
): Promise<ApiResponse<RoleRequest>> => {
  const response = await apiClient.put<ApiResponse<RoleRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteRole = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getRoles, createRole, updateRole, deleteRole };
