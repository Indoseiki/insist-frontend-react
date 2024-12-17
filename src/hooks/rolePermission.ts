import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../types/response";
import {
  getRolePermissions,
  updateRolePermission,
} from "../api/rolePermission";
import { Menu } from "../types/menu";
import { RolePermissionRequest } from "../types/rolePermission";

const useRolePermissionsQuery = (id: number) => {
  return useQuery<ApiResponse<Menu[]>, Error>({
    queryKey: ["RolePermissions", id],
    queryFn: () => getRolePermissions(id),
    enabled: id !== undefined,
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

export { useRolePermissionsQuery, useUpdateRolePermission };
