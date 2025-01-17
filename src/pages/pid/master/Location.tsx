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
import { Location } from "../../../types/location";
import {
  useCreateLocation,
  useDeleteLocation,
  useLocationsQuery,
  useUpdateLocation,
} from "../../../hooks/location";
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
import { useWarehouseInfinityQuery } from "../../../hooks/warehouse";

interface StateFilter {
  open: boolean;
  search: string;
  idWarehouse: string;
  warehouse: string;
}

interface FormValues {
  id_warehouse: string;
  location: string;
  remarks: string;
}

interface StateFormLocation extends StateForm {
  id_fcs: number;
  warehouse: string;
}

const LocationPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormLocation,
    { open: openFormLocation, close: closeFormLocation },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Location>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "id_warehouse",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    idWarehouse: "",
    warehouse: "",
  });

  const [stateForm, setStateForm] = useState<StateFormLocation>({
    title: "",
    action: "",
    id_fcs: 0,
    warehouse: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Location>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormLocation>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Location) => updateStateTable({ selected: row });

  const {
    data: dataLocations,
    isSuccess: isSuccessLocations,
    isLoading: isLoadingLocations,
    refetch: refetchLocations,
  } = useLocationsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    id_warehouse: stateFilter.idWarehouse,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectWarehouses,
    isSuccess: isSuccessSelectWarehouses,
    fetchNextPage: fetchNextPageSelectWarehouses,
    hasNextPage: hasNextPageSelectWarehouses,
    isFetchingNextPage: isFetchingNextPageSelectWarehouses,
  } = useWarehouseInfinityQuery({
    search: stateForm.warehouse,
  });

  const flatDataSelectWarehouses =
    (isSuccessSelectWarehouses &&
      dataSelectWarehouses?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataFilterWarehouses,
    isSuccess: isSuccessFilterWarehouses,
    fetchNextPage: fetchNextPageFilterWarehouses,
    hasNextPage: hasNextPageFilterWarehouses,
    isFetchingNextPage: isFetchingNextPageFilterWarehouses,
  } = useWarehouseInfinityQuery({
    search: stateFilter.warehouse,
  });

  const flatDataFilterWarehouses =
    (isSuccessFilterWarehouses &&
      dataFilterWarehouses?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterWarehouses = useMemo(() => {
    return flatDataFilterWarehouses.map((warehouse) => ({
      value: warehouse.id.toString(),
      label: warehouse.description ? warehouse.description : "",
    }));
  }, [flatDataFilterWarehouses]);

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
  const { data: dataLocationPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessLocations || !dataLocations?.data?.pagination.total_rows)
      return null;

    return dataLocations.data.items.map((row: Location) => {
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
          <Table.Td>{row.location}</Table.Td>
          <Table.Td>{row.warehouse?.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessLocations, dataLocations, stateTable.selected, colorScheme]);

  const formLocation = useForm<FormValues>({
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

  const handleAddData = () => {
    formLocation.clearErrors();
    formLocation.reset();
    updateStateForm({ title: "Add Data", action: "add", warehouse: "" });
    openFormLocation();
  };

  const handleEditData = () => {
    formLocation.clearErrors();
    formLocation.reset();
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to location before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Edit Data",
      action: "edit",
    });

    formLocation.setValues({
      location: stateTable.selected.location,
      remarks: stateTable.selected.remarks,
    });

    openFormLocation();
  };

  const handleDeleteData = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to location before proceeding",
      });
      return;
    }

    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formLocation.clearErrors();
    formLocation.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to location before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "View Data",
      action: "view",
    });

    formLocation.setValues({
      location: stateTable.selected.location,
      remarks: stateTable.selected.remarks,
    });

    openFormLocation();
  };

  const handleSubmitForm = () => {
    const dataLocation = formLocation.getValues();

    let mapLocation = {
      ...dataLocation,
      id_warehouse: parseInt(dataLocation.id_warehouse),
    };

    if (stateForm.action === "add") {
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

    if (stateForm.action === "edit") {
      mutateUpdateLocation(
        {
          id: stateTable.selected?.id!,
          params: mapLocation,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.location} ⮕ ${mapLocation.location})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
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
              message: `${res?.data.message} (${stateTable.selected?.location} ⮕ ${mapLocation.location})`,
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

    if (stateForm.action === "delete") {
      mutateDeleteLocation(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.location})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchLocations();
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
            message: `${res?.data.message} (${stateTable.selected?.location}) `,
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

  const handleCloseFormLocation = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormLocation();
    }
    formLocation.clearErrors();
    formLocation.reset();
  };

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
          updateStateForm({ warehouse: item.description });
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
    <Stack h="100%">
      <PageHeader title="Master Location" />
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
              access: dataLocationPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataLocationPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataLocationPermission?.data.is_delete,
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
                placeholder="Warehouse"
                data={mappedDataFilterWarehouses}
                size={size}
                w={250}
                searchable
                searchValue={stateFilter.warehouse || ""}
                onSearchChange={(value) =>
                  updateStateFilter({ warehouse: value || "" })
                }
                value={stateFilter.idWarehouse ? stateFilter.idWarehouse : ""}
                onChange={(value, _option) =>
                  updateStateFilter({ idWarehouse: value || "" })
                }
                maxDropdownHeight={heightDropdown}
                nothingFoundMessage="Nothing found..."
                clearable
                clearButtonProps={{
                  onClick: () => {
                    updateStateFilter({ warehouse: "" });
                  },
                }}
                scrollAreaProps={{
                  onScrollPositionChange: (position) => {
                    let maxY = 37;
                    const dataCount = mappedDataFilterWarehouses.length;
                    const multipleOf10 = Math.floor(dataCount / 10) * 10;
                    if (position.y >= maxY) {
                      maxY += Math.floor(multipleOf10 / 10) * 37;
                      if (
                        hasNextPageFilterWarehouses &&
                        !isFetchingNextPageFilterWarehouses
                      ) {
                        fetchNextPageFilterWarehouses();
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
        opened={openedFormLocation}
        onClose={closeFormLocation}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formLocation.onSubmit(handleSubmitForm)}>
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
                    stateForm.warehouse ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formLocation.setFieldValue("id_warehouse", "");
                          updateStateForm({ warehouse: "" });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxWarehouse.toggleDropdown()}
                  key={formLocation.key("id_warehouse")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formLocation.getInputProps("id_warehouse")}
                >
                  {stateForm.warehouse || (
                    <Input.Placeholder>Warehouse</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.warehouse}
                  onChange={(event) =>
                    updateStateForm({ warehouse: event.currentTarget.value })
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
              disabled={stateForm.action === "view"}
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
              disabled={stateForm.action === "view"}
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
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateLocation || isPendingMutateUpdateLocation
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
        <Text size={size}>Are you sure you want to delete this location?</Text>
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
            onClick={handleSubmitForm}
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
                  name: "Warehouse",
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
              from={dataLocations.data.pagination.from}
              to={dataLocations.data.pagination.to}
              totalPages={dataLocations.data.pagination.total_pages}
              totalRows={dataLocations.data.pagination.total_rows}
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
        !isLoadingLocations && <NoDataFound />
      )}
    </Stack>
  );
};

export default LocationPage;
