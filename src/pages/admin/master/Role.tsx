import {
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { Role } from "../../../types/role";
import {
  useCreateRole,
  useDeleteRole,
  useRolesQuery,
  useUpdateRole,
} from "../../../hooks/role";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/table/TableScrollable";
import TableFooter from "../../../components/table/TableFooter";
import NoDataFound from "../../../components/table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";

interface StateFilter {
  search: string;
}

interface FormValues {
  name: string;
}

const RolePage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormRole, { open: openFormRole, close: closeFormRole }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Role>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "name",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Role>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Role) => updateStateTable({ selected: row });

  const {
    data: dataRoles,
    isSuccess: isSuccessRoles,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
  } = useRolesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const { mutate: mutateCreateRole, isPending: isPendingMutateCreateRole } =
    useCreateRole();

  const { mutate: mutateUpdateRole, isPending: isPendingMutateUpdateRole } =
    useUpdateRole();

  const { mutate: mutateDeleteRole, isPending: isPendingMutateDeleteRole } =
    useDeleteRole();

  const rows = useMemo(() => {
    if (!isSuccessRoles || !dataRoles?.data?.pagination.total_rows) return null;

    return dataRoles.data.items.map((row: Role) => {
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
          <Table.Td>{row.name}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessRoles, dataRoles, stateTable.selected, colorScheme]);

  const formRole = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
    },

    validate: {
      name: (value) => (value.length === 0 ? "Name is required" : null),
    },
  });

  const handleAddData = () => {
    formRole.clearErrors();
    formRole.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormRole();
  };

  const handleEditData = () => {
    formRole.clearErrors();
    formRole.reset();
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

    formRole.setValues({
      name: stateTable.selected.name,
    });

    openFormRole();
  };

  const handleDeleteData = () => {
    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formRole.clearErrors();
    formRole.reset();

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

    formRole.setValues({
      name: stateTable.selected.name,
    });

    openFormRole();
  };

  const handleSubmitForm = () => {
    const dataRole = formRole.getValues();

    if (stateForm.action === "add") {
      mutateCreateRole(dataRole, {
        onSuccess(res) {
          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchRoles();
          closeFormRole();
        },
        onError() {
          notifications.show({
            title: "Created Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormRole();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateRole(
        {
          id: stateTable.selected?.id!,
          params: dataRole,
        },
        {
          onSuccess(res) {
            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchRoles();
            closeFormRole();
          },
          onError() {
            notifications.show({
              title: "Updated Failed!",
              message: "Please check and try again",
              color: "red",
            });

            closeFormRole();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteRole(stateTable.selected?.id!, {
        onSuccess(res) {
          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchRoles();
          closeFormDelete();
        },
        onError() {
          notifications.show({
            title: "Deleted Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormDelete();
        },
      });
    }
  };

  const handleCloseFormRole = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormRole();
    }
    formRole.clearErrors();
    formRole.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Role" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Button.Group>
          {[
            { icon: IconPlus, label: "Add", onClick: () => handleAddData() },
            { icon: IconEdit, label: "Edit", onClick: () => handleEditData() },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
            },
            {
              icon: IconBinoculars,
              label: "View",
              onClick: () => handleViewData(),
            },
          ].map((btn, idx) => (
            <Button
              key={idx}
              leftSection={<btn.icon size={16} />}
              variant="default"
              fullWidth={fullWidth}
              size={sizeButton}
              onClick={btn.onClick}
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
        </Flex>
      </Flex>
      <Modal
        opened={openedFormRole}
        onClose={closeFormRole}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formRole.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Name"
              placeholder="Name"
              key={formRole.key("name")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formRole.getInputProps("name")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormRole}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateRole || isPendingMutateUpdateRole}
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
        <Text size={size}>Are you sure you want to delete this role?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormRole}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteRole}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingRoles && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessRoles ? (
        dataRoles?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Name",
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
              from={dataRoles.data.pagination.from}
              to={dataRoles.data.pagination.to}
              totalPages={dataRoles.data.pagination.total_pages}
              totalRows={dataRoles.data.pagination.total_rows}
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
        !isLoadingRoles && <NoDataFound />
      )}
    </Stack>
  );
};

export default RolePage;
