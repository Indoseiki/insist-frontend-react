import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { User } from "../types/user";
import { UserRoleParams, UserRoleRequest } from "../types/userRole";
import apiClient from "./apiClient";

const url = "/admin/master/user-role";

const getUserRoles = async (
  params: UserRoleParams
): Promise<ApiResponse<Result<User[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<User[]>>>(url, {
    params,
  });
  return response.data;
};

const updateUserRole = async (
  id: number,
  params: UserRoleRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

export { getUserRoles, updateUserRole };
