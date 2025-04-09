import {
  Button,
  Center,
  Checkbox,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Grid,
  Group,
  Input,
  InputBase,
  Loader,
  Modal,
  NumberInput,
  Radio,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  useCombobox,
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
import { TaxCode } from "../../../types/taxCode";
import {
  useCreateTaxCode,
  useDeleteTaxCode,
  useTaxCodesQuery,
  useUpdateTaxCode,
} from "../../../hooks/taxCode";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm, UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { useLocation } from "@tanstack/react-router";
import { useChartOfAccountsInfinityQuery } from "../../../hooks/chartOfAccount";
import { ChartOfAccount } from "../../../types/chartOfAccount";

interface StateFilter {
  search: string;
}

interface StateFormTaxCode extends StateForm {
  account_ar: string;
  description_account_ar: string;
  account_ar_process: string;
  description_account_ar_process: string;
  account_ap: string;
  description_account_ap: string;
}

const TaxCodePage = () => {
  const location = useLocation();

  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormTaxCode,
    { open: openFormTaxCode, close: closeFormTaxCode },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<TaxCode>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "name",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormTaxCode>({
    title: "",
    action: "",
    account_ar: "",
    description_account_ar: "",
    account_ar_process: "",
    description_account_ar_process: "",
    account_ap: "",
    description_account_ap: "",
  });

  const updateStateTable = (newState: Partial<StateTable<TaxCode>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormTaxCode>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: TaxCode) => updateStateTable({ selected: row });

  const {
    data: dataTaxCodes,
    isSuccess: isSuccessTaxCodes,
    isLoading: isLoadingTaxCodes,
    refetch: refetchTaxCodes,
  } = useTaxCodesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateTaxCode,
    isPending: isPendingMutateCreateTaxCode,
  } = useCreateTaxCode();

  const {
    mutate: mutateUpdateTaxCode,
    isPending: isPendingMutateUpdateTaxCode,
  } = useUpdateTaxCode();

  const {
    mutate: mutateDeleteTaxCode,
    isPending: isPendingMutateDeleteTaxCode,
  } = useDeleteTaxCode();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const {
    data: dataSelectARAccount,
    isSuccess: isSuccessSelectARAccount,
    fetchNextPage: fetchNextPageSelectARAccount,
    hasNextPage: hasNextPageSelectARAccount,
    isFetchingNextPage: isFetchingNextPageSelectARAccount,
  } = useChartOfAccountsInfinityQuery({
    search: stateForm.account_ar,
  });

  const flatDataSelectARAccount =
    (isSuccessSelectARAccount &&
      dataSelectARAccount?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectARAccountProcess,
    isSuccess: isSuccessSelectARAccountProcess,
    fetchNextPage: fetchNextPageSelectARAccountProcess,
    hasNextPage: hasNextPageSelectARAccountProcess,
    isFetchingNextPage: isFetchingNextPageSelectARAccountProcess,
  } = useChartOfAccountsInfinityQuery({
    search: stateForm.account_ar_process,
  });

  const flatDataSelectARAccountProcess =
    (isSuccessSelectARAccountProcess &&
      dataSelectARAccountProcess?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectAPAccount,
    isSuccess: isSuccessSelectAPAccount,
    fetchNextPage: fetchNextPageSelectAPAccount,
    hasNextPage: hasNextPageSelectAPAccount,
    isFetchingNextPage: isFetchingNextPageSelectAPAccount,
  } = useChartOfAccountsInfinityQuery({
    search: stateForm.account_ap,
  });

  const flatDataSelectAPAccount =
    (isSuccessSelectAPAccount &&
      dataSelectAPAccount?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const rows = useMemo(() => {
    if (!isSuccessTaxCodes || !dataTaxCodes?.data?.pagination.total_rows)
      return null;

    return dataTaxCodes.data.items.map((row: TaxCode) => {
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
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.type}</Table.Td>
          <Table.Td>{row.rate}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessTaxCodes, dataTaxCodes, stateTable.selected, colorScheme]);

  const formTaxCode = useForm<Partial<TaxCode>>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      description: "",
      rate: 0,
      type: "",
      include_price: false,
      include_discount: false,
      include_restock_fee: false,
      deductible: false,
      include_freight: false,
      include_duty: false,
      include_brokerage: false,
      include_insurance: false,
      include_local_freight: false,
      include_misc: false,
      include_surcharge: false,
      assess_on_return: false,
      include_tax_on_prev_system: false,
      id_account_ar: "",
      id_account_ar_process: "",
      id_account_ap: "",
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      description: (value) => (!value ? "Description is required" : null),
      type: (value) => (!value ? "Type is required" : null),
      id_account_ar: (value) => (!value ? "A/R Tax Account" : null),
      id_account_ar_process: (value) =>
        !value ? "A/R Tax Account In Process" : null,
      id_account_ap: (value) => (!value ? "A/P Tax Account" : null),
    },
  });

  const handleAddData = () => {
    formTaxCode.clearErrors();
    formTaxCode.reset();
    updateStateForm({
      title: "Add Data",
      action: "add",
      account_ap: "",
      account_ar: "",
      account_ar_process: "",
      description_account_ap: "",
      description_account_ar: "",
      description_account_ar_process: "",
    });
    openFormTaxCode();
  };

  const handleEditData = () => {
    formTaxCode.clearErrors();
    formTaxCode.reset();
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
      account_ap: stateTable.selected.account_ap?.account
        ? String(stateTable.selected.account_ap.account)
        : "",
      account_ar: stateTable.selected.account_ar?.account
        ? String(stateTable.selected.account_ar.account)
        : "",
      account_ar_process: stateTable.selected.account_ar_process?.account
        ? String(stateTable.selected.account_ar_process.account)
        : "",
      description_account_ap: stateTable.selected.account_ap?.description,
      description_account_ar: stateTable.selected.account_ar?.description,
      description_account_ar_process:
        stateTable.selected.account_ar_process?.description,
    });

    formTaxCode.setValues({
      name: stateTable.selected.name,
      description: stateTable.selected.description,
      type: stateTable.selected.type,
      rate: stateTable.selected.rate,
      id_account_ap: stateTable.selected.id_account_ap,
      id_account_ar: stateTable.selected.id_account_ar,
      id_account_ar_process: stateTable.selected.id_account_ar_process,
      include_price: stateTable.selected.include_price,
      include_discount: stateTable.selected.include_discount,
      include_restock_fee: stateTable.selected.include_restock_fee,
      deductible: stateTable.selected.deductible,
      include_freight: stateTable.selected.include_freight,
      include_duty: stateTable.selected.include_duty,
      include_brokerage: stateTable.selected.include_brokerage,
      include_insurance: stateTable.selected.include_insurance,
      include_local_freight: stateTable.selected.include_local_freight,
      include_misc: stateTable.selected.include_misc,
      include_surcharge: stateTable.selected.include_surcharge,
      assess_on_return: stateTable.selected.assess_on_return,
      include_tax_on_prev_system:
        stateTable.selected.include_tax_on_prev_system,
    });

    openFormTaxCode();
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
    formTaxCode.clearErrors();
    formTaxCode.reset();

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
      account_ap: stateTable.selected.account_ap?.account
        ? String(stateTable.selected.account_ap.account)
        : "",
      account_ar: stateTable.selected.account_ar?.account
        ? String(stateTable.selected.account_ar.account)
        : "",
      account_ar_process: stateTable.selected.account_ar_process?.account
        ? String(stateTable.selected.account_ar_process.account)
        : "",
      description_account_ap: stateTable.selected.account_ap?.description,
      description_account_ar: stateTable.selected.account_ar?.description,
      description_account_ar_process:
        stateTable.selected.account_ar_process?.description,
    });

    formTaxCode.setValues({
      name: stateTable.selected.name,
      description: stateTable.selected.description,
      type: stateTable.selected.type,
      rate: stateTable.selected.rate,
      id_account_ap: stateTable.selected.id_account_ap,
      id_account_ar: stateTable.selected.id_account_ar,
      id_account_ar_process: stateTable.selected.id_account_ar_process,
      include_price: stateTable.selected.include_price,
      include_discount: stateTable.selected.include_discount,
      include_restock_fee: stateTable.selected.include_restock_fee,
      deductible: stateTable.selected.deductible,
      include_freight: stateTable.selected.include_freight,
      include_duty: stateTable.selected.include_duty,
      include_brokerage: stateTable.selected.include_brokerage,
      include_insurance: stateTable.selected.include_insurance,
      include_local_freight: stateTable.selected.include_local_freight,
      include_misc: stateTable.selected.include_misc,
      include_surcharge: stateTable.selected.include_surcharge,
      assess_on_return: stateTable.selected.assess_on_return,
      include_tax_on_prev_system:
        stateTable.selected.include_tax_on_prev_system,
    });

    openFormTaxCode();
  };

  const handleSubmitForm = () => {
    const dataTaxCode = formTaxCode.getValues();

    let mapTaxCode = {
      ...dataTaxCode,
      id_account_ar: parseInt(dataTaxCode.id_account_ar?.toString() ?? "0"),
      id_account_ar_process: parseInt(
        dataTaxCode.id_account_ar_process?.toString() ?? "0"
      ),
      id_account_ap: parseInt(dataTaxCode.id_account_ap?.toString() ?? "0"),
    };

    if (stateForm.action === "add") {
      mutateCreateTaxCode(mapTaxCode, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapTaxCode.name})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchTaxCodes();
          closeFormTaxCode();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapTaxCode.name})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormTaxCode();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateTaxCode(
        {
          id: stateTable.selected?.id!,
          params: mapTaxCode,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.name} ⮕ ${mapTaxCode.name})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchTaxCodes();
            closeFormTaxCode();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.name} ⮕ ${mapTaxCode.name})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormTaxCode();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteTaxCode(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.name})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchTaxCodes();
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
            message: `${res?.data.message} (${stateTable.selected?.name}) `,
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

  const handleCloseFormTaxCode = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormTaxCode();
    }
    formTaxCode.clearErrors();
    formTaxCode.reset();
  };

  const useChartOfAccountCombobox = (
    fieldKey: string,
    fieldDescKey: string,
    form: UseFormReturnType<any>,
    updateStateForm: (value: Record<string, string>) => void,
    flatData: ChartOfAccount[]
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
        active={item.id.toString() === form.values[`id_${fieldKey}`]}
        onClick={() => {
          form.setFieldValue(`id_${fieldKey}`, item.id.toString());
          updateStateForm({
            [fieldKey]: item.account.toString() ?? "",
            [fieldDescKey]: item.description ?? "",
          });
          combobox.resetSelectedOption();
        }}
        w={400}
      >
        <Group gap="xs">
          {item.id.toString() === form.values[`id_${fieldKey}`] && (
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
                    <Text fz={size}>{item.account}</Text>
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

  const { combobox: comboboxARAccount, options: optionsARAccount } =
    useChartOfAccountCombobox(
      "account_ar",
      "description_account_ar",
      formTaxCode,
      updateStateForm,
      flatDataSelectARAccount
    );

  const {
    combobox: comboboxARAccountProcess,
    options: optionsARAccountProcess,
  } = useChartOfAccountCombobox(
    "account_ar_process",
    "description_account_ar_process",
    formTaxCode,
    updateStateForm,
    flatDataSelectARAccountProcess
  );

  const { combobox: comboboxAPAccount, options: optionsAPAccount } =
    useChartOfAccountCombobox(
      "account_ap",
      "description_account_ap",
      formTaxCode,
      updateStateForm,
      flatDataSelectAPAccount
    );

  return (
    <Stack h="100%">
      <PageHeader title="Master Tax Code" />
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
        opened={openedFormTaxCode}
        onClose={closeFormTaxCode}
        title={stateForm.title}
        closeOnClickOutside={false}
        size="xl"
      >
        <form onSubmit={formTaxCode.onSubmit(handleSubmitForm)}>
          <ScrollArea h={600} type="scroll">
            <Stack gap={5}>
              <fieldset>
                <legend>Tax Information</legend>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Name"
                      placeholder="Name"
                      key={formTaxCode.key("name")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formTaxCode.getInputProps("name")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      key={formTaxCode.key("description")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formTaxCode.getInputProps("description")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      label="Rate"
                      placeholder="Rate"
                      key={formTaxCode.key("rate")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formTaxCode.getInputProps("rate")}
                      hideControls
                      suffix="%"
                      decimalSeparator=","
                      thousandSeparator="."
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Radio.Group
                      label="Type"
                      key={formTaxCode.key("type")}
                      size={size}
                      {...formTaxCode.getInputProps("type")}
                    >
                      <Group mt="xs">
                        <Radio
                          value="Exemption"
                          label="Exemption"
                          disabled={stateForm.action === "view"}
                        />
                        <Radio
                          value="Rate"
                          label="Rate"
                          disabled={stateForm.action === "view"}
                        />
                      </Group>
                    </Radio.Group>
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Tax Include</legend>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap={15}>
                      <Checkbox
                        label="Include Price"
                        key={formTaxCode.key("include_price")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_price", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Deductible"
                        key={formTaxCode.key("deductible")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("deductible", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Brokerage"
                        key={formTaxCode.key("include_brokerage")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_brokerage", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Misc."
                        key={formTaxCode.key("include_misc")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_misc", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Tax on Prev. System"
                        key={formTaxCode.key("include_tax_on_prev_system")}
                        size={size}
                        disabled={true}
                        {...formTaxCode.getInputProps(
                          "include_tax_on_prev_system",
                          {
                            type: "checkbox",
                          }
                        )}
                      />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap={15}>
                      <Checkbox
                        label="Include Discount"
                        key={formTaxCode.key("include_discount")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_discount", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Freight"
                        key={formTaxCode.key("include_freight")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_freight", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Insurance"
                        key={formTaxCode.key("include_insurance")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_insurance", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Surcharge"
                        key={formTaxCode.key("include_surcharge")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_surcharge", {
                          type: "checkbox",
                        })}
                      />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap={15}>
                      <Checkbox
                        label="Include Restock Fee"
                        key={formTaxCode.key("include_restock_fee")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_restock_fee", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Duty"
                        key={formTaxCode.key("include_duty")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_duty", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Include Local Freight"
                        key={formTaxCode.key("include_local_freight")}
                        size={size}
                        disabled={stateForm.action === "view"}
                        {...formTaxCode.getInputProps("include_local_freight", {
                          type: "checkbox",
                        })}
                      />
                      <Checkbox
                        label="Assess on Return"
                        key={formTaxCode.key("assess_on_return")}
                        size={size}
                        disabled={true}
                        {...formTaxCode.getInputProps("assess_on_return", {
                          type: "checkbox",
                        })}
                      />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Accounts</legend>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Combobox
                      store={comboboxARAccount}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxARAccount.closeDropdown();
                        comboboxARAccount.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="A/R Tax Account"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.account_ar ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formTaxCode.setFieldValue(
                                    "id_account_ar",
                                    ""
                                  );
                                  updateStateForm({
                                    account_ar: "",
                                    description_account_ar: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxARAccount.toggleDropdown()}
                          key={formTaxCode.key("id_account_ar")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formTaxCode.getInputProps("id_account_ar")}
                        >
                          {stateForm.account_ar || (
                            <Input.Placeholder>Account</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.account_ar}
                          onChange={(event) =>
                            updateStateForm({
                              account_ar: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Account"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsARAccount.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectARAccount &&
                                  !isFetchingNextPageSelectARAccount
                                ) {
                                  fetchNextPageSelectARAccount();
                                }
                              }
                            }}
                          >
                            {optionsARAccount.length > 0 ? (
                              optionsARAccount
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      size={size}
                      disabled={true}
                      value={stateForm.description_account_ar}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Combobox
                      store={comboboxARAccountProcess}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxARAccountProcess.closeDropdown();
                        comboboxARAccountProcess.updateSelectedOptionIndex(
                          "active"
                        );
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="A/R Tax Account In Process"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.account_ar_process ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formTaxCode.setFieldValue(
                                    "id_account_ar_process",
                                    ""
                                  );
                                  updateStateForm({
                                    account_ar_process: "",
                                    description_account_ar_process: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() =>
                            comboboxARAccountProcess.toggleDropdown()
                          }
                          key={formTaxCode.key("id_account_ar_process")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formTaxCode.getInputProps(
                            "id_account_ar_process"
                          )}
                        >
                          {stateForm.account_ar_process || (
                            <Input.Placeholder>Account</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.account_ar_process}
                          onChange={(event) =>
                            updateStateForm({
                              account_ar_process: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Account"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsARAccountProcess.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectARAccountProcess &&
                                  !isFetchingNextPageSelectARAccountProcess
                                ) {
                                  fetchNextPageSelectARAccountProcess();
                                }
                              }
                            }}
                          >
                            {optionsARAccountProcess.length > 0 ? (
                              optionsARAccountProcess
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      size={size}
                      disabled={true}
                      value={stateForm.description_account_ar_process}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <Combobox
                      store={comboboxAPAccount}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxAPAccount.closeDropdown();
                        comboboxAPAccount.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="A/P Tax Account"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.account_ap ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formTaxCode.setFieldValue(
                                    "id_account_ap",
                                    ""
                                  );
                                  updateStateForm({
                                    account_ap: "",
                                    description_account_ap: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxAPAccount.toggleDropdown()}
                          key={formTaxCode.key("id_account_ap")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formTaxCode.getInputProps("id_account_ap")}
                        >
                          {stateForm.account_ap || (
                            <Input.Placeholder>Account</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.account_ap}
                          onChange={(event) =>
                            updateStateForm({
                              account_ap: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Account"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsAPAccount.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectAPAccount &&
                                  !isFetchingNextPageSelectAPAccount
                                ) {
                                  fetchNextPageSelectAPAccount();
                                }
                              }
                            }}
                          >
                            {optionsAPAccount.length > 0 ? (
                              optionsAPAccount
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      size={size}
                      disabled={true}
                      value={stateForm.description_account_ap}
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
              onClick={handleCloseFormTaxCode}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateTaxCode || isPendingMutateUpdateTaxCode
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
        <Text size={size}>Are you sure you want to delete this Tax Code?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormTaxCode}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteTaxCode}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingTaxCodes && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessTaxCodes ? (
        dataTaxCodes?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Name",
                },
                {
                  name: "Description",
                },
                {
                  name: "Type",
                },
                {
                  name: "Rate (%)",
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
              from={dataTaxCodes.data.pagination.from}
              to={dataTaxCodes.data.pagination.to}
              totalPages={dataTaxCodes.data.pagination.total_pages}
              totalRows={dataTaxCodes.data.pagination.total_rows}
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
        !isLoadingTaxCodes && <NoDataFound />
      )}
    </Stack>
  );
};

export default TaxCodePage;
