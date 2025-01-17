import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { createUoM, deleteUoM, getUoMs, updateUoM } from "../api/uom";
import { UoM, UoMParams, UoMRequest } from "../types/uom";

const useUoMsQuery = (params: UoMParams) => {
  return useQuery<ApiResponse<Result<UoM[]>>, Error>({
    queryKey: ["UoM", params],
    queryFn: () => getUoMs(params),
  });
};

const useUoMInfinityQuery = ({
  search,
}: {
  search: string;
  id_fcs: number;
}) => {
  return useInfiniteQuery<ApiResponse<Result<UoM[]>>, Error>({
    queryKey: ["InfinityUoM", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getUoMs({
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

const useCreateUoM = () => {
  return useMutation<ApiResponse<UoMRequest>, Error, UoMRequest>({
    mutationFn: createUoM,
  });
};

const useUpdateUoM = () => {
  return useMutation<
    ApiResponse<UoMRequest>,
    Error,
    { id: number; params: UoMRequest }
  >({
    mutationFn: ({ id, params }) => updateUoM(id, params),
  });
};

const useDeleteUoM = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteUoM(id),
  });
};

export {
  useUoMsQuery,
  useUoMInfinityQuery,
  useCreateUoM,
  useUpdateUoM,
  useDeleteUoM,
};
