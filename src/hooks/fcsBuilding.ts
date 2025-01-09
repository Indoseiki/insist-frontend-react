import { useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { getFCSBuildings, updateFCSBuilding } from "../api/fcsBuilding";
import { User } from "../types/user";
import { FCSBuildingParams, FCSBuildingRequest } from "../types/fcsBuilding";

const useFCSBuildingsQuery = (params: FCSBuildingParams) => {
  return useQuery<ApiResponse<Result<User[]>>, Error>({
    queryKey: ["FCSBuildings", params],
    queryFn: () => getFCSBuildings(params),
  });
};

const useUpdateFCSBuilding = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; params: FCSBuildingRequest }
  >({
    mutationFn: ({ id, params }) => updateFCSBuilding(id, params),
  });
};

export { useFCSBuildingsQuery, useUpdateFCSBuilding };
