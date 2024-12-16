import {
  Department,
  DepartmentParams,
  DepartmentRequest,
} from "../types/department";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/admin/master/department";

const getDepartments = async (
  params: DepartmentParams
): Promise<ApiResponse<Result<Department[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Department[]>>>(url, {
    params,
  });
  return response.data;
};

const createDepartment = async (
  params: DepartmentRequest
): Promise<ApiResponse<Department>> => {
  const response = await apiClient.post<ApiResponse<Department>>(url, params);
  return response.data;
};

const updateDepartment = async (
  id: number,
  params: DepartmentRequest
): Promise<ApiResponse<DepartmentRequest>> => {
  const response = await apiClient.put<ApiResponse<DepartmentRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteDepartment = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getDepartments, createDepartment, updateDepartment, deleteDepartment };
