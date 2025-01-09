import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createBuilding,
  deleteBuilding,
  getBuildings,
  updateBuilding,
} from "../api/building";
import { Building, BuildingParams, BuildingRequest } from "../types/building";

const useBuildingsQuery = (params: BuildingParams) => {
  return useQuery<ApiResponse<Result<Building[]>>, Error>({
    queryKey: ["Buildings", params],
    queryFn: () => getBuildings(params),
  });
};

const useBuildingsInfinityQuery = ({
  search,
  id_fcs,
}: {
  search: string;
  id_fcs: number;
}) => {
  return useInfiniteQuery<ApiResponse<Result<Building[]>>, Error>({
    queryKey: ["InfinityBuildings", search, id_fcs],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getBuildings({
        page,
        rows: "10",
        search,
        idFCS: id_fcs,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.pagination?.next_page ?? undefined;
    },
    initialPageParam: 1,
  });
};

const useCreateBuilding = () => {
  return useMutation<ApiResponse<BuildingRequest>, Error, BuildingRequest>({
    mutationFn: createBuilding,
  });
};

const useUpdateBuilding = () => {
  return useMutation<
    ApiResponse<BuildingRequest>,
    Error,
    { id: number; params: BuildingRequest }
  >({
    mutationFn: ({ id, params }) => updateBuilding(id, params),
  });
};

const useDeleteBuilding = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteBuilding(id),
  });
};

export {
  useBuildingsQuery,
  useBuildingsInfinityQuery,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
};
