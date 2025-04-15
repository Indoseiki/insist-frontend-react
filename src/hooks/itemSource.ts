import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemSource, ItemSourceParams } from "../types/itemSource";
import {
  createItemSource,
  deleteItemSource,
  getItemSources,
  updateItemSource,
} from "../api/itemSource";

const useItemSourcesQuery = (params: ItemSourceParams) => {
  return useQuery<ApiResponse<Result<ItemSource[]>>, Error>({
    queryKey: ["ItemSources", params],
    queryFn: () => getItemSources(params),
    enabled: !!params.categoryCode,
  });
};

const useItemSourcesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemSource[]>>, Error>({
    queryKey: ["InfinityItemSources", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemSources({
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

const useCreateItemSource = () => {
  return useMutation<
    ApiResponse<Partial<ItemSource>>,
    Error,
    Partial<ItemSource>
  >({
    mutationFn: createItemSource,
  });
};

const useUpdateItemSource = () => {
  return useMutation<
    ApiResponse<Partial<ItemSource>>,
    Error,
    { id: number; params: Partial<ItemSource> }
  >({
    mutationFn: ({ id, params }) => updateItemSource(id, params),
  });
};

const useDeleteItemSource = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemSource(id),
  });
};

export {
  useItemSourcesQuery,
  useItemSourcesInfinityQuery,
  useCreateItemSource,
  useUpdateItemSource,
  useDeleteItemSource,
};
