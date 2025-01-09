import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  SubSection,
  SubSectionParams,
  SubSectionRequest,
} from "../types/subSection";
import apiClient from "./apiClient";

const url = "/prd/master/sub-section";

const getSubSections = async (
  params: SubSectionParams
): Promise<ApiResponse<Result<SubSection[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<SubSection[]>>>(url, {
    params,
  });
  return response.data;
};

const createSubSection = async (
  params: SubSectionRequest
): Promise<ApiResponse<SubSection>> => {
  const response = await apiClient.post<ApiResponse<SubSection>>(url, params);
  return response.data;
};

const updateSubSection = async (
  id: number,
  params: SubSectionRequest
): Promise<ApiResponse<SubSectionRequest>> => {
  const response = await apiClient.put<ApiResponse<SubSectionRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteSubSection = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getSubSections, createSubSection, updateSubSection, deleteSubSection };
