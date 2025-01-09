import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Section, SectionParams, SectionRequest } from "../types/section";
import apiClient from "./apiClient";

const url = "/prd/master/section";

const getSections = async (
  params: SectionParams
): Promise<ApiResponse<Result<Section[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Section[]>>>(url, {
    params,
  });
  return response.data;
};

const createSection = async (
  params: SectionRequest
): Promise<ApiResponse<Section>> => {
  const response = await apiClient.post<ApiResponse<Section>>(url, params);
  return response.data;
};

const updateSection = async (
  id: number,
  params: SectionRequest
): Promise<ApiResponse<SectionRequest>> => {
  const response = await apiClient.put<ApiResponse<SectionRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteSection = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getSections, createSection, updateSection, deleteSection };
