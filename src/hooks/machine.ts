import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createMachine,
  deleteMachine,
  getMachineDetails,
  getMachines,
  getMachineStatus,
  revisionMachine,
  updateMachine,
  updateMachineStatus,
} from "../api/machine";
import {
  CreateMachineRequest,
  Machine,
  MachineDetailParams,
  MachineDetailRequest,
  MachineParams,
  MachineStatus,
  MachineStatusParams,
  MachineStatusRequest,
  ViewMachine,
  ViewMachineDetail,
} from "../types/machine";

const useMachinesQuery = (params: MachineParams) => {
  return useQuery<ApiResponse<Result<ViewMachine[]>>, Error>({
    queryKey: ["Machine", params],
    queryFn: () => getMachines(params),
  });
};

const useMachineInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ViewMachine[]>>, Error>({
    queryKey: ["InfinityMachine", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getMachines({
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

const useCreateMachine = () => {
  return useMutation<ApiResponse<Machine>, Error, CreateMachineRequest>({
    mutationFn: createMachine,
  });
};

const useUpdateMachine = () => {
  return useMutation<
    ApiResponse<MachineDetailRequest>,
    Error,
    { id: number; params: MachineDetailRequest }
  >({
    mutationFn: ({ id, params }) => updateMachine(id, params),
  });
};

const useDeleteMachine = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteMachine(id),
  });
};

const useRevisionMachine = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => revisionMachine(id),
  });
};

const useMachineDetailsQuery = ({
  id,
  params,
}: {
  id: number;
  params: MachineDetailParams;
}) => {
  return useQuery<ApiResponse<Result<ViewMachineDetail[]>>, Error>({
    queryKey: ["Machine", id, params],
    queryFn: () => getMachineDetails(id, params),
    enabled: !!id,
  });
};

const useMachineStatusQuery = ({
  id,
  params,
}: {
  id: number;
  params: MachineStatusParams;
}) => {
  return useQuery<ApiResponse<Result<MachineStatus[]>>, Error>({
    queryKey: ["Machine", id, params],
    queryFn: () => getMachineStatus(id, params),
    enabled: !!id,
  });
};

const useUpdateMachineStatus = () => {
  return useMutation<
    ApiResponse<MachineStatusRequest>,
    Error,
    { id: number; params: MachineStatusRequest }
  >({
    mutationFn: ({ id, params }) => updateMachineStatus(id, params),
  });
};

export {
  useMachinesQuery,
  useMachineInfinityQuery,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
  useRevisionMachine,
  useMachineDetailsQuery,
  useMachineStatusQuery,
  useUpdateMachineStatus,
};
