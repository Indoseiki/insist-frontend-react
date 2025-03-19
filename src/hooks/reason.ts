import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createReason,
  deleteReason,
  getReasons,
  updateReason,
} from "../api/reason";
import { Reason, ReasonParams, ReasonRequest } from "../types/reason";

const useReasonsQuery = (params: ReasonParams) => {
  return useQuery<ApiResponse<Result<Reason[]>>, Error>({
    queryKey: ["Reasons", params],
    queryFn: () => getReasons(params),
  });
};

const useReasonsInfinityQuery = ({
  search,
  key,
  path,
}: {
  search: string;
  key: string;
  path: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<Reason[]>>, Error>({
    queryKey: ["InfinityReasons", search, key, path],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getReasons({
        page,
        rows: "10",
        search,
        key,
        path,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.pagination?.next_page ?? undefined;
    },
    initialPageParam: 1,
  });
};

const useCreateReason = () => {
  return useMutation<ApiResponse<ReasonRequest>, Error, ReasonRequest>({
    mutationFn: createReason,
  });
};

const useUpdateReason = () => {
  return useMutation<
    ApiResponse<ReasonRequest>,
    Error,
    { id: number; params: ReasonRequest }
  >({
    mutationFn: ({ id, params }) => updateReason(id, params),
  });
};

const useDeleteReason = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteReason(id),
  });
};

export {
  useReasonsQuery,
  useReasonsInfinityQuery,
  useCreateReason,
  useUpdateReason,
  useDeleteReason,
};
