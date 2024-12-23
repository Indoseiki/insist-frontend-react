import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createActivityLog,
  deleteActivityLog,
  getActivityLogs,
  updateActivityLog,
} from "../api/activityLog";
import {
  ActivityLog,
  ActivityLogParams,
  ActivityLogRequest,
} from "../types/activityLog";

const useActivityLogsQuery = (params: ActivityLogParams) => {
  return useQuery<ApiResponse<Result<ActivityLog[]>>, Error>({
    queryKey: ["ActivityLogs", params],
    queryFn: () => getActivityLogs(params),
  });
};

const useActivityLogsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ActivityLog[]>>, Error>({
    queryKey: ["InfinityActivityLogs", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getActivityLogs({
        page,
        rows: "10",
        search,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.pagination?.next_page ?? undefined;
    },
    initialPageParam: 1,
  });
};

const useCreateActivityLog = () => {
  return useMutation<
    ApiResponse<ActivityLogRequest>,
    Error,
    ActivityLogRequest
  >({
    mutationFn: createActivityLog,
  });
};

const useUpdateActivityLog = () => {
  return useMutation<
    ApiResponse<ActivityLogRequest>,
    Error,
    { id: number; params: ActivityLogRequest }
  >({
    mutationFn: ({ id, params }) => updateActivityLog(id, params),
  });
};

const useDeleteActivityLog = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteActivityLog(id),
  });
};

export {
  useActivityLogsQuery,
  useActivityLogsInfinityQuery,
  useCreateActivityLog,
  useUpdateActivityLog,
  useDeleteActivityLog,
};
