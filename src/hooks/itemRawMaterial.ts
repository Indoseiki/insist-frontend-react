import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ItemRawMaterial,
  ItemRawMaterialParams,
} from "../types/itemRawMaterial";
import {
  createItemRawMaterial,
  deleteItemRawMaterial,
  getItemRawMaterials,
  getItemRawMaterial,
  updateItemRawMaterial,
} from "../api/itemRawMaterial";

const useItemRawMaterialsQuery = (params: ItemRawMaterialParams) => {
  return useQuery<ApiResponse<Result<ItemRawMaterial[]>>, Error>({
    queryKey: ["ItemRawMaterials", params],
    queryFn: () => getItemRawMaterials(params),
  });
};

const useItemRawMaterialQuery = (param: string) => {
  return useQuery<ApiResponse<ItemRawMaterial>, Error>({
    queryKey: ["ItemRawMaterial", param],
    queryFn: () => getItemRawMaterial(param),
  });
};

const useItemRawMaterialsInfinityQuery = ({
  search,
  categoryCode,
}: {
  search: string;
  categoryCode: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<ItemRawMaterial[]>>, Error>({
    queryKey: ["InfinityItemRawMaterials", search, categoryCode],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemRawMaterials({
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

const useCreateItemRawMaterial = () => {
  return useMutation<
    ApiResponse<Partial<ItemRawMaterial>>,
    Error,
    Partial<ItemRawMaterial>
  >({
    mutationFn: createItemRawMaterial,
  });
};

const useUpdateItemRawMaterial = () => {
  return useMutation<
    ApiResponse<Partial<ItemRawMaterial>>,
    Error,
    { id: number; params: Partial<ItemRawMaterial> }
  >({
    mutationFn: ({ id, params }) => updateItemRawMaterial(id, params),
  });
};

const useDeleteItemRawMaterial = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemRawMaterial(id),
  });
};

export {
  useItemRawMaterialsQuery,
  useItemRawMaterialQuery,
  useItemRawMaterialsInfinityQuery,
  useCreateItemRawMaterial,
  useUpdateItemRawMaterial,
  useDeleteItemRawMaterial,
};
