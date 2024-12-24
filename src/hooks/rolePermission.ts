import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../types/response";
import {
  getRolePermission,
  getRolePermissions,
  updateRolePermission,
} from "../api/rolePermission";
import { Menu } from "../types/menu";
import {
  MenuWithPermissions,
  RolePermissionRequest,
} from "../types/rolePermission";

const useRolePermissionsQuery = (id: number) => {
  return useQuery<ApiResponse<Menu[]>, Error>({
    queryKey: ["RolePermissions", id],
    queryFn: () => getRolePermissions(id),
    enabled: id !== undefined,
  });
};

const useRolePermissionQuery = (path: string) => {
  return useQuery<ApiResponse<MenuWithPermissions>, Error>({
    queryKey: ["RolePermission", path],
    queryFn: () => getRolePermission(path),
    enabled: path !== undefined,
    staleTime: 0,
    gcTime: Infinity,
  });
};

const useUpdateRolePermission = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { params: RolePermissionRequest }
  >({
    mutationFn: ({ params }) => updateRolePermission(params),
  });
};

export {
  useRolePermissionsQuery,
  useRolePermissionQuery,
  useUpdateRolePermission,
};
