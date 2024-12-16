import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { createRole, deleteRole, getRoles, updateRole } from "../api/role";
import { Role, RoleParams, RoleRequest } from "../types/role";

const useRolesQuery = (params: RoleParams) => {
  return useQuery<ApiResponse<Result<Role[]>>, Error>({
    queryKey: ["Roles", params],
    queryFn: () => getRoles(params),
  });
};

const useRolesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Role[]>>, Error>({
    queryKey: ["InfinityRoles", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getRoles({
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

const useCreateRole = () => {
  return useMutation<ApiResponse<RoleRequest>, Error, RoleRequest>({
    mutationFn: createRole,
  });
};

const useUpdateRole = () => {
  return useMutation<
    ApiResponse<RoleRequest>,
    Error,
    { id: number; params: RoleRequest }
  >({
    mutationFn: ({ id, params }) => updateRole(id, params),
  });
};

const useDeleteRole = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteRole(id),
  });
};

export {
  useRolesQuery,
  useRolesInfinityQuery,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
};
