import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  Department,
  DepartmentParams,
  DepartmentRequest,
} from "../types/department";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../api/department";

const useDepartmentsQuery = (params: DepartmentParams) => {
  return useQuery<ApiResponse<Result<Department[]>>, Error>({
    queryKey: ["Departments", params],
    queryFn: () => getDepartments(params),
  });
};

const useDepartmentsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Department[]>>, Error>({
    queryKey: ["InfinityDepartments", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getDepartments({
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

const useCreateDepartment = () => {
  return useMutation<ApiResponse<DepartmentRequest>, Error, DepartmentRequest>({
    mutationFn: createDepartment,
  });
};

const useUpdateDepartment = () => {
  return useMutation<
    ApiResponse<DepartmentRequest>,
    Error,
    { id: number; params: DepartmentRequest }
  >({
    mutationFn: ({ id, params }) => updateDepartment(id, params),
  });
};

const useDeleteDepartment = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteDepartment(id),
  });
};

export {
  useDepartmentsQuery,
  useDepartmentsInfinityQuery,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
};
