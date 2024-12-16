import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { User, UserParams, UserRequest } from "../types/user";
import apiClient from "./apiClient";

const url = "/admin/master/users";

const getUsers = async (
  params: UserParams
): Promise<ApiResponse<Result<User[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<User[]>>>(url, {
    params,
  });
  return response.data;
};

const createUser = async (
  params: UserRequest
): Promise<ApiResponse<UserRequest>> => {
  const response = await apiClient.post<ApiResponse<UserRequest>>(url, params);
  return response.data;
};

const updateUser = async (
  id: number,
  params: UserRequest
): Promise<ApiResponse<UserRequest>> => {
  const response = await apiClient.put<ApiResponse<UserRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteUser = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const changePassword = async ({
  id,
  password,
  confirm_password,
}: {
  id: number;
  password: string;
  confirm_password: string;
}) => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}/change-password`,
    { password, confirm_password }
  );
  return response.data;
};

export { getUsers, createUser, updateUser, deleteUser, changePassword };
