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
  Textarea,
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
import { UoM } from "../../../types/uom";
import {
  useCreateUoM,
  useDeleteUoM,
  useUoMsQuery,
  useUpdateUoM,
} from "../../../hooks/uom";
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
  search: string;
}

interface FormValues {
  code: string;
  description: string;
  remarks: string;
}

const UoMPage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormUoM, { open: openFormUoM, close: closeFormUoM }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<UoM>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<UoM>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: UoM) => updateStateTable({ selected: row });

  const {
    data: dataUoMs,
    isSuccess: isSuccessUoMs,
    isLoading: isLoadingUoMs,
    refetch: refetchUoMs,
  } = useUoMsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const { mutate: mutateCreateUoM, isPending: isPendingMutateCreateUoM } =
    useCreateUoM();

  const { mutate: mutateUpdateUoM, isPending: isPendingMutateUpdateUoM } =
    useUpdateUoM();

  const { mutate: mutateDeleteUoM, isPending: isPendingMutateDeleteUoM } =
    useDeleteUoM();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataUoMPermission } = useRolePermissionQuery(location.pathname);

  const rows = useMemo(() => {
    if (!isSuccessUoMs || !dataUoMs?.data?.pagination.total_rows) return null;

    return dataUoMs.data.items.map((row: UoM) => {
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
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessUoMs, dataUoMs, stateTable.selected, colorScheme]);

  const formUoM = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddData = () => {
    formUoM.clearErrors();
    formUoM.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormUoM();
  };

  const handleEditData = () => {
    formUoM.clearErrors();
    formUoM.reset();
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to uom before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Edit Data",
      action: "edit",
    });

    formUoM.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormUoM();
  };

  const handleDeleteData = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to uom before proceeding",
      });
      return;
    }

    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formUoM.clearErrors();
    formUoM.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to uom before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "View Data",
      action: "view",
    });

    formUoM.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormUoM();
  };

  const handleSubmitForm = () => {
    const dataUoM = formUoM.getValues();

    if (stateForm.action === "add") {
      mutateCreateUoM(dataUoM, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataUoM.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchUoMs();
          closeFormUoM();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataUoM.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormUoM();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateUoM(
        {
          id: stateTable.selected?.id!,
          params: dataUoM,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${dataUoM.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchUoMs();
            closeFormUoM();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${dataUoM.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormUoM();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteUoM(stateTable.selected?.id!, {
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
          refetchUoMs();
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

  const handleCloseFormUoM = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormUoM();
    }
    formUoM.clearErrors();
    formUoM.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master UoM" />
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
              access: dataUoMPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataUoMPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataUoMPermission?.data.is_delete,
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
        </Flex>
      </Flex>
      <Modal
        opened={openedFormUoM}
        onClose={closeFormUoM}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formUoM.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Code"
              placeholder="Code"
              key={formUoM.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUoM.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formUoM.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUoM.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formUoM.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUoM.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormUoM}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateUoM || isPendingMutateUpdateUoM}
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
        <Text size={size}>Are you sure you want to delete this uom?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormUoM}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteUoM}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingUoMs && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessUoMs ? (
        dataUoMs?.data?.pagination.total_rows > 0 ? (
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
              from={dataUoMs.data.pagination.from}
              to={dataUoMs.data.pagination.to}
              totalPages={dataUoMs.data.pagination.total_pages}
              totalRows={dataUoMs.data.pagination.total_rows}
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
        !isLoadingUoMs && <NoDataFound />
      )}
    </Stack>
  );
};

export default UoMPage;
