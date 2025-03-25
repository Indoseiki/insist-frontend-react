import {
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  NumberInput,
  Select,
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
import { ChartOfAccount } from "../../../types/chartOfAccount";
import {
  useCreateChartOfAccount,
  useDeleteChartOfAccount,
  useChartOfAccountsQuery,
  useUpdateChartOfAccount,
} from "../../../hooks/chartOfAccount";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { useLocation } from "@tanstack/react-router";

interface StateFilter {
  search: string;
}

const ChartOfAccountPage = () => {
  const location = useLocation();

  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormChartOfAccount,
    { open: openFormChartOfAccount, close: closeFormChartOfAccount },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<ChartOfAccount>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "account",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<ChartOfAccount>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: ChartOfAccount) =>
    updateStateTable({ selected: row });

  const {
    data: dataChartOfAccounts,
    isSuccess: isSuccessChartOfAccounts,
    isLoading: isLoadingChartOfAccounts,
    refetch: refetchChartOfAccounts,
  } = useChartOfAccountsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateChartOfAccount,
    isPending: isPendingMutateCreateChartOfAccount,
  } = useCreateChartOfAccount();

  const {
    mutate: mutateUpdateChartOfAccount,
    isPending: isPendingMutateUpdateChartOfAccount,
  } = useUpdateChartOfAccount();

  const {
    mutate: mutateDeleteChartOfAccount,
    isPending: isPendingMutateDeleteChartOfAccount,
  } = useDeleteChartOfAccount();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (
      !isSuccessChartOfAccounts ||
      !dataChartOfAccounts?.data?.pagination.total_rows
    )
      return null;

    return dataChartOfAccounts.data.items.map((row: ChartOfAccount) => {
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
          <Table.Td>{row.account}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.type}</Table.Td>
          <Table.Td>{row.class}</Table.Td>
          <Table.Td>{row.exchange_rate_type}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessChartOfAccounts,
    dataChartOfAccounts,
    stateTable.selected,
    colorScheme,
  ]);

  const formChartOfAccount = useForm<Partial<ChartOfAccount>>({
    mode: "uncontrolled",
    initialValues: {
      account: 0,
      description: "",
      class: "",
      type: "",
      exchange_rate_type: "",
    },

    validate: {
      account: (value) => (value === 0 ? "Account is required" : null),
      description: (value) =>
        value!.length === 0 ? "Description is required" : null,
      class: (value) => (value!.length === 0 ? "Class is required" : null),
      type: (value) => (value!.length === 0 ? "Type is required" : null),
      exchange_rate_type: (value) =>
        value!.length === 0 ? "Exchange Rate Type is required" : null,
    },
  });

  const handleAddData = () => {
    formChartOfAccount.clearErrors();
    formChartOfAccount.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormChartOfAccount();
  };

  const handleEditData = () => {
    formChartOfAccount.clearErrors();
    formChartOfAccount.reset();
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

    formChartOfAccount.setValues({
      account: stateTable.selected.account,
      description: stateTable.selected.description,
      type: stateTable.selected.type,
      class: stateTable.selected.class,
      exchange_rate_type: stateTable.selected.exchange_rate_type,
    });

    openFormChartOfAccount();
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
    formChartOfAccount.clearErrors();
    formChartOfAccount.reset();

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

    formChartOfAccount.setValues({
      account: stateTable.selected.account,
      description: stateTable.selected.description,
      type: stateTable.selected.type,
      class: stateTable.selected.class,
      exchange_rate_type: stateTable.selected.exchange_rate_type,
    });

    openFormChartOfAccount();
  };

  const handleSubmitForm = () => {
    const dataChartOfAccount = formChartOfAccount.getValues();

    if (stateForm.action === "add") {
      mutateCreateChartOfAccount(dataChartOfAccount, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataChartOfAccount.account})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchChartOfAccounts();
          closeFormChartOfAccount();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataChartOfAccount.account})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormChartOfAccount();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateChartOfAccount(
        {
          id: stateTable.selected?.id!,
          params: dataChartOfAccount,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.account} ⮕ ${dataChartOfAccount.account})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchChartOfAccounts();
            closeFormChartOfAccount();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.account} ⮕ ${dataChartOfAccount.account})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormChartOfAccount();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteChartOfAccount(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.account})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchChartOfAccounts();
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
            message: `${res?.data.message} (${stateTable.selected?.account}) `,
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

  const handleCloseFormChartOfAccount = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormChartOfAccount();
    }
    formChartOfAccount.clearErrors();
    formChartOfAccount.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Chart of Account" />
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
              access: dataRolePermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataRolePermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataRolePermission?.data.is_delete,
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
        opened={openedFormChartOfAccount}
        onClose={closeFormChartOfAccount}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formChartOfAccount.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <NumberInput
              label="Account"
              placeholder="Account"
              key={formChartOfAccount.key("account")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formChartOfAccount.getInputProps("account")}
              hideControls
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formChartOfAccount.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formChartOfAccount.getInputProps("description")}
            />
            <Select
              label="Type"
              placeholder="Type"
              data={[
                "Allocation",
                "Asset",
                "Annalitical",
                "Expense",
                "Liability",
                "Owner's Equity",
                "Revenue",
                "Statistical",
              ]}
              key={formChartOfAccount.key("type")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formChartOfAccount.getInputProps("type")}
              clearable
            />
            <Select
              label="Class"
              placeholder="Class"
              data={[
                "Current Assets",
                "Noncurrent Assets",
                "Current Liabilities",
                "Noncurrent Liabilities",
                "Equity",
                "Equity - Non-Monetary",
                "Revenue",
                "Cost of Sales",
                "Operating Expense",
                "Depreciation and Amortization Expense",
                "Interest Income Expense",
                "Non Operating Income Expense",
                "Tax Expense",
              ]}
              key={formChartOfAccount.key("class")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formChartOfAccount.getInputProps("class")}
              clearable
            />
            <Select
              label="Exchange Rate Type"
              placeholder="Exchange Rate Type"
              data={["Buying", "Selling"]}
              key={formChartOfAccount.key("exchange_rate_type")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formChartOfAccount.getInputProps("exchange_rate_type")}
              clearable
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormChartOfAccount}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateChartOfAccount ||
                  isPendingMutateUpdateChartOfAccount
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
        <Text size={size}>
          Are you sure you want to delete this chartOfAccount?
        </Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormChartOfAccount}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteChartOfAccount}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingChartOfAccounts && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessChartOfAccounts ? (
        dataChartOfAccounts?.data?.pagination.total_rows > 0 ? (
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
                  name: "Type",
                },
                {
                  name: "Class",
                },
                {
                  name: "Exchange Rate Type",
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
              from={dataChartOfAccounts.data.pagination.from}
              to={dataChartOfAccounts.data.pagination.to}
              totalPages={dataChartOfAccounts.data.pagination.total_pages}
              totalRows={dataChartOfAccounts.data.pagination.total_rows}
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
        !isLoadingChartOfAccounts && <NoDataFound />
      )}
    </Stack>
  );
};

export default ChartOfAccountPage;
