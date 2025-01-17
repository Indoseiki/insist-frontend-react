import {
  ActionIcon,
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Menu,
  Modal,
  rem,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
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
import { Building } from "../../../types/building";
import {
  useCreateBuilding,
  useDeleteBuilding,
  useBuildingsQuery,
  useUpdateBuilding,
} from "../../../hooks/building";
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

interface StateFilter {
  open: boolean;
  search: string;
  plant: string;
}

interface FormValues {
  code: string;
  description: string;
  plant: string;
  remarks: string;
}

const BuildingPage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormBuilding,
    { open: openFormBuilding, close: closeFormBuilding },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Building>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    plant: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Building>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Building) => updateStateTable({ selected: row });

  const {
    data: dataBuildings,
    isSuccess: isSuccessBuildings,
    isLoading: isLoadingBuildings,
    refetch: refetchBuildings,
  } = useBuildingsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    plant: stateFilter.plant,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateBuilding,
    isPending: isPendingMutateCreateBuilding,
  } = useCreateBuilding();

  const {
    mutate: mutateUpdateBuilding,
    isPending: isPendingMutateUpdateBuilding,
  } = useUpdateBuilding();

  const {
    mutate: mutateDeleteBuilding,
    isPending: isPendingMutateDeleteBuilding,
  } = useDeleteBuilding();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataBuildingPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessBuildings || !dataBuildings?.data?.pagination.total_rows)
      return null;

    return dataBuildings.data.items.map((row: Building) => {
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
          <Table.Td>{row.plant}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessBuildings, dataBuildings, stateTable.selected, colorScheme]);

  const formBuilding = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      description: "",
      plant: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
      plant: (value) => (value.length === 0 ? "Plant is required" : null),
    },
  });

  const handleAddData = () => {
    formBuilding.clearErrors();
    formBuilding.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormBuilding();
  };

  const handleEditData = () => {
    formBuilding.clearErrors();
    formBuilding.reset();
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Edit Data",
      action: "edit",
    });

    formBuilding.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      plant: stateTable.selected.plant,
      remarks: stateTable.selected.remarks,
    });

    openFormBuilding();
  };

  const handleDeleteData = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formBuilding.clearErrors();
    formBuilding.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "View Data",
      action: "view",
    });

    formBuilding.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      plant: stateTable.selected.plant,
      remarks: stateTable.selected.remarks,
    });

    openFormBuilding();
  };

  const handleSubmitForm = () => {
    const dataBuilding = formBuilding.getValues();

    if (stateForm.action === "add") {
      mutateCreateBuilding(dataBuilding, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataBuilding.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchBuildings();
          closeFormBuilding();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataBuilding.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormBuilding();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateBuilding(
        {
          id: stateTable.selected?.id!,
          params: dataBuilding,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${dataBuilding.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchBuildings();
            closeFormBuilding();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${dataBuilding.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormBuilding();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteBuilding(stateTable.selected?.id!, {
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
          refetchBuildings();
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

  const handleCloseFormBuilding = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormBuilding();
    }
    formBuilding.clearErrors();
    formBuilding.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Building" />
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
              access: dataBuildingPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataBuildingPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataBuildingPermission?.data.is_delete,
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
                placeholder="Plant"
                data={["PLANT 1", "PLANT 2"]}
                size={size}
                value={stateFilter.plant ? stateFilter.plant : ""}
                onChange={(value, _option) =>
                  updateStateFilter({ plant: value || "" })
                }
                clearable
                clearButtonProps={{
                  onClick: () => {
                    updateStateFilter({ plant: "" });
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
        opened={openedFormBuilding}
        onClose={closeFormBuilding}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formBuilding.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Code"
              placeholder="Code"
              key={formBuilding.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formBuilding.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formBuilding.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formBuilding.getInputProps("description")}
            />
            <Select
              label="Plant"
              placeholder="Plant"
              data={["PLANT 1", "PLANT 2"]}
              key={formBuilding.key("plant")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formBuilding.getInputProps("plant")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formBuilding.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formBuilding.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormBuilding}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateBuilding || isPendingMutateUpdateBuilding
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
        <Text size={size}>Are you sure you want to delete this building?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormBuilding}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteBuilding}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingBuildings && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessBuildings ? (
        dataBuildings?.data?.pagination.total_rows > 0 ? (
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
                  name: "Plant",
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
              from={dataBuildings.data.pagination.from}
              to={dataBuildings.data.pagination.to}
              totalPages={dataBuildings.data.pagination.total_pages}
              totalRows={dataBuildings.data.pagination.total_rows}
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
        !isLoadingBuildings && <NoDataFound />
      )}
    </Stack>
  );
};

export default BuildingPage;
