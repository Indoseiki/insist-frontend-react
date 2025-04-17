import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Item, ItemParams } from "../types/item";
import {
  createItem,
  deleteItem,
  getItems,
  getItem,
  updateItem,
} from "../api/item";

const useItemsQuery = (params: ItemParams) => {
  return useQuery<ApiResponse<Result<Item[]>>, Error>({
    queryKey: ["Items", params],
    queryFn: () => getItems(params),
  });
};

const useItemQuery = (param: string) => {
  return useQuery<ApiResponse<Item>, Error>({
    queryKey: ["Item", param],
    queryFn: () => getItem(param),
  });
};

const useItemsInfinityQuery = ({
  search,
  categoryCode,
}: {
  search: string;
  categoryCode: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<Item[]>>, Error>({
    queryKey: ["InfinityItems", search, categoryCode],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItems({
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

const useCreateItem = () => {
  return useMutation<ApiResponse<Partial<Item>>, Error, Partial<Item>>({
    mutationFn: createItem,
  });
};

const useUpdateItem = () => {
  return useMutation<
    ApiResponse<Partial<Item>>,
    Error,
    { id: number; params: Partial<Item> }
  >({
    mutationFn: ({ id, params }) => updateItem(id, params),
  });
};

const useDeleteItem = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItem(id),
  });
};

export {
  useItemsQuery,
  useItemQuery,
  useItemsInfinityQuery,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
};
