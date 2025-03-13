import {
  CreateMachineRequest,
  Machine,
  MachineDetailParams,
  MachineDetailRequest,
  MachineParams,
  MachineStatus,
  MachineStatusParams,
  MachineStatusRequest,
  ViewMachine,
  ViewMachineDetail,
} from "../types/machine";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/mnt/master/machine";

const getMachines = async (
  params: MachineParams
): Promise<ApiResponse<Result<ViewMachine[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ViewMachine[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createMachine = async (
  params: CreateMachineRequest
): Promise<ApiResponse<Machine>> => {
  const response = await apiClient.post<ApiResponse<Machine>>(url, params);
  return response.data;
};

const updateMachine = async (
  id: number,
  params: MachineDetailRequest
): Promise<ApiResponse<MachineDetailRequest>> => {
  const response = await apiClient.put<ApiResponse<MachineDetailRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteMachine = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const revisionMachine = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}/revision`
  );
  return response.data;
};

const getMachineDetails = async (
  id: number,
  params: MachineDetailParams
): Promise<ApiResponse<Result<ViewMachineDetail[]>>> => {
  const response = await apiClient.get<
    ApiResponse<Result<ViewMachineDetail[]>>
  >(`${url}/${id}/detail`, {
    params,
  });
  return response.data;
};

const getMachineStatus = async (
  id: number,
  params: MachineStatusParams
): Promise<ApiResponse<Result<MachineStatus[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<MachineStatus[]>>>(
    `${url}/${id}/status`,
    {
      params,
    }
  );
  return response.data;
};

const updateMachineStatus = async (
  id: number,
  params: MachineStatusRequest
): Promise<ApiResponse<MachineStatusRequest>> => {
  const response = await apiClient.put<ApiResponse<MachineStatusRequest>>(
    `${url}/${id}/status`,
    params
  );
  return response.data;
};

export {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  revisionMachine,
  getMachineDetails,
  getMachineStatus,
  updateMachineStatus,
};
