import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ActivityLog,
  ActivityLogParams,
  ActivityLogRequest,
} from "../types/activityLog";
import apiClient from "./apiClient";

const url = "/log";

const getActivityLogs = async (
  params: ActivityLogParams
): Promise<ApiResponse<Result<ActivityLog[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ActivityLog[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createActivityLog = async (
  params: ActivityLogRequest
): Promise<ApiResponse<ActivityLog>> => {
  params.user_agent = navigator.userAgent;
  const response = await apiClient.post<ApiResponse<ActivityLog>>(url, params);
  return response.data;
};

const updateActivityLog = async (
  id: number,
  params: ActivityLogRequest
): Promise<ApiResponse<ActivityLogRequest>> => {
  const response = await apiClient.put<ApiResponse<ActivityLogRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteActivityLog = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getActivityLogs,
  createActivityLog,
  updateActivityLog,
  deleteActivityLog,
};
