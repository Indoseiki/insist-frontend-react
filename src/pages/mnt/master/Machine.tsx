import {
  ActionIcon,
  Badge,
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Grid,
  Group,
  Input,
  InputBase,
  Loader,
  Menu,
  Modal,
  NumberInput,
  rem,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  useCombobox,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import {
  CreateMachineRequest,
  MachineStatus,
  ViewMachine,
  ViewMachineDetail,
} from "../../../types/machine";
import {
  useCreateMachine,
  useDeleteMachine,
  useMachineDetailsQuery,
  useMachinesQuery,
  useMachineStatusQuery,
  useUpdateMachine,
} from "../../../hooks/machine";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
import { useDisclosure, useMediaQuery, useOs } from "@mantine/hooks";
import { useForm, UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";
import { createActivityLog } from "../../../api/activityLog";
import PageSubHeader from "../../../components/layouts/PageSubHeader";
import { useUoMInfinityQuery } from "../../../hooks/uom";
import { UoM } from "../../../types/uom";
import { useReasonsInfinityQuery } from "../../../hooks/reason";

interface StateFilterMachine {
  open: boolean;
  search: string;
  idUoM: string;
  uom: string;
}

interface StateFormMachine extends StateForm {
  power_uom: string;
  electricity_uom: string;
  lubricant_uom: string;
  sliding_uom: string;
  coolant_uom: string;
  hydraulic_uom: string;
  dimension_front_uom: string;
  dimension_side_uom: string;
  reason: string;
}

const MachinePage = () => {
  const isSmall = useMediaQuery("(max-width: 768px)");
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormMachine,
    { open: openFormMachine, close: closeFormMachine },
  ] = useDisclosure(false);

  const [
    openedFormDeleteMachine,
    { open: openFormDeleteMachine, close: closeFormDeleteMachine },
  ] = useDisclosure(false);

  const [stateTableMachine, setStateTableMachine] = useState<
    StateTable<ViewMachine>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateTableMachineDetail, setStateTableMachineDetail] = useState<
    StateTable<ViewMachineDetail>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateTableMachineStatus, setStateTableMachineStatus] = useState<
    StateTable<MachineStatus>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "created_at",
    sortDirection: true,
  });

  const [stateFilterMachine, setStateFilterMachine] =
    useState<StateFilterMachine>({
      open: false,
      search: "",
      idUoM: "",
      uom: "",
    });

  const [stateFormMachine, setStateFormMachine] = useState<StateFormMachine>({
    title: "",
    action: "",
    power_uom: "",
    electricity_uom: "",
    lubricant_uom: "",
    sliding_uom: "",
    coolant_uom: "",
    hydraulic_uom: "",
    dimension_front_uom: "",
    dimension_side_uom: "",
    reason: "",
  });

  const updateStateTableMachine = (
    newState: Partial<StateTable<ViewMachine>>
  ) => setStateTableMachine((prev) => ({ ...prev, ...newState }));

  const updateStateTableMachineDetail = (
    newState: Partial<StateTable<ViewMachineDetail>>
  ) => setStateTableMachineDetail((prev) => ({ ...prev, ...newState }));

  const updateStateTableMachineStatus = (
    newState: Partial<StateTable<MachineStatus>>
  ) => setStateTableMachineStatus((prev) => ({ ...prev, ...newState }));

  const updateStateFilterMachine = (newState: Partial<StateFilterMachine>) =>
    setStateFilterMachine((prev) => ({ ...prev, ...newState }));

  const updateStateFormMachine = (newState: Partial<StateFormMachine>) =>
    setStateFormMachine((prev) => ({ ...prev, ...newState }));

  const handleClickRowMachine = (row: ViewMachine) => {
    updateStateTableMachine({ selected: row });
  };

  const handleClickRowMachineDetail = (row: ViewMachineDetail) => {
    updateStateTableMachineDetail({ selected: row });
  };

  const handleClickRowMachineStatus = (row: MachineStatus) => {
    updateStateTableMachineStatus({ selected: row });
  };

  const {
    data: dataMachines,
    isSuccess: isSuccessMachines,
    isLoading: isLoadingMachines,
    refetch: refetchMachines,
  } = useMachinesQuery({
    page: stateTableMachine.activePage,
    rows: stateTableMachine.rowsPerPage,
    search: stateFilterMachine.search,
    sortBy: stateTableMachine.sortBy,
    sortDirection: stateTableMachine.sortDirection,
  });

  const {
    data: dataSelectUoMsPower,
    isSuccess: isSuccessSelectUoMsPower,
    fetchNextPage: fetchNextPageSelectUoMsPower,
    hasNextPage: hasNextPageSelectUoMsPower,
    isFetchingNextPage: isFetchingNextPageSelectUoMsPower,
  } = useUoMInfinityQuery({
    search: stateFormMachine.power_uom,
  });

  const flatDataSelectUoMsPower =
    (isSuccessSelectUoMsPower &&
      dataSelectUoMsPower?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsElectricity,
    isSuccess: isSuccessSelectUoMsElectricity,
    fetchNextPage: fetchNextPageSelectUoMsElectricity,
    hasNextPage: hasNextPageSelectUoMsElectricity,
    isFetchingNextPage: isFetchingNextPageSelectUoMsElectricity,
  } = useUoMInfinityQuery({
    search: stateFormMachine.electricity_uom,
  });

  const flatDataSelectUoMsElectricity =
    (isSuccessSelectUoMsElectricity &&
      dataSelectUoMsElectricity?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsLubricant,
    isSuccess: isSuccessSelectUoMsLubricant,
    fetchNextPage: fetchNextPageSelectUoMsLubricant,
    hasNextPage: hasNextPageSelectUoMsLubricant,
    isFetchingNextPage: isFetchingNextPageSelectUoMsLubricant,
  } = useUoMInfinityQuery({
    search: stateFormMachine.lubricant_uom,
  });

  const flatDataSelectUoMsLubricant =
    (isSuccessSelectUoMsLubricant &&
      dataSelectUoMsLubricant?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsSliding,
    isSuccess: isSuccessSelectUoMsSliding,
    fetchNextPage: fetchNextPageSelectUoMsSliding,
    hasNextPage: hasNextPageSelectUoMsSliding,
    isFetchingNextPage: isFetchingNextPageSelectUoMsSliding,
  } = useUoMInfinityQuery({
    search: stateFormMachine.sliding_uom,
  });

  const flatDataSelectUoMsSliding =
    (isSuccessSelectUoMsSliding &&
      dataSelectUoMsSliding?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsCoolant,
    isSuccess: isSuccessSelectUoMsCoolant,
    fetchNextPage: fetchNextPageSelectUoMsCoolant,
    hasNextPage: hasNextPageSelectUoMsCoolant,
    isFetchingNextPage: isFetchingNextPageSelectUoMsCoolant,
  } = useUoMInfinityQuery({
    search: stateFormMachine.coolant_uom,
  });

  const flatDataSelectUoMsCoolant =
    (isSuccessSelectUoMsCoolant &&
      dataSelectUoMsCoolant?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsHydraulic,
    isSuccess: isSuccessSelectUoMsHydraulic,
    fetchNextPage: fetchNextPageSelectUoMsHydraulic,
    hasNextPage: hasNextPageSelectUoMsHydraulic,
    isFetchingNextPage: isFetchingNextPageSelectUoMsHydraulic,
  } = useUoMInfinityQuery({
    search: stateFormMachine.hydraulic_uom,
  });

  const flatDataSelectUoMsHydraulic =
    (isSuccessSelectUoMsHydraulic &&
      dataSelectUoMsHydraulic?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsFront,
    isSuccess: isSuccessSelectUoMsFront,
    fetchNextPage: fetchNextPageSelectUoMsFront,
    hasNextPage: hasNextPageSelectUoMsFront,
    isFetchingNextPage: isFetchingNextPageSelectUoMsFront,
  } = useUoMInfinityQuery({
    search: stateFormMachine.dimension_front_uom,
  });

  const flatDataSelectUoMsFront =
    (isSuccessSelectUoMsFront &&
      dataSelectUoMsFront?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMsSide,
    isSuccess: isSuccessSelectUoMsSide,
    fetchNextPage: fetchNextPageSelectUoMsSide,
    hasNextPage: hasNextPageSelectUoMsSide,
    isFetchingNextPage: isFetchingNextPageSelectUoMsSide,
  } = useUoMInfinityQuery({
    search: stateFormMachine.dimension_side_uom,
  });

  const flatDataSelectUoMsSide =
    (isSuccessSelectUoMsSide &&
      dataSelectUoMsSide?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectReasons,
    isSuccess: isSuccessSelectReasons,
    fetchNextPage: fetchNextPageSelectReasons,
    hasNextPage: hasNextPageSelectReasons,
    isFetchingNextPage: isFetchingNextPageSelectReasons,
  } = useReasonsInfinityQuery({
    search: stateFormMachine.reason,
  });

  const flatDataSelectReasons =
    (isSuccessSelectReasons &&
      dataSelectReasons?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataSelectReasons = useMemo(() => {
    return flatDataSelectReasons.map((dept) => ({
      value: dept.id.toString(),
      label: dept.description ? dept.description : "",
    }));
  }, [flatDataSelectReasons]);

  const {
    data: dataFilterUoMs,
    isSuccess: isSuccessFilterUoMs,
    fetchNextPage: fetchNextPageFilterUoMs,
    hasNextPage: hasNextPageFilterUoMs,
    isFetchingNextPage: isFetchingNextPageFilterUoMs,
  } = useUoMInfinityQuery({
    search: stateFilterMachine.uom,
  });

  const flatDataFilterUoMs =
    (isSuccessFilterUoMs &&
      dataFilterUoMs?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterUoMs = useMemo(() => {
    return flatDataFilterUoMs.map((uom) => ({
      value: uom.id.toString(),
      label: uom.description ? uom.description : "",
    }));
  }, [flatDataFilterUoMs]);

  const {
    mutate: mutateCreateMachine,
    isPending: isPendingMutateCreateMachine,
  } = useCreateMachine();

  const {
    mutate: mutateUpdateMachine,
    isPending: isPendingMutateUpdateMachine,
  } = useUpdateMachine();

  const {
    mutate: mutateDeleteMachine,
    isPending: isPendingMutateDeleteMachine,
  } = useDeleteMachine();

  const {
    data: dataMachineDetails,
    isSuccess: isSuccessMachineDetails,
    isLoading: isLoadingMachineDetails,
    refetch: refetchMachineDetails,
  } = useMachineDetailsQuery({
    id: stateTableMachine.selected?.id ?? 0,
    params: {
      page: stateTableMachineDetail.activePage,
      rows: stateTableMachineDetail.rowsPerPage,
      sortBy: stateTableMachineDetail.sortBy,
      sortDirection: stateTableMachineDetail.sortDirection,
    },
  });

  const {
    data: dataMachineStatus,
    isSuccess: isSuccessMachineStatus,
    isLoading: isLoadingMachineStatus,
    refetch: refetchMachineStatus,
  } = useMachineStatusQuery({
    id: stateTableMachine.selected?.id ?? 0,
    params: {
      page: stateTableMachineStatus.activePage,
      rows: stateTableMachineStatus.rowsPerPage,
      sortBy: stateTableMachineStatus.sortBy,
      sortDirection: stateTableMachineStatus.sortDirection,
    },
  });

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataMachinePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rowsMachine = useMemo(() => {
    if (!isSuccessMachines || !dataMachines?.data?.pagination?.total_rows) {
      return null;
    }

    const colorApprovals: Record<string, string> = {
      SUBMITTED: "blue",
      APPROVED: "teal",
    };

    const colorCondition: Record<string, string> = {
      AVAILABLE: "teal",
      "PREVENTIVE MAINTENANCE": "orange",
      "UNDER REPAIR": "red",
      RELAYOUT: "blue",
      INACTIVE: "gray",
    };

    return dataMachines.data.items?.map((row: ViewMachine) => {
      const isSelected = stateTableMachine.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : "inherit";

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowMachine(row);
          }}
          className={`hover-row ${isSelected ? "selected-row" : ""}`}
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>
            <Badge color={colorApprovals[row.approval_status] ?? "gray"}>
              {row.approval_status ? row.approval_status : "DRAFT"}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge color={colorCondition[row.reason_description] ?? "gray"}>
              {row.reason_description ?? "-"}
            </Badge>
          </Table.Td>
          <Table.Td>{row.asset_num}</Table.Td>
          <Table.Td>{row.name}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.maker}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.detail_updatedby_name || "-"}</Table.Td>
          <Table.Td w="150px">
            {row.machine_updated_at
              ? formatDateTime(row.detail_updated_at)
              : "-"}
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessMachines,
    dataMachines,
    stateTableMachine.selected,
    colorScheme,
  ]);

  const rowsMachineDetail = useMemo(() => {
    if (
      !isSuccessMachineDetails ||
      !dataMachineDetails?.data?.pagination?.total_rows
    ) {
      return null;
    }

    const colorApprovals: Record<string, string> = {
      SUBMITTED: "blue",
      APPROVED: "teal",
    };

    return dataMachineDetails.data.items?.map((row: ViewMachineDetail) => {
      const isSelected = stateTableMachineDetail.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : "inherit";

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowMachineDetail(row);
          }}
          className={`hover-row ${isSelected ? "selected-row" : ""}`}
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w={100}>{row.rev_no ? row.rev_no : "-"}</Table.Td>
          <Table.Td>
            <Badge color={colorApprovals[row.approval_status] ?? "gray"}>
              {row.approval_status ? row.approval_status : "DRAFT"}
            </Badge>
          </Table.Td>
          <Table.Td>{row.name}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td w="150px">{row.detail_updatedby_name || "-"}</Table.Td>
          <Table.Td w="150px">
            {row.detail_updated_at
              ? formatDateTime(row.detail_updated_at)
              : "-"}
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessMachineDetails,
    dataMachineDetails,
    stateTableMachine.selected,
    stateTableMachineDetail.selected,
    colorScheme,
  ]);

  const rowsMachineStatus = useMemo(() => {
    if (
      !isSuccessMachineStatus ||
      !dataMachineStatus?.data?.pagination?.total_rows
    ) {
      return null;
    }

    const colorCondition: Record<string, string> = {
      AVAILABLE: "teal",
      "PREVENTIVE MAINTENANCE": "orange",
      "UNDER REPAIR": "red",
      RELAYOUT: "blue",
      INACTIVE: "gray",
    };

    return dataMachineStatus.data.items?.map((row: MachineStatus) => {
      const isSelected = stateTableMachineStatus.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : "inherit";

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowMachineStatus(row);
          }}
          className={`hover-row ${isSelected ? "selected-row" : ""}`}
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w={200}>
            <Badge
              color={colorCondition[row.reason?.description ?? "INACTIVE"]}
            >
              {row.reason?.description ?? "INACTIVE"}
            </Badge>
          </Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.created_by?.name || "-"}</Table.Td>
          <Table.Td w="150px">
            {row.created_at ? formatDateTime(row.created_at) : "-"}
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessMachineStatus,
    dataMachineStatus,
    stateTableMachine.selected,
    stateTableMachineStatus.selected,
    colorScheme,
  ]);

  const formMachine = useForm<CreateMachineRequest>({
    mode: "uncontrolled",
    initialValues: {
      machine: {},
      machine_detail: {
        id_machine: 0,
        rev_no: 0,
        code: "",
        code_old: "",
        asset_num: "",
        asset_num_old: "",
        description: "",
        name: "",
        maker: "",
        power: 0,
        id_power_uom: "",
        electricity: 0,
        id_electricity_uom: "",
        cavity: 0,
        lubricant: "",
        lubricant_capacity: 0,
        id_lubricant_uom: "",
        sliding: "",
        sliding_capacity: 0,
        id_sliding_uom: "",
        coolant: "",
        coolant_capacity: 0,
        id_coolant_uom: "",
        hydraulic: "",
        hydraulic_capacity: 0,
        id_hydraulic_uom: "",
        dimension_front: 0,
        id_dimension_front_uom: "",
        dimension_side: 0,
        id_dimension_side_uom: "",
      },
      machine_status: {
        id_reason: "",
        remarks: "",
      },
    },

    validate: (values) => {
      const errors: Record<string, string> = {};

      const isEmptyString = (value: unknown) =>
        typeof value === "string" && value.trim() === "";

      if (isEmptyString(values.machine_detail.code)) {
        errors["machine_detail.code"] = "Code is required";
      }
      if (isEmptyString(values.machine_detail.asset_num)) {
        errors["machine_detail.asset_num"] = "Asset Number is required";
      }
      if (isEmptyString(values.machine_detail.description)) {
        errors["machine_detail.description"] = "Description is required";
      }
      if (isEmptyString(values.machine_detail.name)) {
        errors["machine_detail.name"] = "Name is required";
      }
      if (isEmptyString(values.machine_detail.maker)) {
        errors["machine_detail.maker"] = "Maker is required";
      }

      if (values.machine_detail.power <= 0) {
        errors["machine_detail.power"] = "Power must be greater than 0";
      }
      if (isEmptyString(values.machine_detail.id_power_uom)) {
        errors["machine_detail.id_power_uom"] = "Power UOM is required";
      }

      if (values.machine_detail.electricity <= 0) {
        errors["machine_detail.electricity"] =
          "Electricity must be greater than 0";
      }
      if (isEmptyString(values.machine_detail.id_electricity_uom)) {
        errors["machine_detail.id_electricity_uom"] =
          "Electricity UOM is required";
      }

      if (values.machine_detail.cavity <= 0) {
        errors["machine_detail.cavity"] = "Cavity must be greater than 0";
      }

      if (isEmptyString(values.machine_detail.lubricant)) {
        errors["machine_detail.lubricant"] = "Lubricant is required";
      }
      if (isEmptyString(values.machine_detail.id_lubricant_uom)) {
        errors["machine_detail.id_lubricant_uom"] = "Lubricant UOM is required";
      }

      if (isEmptyString(values.machine_detail.sliding)) {
        errors["machine_detail.sliding"] = "Sliding is required";
      }
      if (isEmptyString(values.machine_detail.id_sliding_uom)) {
        errors["machine_detail.id_sliding_uom"] = "Sliding UOM is required";
      }

      if (isEmptyString(values.machine_detail.coolant)) {
        errors["machine_detail.coolant"] = "Coolant is required";
      }
      if (isEmptyString(values.machine_detail.id_coolant_uom)) {
        errors["machine_detail.id_coolant_uom"] = "Coolant UOM is required";
      }

      if (isEmptyString(values.machine_detail.hydraulic)) {
        errors["machine_detail.hydraulic"] = "Hydraulic is required";
      }
      if (isEmptyString(values.machine_detail.id_hydraulic_uom)) {
        errors["machine_detail.id_hydraulic_uom"] = "Hydraulic UOM is required";
      }

      if (values.machine_detail.dimension_front <= 0) {
        errors["machine_detail.dimension_front"] =
          "Front dimension must be greater than 0";
      }
      if (isEmptyString(values.machine_detail.id_dimension_front_uom)) {
        errors["machine_detail.id_dimension_front_uom"] =
          "Front dimension UOM is required";
      }

      if (values.machine_detail.dimension_side <= 0) {
        errors["machine_detail.dimension_side"] =
          "Side dimension must be greater than 0";
      }
      if (isEmptyString(values.machine_detail.id_dimension_side_uom)) {
        errors["machine_detail.id_dimension_side_uom"] =
          "Side dimension UOM is required";
      }

      if (isEmptyString(values.machine_status.id_reason)) {
        errors["machine_status.id_reason"] = "Reason is required";
      }

      return errors;
    },
  });

  const handleAddDataMachine = () => {
    formMachine.clearErrors();
    formMachine.reset();
    updateStateFormMachine({
      title: "Add Data",
      action: "add",
      power_uom: "",
      electricity_uom: "",
    });
    openFormMachine();
  };

  const handleEditDataMachine = () => {
    formMachine.clearErrors();
    formMachine.reset();
    if (!stateTableMachine.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to machine before proceeding",
      });
      return;
    }

    if (stateTableMachine.selected.approval_status) {
      notifications.show({
        title: "Only Draft Data Can Be Edited!",
        message:
          "Please select a data entry with 'Draft' status before proceeding.",
      });
      return;
    }

    updateStateFormMachine({
      title: "Edit Data",
      action: "edit",
      power_uom: stateTableMachine.selected.power_uom_code,
      electricity_uom: stateTableMachine.selected.electricity_uom_code,
      lubricant_uom: stateTableMachine.selected.lubricant_uom_code,
      sliding_uom: stateTableMachine.selected.sliding_uom_code,
      coolant_uom: stateTableMachine.selected.coolant_uom_code,
      hydraulic_uom: stateTableMachine.selected.hydraulic_uom_code,
      dimension_front_uom: stateTableMachine.selected.dimension_front_uom_code,
      dimension_side_uom: stateTableMachine.selected.dimension_side_uom_code,
      reason: stateTableMachine.selected.reason_description,
    });

    formMachine.setValues({
      machine: {
        id: stateTableMachine.selected.id,
      },
      machine_detail: {
        id_machine: stateTableMachine.selected.id,
        rev_no: stateTableMachine.selected.rev_no,
        code: stateTableMachine.selected.code,
        code_old: stateTableMachine.selected.code_old,
        asset_num: stateTableMachine.selected.asset_num,
        asset_num_old: stateTableMachine.selected.asset_num_old,
        description: stateTableMachine.selected.description,
        name: stateTableMachine.selected.name,
        maker: stateTableMachine.selected.maker,
        power: stateTableMachine.selected.power,
        id_power_uom: stateTableMachine.selected.id_power_uom.toString(),
        electricity: stateTableMachine.selected.electricity,
        id_electricity_uom:
          stateTableMachine.selected.id_electricity_uom.toString(),
        cavity: stateTableMachine.selected.cavity,
        lubricant: stateTableMachine.selected.lubricant,
        lubricant_capacity: stateTableMachine.selected.lubricant_capacity,
        id_lubricant_uom:
          stateTableMachine.selected.id_lubricant_uom.toString(),
        sliding: stateTableMachine.selected.sliding,
        sliding_capacity: stateTableMachine.selected.sliding_capacity,
        id_sliding_uom: stateTableMachine.selected.id_sliding_uom.toString(),
        coolant: stateTableMachine.selected.coolant,
        coolant_capacity: stateTableMachine.selected.coolant_capacity,
        id_coolant_uom: stateTableMachine.selected.id_coolant_uom.toString(),
        hydraulic: stateTableMachine.selected.hydraulic,
        hydraulic_capacity: stateTableMachine.selected.hydraulic_capacity,
        id_hydraulic_uom:
          stateTableMachine.selected.id_hydraulic_uom.toString(),
        dimension_front: stateTableMachine.selected.dimension_front,
        id_dimension_front_uom:
          stateTableMachine.selected.id_dimension_front_uom.toString(),
        dimension_side: stateTableMachine.selected.dimension_side,
        id_dimension_side_uom:
          stateTableMachine.selected.id_dimension_side_uom.toString(),
      },
      machine_status: {
        id_reason: stateTableMachine.selected.id_reason.toString(),
        remarks: stateTableMachine.selected.remarks,
      },
    });

    openFormMachine();
  };

  const handleDeleteDataMachine = () => {
    if (!stateTableMachine.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to machine before proceeding",
      });
      return;
    }

    if (stateTableMachine.selected.approval_status) {
      notifications.show({
        title: "Only Draft Data Can Be Deleted!",
        message: "You can only delete data entries with 'Draft' status.",
      });
      return;
    }

    updateStateFormMachine({ title: "Delete Data", action: "delete" });
    openFormDeleteMachine();
  };

  const handleViewDataMachine = () => {
    formMachine.clearErrors();
    formMachine.reset();

    if (!stateTableMachine.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to machine before proceeding",
      });
      return;
    }

    updateStateFormMachine({
      title: "View Data",
      action: "view",
      power_uom: stateTableMachine.selected.power_uom_code,
      electricity_uom: stateTableMachine.selected.electricity_uom_code,
      lubricant_uom: stateTableMachine.selected.lubricant_uom_code,
      sliding_uom: stateTableMachine.selected.sliding_uom_code,
      coolant_uom: stateTableMachine.selected.coolant_uom_code,
      hydraulic_uom: stateTableMachine.selected.hydraulic_uom_code,
      dimension_front_uom: stateTableMachine.selected.dimension_front_uom_code,
      dimension_side_uom: stateTableMachine.selected.dimension_side_uom_code,
      reason: stateTableMachine.selected.reason_description,
    });

    formMachine.setValues({
      machine: {
        id: stateTableMachine.selected.id,
      },
      machine_detail: {
        id_machine: stateTableMachine.selected.id,
        rev_no: stateTableMachine.selected.rev_no,
        code: stateTableMachine.selected.code,
        code_old: stateTableMachine.selected.code_old,
        asset_num: stateTableMachine.selected.asset_num,
        asset_num_old: stateTableMachine.selected.asset_num_old,
        description: stateTableMachine.selected.description,
        name: stateTableMachine.selected.name,
        maker: stateTableMachine.selected.maker,
        power: stateTableMachine.selected.power,
        id_power_uom: stateTableMachine.selected.id_power_uom.toString(),
        electricity: stateTableMachine.selected.electricity,
        id_electricity_uom:
          stateTableMachine.selected.id_electricity_uom.toString(),
        cavity: stateTableMachine.selected.cavity,
        lubricant: stateTableMachine.selected.lubricant,
        lubricant_capacity: stateTableMachine.selected.lubricant_capacity,
        id_lubricant_uom:
          stateTableMachine.selected.id_lubricant_uom.toString(),
        sliding: stateTableMachine.selected.sliding,
        sliding_capacity: stateTableMachine.selected.sliding_capacity,
        id_sliding_uom: stateTableMachine.selected.id_sliding_uom.toString(),
        coolant: stateTableMachine.selected.coolant,
        coolant_capacity: stateTableMachine.selected.coolant_capacity,
        id_coolant_uom: stateTableMachine.selected.id_coolant_uom.toString(),
        hydraulic: stateTableMachine.selected.hydraulic,
        hydraulic_capacity: stateTableMachine.selected.hydraulic_capacity,
        id_hydraulic_uom:
          stateTableMachine.selected.id_hydraulic_uom.toString(),
        dimension_front: stateTableMachine.selected.dimension_front,
        id_dimension_front_uom:
          stateTableMachine.selected.id_dimension_front_uom.toString(),
        dimension_side: stateTableMachine.selected.dimension_side,
        id_dimension_side_uom:
          stateTableMachine.selected.id_dimension_side_uom.toString(),
      },
      machine_status: {
        id_reason: stateTableMachine.selected.id_reason.toString(),
        remarks: stateTableMachine.selected.remarks,
      },
    });

    openFormMachine();
  };

  const handleSubmitFormMachine = () => {
    const dataMachine = formMachine.getValues();

    let mapMachine: CreateMachineRequest = {
      machine: { ...dataMachine.machine },
      machine_detail: {
        id_machine: Number(dataMachine.machine_detail.id_machine),
        rev_no: Number(dataMachine.machine_detail.rev_no),
        code: dataMachine.machine_detail.code,
        code_old: dataMachine.machine_detail.code_old,
        asset_num: dataMachine.machine_detail.asset_num,
        asset_num_old: dataMachine.machine_detail.asset_num_old,
        description: dataMachine.machine_detail.description,
        name: dataMachine.machine_detail.name,
        maker: dataMachine.machine_detail.maker,
        power: Number(dataMachine.machine_detail.power),
        id_power_uom: Number(dataMachine.machine_detail.id_power_uom),
        electricity: Number(dataMachine.machine_detail.electricity),
        id_electricity_uom: Number(
          dataMachine.machine_detail.id_electricity_uom
        ),
        cavity: Number(dataMachine.machine_detail.cavity),
        lubricant: dataMachine.machine_detail.lubricant,
        lubricant_capacity: Number(
          dataMachine.machine_detail.lubricant_capacity
        ),
        id_lubricant_uom: Number(dataMachine.machine_detail.id_lubricant_uom),
        sliding: dataMachine.machine_detail.sliding,
        sliding_capacity: Number(dataMachine.machine_detail.sliding_capacity),
        id_sliding_uom: Number(dataMachine.machine_detail.id_sliding_uom),
        coolant: dataMachine.machine_detail.coolant,
        coolant_capacity: Number(dataMachine.machine_detail.coolant_capacity),
        id_coolant_uom: Number(dataMachine.machine_detail.id_coolant_uom),
        hydraulic: dataMachine.machine_detail.hydraulic,
        hydraulic_capacity: Number(
          dataMachine.machine_detail.hydraulic_capacity
        ),
        id_hydraulic_uom: Number(dataMachine.machine_detail.id_hydraulic_uom),
        dimension_front: Number(dataMachine.machine_detail.dimension_front),
        id_dimension_front_uom: Number(
          dataMachine.machine_detail.id_dimension_front_uom
        ),
        dimension_side: Number(dataMachine.machine_detail.dimension_side),
        id_dimension_side_uom: Number(
          dataMachine.machine_detail.id_dimension_side_uom
        ),
      },
      machine_status: {
        id_reason: Number(dataMachine.machine_status.id_reason),
        remarks: dataMachine.machine_status.remarks,
      },
    };

    if (stateFormMachine.action === "add") {
      mutateCreateMachine(mapMachine, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapMachine.machine_detail.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchMachines();
          refetchMachineDetails();
          refetchMachineStatus();

          closeFormMachine();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapMachine.machine_detail.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormMachine();
        },
      });
    }

    if (stateFormMachine.action === "edit") {
      mutateUpdateMachine(
        {
          id: stateTableMachine.selected?.detail_id!,
          params: mapMachine.machine_detail,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableMachine.selected?.code} ⮕ ${mapMachine.machine_detail.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableMachine({ selected: null });
            refetchMachines();
            refetchMachineDetails();
            refetchMachineStatus();

            closeFormMachine();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableMachine.selected?.code} ⮕ ${mapMachine.machine_detail.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormMachine();
          },
        }
      );
    }

    if (stateFormMachine.action === "delete") {
      mutateDeleteMachine(stateTableMachine.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableMachine.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableMachine({ selected: null });
          refetchMachines();
          refetchMachineDetails();
          refetchMachineStatus();

          closeFormDeleteMachine();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableMachine.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteMachine();
        },
      });
    }
  };

  const handleCloseFormMachine = () => {
    if (stateFormMachine.action === "delete") {
      closeFormDeleteMachine();
    } else {
      closeFormMachine();
    }
    formMachine.clearErrors();
    formMachine.reset();
  };

  const useUoMCombobox = (
    fieldKey: string,
    form: UseFormReturnType<any>,
    updateStateFormMachine: (value: Record<string, string>) => void,
    flatData: UoM[]
  ) => {
    const combobox = useCombobox({
      onDropdownClose: () => combobox.resetSelectedOption(),
      onDropdownOpen: (eventSource) => {
        if (eventSource === "keyboard") {
          combobox.selectActiveOption();
        } else {
          combobox.updateSelectedOptionIndex("active");
        }
      },
    });

    const options = flatData.map((item) => (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() === form.values.machine_detail[`id_${fieldKey}`]
        }
        onClick={() => {
          form.setFieldValue(
            `machine_detail.id_${fieldKey}`,
            item.id.toString()
          );
          updateStateFormMachine({ [fieldKey]: item.code ?? "" });
          combobox.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            form.values.machine_detail[`id_${fieldKey}`] && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Code
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "4px",
                    }}
                  >
                    :
                  </td>
                  <td>
                    <Text fz={size}>{item.code}</Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Description
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "4px",
                    }}
                  >
                    :
                  </td>
                  <td>
                    <Text fz={size}>{item.description}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Stack>
        </Group>
      </Combobox.Option>
    ));

    return { combobox, options };
  };

  const { combobox: comboboxUoMPower, options: optionsUoMPower } =
    useUoMCombobox(
      "power_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsPower
    );

  const { combobox: comboboxUoMElectricity, options: optionsUoMElectricity } =
    useUoMCombobox(
      "electricity_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsElectricity
    );

  const { combobox: comboboxUoMLubricant, options: optionsUoMLubricant } =
    useUoMCombobox(
      "lubricant_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsLubricant
    );

  const { combobox: comboboxUoMSliding, options: optionsUoMSliding } =
    useUoMCombobox(
      "sliding_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsSliding
    );

  const { combobox: comboboxUoMCoolant, options: optionsUoMCoolant } =
    useUoMCombobox(
      "coolant_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsCoolant
    );

  const { combobox: comboboxUoMHydraulic, options: optionsUoMHydraulic } =
    useUoMCombobox(
      "hydraulic_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsHydraulic
    );

  const { combobox: comboboxUoMFront, options: optionsUoMFront } =
    useUoMCombobox(
      "dimension_front_uom",
      formMachine,
      updateStateFormMachine,
      flatDataSelectUoMsFront
    );

  const { combobox: comboboxUoMSide, options: optionsUoMSide } = useUoMCombobox(
    "dimension_side_uom",
    formMachine,
    updateStateFormMachine,
    flatDataSelectUoMsSide
  );

  return (
    <Stack h="100%" gap={20}>
      <Stack h="100%">
        <PageHeader title="Master Machine" />
        <Flex
          direction={{ base: "column-reverse", sm: "row" }}
          justify="space-between"
          align={{ base: "normal", sm: "center" }}
          gap={10}
        >
          <Button.Group>
            {[
              {
                icon: IconPlus,
                label: "Add",
                onClick: () => handleAddDataMachine(),
                access: dataMachinePermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataMachine(),
                access: dataMachinePermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataMachine(),
                access: dataMachinePermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataMachine(),
                access: true,
              },
            ].map((btn, idx) => (
              <Button
                key={idx}
                leftSection={<btn.icon size={16} />}
                variant="default"
                fullWidth={fullWidth}
                size={sizeButton}
                onClick={btn.onClick}
                style={{ display: btn.access ? "block" : "none" }}
              >
                {btn.label}
              </Button>
            ))}
          </Button.Group>
          <Flex gap={5}>
            <Input
              placeholder="Search"
              leftSection={<IconSearch size={16} />}
              size="xs"
              value={stateFilterMachine.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterMachine({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterMachine({ search: "" })}
                  style={{
                    display: stateFilterMachine.search ? undefined : "none",
                  }}
                />
              }
            />
            <Menu
              shadow="md"
              closeOnClickOutside={false}
              opened={stateFilterMachine.open}
              onChange={(isOpen) => updateStateFilterMachine({ open: isOpen })}
            >
              <Menu.Target>
                <ActionIcon variant="filled">
                  <IconFilter
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    onClick={() =>
                      updateStateFilterMachine({
                        open: !stateFilterMachine.open,
                      })
                    }
                  />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown p={15} w="fit-content">
                <Text mb={5}>Filter</Text>
                <Select
                  placeholder="UoM"
                  data={mappedDataFilterUoMs}
                  size={size}
                  searchable
                  searchValue={stateFilterMachine.uom || ""}
                  onSearchChange={(value) =>
                    updateStateFilterMachine({ uom: value || "" })
                  }
                  value={
                    stateFilterMachine.idUoM ? stateFilterMachine.idUoM : ""
                  }
                  onChange={(value, _option) =>
                    updateStateFilterMachine({ idUoM: value || "" })
                  }
                  maxDropdownHeight={heightDropdown}
                  nothingFoundMessage="Nothing found..."
                  clearable
                  clearButtonProps={{
                    onClick: () => {
                      updateStateFilterMachine({ uom: "" });
                    },
                  }}
                  scrollAreaProps={{
                    onScrollPositionChange: (position) => {
                      let maxY = 37;
                      const dataCount = mappedDataFilterUoMs.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
                        if (
                          hasNextPageFilterUoMs &&
                          !isFetchingNextPageFilterUoMs
                        ) {
                          fetchNextPageFilterUoMs();
                        }
                      }
                    },
                  }}
                />
                <Flex justify="end" pt={10}>
                  <Button
                    leftSection={<IconX size={14} />}
                    variant="default"
                    size={sizeButton}
                    onClick={() => updateStateFilterMachine({ open: false })}
                  >
                    Close
                  </Button>
                </Flex>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Flex>
        <Modal
          opened={openedFormMachine}
          onClose={closeFormMachine}
          title={stateFormMachine.title}
          closeOnClickOutside={false}
          size="xl"
        >
          <form onSubmit={formMachine.onSubmit(handleSubmitFormMachine)}>
            <ScrollArea h={600} type="scroll">
              <Stack gap={5}>
                <TextInput
                  label="Revision"
                  placeholder="Revision"
                  key={formMachine.key("machine_detail.rev_no")}
                  size={size}
                  disabled={true}
                  w={100}
                  {...formMachine.getInputProps("machine_detail.rev_no")}
                />
                <fieldset>
                  <legend>Information</legend>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Code"
                        placeholder="Code"
                        key={formMachine.key("machine_detail.code")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.code")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Code (Old)"
                        placeholder="Code (Old)"
                        key={formMachine.key("machine_detail.code_old")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.code_old"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Asset Number"
                        placeholder="Asset Number"
                        key={formMachine.key("machine_detail.asset_num")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.asset_num"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Asset Number (Old)"
                        placeholder="Asset Number (Old)"
                        key={formMachine.key("machine_detail.asset_num_old")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.asset_num_old"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Description"
                        placeholder="Description"
                        key={formMachine.key("machine_detail.description")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.description"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Name / Type"
                        placeholder="Name / Type"
                        key={formMachine.key("machine_detail.name")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.name")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Maker"
                        placeholder="Maker"
                        key={formMachine.key("machine_detail.maker")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.maker")}
                      />
                    </Grid.Col>
                  </Grid>
                </fieldset>
                <fieldset>
                  <legend>Specification</legend>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        hideControls
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Power"
                        placeholder="Power"
                        key={formMachine.key("machine_detail.power")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.power")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Combobox
                        store={comboboxUoMPower}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMPower.closeDropdown();
                          comboboxUoMPower.updateSelectedOptionIndex("active");
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.power_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_power_uom",
                                      ""
                                    );
                                    updateStateFormMachine({ power_uom: "" });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() => comboboxUoMPower.toggleDropdown()}
                            key={formMachine.key("machine_detail.id_power_uom")}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_power_uom"
                            )}
                          >
                            {stateFormMachine.power_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.power_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                power_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMPower.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsPower &&
                                    !isFetchingNextPageSelectUoMsPower
                                  ) {
                                    fetchNextPageSelectUoMsPower();
                                  }
                                }
                              }}
                            >
                              {optionsUoMPower.length > 0 ? (
                                optionsUoMPower
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        hideControls
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Electricity"
                        placeholder="Electricity"
                        key={formMachine.key("machine_detail.electricity")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.electricity"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Combobox
                        store={comboboxUoMElectricity}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMElectricity.closeDropdown();
                          comboboxUoMElectricity.updateSelectedOptionIndex(
                            "active"
                          );
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.electricity_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_electricity_uom",
                                      ""
                                    );
                                    updateStateFormMachine({
                                      electricity_uom: "",
                                    });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() =>
                              comboboxUoMElectricity.toggleDropdown()
                            }
                            key={formMachine.key(
                              "machine_detail.id_electricity_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_electricity_uom"
                            )}
                          >
                            {stateFormMachine.electricity_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.electricity_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                electricity_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMElectricity.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsElectricity &&
                                    !isFetchingNextPageSelectUoMsElectricity
                                  ) {
                                    fetchNextPageSelectUoMsElectricity();
                                  }
                                }
                              }}
                            >
                              {optionsUoMElectricity.length > 0 ? (
                                optionsUoMElectricity
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        hideControls
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Cavity / Station"
                        placeholder="Cavity / Station"
                        key={formMachine.key("machine_detail.cavity")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.cavity")}
                      />
                    </Grid.Col>
                  </Grid>
                </fieldset>
                <fieldset>
                  <legend>Fluids</legend>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Lubricant Oil"
                        placeholder="Lubricant Oil"
                        key={formMachine.key("machine_detail.lubricant")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.lubricant"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <NumberInput
                        hideControls
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Capacity"
                        placeholder="Capacity"
                        key={formMachine.key(
                          "machine_detail.lubricant_capacity"
                        )}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.lubricant_capacity"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Combobox
                        store={comboboxUoMLubricant}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMLubricant.closeDropdown();
                          comboboxUoMLubricant.updateSelectedOptionIndex(
                            "active"
                          );
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.lubricant_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_lubricant_uom",
                                      ""
                                    );
                                    updateStateFormMachine({
                                      lubricant_uom: "",
                                    });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() =>
                              comboboxUoMLubricant.toggleDropdown()
                            }
                            key={formMachine.key(
                              "machine_detail.id_lubricant_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_lubricant_uom"
                            )}
                          >
                            {stateFormMachine.lubricant_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.lubricant_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                lubricant_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMLubricant.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsLubricant &&
                                    !isFetchingNextPageSelectUoMsLubricant
                                  ) {
                                    fetchNextPageSelectUoMsLubricant();
                                  }
                                }
                              }}
                            >
                              {optionsUoMLubricant.length > 0 ? (
                                optionsUoMLubricant
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Sliding Oil"
                        placeholder="Sliding Oil"
                        key={formMachine.key("machine_detail.sliding")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.sliding")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <NumberInput
                        hideControls
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Capacity"
                        placeholder="Capacity"
                        key={formMachine.key("machine_detail.sliding_capacity")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.sliding_capacity"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Combobox
                        store={comboboxUoMSliding}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMSliding.closeDropdown();
                          comboboxUoMSliding.updateSelectedOptionIndex(
                            "active"
                          );
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.sliding_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_sliding_uom",
                                      ""
                                    );
                                    updateStateFormMachine({ sliding_uom: "" });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() => comboboxUoMSliding.toggleDropdown()}
                            key={formMachine.key(
                              "machine_detail.id_sliding_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_sliding_uom"
                            )}
                          >
                            {stateFormMachine.sliding_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.sliding_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                sliding_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMSliding.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsSliding &&
                                    !isFetchingNextPageSelectUoMsSliding
                                  ) {
                                    fetchNextPageSelectUoMsSliding();
                                  }
                                }
                              }}
                            >
                              {optionsUoMSliding.length > 0 ? (
                                optionsUoMSliding
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Coolant Oil"
                        placeholder="Coolant Oil"
                        key={formMachine.key("machine_detail.coolant")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps("machine_detail.coolant")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <NumberInput
                        hideControls
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Capacity"
                        placeholder="Capacity"
                        key={formMachine.key("machine_detail.coolant_capacity")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.coolant_capacity"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Combobox
                        store={comboboxUoMCoolant}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMCoolant.closeDropdown();
                          comboboxUoMCoolant.updateSelectedOptionIndex(
                            "active"
                          );
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.coolant_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_coolant_uom",
                                      ""
                                    );
                                    updateStateFormMachine({ coolant_uom: "" });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() => comboboxUoMCoolant.toggleDropdown()}
                            key={formMachine.key(
                              "machine_detail.id_coolant_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_coolant_uom"
                            )}
                          >
                            {stateFormMachine.coolant_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.coolant_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                coolant_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMCoolant.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsCoolant &&
                                    !isFetchingNextPageSelectUoMsCoolant
                                  ) {
                                    fetchNextPageSelectUoMsCoolant();
                                  }
                                }
                              }}
                            >
                              {optionsUoMCoolant.length > 0 ? (
                                optionsUoMCoolant
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Hydraulic Oil"
                        placeholder="Hydraulic Oil"
                        key={formMachine.key("machine_detail.hydraulic")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.hydraulic"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <NumberInput
                        hideControls
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Capacity"
                        placeholder="Capacity"
                        key={formMachine.key(
                          "machine_detail.hydraulic_capacity"
                        )}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.hydraulic_capacity"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Combobox
                        store={comboboxUoMHydraulic}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMHydraulic.closeDropdown();
                          comboboxUoMHydraulic.updateSelectedOptionIndex(
                            "active"
                          );
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.hydraulic_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_hydraulic_uom",
                                      ""
                                    );
                                    updateStateFormMachine({
                                      hydraulic_uom: "",
                                    });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() =>
                              comboboxUoMHydraulic.toggleDropdown()
                            }
                            key={formMachine.key(
                              "machine_detail.id_hydraulic_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_hydraulic_uom"
                            )}
                          >
                            {stateFormMachine.hydraulic_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.hydraulic_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                hydraulic_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMHydraulic.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsHydraulic &&
                                    !isFetchingNextPageSelectUoMsHydraulic
                                  ) {
                                    fetchNextPageSelectUoMsHydraulic();
                                  }
                                }
                              }}
                            >
                              {optionsUoMHydraulic.length > 0 ? (
                                optionsUoMHydraulic
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                  </Grid>
                </fieldset>
                <fieldset>
                  <legend>Dimension</legend>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        hideControls
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Front"
                        placeholder="Front"
                        key={formMachine.key("machine_detail.dimension_front")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.dimension_front"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Combobox
                        store={comboboxUoMFront}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMFront.closeDropdown();
                          comboboxUoMFront.updateSelectedOptionIndex("active");
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.dimension_front_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_dimension_front_uom",
                                      ""
                                    );
                                    updateStateFormMachine({
                                      dimension_front_uom: "",
                                    });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() => comboboxUoMFront.toggleDropdown()}
                            key={formMachine.key(
                              "machine_detail.id_dimension_front_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_dimension_front_uom"
                            )}
                          >
                            {stateFormMachine.dimension_front_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.dimension_front_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                dimension_front_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMFront.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsFront &&
                                    !isFetchingNextPageSelectUoMsFront
                                  ) {
                                    fetchNextPageSelectUoMsFront();
                                  }
                                }
                              }}
                            >
                              {optionsUoMFront.length > 0 ? (
                                optionsUoMFront
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        hideControls
                        decimalScale={2}
                        fixedDecimalScale
                        decimalSeparator=","
                        thousandSeparator="."
                        label="Side"
                        placeholder="Side"
                        key={formMachine.key("machine_detail.dimension_side")}
                        size={size}
                        disabled={stateFormMachine.action === "view"}
                        {...formMachine.getInputProps(
                          "machine_detail.dimension_side"
                        )}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Combobox
                        store={comboboxUoMSide}
                        resetSelectionOnOptionHover
                        onOptionSubmit={() => {
                          comboboxUoMSide.closeDropdown();
                          comboboxUoMSide.updateSelectedOptionIndex("active");
                        }}
                      >
                        <Combobox.Target targetType="button">
                          <InputBase
                            label="UoM"
                            component="button"
                            type="button"
                            pointer
                            rightSection={
                              stateFormMachine.dimension_side_uom ? (
                                <CloseButton
                                  size={16}
                                  onClick={() => {
                                    formMachine.setFieldValue(
                                      "machine_detail.id_dimension_side_uom",
                                      ""
                                    );
                                    updateStateFormMachine({
                                      dimension_side_uom: "",
                                    });
                                  }}
                                  disabled={stateFormMachine.action === "view"}
                                />
                              ) : (
                                <Combobox.Chevron />
                              )
                            }
                            rightSectionPointerEvents="all"
                            onClick={() => comboboxUoMSide.toggleDropdown()}
                            key={formMachine.key(
                              "machine_detail.id_dimension_side_uom"
                            )}
                            size={size}
                            disabled={stateFormMachine.action === "view"}
                            {...formMachine.getInputProps(
                              "machine_detail.id_dimension_side_uom"
                            )}
                          >
                            {stateFormMachine.dimension_side_uom || (
                              <Input.Placeholder>UoM</Input.Placeholder>
                            )}
                          </InputBase>
                        </Combobox.Target>
                        <Combobox.Dropdown>
                          <Combobox.Search
                            value={stateFormMachine.dimension_side_uom}
                            onChange={(event) =>
                              updateStateFormMachine({
                                dimension_side_uom: event.currentTarget.value,
                              })
                            }
                            placeholder="Search UoM"
                          />
                          <Combobox.Options>
                            <ScrollArea.Autosize
                              type="scroll"
                              mah={heightDropdown}
                              onScrollPositionChange={(position) => {
                                let maxY = 790;
                                const dataCount = optionsUoMSide.length;
                                const multipleOf10 =
                                  Math.floor(dataCount / 10) * 10;
                                if (position.y >= maxY) {
                                  maxY += Math.floor(multipleOf10 / 10) * 790;
                                  if (
                                    hasNextPageSelectUoMsSide &&
                                    !isFetchingNextPageSelectUoMsSide
                                  ) {
                                    fetchNextPageSelectUoMsSide();
                                  }
                                }
                              }}
                            >
                              {optionsUoMSide.length > 0 ? (
                                optionsUoMSide
                              ) : (
                                <Combobox.Empty>Nothing found</Combobox.Empty>
                              )}
                            </ScrollArea.Autosize>
                          </Combobox.Options>
                        </Combobox.Dropdown>
                      </Combobox>
                    </Grid.Col>
                  </Grid>
                </fieldset>
                <fieldset>
                  <legend>Condition</legend>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label="Reason"
                        placeholder="Reason"
                        data={mappedDataSelectReasons}
                        key={formMachine.key("machine_status.id_reason")}
                        size={size}
                        {...formMachine.getInputProps(
                          "machine_status.id_reason"
                        )}
                        searchable
                        searchValue={stateFormMachine.reason}
                        onSearchChange={(value) =>
                          updateStateFormMachine({ reason: value })
                        }
                        maxDropdownHeight={heightDropdown}
                        nothingFoundMessage="Nothing found..."
                        clearable
                        clearButtonProps={{
                          onClick: () => {
                            formMachine.setFieldValue(
                              "machine_status.id_reason",
                              ""
                            );
                            updateStateFormMachine({ reason: "" });
                          },
                        }}
                        scrollAreaProps={{
                          onScrollPositionChange: (position) => {
                            let maxY = 37;
                            const dataCount = mappedDataSelectReasons.length;
                            const multipleOf10 =
                              Math.floor(dataCount / 10) * 10;
                            if (position.y >= maxY) {
                              maxY += Math.floor(multipleOf10 / 10) * 37;
                              if (
                                hasNextPageSelectReasons &&
                                !isFetchingNextPageSelectReasons
                              ) {
                                fetchNextPageSelectReasons();
                              }
                            }
                          },
                        }}
                        disabled={
                          stateFormMachine.action === "view" ||
                          stateFormMachine.action === "edit"
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Textarea
                        label="Remarks"
                        placeholder="Remarks"
                        key={formMachine.key("machine_detail.remarks")}
                        size={size}
                        disabled={
                          stateFormMachine.action === "view" ||
                          stateFormMachine.action === "edit"
                        }
                        {...formMachine.getInputProps("machine_status.remarks")}
                      />
                    </Grid.Col>
                  </Grid>
                </fieldset>
              </Stack>
            </ScrollArea>
            <Group justify="center" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormMachine}
              >
                Close
              </Button>
              {stateFormMachine.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateMachine || isPendingMutateUpdateMachine
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteMachine}
          onClose={closeFormDeleteMachine}
          title={stateFormMachine.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>Are you sure you want to delete this machine?</Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormMachine}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteMachine}
              onClick={handleSubmitFormMachine}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingMachines && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessMachines ? (
          dataMachines?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "Code",
                  },
                  {
                    name: "Status",
                  },
                  {
                    name: "Condition",
                  },
                  {
                    name: "Asset No.",
                  },
                  {
                    name: "Name",
                  },
                  {
                    name: "Description",
                  },
                  {
                    name: "Maker",
                  },
                  {
                    name: "Remarks",
                  },
                  {
                    name: "Updated By",
                  },
                  {
                    name: "Last Updated",
                  },
                ]}
                rows={rowsMachine}
              />
              <TableFooter
                from={dataMachines.data.pagination.from}
                to={dataMachines.data.pagination.to}
                totalPages={dataMachines.data.pagination.total_pages}
                totalRows={dataMachines.data.pagination.total_rows}
                rowsPerPage={stateTableMachine.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableMachine({ rowsPerPage: rows || "" })
                }
                activePage={stateTableMachine.activePage}
                onPageChange={(page: number) =>
                  updateStateTableMachine({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingMachines && <NoDataFound />
        )}
      </Stack>
      <Flex
        pt={10}
        mih="50%"
        style={{
          borderTop: "1px solid gray",
        }}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: "sm", sm: "sm" }}
        justify={{ sm: "center" }}
      >
        <Stack
          pb={10}
          pe={10}
          mih="100%"
          w={{ sm: "65%" }}
          style={{
            borderRight: isSmall ? "none" : "1px solid gray",
            borderBottom: !isSmall ? "none" : "1px solid gray",
          }}
        >
          <PageSubHeader title="Detail History" />
          {isLoadingMachineDetails && (
            <Center flex={1}>
              <Loader size={100} />
            </Center>
          )}
          {isSuccessMachineDetails ? (
            dataMachineDetails?.data?.pagination.total_rows > 0 ? (
              <>
                <TableScrollable
                  minWidth={800}
                  headers={[
                    {
                      name: "Revision",
                    },
                    {
                      name: "Status",
                    },
                    {
                      name: "Name",
                    },
                    {
                      name: "Description",
                    },
                    {
                      name: "Updated By",
                    },
                    {
                      name: "Last Updated",
                    },
                  ]}
                  rows={rowsMachineDetail}
                />
                <TableFooter
                  from={dataMachineDetails.data.pagination.from}
                  to={dataMachineDetails.data.pagination.to}
                  totalPages={dataMachineDetails.data.pagination.total_pages}
                  totalRows={dataMachineDetails.data.pagination.total_rows}
                  rowsPerPage={stateTableMachineDetail.rowsPerPage}
                  onRowsPerPageChange={(rows) =>
                    updateStateTableMachineDetail({ rowsPerPage: rows || "" })
                  }
                  activePage={stateTableMachineDetail.activePage}
                  onPageChange={(page: number) =>
                    updateStateTableMachineDetail({ activePage: page })
                  }
                />
              </>
            ) : (
              <NoDataFound />
            )
          ) : (
            !isLoadingMachineDetails &&
            (stateTableMachine.selected?.id ? (
              <NoDataFound
                subTitle="There is no detail data in the machine"
                remarks="Please add the detail to the machine"
              />
            ) : (
              <NoDataFound
                subTitle="There is no detail data in the machine"
                remarks="Please select the machine first"
              />
            ))
          )}
        </Stack>
        <Stack pb={10} w={{ sm: "35%" }} mih="100%">
          <PageSubHeader title="Condition History" />
          {isLoadingMachineStatus && (
            <Center flex={1}>
              <Loader size={100} />
            </Center>
          )}
          {isSuccessMachineStatus ? (
            dataMachineStatus?.data?.pagination.total_rows > 0 ? (
              <>
                <TableScrollable
                  minWidth={800}
                  headers={[
                    {
                      name: "Condition",
                    },
                    {
                      name: "Remarks",
                    },
                    {
                      name: "Updated By",
                    },
                    {
                      name: "Last Updated",
                    },
                  ]}
                  rows={rowsMachineStatus}
                />
                <TableFooter
                  from={dataMachineStatus.data.pagination.from}
                  to={dataMachineStatus.data.pagination.to}
                  totalPages={dataMachineStatus.data.pagination.total_pages}
                  totalRows={dataMachineStatus.data.pagination.total_rows}
                  rowsPerPage={stateTableMachineStatus.rowsPerPage}
                  onRowsPerPageChange={(rows) =>
                    updateStateTableMachineStatus({ rowsPerPage: rows || "" })
                  }
                  activePage={stateTableMachineStatus.activePage}
                  onPageChange={(page: number) =>
                    updateStateTableMachineStatus({ activePage: page })
                  }
                />
              </>
            ) : (
              <NoDataFound />
            )
          ) : (
            !isLoadingMachineStatus &&
            (stateTableMachine.selected?.id ? (
              <NoDataFound
                subTitle="There is no condition data in the machine"
                remarks="Please add the condition to the machine"
              />
            ) : (
              <NoDataFound
                subTitle="There is no condition data in the machine"
                remarks="Please select the machine first"
              />
            ))
          )}
        </Stack>
      </Flex>
    </Stack>
  );
};

export default MachinePage;
