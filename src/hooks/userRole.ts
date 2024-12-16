import { useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { getUserRoles, updateUserRole } from "../api/userRole";
import { User } from "../types/user";
import { UserRoleParams, UserRoleRequest } from "../types/userRole";

const useUserRolesQuery = (params: UserRoleParams) => {
  return useQuery<ApiResponse<Result<User[]>>, Error>({
    queryKey: ["UserRoles", params],
    queryFn: () => getUserRoles(params),
  });
};

const useUpdateUserRole = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; params: UserRoleRequest }
  >({
    mutationFn: ({ id, params }) => updateUserRole(id, params),
  });
};

export { useUserRolesQuery, useUpdateUserRole };
