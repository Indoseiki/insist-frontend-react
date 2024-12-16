import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { KeyValue, KeyValueParams, KeyValueRequest } from "../types/keyValue";
import apiClient from "./apiClient";

const url = "/admin/master/key-value";

const getKeyValues = async (
  params: KeyValueParams
): Promise<ApiResponse<Result<KeyValue[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<KeyValue[]>>>(url, {
    params,
  });
  return response.data;
};

const createKeyValue = async (
  params: KeyValueRequest
): Promise<ApiResponse<KeyValue>> => {
  const response = await apiClient.post<ApiResponse<KeyValue>>(url, params);
  return response.data;
};

const updateKeyValue = async (
  id: number,
  params: KeyValueRequest
): Promise<ApiResponse<KeyValueRequest>> => {
  const response = await apiClient.put<ApiResponse<KeyValueRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteKeyValue = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getKeyValues, createKeyValue, updateKeyValue, deleteKeyValue };
