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

interface StateFilter {
  open: boolean;
  search: string;
  idBuilding: string;
  building: string;
}

interface FormValues {
  id_building: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormWarehouse extends StateForm {
  id_fcs: number;
  building: string;
}

const WarehousePage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormWarehouse,
    { open: openFormWarehouse, close: closeFormWarehouse },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Warehouse>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    idBuilding: "",
    building: "",
  });

  const [stateForm, setStateForm] = useState<StateFormWarehouse>({
    title: "",
    action: "",
    id_fcs: 0,
    building: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Warehouse>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormWarehouse>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Warehouse) =>
    updateStateTable({ selected: row });

  const {
    data: dataWarehouses,
    isSuccess: isSuccessWarehouses,
    isLoading: isLoadingWarehouses,
    refetch: refetchWarehouses,
  } = useWarehousesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    id_building: stateFilter.idBuilding,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectBuildings,
    isSuccess: isSuccessSelectBuildings,
    fetchNextPage: fetchNextPageSelectBuildings,
    hasNextPage: hasNextPageSelectBuildings,
    isFetchingNextPage: isFetchingNextPageSelectBuildings,
  } = useBuildingsInfinityQuery({
    search: stateForm.building,
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
    search: stateFilter.building,
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

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataWarehousePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessWarehouses || !dataWarehouses?.data?.pagination.total_rows)
      return null;

    return dataWarehouses.data.items.map((row: Warehouse) => {
      const isSelected = stateTable.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
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
  }, [isSuccessWarehouses, dataWarehouses, stateTable.selected, colorScheme]);

  const formWarehouse = useForm<FormValues>({
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

  const handleAddData = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();
    updateStateForm({ title: "Add Data", action: "add", building: "" });
    openFormWarehouse();
  };

  const handleEditData = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Edit Data",
      action: "edit",
      building: stateTable.selected.building?.description,
    });

    formWarehouse.setValues({
      id_building: stateTable.selected.building?.id.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormWarehouse();
  };

  const handleDeleteData = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formWarehouse.clearErrors();
    formWarehouse.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to warehouse before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "View Data",
      action: "view",
      building: stateTable.selected.building?.description,
    });

    formWarehouse.setValues({
      id_building: stateTable.selected.building?.id.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormWarehouse();
  };

  const handleSubmitForm = () => {
    const dataWarehouse = formWarehouse.getValues();

    let mapWarehouse = {
      ...dataWarehouse,
      id_building: parseInt(dataWarehouse.id_building),
    };

    if (stateForm.action === "add") {
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

    if (stateForm.action === "edit") {
      mutateUpdateWarehouse(
        {
          id: stateTable.selected?.id!,
          params: mapWarehouse,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${mapWarehouse.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
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
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${mapWarehouse.code})`,
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

    if (stateForm.action === "delete") {
      mutateDeleteWarehouse(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchWarehouses();
          closeFormDelete();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTable.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDelete();
        },
      });
    }
  };

  const handleCloseFormWarehouse = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormWarehouse();
    }
    formWarehouse.clearErrors();
    formWarehouse.reset();
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
          updateStateForm({ building: item.description });
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

  return (
    <Stack h="100%">
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
              onClick: () => handleAddData(),
              access: dataWarehousePermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataWarehousePermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataWarehousePermission?.data.is_delete,
            },
            {
              icon: IconBinoculars,
              label: "View",
              onClick: () => handleViewData(),
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
            value={stateFilter.search}
            w={{ base: "100%", sm: 200 }}
            onChange={(event) =>
              updateStateFilter({
                search: event.currentTarget.value,
              })
            }
            rightSectionPointerEvents="all"
            rightSection={
              <CloseButton
                size={16}
                onClick={() => updateStateFilter({ search: "" })}
                style={{ display: stateFilter.search ? undefined : "none" }}
              />
            }
          />
          <Menu
            shadow="md"
            closeOnClickOutside={false}
            opened={stateFilter.open}
            onChange={(isOpen) => updateStateFilter({ open: isOpen })}
          >
            <Menu.Target>
              <ActionIcon variant="filled">
                <IconFilter
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                  onClick={() => updateStateFilter({ open: !stateFilter.open })}
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
                searchValue={stateFilter.building || ""}
                onSearchChange={(value) =>
                  updateStateFilter({ building: value || "" })
                }
                value={stateFilter.idBuilding ? stateFilter.idBuilding : ""}
                onChange={(value, _option) =>
                  updateStateFilter({ idBuilding: value || "" })
                }
                maxDropdownHeight={heightDropdown}
                nothingFoundMessage="Nothing found..."
                clearable
                clearButtonProps={{
                  onClick: () => {
                    updateStateFilter({ building: "" });
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
                  onClick={() => updateStateFilter({ open: false })}
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
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formWarehouse.onSubmit(handleSubmitForm)}>
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
                    stateForm.building ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formWarehouse.setFieldValue("id_building", "");
                          updateStateForm({ building: "" });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxBuilding.toggleDropdown()}
                  key={formWarehouse.key("id_building")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formWarehouse.getInputProps("id_building")}
                >
                  {stateForm.building || (
                    <Input.Placeholder>Building</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.building}
                  onChange={(event) =>
                    updateStateForm({ building: event.currentTarget.value })
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
              disabled={stateForm.action === "view"}
              {...formWarehouse.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formWarehouse.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
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
              disabled={stateForm.action === "view"}
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
            {stateForm.action !== "view" && (
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
        opened={openedFormDelete}
        onClose={closeFormDelete}
        title={stateForm.title}
        centered
        closeOnClickOutside={false}
      >
        <Text size={size}>Are you sure you want to delete this warehouse?</Text>
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
            onClick={handleSubmitForm}
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
              rows={rows}
            />
            <TableFooter
              from={dataWarehouses.data.pagination.from}
              to={dataWarehouses.data.pagination.to}
              totalPages={dataWarehouses.data.pagination.total_pages}
              totalRows={dataWarehouses.data.pagination.total_rows}
              rowsPerPage={stateTable.rowsPerPage}
              onRowsPerPageChange={(rows) =>
                updateStateTable({ rowsPerPage: rows || "" })
              }
              activePage={stateTable.activePage}
              onPageChange={(page: number) =>
                updateStateTable({ activePage: page })
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
  );
};

export default WarehousePage;
