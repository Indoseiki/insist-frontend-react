import { useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { getRoleMenus, updateRoleMenu } from "../api/roleMenu";
import { User } from "../types/user";
import { RoleMenuParams, RoleMenuRequest } from "../types/roleMenu";

const useRoleMenusQuery = (params: RoleMenuParams) => {
  return useQuery<ApiResponse<Result<User[]>>, Error>({
    queryKey: ["RoleMenus", params],
    queryFn: () => getRoleMenus(params),
  });
};

const useUpdateRoleMenu = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; params: RoleMenuRequest }
  >({
    mutationFn: ({ id, params }) => updateRoleMenu(id, params),
  });
};

export { useRoleMenusQuery, useUpdateRoleMenu };
