import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemCategory, ItemCategoryParams } from "../types/itemCategory";
import {
  createItemCategory,
  deleteItemCategory,
  getItemCategories,
  updateItemCategory,
} from "../api/itemCategory";

const useItemCategoriesQuery = (params: ItemCategoryParams) => {
  return useQuery<ApiResponse<Result<ItemCategory[]>>, Error>({
    queryKey: ["ItemCategories", params],
    queryFn: () => getItemCategories(params),
  });
};

const useItemCategoriesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemCategory[]>>, Error>({
    queryKey: ["InfinityItemCategories", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemCategories({
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

const useCreateItemCategory = () => {
  return useMutation<
    ApiResponse<Partial<ItemCategory>>,
    Error,
    Partial<ItemCategory>
  >({
    mutationFn: createItemCategory,
  });
};

const useUpdateItemCategory = () => {
  return useMutation<
    ApiResponse<Partial<ItemCategory>>,
    Error,
    { id: number; params: Partial<ItemCategory> }
  >({
    mutationFn: ({ id, params }) => updateItemCategory(id, params),
  });
};

const useDeleteItemCategory = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemCategory(id),
  });
};

export {
  useItemCategoriesQuery,
  useItemCategoriesInfinityQuery,
  useCreateItemCategory,
  useUpdateItemCategory,
  useDeleteItemCategory,
};
