import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Process, ProcessParams, ProcessRequest } from "../types/process";
import apiClient from "./apiClient";

const url = "/egd/master/process";

const getProcesses = async (
  params: ProcessParams
): Promise<ApiResponse<Result<Process[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Process[]>>>(url, {
    params,
  });
  return response.data;
};

const createProcess = async (
  params: ProcessRequest
): Promise<ApiResponse<Process>> => {
  const response = await apiClient.post<ApiResponse<Process>>(url, params);
  return response.data;
};

const updateProcess = async (
  id: number,
  params: ProcessRequest
): Promise<ApiResponse<ProcessRequest>> => {
  const response = await apiClient.put<ApiResponse<ProcessRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteProcess = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getProcesses, createProcess, updateProcess, deleteProcess };
