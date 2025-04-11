import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ItemProductType,
  ItemProductTypeParams,
} from "../types/itemProductType";
import {
  createItemProductType,
  deleteItemProductType,
  getItemProductTypes,
  updateItemProductType,
} from "../api/itemProductType";

const useItemProductTypesQuery = (params: ItemProductTypeParams) => {
  return useQuery<ApiResponse<Result<ItemProductType[]>>, Error>({
    queryKey: ["ItemProductTypes", params],
    queryFn: () => getItemProductTypes(params),
    enabled: !!params.idItemProduct,
  });
};

const useItemProductTypesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemProductType[]>>, Error>({
    queryKey: ["InfinityItemProductTypes", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemProductTypes({
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

const useCreateItemProductType = () => {
  return useMutation<
    ApiResponse<Partial<ItemProductType>>,
    Error,
    Partial<ItemProductType>
  >({
    mutationFn: createItemProductType,
  });
};

const useUpdateItemProductType = () => {
  return useMutation<
    ApiResponse<Partial<ItemProductType>>,
    Error,
    { id: number; params: Partial<ItemProductType> }
  >({
    mutationFn: ({ id, params }) => updateItemProductType(id, params),
  });
};

const useDeleteItemProductType = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemProductType(id),
  });
};

export {
  useItemProductTypesQuery,
  useItemProductTypesInfinityQuery,
  useCreateItemProductType,
  useUpdateItemProductType,
  useDeleteItemProductType,
};
