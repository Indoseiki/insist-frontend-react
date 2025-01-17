import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createProcess,
  deleteProcess,
  getProcesses,
  updateProcess,
} from "../api/process";
import { Process, ProcessParams, ProcessRequest } from "../types/process";

const useProcessesQuery = (params: ProcessParams) => {
  return useQuery<ApiResponse<Result<Process[]>>, Error>({
    queryKey: ["Process", params],
    queryFn: () => getProcesses(params),
  });
};

const useProcessInfinityQuery = ({
  search,
}: {
  search: string;
  id_fcs: number;
}) => {
  return useInfiniteQuery<ApiResponse<Result<Process[]>>, Error>({
    queryKey: ["InfinityProcess", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getProcesses({
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

const useCreateProcess = () => {
  return useMutation<ApiResponse<ProcessRequest>, Error, ProcessRequest>({
    mutationFn: createProcess,
  });
};

const useUpdateProcess = () => {
  return useMutation<
    ApiResponse<ProcessRequest>,
    Error,
    { id: number; params: ProcessRequest }
  >({
    mutationFn: ({ id, params }) => updateProcess(id, params),
  });
};

const useDeleteProcess = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteProcess(id),
  });
};

export {
  useProcessesQuery,
  useProcessInfinityQuery,
  useCreateProcess,
  useUpdateProcess,
  useDeleteProcess,
};
