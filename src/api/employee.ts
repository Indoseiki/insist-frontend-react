import { Employee, EmployeeParams } from "../types/employee";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/admin/master/employee";

const getEmployees = async (
  params: EmployeeParams
): Promise<ApiResponse<Result<Employee[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Employee[]>>>(url, {
    params,
  });
  return response.data;
};

const syncEmployees = async () => {
  const response = await apiClient.post<ApiResponse<null>>(`${url}/sync`);
  return response.data;
};

export { getEmployees, syncEmployees };
