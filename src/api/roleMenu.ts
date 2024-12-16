import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Role } from "../types/role";
import { RoleMenuParams, RoleMenuRequest } from "../types/roleMenu";
import apiClient from "./apiClient";

const url = "/admin/master/role-menu";

const getRoleMenus = async (
  params: RoleMenuParams
): Promise<ApiResponse<Result<Role[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Role[]>>>(url, {
    params,
  });
  return response.data;
};

const updateRoleMenu = async (
  id: number,
  params: RoleMenuRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

export { getRoleMenus, updateRoleMenu };
