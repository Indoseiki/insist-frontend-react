import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "../api/warehouse";
import {
  Warehouse,
  WarehouseParams,
  WarehouseRequest,
} from "../types/warehouse";

const useWarehousesQuery = (params: WarehouseParams) => {
  return useQuery<ApiResponse<Result<Warehouse[]>>, Error>({
    queryKey: ["Warehouse", params],
    queryFn: () => getWarehouses(params),
  });
};

const useWarehouseInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Warehouse[]>>, Error>({
    queryKey: ["InfinityWarehouse", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getWarehouses({
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

const useCreateWarehouse = () => {
  return useMutation<ApiResponse<WarehouseRequest>, Error, WarehouseRequest>({
    mutationFn: createWarehouse,
  });
};

const useUpdateWarehouse = () => {
  return useMutation<
    ApiResponse<WarehouseRequest>,
    Error,
    { id: number; params: WarehouseRequest }
  >({
    mutationFn: ({ id, params }) => updateWarehouse(id, params),
  });
};

const useDeleteWarehouse = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteWarehouse(id),
  });
};

export {
  useWarehousesQuery,
  useWarehouseInfinityQuery,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
};
