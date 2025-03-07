import {
  ActionIcon,
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  Loader,
  Menu,
  Modal,
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
import { Warehouse } from "../../../types/warehouse";
import {
  useCreateWarehouse,
  useDeleteWarehouse,
  useWarehousesQuery,
  useUpdateWarehouse,
  useWarehouseInfinityQuery,
} from "../../../hooks/warehouse";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/table/TableScrollable";
import TableFooter from "../../../components/table/TableFooter";
import NoDataFound from "../../../components/table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";
import { createActivityLog } from "../../../api/activityLog";
import { useBuildingsInfinityQuery } from "../../../hooks/building";
import PageSubHeader from "../../../components/layouts/PageSubHeader";
import {
  useCreateLocation,
  useDeleteLocation,
  useLocationsQuery,
  useUpdateLocation,
} from "../../../hooks/location";
import { Location } from "../../../types/location";

interface StateFilterWarehouse {
  open: boolean;
  search: string;
  idBuilding: string;
  building: string;
}

interface FormValuesWarehouse {
  id_building: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormWarehouse extends StateForm {
  id_fcs: number;
  building: string;
}

interface StateFilterLocation {
  open: boolean;
  search: string;
  idWarehouse: string;
  warehouse: string;
}

interface FormValuesLocation {
  id_warehouse: string;
  location: string;
  remarks: string;
}

interface StateFormLocation extends StateForm {
  id_fcs: number;
  warehouse: string;
}

const WarehousePage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormWarehouse,
    { open: openFormWarehouse, close: closeFormWarehouse },
  ] = useDisclosure(false);

  const [
    openedFormDeleteWarehouse,
    { open: openFormDeleteWarehouse, close: closeFormDeleteWarehouse },
  ] = useDisclosure(false);

  const [
    openedFormLocation,
    { open: openFormLocation, close: closeFormLocation },
  ] = useDisclosure(false);

  const [
    openedFormDeleteLocation,
    { open: openFormDeleteLocation, close: closeFormDeleteLocation },
  ] = useDisclosure(false);

  const [stateTableWarehouse, setStateTableWarehouse] = useState<
    StateTable<Warehouse>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilterWarehouse, setStateFilterWarehouse] =
    useState<StateFilterWarehouse>({
      open: false,
      search: "",
      idBuilding: "",
      building: "",
    });

  const [stateFormWarehouse, setStateFormWarehouse] =
    useState<StateFormWarehouse>({
      title: "",
      action: "",
      id_fcs: 0,
      building: "",
    });

  const [stateTableLocation, setStateTableLocation] = useState<
    StateTable<Location>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "id_warehouse",
    sortDirection: false,
  });

  const [stateFilterLocation, setStateFilterLocation] =
    useState<StateFilterLocation>({
      open: false,
      search: "",
      idWarehouse: "",
      warehouse: "",
    });

  const [stateFormLocation, setStateFormLocation] = useState<StateFormLocation>(
    {
      title: "",
      action: "",
      id_fcs: 0,
      warehouse: "",
    }
  );

  const updateStateTableWarehouse = (
    newState: Partial<StateTable<Warehouse>>
  ) => setStateTableWarehouse((prev) => ({ ...prev, ...newState }));

  const updateStateFilterWarehouse = (
    newState: Partial<StateFilterWarehouse>
  ) => setStateFilterWarehouse((prev) => ({ ...prev, ...newState }));

  const updateStateFormWarehouse = (newState: Partial<StateFormWarehouse>) =>
    setStateFormWarehouse((prev) => ({ ...prev, ...newState }));

  const handleClickRowWarehouse = (row: Warehouse) =>
    updateStateTableWarehouse({ selected: row });

  const updateStateTableLocation = (newState: Partial<StateTable<Location>>) =>
    setStateTableLocation((prev) => ({ ...prev, ...newState }));

  const updateStateFilterLocation = (newState: Partial<StateFilterLocation>) =>
    setStateFilterLocation((prev) => ({ ...prev, ...newState }));

  const updateStateFormLocation = (newState: Partial<StateFormLocation>) =>
    setStateFormLocation((prev) => ({ ...prev, ...newState }));

  const handleClickRowLocation = (row: Location) =>
    updateStateTableLocation({ selected: row });

  const {
    data: dataWarehouses,
    isSuccess: isSuccessWarehouses,
    isLoading: isLoadingWarehouses,
    refetch: refetchWarehouses,
  } = useWarehousesQuery({
    page: stateTableWarehouse.activePage,
    rows: stateTableWarehouse.rowsPerPage,
    id_building: stateFilterWarehouse.idBuilding,
    search: stateFilterWarehouse.search,
    sortBy: stateTableWarehouse.sortBy,
    sortDirection: stateTableWarehouse.sortDirection,
  });

  const {
    data: dataSelectBuildings,
    isSuccess: isSuccessSelectBuildings,
    fetchNextPage: fetchNextPageSelectBuildings,
    hasNextPage: hasNextPageSelectBuildings,
    isFetchingNextPage: isFetchingNextPageSelectBuildings,
  } = useBuildingsInfinityQuery({
    search: stateFormWarehouse.building,
    id_fcs: 0,
  });

  const flatDataSelectBuildings =
    (isSuccessSelectBuildings &&
      dataSelectBuildings?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataFilterBuildings,
    isSuccess: isSuccessFilterBuildings,
    fetchNextPage: fetchNextPageFilterBuildings,
    hasNextPage: hasNextPageFilterBuildings,
    isFetchingNextPage: isFetchingNextPageFilterBuildings,
  } = useBuildingsInfinityQuery({
    search: stateFilterWarehouse.building,
    id_fcs: 0,
  });

  const flatDataFilterBuildings =
    (isSuccessFilterBuildings &&
      dataFilterBuildings?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterBuildings = useMemo(() => {
    return flatDataFilterBuildings.map((building) => ({
      value: building.id.toString(),
      label: building.description ? building.description : "",
    }));
  }, [flatDataFilterBuildings]);

  const {
    data: dataLocations,
    isSuccess: isSuccessLocations,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useLocationsQuery({
    page: stateTableLocation.activePage,
    rows: stateTableLocation.rowsPerPage,
    id_warehouse: stateFilterLocation.idWarehouse,
    search: stateFilterLocation.search,
    sortBy: stateTableLocation.sortBy,
    sortDirection: stateTableLocation.sortDirection,
  });

  const {
    mutate: mutateCreateWarehouse,
    isPending: isPendingMutateCreateWarehouse,
  } = useCreateWarehouse();

  const {
    mutate: mutateUpdateWarehouse,
    isPending: isPendingMutateUpdateWarehouse,
  } = useUpdateWarehouse();

  const {
    mutate: mutateDeleteWarehouse,
    isPending: isPendingMutateDeleteWarehouse,
  } = useDeleteWarehouse();

  const {
    data: dataSelectWarehouses,
    isSuccess: isSuccessSelectWarehouses,
    fetchNextPage: fetchNextPageSelectWarehouses,
    hasNextPage: hasNextPageSelectWarehouses,
    isFetchingNextPage: isFetchingNextPageSelectWarehouses,
  } = useWarehouseInfinityQuery({
    search: stateFormLocation.warehouse,
  });

  const flatDataSelectWarehouses =
    (isSuccessSelectWarehouses &&
      dataSelectWarehouses?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    mutate: mutateCreateLocation,
    isPending: isPendingMutateCreateLocation,
  } = useCreateLocation();

  const {
    mutate: mutateUpdateLocation,
    isPending: isPendingMutateUpdateLocation,
  } = useUpdateLocation();

  const {
    mutate: mutateDeleteLocation,
    isPending: isPendingMutateDeleteLocation,
  } = useDeleteLocation();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataWarehousePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rowsWarehouse = useMemo(() => {
    if (!isSuccessWarehouses || !dataWarehouses?.data?.pagination.total_rows)
      return null;

    return dataWarehouses.data.items.map((row: Warehouse) => {
      const isSelected = stateTableWarehouse.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowWarehouse(row);
            updateStateFilterLocation({ idWarehouse: row.id.toString() });
          }}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.building?.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessWarehouses,
    dataWarehouses,
    stateTableWarehouse.selected,
    colorScheme,
  ]);

  const rowsLocation = useMemo(() => {
    if (!isSuccessLocations || !dataLocations?.data?.pagination.total_rows)
      return null;

    return dataLocations.data.items.map((row: Location) => {
      const isSelected = stateTableLocation.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRowLocation(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.location}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessLocations,
    dataLocations,
    stateTableLocation.selected,
    colorScheme,
  ]);

  const formWarehouse = useForm<FormValuesWarehouse>({
    mode: "uncontrolled",
    initialValues: {
      id_building: "",
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      id_building: (value) =>
        value.length === 0 ? "Building is required" : null,
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
    },
  });

  const formLocation = useForm<FormValuesLocation>({
    mode: "uncontrolled",
    initialValues: {
      id_warehouse: "",
      location: "",
      remarks: "",
    },

    validate: {
      id_warehouse: (value) =>
        value.length === 0 ? "Warehouse is required" : null,
      location: (value) => (value.length === 0 ? "Code is required" : null),
    },
  });

  const handleAddDataWarehouse = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();
    updateStateFormWarehouse({
      title: "Add Data",
      action: "add",
      building: "",
    });
    openFormWarehouse();
  };

  const handleEditDataWarehouse = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();
    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateFormWarehouse({
      title: "Edit Data",
      action: "edit",
      building: stateTableWarehouse.selected.building?.description,
    });

    formWarehouse.setValues({
      id_building: stateTableWarehouse.selected.building?.id.toString(),
      code: stateTableWarehouse.selected.code,
      description: stateTableWarehouse.selected.description,
      remarks: stateTableWarehouse.selected.remarks,
    });

    openFormWarehouse();
  };

  const handleDeleteDataWarehouse = () => {
    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateFormWarehouse({ title: "Delete Data", action: "delete" });
    openFormDeleteWarehouse();
  };

  const handleViewDataWarehouse = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();

    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateFormWarehouse({
      title: "View Data",
      action: "view",
      building: stateTableWarehouse.selected.building?.description,
    });

    formWarehouse.setValues({
      id_building: stateTableWarehouse.selected.building?.id.toString(),
      code: stateTableWarehouse.selected.code,
      description: stateTableWarehouse.selected.description,
      remarks: stateTableWarehouse.selected.remarks,
    });

    openFormWarehouse();
  };

  const handleSubmitFormWarehouse = () => {
    const dataWarehouse = formWarehouse.getValues();

    let mapWarehouse = {
      ...dataWarehouse,
      id_building: parseInt(dataWarehouse.id_building),
    };

    if (stateFormWarehouse.action === "add") {
      mutateCreateWarehouse(mapWarehouse, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapWarehouse.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchWarehouses();
          closeFormWarehouse();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapWarehouse.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormWarehouse();
        },
      });
    }

    if (stateFormWarehouse.action === "edit") {
      mutateUpdateWarehouse(
        {
          id: stateTableWarehouse.selected?.id!,
          params: mapWarehouse,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableWarehouse.selected?.code} ⮕ ${mapWarehouse.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableWarehouse({ selected: null });
            refetchWarehouses();
            closeFormWarehouse();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableWarehouse.selected?.code} ⮕ ${mapWarehouse.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormWarehouse();
          },
        }
      );
    }

    if (stateFormWarehouse.action === "delete") {
      mutateDeleteWarehouse(stateTableWarehouse.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableWarehouse.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableWarehouse({ selected: null });
          refetchWarehouses();
          closeFormDeleteWarehouse();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableWarehouse.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteWarehouse();
        },
      });
    }
  };

  const handleCloseFormWarehouse = () => {
    if (stateFormWarehouse.action === "delete") {
      closeFormDeleteWarehouse();
    } else {
      closeFormWarehouse();
    }
    formWarehouse.clearErrors();
    formWarehouse.reset();
  };

  const handleAddDataLocation = () => {
    formLocation.clearErrors();
    formLocation.reset();

    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data Warehouse First!",
        message:
          "Please select the data warehouse you want to process before proceeding",
      });
      return;
    }

    formLocation.setFieldValue(
      "id_warehouse",
      stateTableWarehouse.selected?.id.toString()
    );

    updateStateFormLocation({
      title: "Add Data",
      action: "add",
      warehouse: stateTableWarehouse.selected.description,
    });
    openFormLocation();
  };

  const handleEditDataLocation = () => {
    formLocation.clearErrors();
    formLocation.reset();

    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data Warehouse First!",
        message:
          "Please select the data warehouse you want to process before proceeding",
      });
      return;
    }

    if (!stateTableLocation.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateFormLocation({
      title: "Edit Data",
      action: "edit",
      warehouse: stateTableLocation.selected.warehouse?.description,
    });

    formLocation.setValues({
      id_warehouse: stateTableLocation.selected.warehouse?.id.toString(),
      location: stateTableLocation.selected.location,
      remarks: stateTableLocation.selected.remarks,
    });

    openFormLocation();
  };

  const handleDeleteDataLocation = () => {
    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data Warehouse First!",
        message:
          "Please select the data warehouse you want to process before proceeding",
      });
      return;
    }

    if (!stateTableLocation.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateFormLocation({ title: "Delete Data", action: "delete" });
    openFormDeleteLocation();
  };

  const handleViewDataLocation = () => {
    formLocation.clearErrors();
    formLocation.reset();

    if (!stateTableWarehouse.selected) {
      notifications.show({
        title: "Select Data Warehouse First!",
        message:
          "Please select the data warehouse you want to process before proceeding",
      });
      return;
    }

    if (!stateTableLocation.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateFormLocation({
      title: "View Data",
      action: "view",
      warehouse: stateTableLocation.selected.warehouse?.description,
    });

    formLocation.setValues({
      id_warehouse: stateTableLocation.selected.warehouse?.id.toString(),
      location: stateTableLocation.selected.location,
      remarks: stateTableLocation.selected.remarks,
    });

    openFormLocation();
  };

  const handleSubmitFormLocation = () => {
    const dataLocation = formLocation.getValues();

    let mapLocation = {
      ...dataLocation,
      id_warehouse: parseInt(dataLocation.id_warehouse),
    };

    if (stateFormLocation.action === "add") {
      mutateCreateLocation(mapLocation, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapLocation.location})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchLocations();
          closeFormLocation();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapLocation.location})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormLocation();
        },
      });
    }

    if (stateFormLocation.action === "edit") {
      mutateUpdateLocation(
        {
          id: stateTableLocation.selected?.id!,
          params: mapLocation,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableLocation.selected?.location} ⮕ ${mapLocation.location})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableLocation({ selected: null });
            refetchLocations();
            closeFormLocation();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableLocation.selected?.location} ⮕ ${mapLocation.location})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormLocation();
          },
        }
      );
    }

    if (stateFormLocation.action === "delete") {
      mutateDeleteLocation(stateTableLocation.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableLocation.selected?.location})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableLocation({ selected: null });
          refetchLocations();
          closeFormDeleteLocation();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableLocation.selected?.location}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteLocation();
        },
      });
    }
  };

  const handleCloseFormLocation = () => {
    if (stateFormLocation.action === "delete") {
      closeFormDeleteLocation();
    } else {
      closeFormLocation();
    }
    formLocation.clearErrors();
    formLocation.reset();
  };

  const comboboxBuilding = useCombobox({
    onDropdownClose: () => comboboxBuilding.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxBuilding.selectActiveOption();
      } else {
        comboboxBuilding.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsBuilding = flatDataSelectBuildings.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formWarehouse.getValues().id_building}
        onClick={() => {
          formWarehouse.setFieldValue("id_building", item.id.toString());
          updateStateFormWarehouse({ building: item.description });
          comboboxBuilding.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formWarehouse.getValues().id_building && (
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
    );
  });

  const comboboxWarehouse = useCombobox({
    onDropdownClose: () => comboboxWarehouse.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxWarehouse.selectActiveOption();
      } else {
        comboboxWarehouse.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsWarehouse = flatDataSelectWarehouses.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formLocation.getValues().id_warehouse}
        onClick={() => {
          formLocation.setFieldValue("id_warehouse", item.id.toString());
          updateStateFormLocation({ warehouse: item.description });
          comboboxWarehouse.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formLocation.getValues().id_warehouse && (
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
    );
  });

  return (
    <>
      <Stack h="50%">
        <PageHeader title="Master Warehouse" />
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
                onClick: () => handleAddDataWarehouse(),
                access: dataWarehousePermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataWarehouse(),
                access: dataWarehousePermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataWarehouse(),
                access: dataWarehousePermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataWarehouse(),
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
              value={stateFilterWarehouse.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterWarehouse({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterWarehouse({ search: "" })}
                  style={{
                    display: stateFilterWarehouse.search ? undefined : "none",
                  }}
                />
              }
            />
            <Menu
              shadow="md"
              closeOnClickOutside={false}
              opened={stateFilterWarehouse.open}
              onChange={(isOpen) =>
                updateStateFilterWarehouse({ open: isOpen })
              }
            >
              <Menu.Target>
                <ActionIcon variant="filled">
                  <IconFilter
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    onClick={() =>
                      updateStateFilterWarehouse({
                        open: !stateFilterWarehouse.open,
                      })
                    }
                  />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown p={15} w="fit-content">
                <Text mb={5}>Filter</Text>
                <Select
                  placeholder="Building"
                  data={mappedDataFilterBuildings}
                  size={size}
                  searchable
                  searchValue={stateFilterWarehouse.building || ""}
                  onSearchChange={(value) =>
                    updateStateFilterWarehouse({ building: value || "" })
                  }
                  value={
                    stateFilterWarehouse.idBuilding
                      ? stateFilterWarehouse.idBuilding
                      : ""
                  }
                  onChange={(value, _option) =>
                    updateStateFilterWarehouse({ idBuilding: value || "" })
                  }
                  maxDropdownHeight={heightDropdown}
                  nothingFoundMessage="Nothing found..."
                  clearable
                  clearButtonProps={{
                    onClick: () => {
                      updateStateFilterWarehouse({ building: "" });
                    },
                  }}
                  scrollAreaProps={{
                    onScrollPositionChange: (position) => {
                      let maxY = 37;
                      const dataCount = mappedDataFilterBuildings.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
                        if (
                          hasNextPageFilterBuildings &&
                          !isFetchingNextPageFilterBuildings
                        ) {
                          fetchNextPageFilterBuildings();
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
                    onClick={() => updateStateFilterWarehouse({ open: false })}
                  >
                    Close
                  </Button>
                </Flex>
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Flex>
        <Modal
          opened={openedFormWarehouse}
          onClose={closeFormWarehouse}
          title={stateFormWarehouse.title}
          closeOnClickOutside={false}
        >
          <form onSubmit={formWarehouse.onSubmit(handleSubmitFormWarehouse)}>
            <Stack gap={5}>
              <Combobox
                store={comboboxBuilding}
                resetSelectionOnOptionHover
                onOptionSubmit={() => {
                  comboboxBuilding.closeDropdown();
                  comboboxBuilding.updateSelectedOptionIndex("active");
                }}
              >
                <Combobox.Target targetType="button">
                  <InputBase
                    label="Building"
                    component="button"
                    type="button"
                    pointer
                    rightSection={
                      stateFormWarehouse.building ? (
                        <CloseButton
                          size={16}
                          onClick={() => {
                            formWarehouse.setFieldValue("id_building", "");
                            updateStateFormWarehouse({ building: "" });
                          }}
                          disabled={stateFormWarehouse.action === "view"}
                        />
                      ) : (
                        <Combobox.Chevron />
                      )
                    }
                    rightSectionPointerEvents="all"
                    onClick={() => comboboxBuilding.toggleDropdown()}
                    key={formWarehouse.key("id_building")}
                    size={size}
                    disabled={stateFormWarehouse.action === "view"}
                    {...formWarehouse.getInputProps("id_building")}
                  >
                    {stateFormWarehouse.building || (
                      <Input.Placeholder>Building</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Search
                    value={stateFormWarehouse.building}
                    onChange={(event) =>
                      updateStateFormWarehouse({
                        building: event.currentTarget.value,
                      })
                    }
                    placeholder="Search Building"
                  />
                  <Combobox.Options>
                    <ScrollArea.Autosize
                      type="scroll"
                      mah={heightDropdown}
                      onScrollPositionChange={(position) => {
                        let maxY = 790;
                        const dataCount = optionsBuilding.length;
                        const multipleOf10 = Math.floor(dataCount / 10) * 10;
                        if (position.y >= maxY) {
                          maxY += Math.floor(multipleOf10 / 10) * 790;
                          if (
                            hasNextPageSelectBuildings &&
                            !isFetchingNextPageSelectBuildings
                          ) {
                            fetchNextPageSelectBuildings();
                          }
                        }
                      }}
                    >
                      {optionsBuilding.length > 0 ? (
                        optionsBuilding
                      ) : (
                        <Combobox.Empty>Nothing found</Combobox.Empty>
                      )}
                    </ScrollArea.Autosize>
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <TextInput
                label="Code"
                placeholder="Code"
                key={formWarehouse.key("code")}
                size={size}
                disabled={stateFormWarehouse.action === "view"}
                {...formWarehouse.getInputProps("code")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formWarehouse.key("description")}
                size={size}
                disabled={stateFormWarehouse.action === "view"}
                {...formWarehouse.getInputProps("description")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formWarehouse.key("remarks")}
                size={size}
                disabled={stateFormWarehouse.action === "view"}
                {...formWarehouse.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormWarehouse}
              >
                Close
              </Button>
              {stateFormWarehouse.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateWarehouse ||
                    isPendingMutateUpdateWarehouse
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteWarehouse}
          onClose={closeFormDeleteWarehouse}
          title={stateFormWarehouse.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>
            Are you sure you want to delete this warehouse?
          </Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormWarehouse}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteWarehouse}
              onClick={handleSubmitFormLocation}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingWarehouses && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessWarehouses ? (
          dataWarehouses?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "Code",
                  },
                  {
                    name: "Description",
                  },
                  {
                    name: "Building",
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
                rows={rowsWarehouse}
              />
              <TableFooter
                from={dataWarehouses.data.pagination.from}
                to={dataWarehouses.data.pagination.to}
                totalPages={dataWarehouses.data.pagination.total_pages}
                totalRows={dataWarehouses.data.pagination.total_rows}
                rowsPerPage={stateTableWarehouse.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableWarehouse({ rowsPerPage: rows || "" })
                }
                activePage={stateTableWarehouse.activePage}
                onPageChange={(page: number) =>
                  updateStateTableWarehouse({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingWarehouses && <NoDataFound />
        )}
      </Stack>
      <Stack h="50%">
        <PageSubHeader title="Location" />
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
                onClick: () => handleAddDataLocation(),
                access: dataWarehousePermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataLocation(),
                access: dataWarehousePermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataLocation(),
                access: dataWarehousePermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataLocation(),
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
              value={stateFilterLocation.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterLocation({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterLocation({ search: "" })}
                  style={{
                    display: stateFilterLocation.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormLocation}
          onClose={closeFormLocation}
          title={stateFormLocation.title}
          closeOnClickOutside={false}
        >
          <form onSubmit={formLocation.onSubmit(handleSubmitFormLocation)}>
            <Stack gap={5}>
              <Combobox
                store={comboboxWarehouse}
                resetSelectionOnOptionHover
                onOptionSubmit={() => {
                  comboboxWarehouse.closeDropdown();
                  comboboxWarehouse.updateSelectedOptionIndex("active");
                }}
              >
                <Combobox.Target targetType="button">
                  <InputBase
                    label="Warehouse"
                    component="button"
                    type="button"
                    pointer
                    rightSection={
                      stateFormLocation.warehouse ? (
                        <CloseButton
                          size={16}
                          onClick={() => {
                            formLocation.setFieldValue("id_warehouse", "");
                            updateStateFormLocation({ warehouse: "" });
                          }}
                          disabled={stateFormLocation.action === "view"}
                        />
                      ) : (
                        <Combobox.Chevron />
                      )
                    }
                    rightSectionPointerEvents="all"
                    onClick={() => comboboxWarehouse.toggleDropdown()}
                    key={formLocation.key("id_warehouse")}
                    size={size}
                    disabled={true}
                    {...formLocation.getInputProps("id_warehouse")}
                  >
                    {stateFormLocation.warehouse || (
                      <Input.Placeholder>Warehouse</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Search
                    value={stateFormLocation.warehouse}
                    onChange={(event) =>
                      updateStateFormLocation({
                        warehouse: event.currentTarget.value,
                      })
                    }
                    placeholder="Search Warehouse"
                  />
                  <Combobox.Options>
                    <ScrollArea.Autosize
                      type="scroll"
                      mah={heightDropdown}
                      onScrollPositionChange={(position) => {
                        let maxY = 790;
                        const dataCount = optionsWarehouse.length;
                        const multipleOf10 = Math.floor(dataCount / 10) * 10;
                        if (position.y >= maxY) {
                          maxY += Math.floor(multipleOf10 / 10) * 790;
                          if (
                            hasNextPageSelectWarehouses &&
                            !isFetchingNextPageSelectWarehouses
                          ) {
                            fetchNextPageSelectWarehouses();
                          }
                        }
                      }}
                    >
                      {optionsWarehouse.length > 0 ? (
                        optionsWarehouse
                      ) : (
                        <Combobox.Empty>Nothing found</Combobox.Empty>
                      )}
                    </ScrollArea.Autosize>
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <TextInput
                label="Location"
                placeholder="Location"
                key={formLocation.key("location")}
                size={size}
                disabled={stateFormLocation.action === "view"}
                {...formLocation.getInputProps("location")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formLocation.key("remarks")}
                size={size}
                disabled={stateFormLocation.action === "view"}
                {...formLocation.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormLocation}
              >
                Close
              </Button>
              {stateFormLocation.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateLocation ||
                    isPendingMutateUpdateLocation
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteLocation}
          onClose={closeFormDeleteLocation}
          title={stateFormLocation.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>
            Are you sure you want to delete this location?
          </Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormLocation}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteLocation}
              onClick={handleSubmitFormLocation}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingLocations && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessLocations ? (
          dataLocations?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "Location",
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
                rows={rowsLocation}
              />
              <TableFooter
                from={dataLocations.data.pagination.from}
                to={dataLocations.data.pagination.to}
                totalPages={dataLocations.data.pagination.total_pages}
                totalRows={dataLocations.data.pagination.total_rows}
                rowsPerPage={stateTableLocation.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableLocation({ rowsPerPage: rows || "" })
                }
                activePage={stateTableLocation.activePage}
                onPageChange={(page: number) =>
                  updateStateTableLocation({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingLocations &&
          (stateFilterLocation.idWarehouse ? (
            <NoDataFound
              subTitle="There is no location data in the warehouse"
              remarks="Please add the location to the warehouse"
            />
          ) : (
            <NoDataFound
              subTitle="There is no location data in the warehouse"
              remarks="Please select the warehouse first"
            />
          ))
        )}
      </Stack>
    </>
  );
};

export default WarehousePage;
