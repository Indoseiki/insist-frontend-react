import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiResponse } from "../types/response";
import { Employee, EmployeeParams } from "../types/employee";
import { Result } from "../types/pagination";
import { getEmployees, syncEmployees } from "../api/employee";

const useEmployeesQuery = (params: EmployeeParams) => {
  return useQuery<ApiResponse<Result<Employee[]>>, Error>({
    queryKey: ["Employees", params],
    queryFn: () => getEmployees(params),
  });
};

const useSyncEmployees = () => {
  return useMutation<ApiResponse<null>, Error, {}>({
    mutationFn: syncEmployees,
  });
};

export { useEmployeesQuery, useSyncEmployees };
