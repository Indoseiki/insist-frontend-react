import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemProcess, ItemProcessParams } from "../types/itemProcess";
import {
  createItemProcess,
  deleteItemProcess,
  getItemProcesses,
  updateItemProcess,
} from "../api/itemProcess";

const useItemProcessesQuery = (params: ItemProcessParams) => {
  return useQuery<ApiResponse<Result<ItemProcess[]>>, Error>({
    queryKey: ["ItemProcesses", params],
    queryFn: () => getItemProcesses(params),
    enabled: !!params.categoryCode,
  });
};

const useItemProcessesInfinityQuery = ({
  search,
  categoryCode,
}: {
  search: string;
  categoryCode: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<ItemProcess[]>>, Error>({
    queryKey: ["InfinityItemProcesses", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemProcesses({
        categoryCode,
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

const useCreateItemProcess = () => {
  return useMutation<
    ApiResponse<Partial<ItemProcess>>,
    Error,
    Partial<ItemProcess>
  >({
    mutationFn: createItemProcess,
  });
};

const useUpdateItemProcess = () => {
  return useMutation<
    ApiResponse<Partial<ItemProcess>>,
    Error,
    { id: number; params: Partial<ItemProcess> }
  >({
    mutationFn: ({ id, params }) => updateItemProcess(id, params),
  });
};

const useDeleteItemProcess = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemProcess(id),
  });
};

export {
  useItemProcessesQuery,
  useItemProcessesInfinityQuery,
  useCreateItemProcess,
  useUpdateItemProcess,
  useDeleteItemProcess,
};
