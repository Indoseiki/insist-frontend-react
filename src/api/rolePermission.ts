import { Menu } from "../types/menu";
import { ApiResponse } from "../types/response";
import {
  MenuWithPermissions,
  RolePermissionRequest,
} from "../types/rolePermission";
import apiClient from "./apiClient";

const url = "/admin/role-permission";

const getRolePermissions = async (id: number): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>(`${url}/${id}`);
  return response.data;
};

const getRolePermission = async (
  path: string
): Promise<ApiResponse<MenuWithPermissions>> => {
  const response = await apiClient.get<ApiResponse<MenuWithPermissions>>(
    `${url}?path=${path}`
  );
  return response.data;
};

const updateRolePermission = async (
  params: RolePermissionRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(url, params);
  return response.data;
};

export { getRolePermissions, getRolePermission, updateRolePermission };
