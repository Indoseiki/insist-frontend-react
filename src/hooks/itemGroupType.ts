import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemGroupType, ItemGroupTypeParams } from "../types/itemGroupType";
import {
  createItemGroupType,
  deleteItemGroupType,
  getItemGroupTypes,
  updateItemGroupType,
} from "../api/itemGroupType";

const useItemGroupTypesQuery = (params: ItemGroupTypeParams) => {
  return useQuery<ApiResponse<Result<ItemGroupType[]>>, Error>({
    queryKey: ["ItemGroupTypes", params],
    queryFn: () => getItemGroupTypes(params),
    enabled: !!params.idItemGroup,
  });
};

const useItemGroupTypesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemGroupType[]>>, Error>({
    queryKey: ["InfinityItemGroupTypes", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemGroupTypes({
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

const useCreateItemGroupType = () => {
  return useMutation<
    ApiResponse<Partial<ItemGroupType>>,
    Error,
    Partial<ItemGroupType>
  >({
    mutationFn: createItemGroupType,
  });
};

const useUpdateItemGroupType = () => {
  return useMutation<
    ApiResponse<Partial<ItemGroupType>>,
    Error,
    { id: number; params: Partial<ItemGroupType> }
  >({
    mutationFn: ({ id, params }) => updateItemGroupType(id, params),
  });
};

const useDeleteItemGroupType = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemGroupType(id),
  });
};

export {
  useItemGroupTypesQuery,
  useItemGroupTypesInfinityQuery,
  useCreateItemGroupType,
  useUpdateItemGroupType,
  useDeleteItemGroupType,
};
