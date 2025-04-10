import {
  Button,
  Center,
  Checkbox,
  CloseButton,
  Flex,
  Grid,
  Group,
  Input,
  Loader,
  Modal,
  NumberInput,
  ScrollArea,
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
import { BillingTerm } from "../../../types/billingTerm";
import {
  useCreateBillingTerm,
  useDeleteBillingTerm,
  useBillingTermsQuery,
  useUpdateBillingTerm,
} from "../../../hooks/billingTerm";
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

const BillingTermPage = () => {
  const location = useLocation();

  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormBillingTerm,
    { open: openFormBillingTerm, close: closeFormBillingTerm },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<BillingTerm>>({
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

  const updateStateTable = (newState: Partial<StateTable<BillingTerm>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: BillingTerm) =>
    updateStateTable({ selected: row });

  const {
    data: dataBillingTerms,
    isSuccess: isSuccessBillingTerms,
    isLoading: isLoadingBillingTerms,
    refetch: refetchBillingTerms,
  } = useBillingTermsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateBillingTerm,
    isPending: isPendingMutateCreateBillingTerm,
  } = useCreateBillingTerm();

  const {
    mutate: mutateUpdateBillingTerm,
    isPending: isPendingMutateUpdateBillingTerm,
  } = useUpdateBillingTerm();

  const {
    mutate: mutateDeleteBillingTerm,
    isPending: isPendingMutateDeleteBillingTerm,
  } = useDeleteBillingTerm();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (
      !isSuccessBillingTerms ||
      !dataBillingTerms?.data?.pagination.total_rows
    )
      return null;

    const holidayOffsetMethodOptions = [
      { value: "NO_OFFSET", label: "No Offset" },
      { value: "BRING_FORWARD", label: "Bring Forward" },
      { value: "POSTPONE", label: "Postpone" },
    ];

    return dataBillingTerms.data.items.map((row: BillingTerm) => {
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
          <Table.Td>{row.due_days}</Table.Td>
          <Table.Td>{row.cutoff_day}</Table.Td>
          <Table.Td>
            {holidayOffsetMethodOptions.find(
              (opt) => opt.value === row.holiday_offset_method
            )?.label || "-"}
          </Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessBillingTerms,
    dataBillingTerms,
    stateTable.selected,
    colorScheme,
  ]);

  const formBillingTerm = useForm<Partial<BillingTerm>>({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      description: "",
      due_days: 0,
      discount_days: 0,
      is_cash_only: false,
      prox_due_day: 0,
      prox_discount_day: 0,
      prox_months_forward: 0,
      prox_discount_months_forward: 0,
      cutoff_day: 0,
      discount_percent: 0,
      holiday_offset_method: "",
      is_advanced_terms: false,
      prox_code: 0,
    },

    validate: {
      code: (value) =>
        !value || value.length === 0 ? "Code is required" : null,
      description: (value) =>
        !value || value.length === 0 ? "Description is required" : null,
      holiday_offset_method: (value) =>
        !value || value.length === 0
          ? "Holiday Offset Method is required"
          : null,
      discount_percent: (value) =>
        value !== undefined && (value < 0 || value > 100)
          ? "Discount percent must be between 0 and 100"
          : null,
      due_days: (value) => (value === 0 ? "Due days cannot be 0" : null),
      cutoff_day: (value) =>
        value == null
          ? "Cutoff day is required"
          : value === 0
            ? "Cutoff day cannot be 0"
            : value < 1 || value > 31
              ? "Cutoff day must be between 1 and 31"
              : null,
      prox_due_day: (value) =>
        value !== undefined && (value < 0 || value > 31)
          ? "Prox due day must be between 0 and 31"
          : null,
      prox_discount_day: (value) =>
        value !== undefined && (value < 0 || value > 31)
          ? "Prox discount day must be between 0 and 31"
          : null,
    },
  });

  const handleAddData = () => {
    formBillingTerm.clearErrors();
    formBillingTerm.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormBillingTerm();
  };

  const handleEditData = () => {
    formBillingTerm.clearErrors();
    formBillingTerm.reset();
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

    formBillingTerm.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      due_days: stateTable.selected.due_days ?? 0,
      discount_days: stateTable.selected.discount_days ?? 0,
      is_cash_only: stateTable.selected.is_cash_only ?? false,
      prox_due_day: stateTable.selected.prox_due_day ?? 0,
      prox_discount_day: stateTable.selected.prox_discount_day ?? 0,
      prox_months_forward: stateTable.selected.prox_months_forward ?? 0,
      prox_discount_months_forward:
        stateTable.selected.prox_discount_months_forward ?? 0,
      cutoff_day: stateTable.selected.cutoff_day ?? 0,
      discount_percent: stateTable.selected.discount_percent ?? 0,
      holiday_offset_method: stateTable.selected.holiday_offset_method ?? "",
      is_advanced_terms: stateTable.selected.is_advanced_terms ?? false,
      prox_code: stateTable.selected.prox_code ?? 0,
    });

    openFormBillingTerm();
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
    formBillingTerm.clearErrors();
    formBillingTerm.reset();

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

    formBillingTerm.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      due_days: stateTable.selected.due_days ?? 0,
      discount_days: stateTable.selected.discount_days ?? 0,
      is_cash_only: stateTable.selected.is_cash_only ?? false,
      prox_due_day: stateTable.selected.prox_due_day ?? 0,
      prox_discount_day: stateTable.selected.prox_discount_day ?? 0,
      prox_months_forward: stateTable.selected.prox_months_forward ?? 0,
      prox_discount_months_forward:
        stateTable.selected.prox_discount_months_forward ?? 0,
      cutoff_day: stateTable.selected.cutoff_day ?? 0,
      discount_percent: stateTable.selected.discount_percent ?? 0,
      holiday_offset_method: stateTable.selected.holiday_offset_method ?? "",
      is_advanced_terms: stateTable.selected.is_advanced_terms ?? false,
      prox_code: stateTable.selected.prox_code ?? 0,
    });

    openFormBillingTerm();
  };

  const handleSubmitForm = () => {
    const dataBillingTerm = formBillingTerm.getValues();

    if (stateForm.action === "add") {
      mutateCreateBillingTerm(dataBillingTerm, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataBillingTerm.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchBillingTerms();
          closeFormBillingTerm();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataBillingTerm.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormBillingTerm();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateBillingTerm(
        {
          id: stateTable.selected?.id!,
          params: dataBillingTerm,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${dataBillingTerm.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchBillingTerms();
            closeFormBillingTerm();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${dataBillingTerm.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormBillingTerm();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteBillingTerm(stateTable.selected?.id!, {
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
          refetchBillingTerms();
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

  const handleCloseFormBillingTerm = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormBillingTerm();
    }
    formBillingTerm.clearErrors();
    formBillingTerm.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Billing Term" />
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
        opened={openedFormBillingTerm}
        onClose={closeFormBillingTerm}
        title={stateForm.title}
        closeOnClickOutside={false}
        size="xl"
      >
        <form onSubmit={formBillingTerm.onSubmit(handleSubmitForm)}>
          <ScrollArea h={600} type="scroll">
            <Stack gap={5}>
              <fieldset>
                <legend>Billing Term Information</legend>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Code"
                      placeholder="Code"
                      key={formBillingTerm.key("code")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("code")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      key={formBillingTerm.key("description")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("description")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Due Days"
                      placeholder="e.g. 30"
                      key={formBillingTerm.key("due_days")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("due_days")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Discount Days"
                      placeholder="e.g. 10"
                      key={formBillingTerm.key("discount_days")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("discount_days")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Discount"
                      placeholder="e.g. 1.500"
                      key={formBillingTerm.key("discount_percent")}
                      size={size}
                      step={0.001}
                      decimalScale={3}
                      fixedDecimalScale
                      suffix="%"
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("discount_percent")}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Checkbox
                      label="Cash Only"
                      key={formBillingTerm.key("is_cash_only")}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("is_cash_only", {
                        type: "checkbox",
                      })}
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Prox Settings</legend>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Prox Due Day"
                      placeholder="e.g. 15"
                      key={formBillingTerm.key("prox_due_day")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("prox_due_day")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Prox Discount Day"
                      placeholder="e.g. 10"
                      key={formBillingTerm.key("prox_discount_day")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("prox_discount_day")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      hideControls
                      label="Cutoff Day"
                      placeholder="1-31"
                      key={formBillingTerm.key("cutoff_day")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("cutoff_day")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      hideControls
                      label="Months Forward"
                      placeholder="e.g. 1"
                      key={formBillingTerm.key("prox_months_forward")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("prox_months_forward")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      hideControls
                      label="Discount Months Forward"
                      placeholder="e.g. 0"
                      key={formBillingTerm.key("prox_discount_months_forward")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps(
                        "prox_discount_months_forward"
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Checkbox
                      label="Advanced Terms"
                      key={formBillingTerm.key("is_advanced_terms")}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("is_advanced_terms", {
                        type: "checkbox",
                      })}
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Additional Info</legend>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Holiday Offset Method"
                      placeholder="Select method"
                      data={[
                        { value: "NO_OFFSET", label: "No Offset" },
                        { value: "BRING_FORWARD", label: "Bring Forward" },
                        { value: "POSTPONE", label: "Postpone" },
                      ]}
                      key={formBillingTerm.key("holiday_offset_method")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps(
                        "holiday_offset_method"
                      )}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      hideControls
                      label="Prox Code"
                      placeholder="e.g. 0"
                      key={formBillingTerm.key("prox_code")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBillingTerm.getInputProps("prox_code")}
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
            </Stack>
          </ScrollArea>
          <Group justify="center" gap={5}>
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormBillingTerm}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateBillingTerm ||
                  isPendingMutateUpdateBillingTerm
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
          Are you sure you want to delete this Billing Term?
        </Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormBillingTerm}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteBillingTerm}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingBillingTerms && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessBillingTerms ? (
        dataBillingTerms?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                { name: "Code" },
                { name: "Description" },
                { name: "Due Days" },
                { name: "Cutoff Day" },
                { name: "Holiday Offset Method" },
                { name: "Updated By" },
                { name: "Last Updated" },
              ]}
              rows={rows}
            />

            <TableFooter
              from={dataBillingTerms.data.pagination.from}
              to={dataBillingTerms.data.pagination.to}
              totalPages={dataBillingTerms.data.pagination.total_pages}
              totalRows={dataBillingTerms.data.pagination.total_rows}
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
        !isLoadingBillingTerms && <NoDataFound />
      )}
    </Stack>
  );
};

export default BillingTermPage;
