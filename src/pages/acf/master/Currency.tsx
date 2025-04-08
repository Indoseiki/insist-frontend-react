import {
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
  Modal,
  NumberInput,
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
  IconCalendarWeek,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { formatDate, formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
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
import PageSubHeader from "../../../components/layouts/PageSubHeader";
import {
  useCurrenciesInfinityQuery,
  useCurrenciesQuery,
  useGenereateCurrency,
} from "../../../hooks/currency";
import { Currency } from "../../../types/currency";
import {
  useCreateCurrencyRate,
  useCurrencyRatesQuery,
  useDeleteCurrencyRate,
  useUpdateCurrencyRate,
} from "../../../hooks/currencyRate";
import { CurrencyRate } from "../../../types/currencyRate";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import { formatRupiah } from "../../../utils/formatRupiah";

interface StateFilterCurrency {
  search: string;
}

interface StateFormCurrency extends StateForm {
  currency: string;
}

interface StateFilterCurrencyRate {
  open: boolean;
  search: string;
  idCurrency: string;
  currency: string;
}

interface StateFormCurrencyRate extends StateForm {
  fromCurrency: string;
  toCurrency: string;
}

const CurrencyPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormCurrency,
    { open: openFormWarehouse, close: closeFormCurrency },
  ] = useDisclosure(false);

  const [
    openedFormCurrencyRate,
    { open: openFormCurrencyRate, close: closeFormCurrencyRate },
  ] = useDisclosure(false);

  const [
    openedFormDeleteCurrencyRate,
    { open: openFormDeleteCurrencyRate, close: closeFormDeleteCurrencyRate },
  ] = useDisclosure(false);

  const [stateTableCurrency, setStateTableCurrency] = useState<
    StateTable<Currency>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "currency",
    sortDirection: false,
  });

  const [stateFilterCurrency, setStateFilterCurrency] =
    useState<StateFilterCurrency>({
      search: "",
    });

  const [stateFormCurrency, setStateFormCurrency] = useState<StateFormCurrency>(
    {
      title: "",
      action: "",
      currency: "",
    }
  );

  const [stateTableCurrencyRate, setStateTableCurencyRate] = useState<
    StateTable<CurrencyRate>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "id",
    sortDirection: false,
  });

  const [stateFilterCurrencyRate, setStateFilterCurrencyRate] =
    useState<StateFilterCurrencyRate>({
      open: false,
      search: "",
      idCurrency: "",
      currency: "",
    });

  const [stateFormCurrencyRate, setStateFormCurrencyRate] =
    useState<StateFormCurrencyRate>({
      title: "",
      action: "",
      fromCurrency: "",
      toCurrency: "",
    });

  const updateStateTableCurrency = (newState: Partial<StateTable<Currency>>) =>
    setStateTableCurrency((prev) => ({ ...prev, ...newState }));

  const updateStateFilterCurrency = (newState: Partial<StateFilterCurrency>) =>
    setStateFilterCurrency((prev) => ({ ...prev, ...newState }));

  const updateStateFormCurrency = (newState: Partial<StateFormCurrency>) =>
    setStateFormCurrency((prev) => ({ ...prev, ...newState }));

  const handleClickRowCurrency = (row: Currency) => {
    updateStateTableCurrency({ selected: row });
  };

  const handleClickRowCurrencyRate = (row: CurrencyRate) => {
    updateStateTableCurrencyRate({ selected: row });
  };

  const updateStateTableCurrencyRate = (
    newState: Partial<StateTable<CurrencyRate>>
  ) => setStateTableCurencyRate((prev) => ({ ...prev, ...newState }));

  const updateStateFilterCurrencyRate = (
    newState: Partial<StateFilterCurrencyRate>
  ) => setStateFilterCurrencyRate((prev) => ({ ...prev, ...newState }));

  const updateStateFormCurrencyRate = (
    newState: Partial<StateFormCurrencyRate>
  ) => setStateFormCurrencyRate((prev) => ({ ...prev, ...newState }));

  const {
    data: dataCurrencies,
    isSuccess: isSuccessCurrencies,
    isLoading: isLoadingCurrencies,
    refetch: refetchCurrencies,
  } = useCurrenciesQuery({
    page: stateTableCurrency.activePage,
    rows: stateTableCurrency.rowsPerPage,
    search: stateFilterCurrency.search,
    sortBy: stateTableCurrency.sortBy,
    sortDirection: stateTableCurrency.sortDirection,
  });

  const {
    data: dataSelectCurrencies,
    isSuccess: isSuccessSelectCurrencies,
    fetchNextPage: fetchNextPageSelectCurrencies,
    hasNextPage: hasNextPageSelectCurrencies,
    isFetchingNextPage: isFetchingNextPageSelectCurrencies,
  } = useCurrenciesInfinityQuery({
    search: stateFormCurrencyRate.toCurrency,
  });

  const flatDataSelectCurrencies =
    (isSuccessSelectCurrencies &&
      dataSelectCurrencies?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataCurrencyRates,
    isSuccess: isSuccessCurrencyRates,
    isLoading: isLoadingCurrencyRates,
    refetch: refetchCurrencyRates,
  } = useCurrencyRatesQuery({
    page: stateTableCurrencyRate.activePage,
    rows: stateTableCurrencyRate.rowsPerPage,
    idCurrency: stateFilterCurrencyRate.idCurrency,
    search: stateFilterCurrencyRate.search,
    sortBy: stateTableCurrencyRate.sortBy,
    sortDirection: stateTableCurrencyRate.sortDirection,
  });

  const {
    mutate: mutateGenerateCurrency,
    isPending: isPendingMutateGenerateCurrency,
  } = useGenereateCurrency();

  const {
    mutate: mutateCreateCurrencyRate,
    isPending: isPendingMutateCreateCurrencyRate,
  } = useCreateCurrencyRate();

  const {
    mutate: mutateUpdateCurrencyRate,
    isPending: isPendingMutateUpdateCurrencyRate,
  } = useUpdateCurrencyRate();

  const {
    mutate: mutateDeleteCurrencyRate,
    isPending: isPendingMutateDeleteCurrencyRate,
  } = useDeleteCurrencyRate();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataWarehousePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rowsCurrency = useMemo(() => {
    if (!isSuccessCurrencies || !dataCurrencies?.data?.pagination.total_rows)
      return null;

    return dataCurrencies.data.items.map((row: Currency) => {
      const isSelected = stateTableCurrency.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowCurrency(row);
            updateStateFilterCurrencyRate({ idCurrency: row.id.toString() });
          }}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.currency}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessCurrencies,
    dataCurrencies,
    stateTableCurrency.selected,
    colorScheme,
  ]);

  const rowsCurrencyRate = useMemo(() => {
    if (
      !isSuccessCurrencyRates ||
      !dataCurrencyRates?.data?.pagination.total_rows
    )
      return null;

    return dataCurrencyRates.data.items.map((row: CurrencyRate) => {
      const isSelected = stateTableCurrencyRate.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowCurrencyRate(row);
          }}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w="200px">{row.from_currency?.currency}</Table.Td>
          <Table.Td w="200px">{row.to_currency?.currency}</Table.Td>
          <Table.Td>{formatRupiah(row.buy_rate)}</Table.Td>
          <Table.Td>{formatRupiah(row.sell_rate)}</Table.Td>
          <Table.Td>{formatDate(row.effective_date)}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessCurrencyRates,
    dataCurrencyRates,
    stateTableCurrencyRate.selected,
    colorScheme,
  ]);

  const formCurrency = useForm<Partial<Currency>>({
    mode: "uncontrolled",
    initialValues: {
      currency: "",
      description: "",
    },

    validate: {
      currency: (value) =>
        value!.length === 0 ? "Currency is required" : null,
      description: (value) =>
        value!.length === 0 ? "Description is required" : null,
    },
  });

  const formCurrencyRate = useForm<Partial<CurrencyRate>>({
    mode: "uncontrolled",
    initialValues: {
      id_from_currency: "",
      id_to_currency: "",
      buy_rate: 0,
      sell_rate: 0,
      effective_date: dayjs(),
    },

    validate: {
      id_from_currency: (value) =>
        value === "" ? "From Currency is required" : null,
      id_to_currency: (value) =>
        value === "" ? "To Currency is required" : null,
      buy_rate: (value) => (value === 0 ? "Buyying Rate is required" : null),
      sell_rate: (value) => (value === 0 ? "Selling Rate is required" : null),
      effective_date: (value) =>
        !value || !dayjs(value).isValid() ? "Effective Date is required" : null,
    },
  });

  const handleGenerateCurrrency = () => {
    const id = notifications.show({
      loading: isPendingMutateGenerateCurrency,
      title: "Waiting for Data Generating",
      message: "Please wait, currency data is being generated",
      autoClose: false,
      withCloseButton: false,
    });

    mutateGenerateCurrency(null, {
      onSuccess: async (res) => {
        await createActivityLog({
          username: dataUser?.data.username,
          action: "Update",
          is_success: true,
          os: os,
          message: res?.message,
        });

        notifications.update({
          id,
          title: "Data Generated Successfully!",
          message: "Currency data has been generated, please check first",
          color: "green",
          loading: false,
          autoClose: 3000,
        });

        refetchCurrencies();
      },
      onError: async (err) => {
        const error = err as AxiosError<ApiResponse<null>>;
        const res = error.response;
        await createActivityLog({
          username: dataUser?.data.username,
          action: "Update",
          is_success: false,
          os: os,
          message: res?.data.message,
        });

        notifications.update({
          id,
          title: "Data Generated Failed!",
          message:
            "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
          color: "red",
          loading: false,
          autoClose: 3000,
        });
      },
    });
  };

  const handleViewDataCurrency = () => {
    formCurrency.clearErrors();
    formCurrency.reset();

    if (!stateTableCurrency.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data you want to currency before proceeding",
      });
      return;
    }

    updateStateFormCurrency({
      title: "View Data",
      action: "view",
    });

    formCurrency.setValues({
      currency: stateTableCurrency.selected.currency,
      description: stateTableCurrency.selected.description,
    });

    openFormWarehouse();
  };

  const handleCloseFormCurrency = () => {
    closeFormCurrency();
    formCurrency.clearErrors();
    formCurrency.reset();
  };

  const handleAddDataCurrencyRate = () => {
    formCurrencyRate.clearErrors();
    formCurrencyRate.reset();

    if (!stateTableCurrency.selected) {
      notifications.show({
        title: "Select Data Currency First!",
        message:
          "Please select the data currency you want to process before proceeding",
      });
      return;
    }

    formCurrencyRate.setFieldValue(
      "id_from_currency",
      stateTableCurrency.selected?.id.toString()
    );

    updateStateFormCurrencyRate({
      title: "Add Data",
      action: "add",
      fromCurrency: stateTableCurrency.selected.currency,
      toCurrency: "",
    });

    openFormCurrencyRate();
  };

  const handleEditDataCurrencyRate = () => {
    formCurrencyRate.clearErrors();
    formCurrencyRate.reset();

    if (!stateTableCurrencyRate.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateFormCurrencyRate({
      title: "Edit Data",
      action: "edit",
      fromCurrency: stateTableCurrencyRate.selected?.from_currency?.currency,
      toCurrency: stateTableCurrencyRate.selected?.to_currency?.currency,
    });

    formCurrencyRate.setValues({
      id_from_currency:
        stateTableCurrencyRate.selected?.from_currency?.id.toString(),
      id_to_currency:
        stateTableCurrencyRate.selected?.to_currency?.id.toString(),
      buy_rate: stateTableCurrencyRate.selected?.buy_rate,
      sell_rate: stateTableCurrencyRate.selected?.sell_rate,
      effective_date: dayjs(stateTableCurrencyRate.selected?.effective_date),
    });

    openFormCurrencyRate();
  };

  const handleDeleteDataCurrencyRate = () => {
    if (!stateTableCurrencyRate.selected) {
      notifications.show({
        title: "Select Data First!",
        message:
          "Please select the data currency you want to process before proceeding",
      });
      return;
    }

    updateStateFormCurrencyRate({ title: "Delete Data", action: "delete" });
    openFormDeleteCurrencyRate();
  };

  const handleViewDataCurrencyRate = () => {
    formCurrencyRate.clearErrors();
    formCurrencyRate.reset();

    if (!stateTableCurrencyRate.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateFormCurrencyRate({
      title: "View Data",
      action: "view",
      fromCurrency: stateTableCurrencyRate.selected?.from_currency?.currency,
      toCurrency: stateTableCurrencyRate.selected?.to_currency?.currency,
    });

    formCurrencyRate.setValues({
      id_from_currency:
        stateTableCurrencyRate.selected?.from_currency?.id.toString(),
      id_to_currency:
        stateTableCurrencyRate.selected?.to_currency?.id.toString(),
      buy_rate: stateTableCurrencyRate.selected?.buy_rate,
      sell_rate: stateTableCurrencyRate.selected?.sell_rate,
      effective_date: dayjs(stateTableCurrencyRate.selected?.effective_date),
    });

    openFormCurrencyRate();
  };

  const handleSubmitFormCurrencyRate = () => {
    const dataCurrencyRate = formCurrencyRate.getValues();

    let mapCurrencyRate = {
      ...dataCurrencyRate,
      id_from_currency: Number(dataCurrencyRate.id_from_currency),
      id_to_currency: Number(dataCurrencyRate.id_to_currency),
      effective_date: dayjs(dataCurrencyRate.effective_date).format(
        "YYYY-MM-DDTHH:mm:ssZ"
      ),
    };

    if (stateFormCurrencyRate.action === "add") {
      mutateCreateCurrencyRate(mapCurrencyRate, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapCurrencyRate.from_currency})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchCurrencyRates();
          closeFormCurrencyRate();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapCurrencyRate.from_currency})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormCurrencyRate();
        },
      });
    }

    if (stateFormCurrencyRate.action === "edit") {
      mutateUpdateCurrencyRate(
        {
          id: stateTableCurrencyRate?.selected?.id!,
          params: mapCurrencyRate,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableCurrency?.selected?.currency} ⮕ ${mapCurrencyRate.from_currency})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            refetchCurrencyRates();
            closeFormCurrencyRate();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableCurrency?.selected?.currency} ⮕ ${mapCurrencyRate.from_currency})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormCurrencyRate();
          },
        }
      );
    }

    if (stateFormCurrencyRate.action === "delete") {
      mutateDeleteCurrencyRate(stateTableCurrencyRate?.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableCurrency?.selected?.currency})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          refetchCurrencyRates();
          closeFormDeleteCurrencyRate();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableCurrency?.selected?.currency}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteCurrencyRate();
        },
      });
    }
  };

  const handleCloseFormCurrencyRate = () => {
    if (stateFormCurrencyRate.action === "delete") {
      closeFormDeleteCurrencyRate();
    } else {
      closeFormCurrencyRate();
    }
    formCurrencyRate.clearErrors();
    formCurrencyRate.reset();
  };

  const comboboxCurrencyFrom = useCombobox({
    onDropdownClose: () => comboboxCurrencyFrom.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxCurrencyFrom.selectActiveOption();
      } else {
        comboboxCurrencyFrom.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsCurrencyFrom = flatDataSelectCurrencies.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() === formCurrencyRate.getValues().id_from_currency
        }
        onClick={() => {
          formCurrencyRate.setFieldValue(
            "id_from_currency",
            item.id.toString()
          );
          updateStateFormCurrencyRate({ fromCurrency: item.description });
          comboboxCurrencyFrom.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formCurrencyRate.getValues().id_from_currency && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Currency
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
                    <Text fz={size}>{item.currency}</Text>
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

  const comboboxCurrencyTo = useCombobox({
    onDropdownClose: () => comboboxCurrencyTo.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxCurrencyTo.selectActiveOption();
      } else {
        comboboxCurrencyTo.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsCurrencyTo = flatDataSelectCurrencies.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() === formCurrencyRate.getValues().id_to_currency
        }
        onClick={() => {
          formCurrencyRate.setFieldValue("id_to_currency", item.id.toString());
          updateStateFormCurrencyRate({ toCurrency: item.currency });
          comboboxCurrencyTo.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formCurrencyRate.getValues().id_to_currency && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Currency
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
                    <Text fz={size}>{item.currency}</Text>
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
    <Stack h="100%" gap={20}>
      <Stack h="50%">
        <PageHeader title="Master Currency" />
        <Flex
          direction={{ base: "column-reverse", sm: "row" }}
          justify="space-between"
          align={{ base: "normal", sm: "center" }}
          gap={10}
        >
          <Button.Group>
            {[
              {
                icon: IconRefresh,
                label: "Generate",
                onClick: () => handleGenerateCurrrency(),
                access:
                  dataWarehousePermission?.data.is_create ||
                  dataWarehousePermission?.data.is_update ||
                  dataWarehousePermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataCurrency(),
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
              value={stateFilterCurrency.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterCurrency({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterCurrency({ search: "" })}
                  style={{
                    display: stateFilterCurrency.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormCurrency}
          onClose={closeFormCurrency}
          title={stateFormCurrency.title}
          closeOnClickOutside={false}
        >
          <form>
            <Stack gap={5}>
              <TextInput
                label="Currency"
                placeholder="Currency"
                key={formCurrency.key("currency")}
                size={size}
                disabled={stateFormCurrency.action === "view"}
                {...formCurrency.getInputProps("currency")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formCurrency.key("description")}
                size={size}
                disabled={stateFormCurrency.action === "view"}
                {...formCurrency.getInputProps("description")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormCurrency}
              >
                Close
              </Button>
            </Group>
          </form>
        </Modal>
        {isLoadingCurrencies && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessCurrencies ? (
          dataCurrencies?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "Currency",
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
                rows={rowsCurrency}
              />
              <TableFooter
                from={dataCurrencies.data.pagination.from}
                to={dataCurrencies.data.pagination.to}
                totalPages={dataCurrencies.data.pagination.total_pages}
                totalRows={dataCurrencies.data.pagination.total_rows}
                rowsPerPage={stateTableCurrency.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableCurrency({ rowsPerPage: rows || "" })
                }
                activePage={stateTableCurrency.activePage}
                onPageChange={(page: number) =>
                  updateStateTableCurrency({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingCurrencies && <NoDataFound />
        )}
      </Stack>
      <Stack
        pt={10}
        h="50%"
        style={{
          borderTop: "1px solid gray",
        }}
      >
        <PageSubHeader title="Currency Rates" />
        <Flex
          pb={10}
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
                onClick: () => handleAddDataCurrencyRate(),
                access: dataWarehousePermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataCurrencyRate(),
                access: dataWarehousePermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataCurrencyRate(),
                access: dataWarehousePermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataCurrencyRate(),
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
        </Flex>
        <Modal
          opened={openedFormCurrencyRate}
          onClose={closeFormCurrencyRate}
          title={stateFormCurrencyRate.title}
          closeOnClickOutside={false}
        >
          <form
            onSubmit={formCurrencyRate.onSubmit(handleSubmitFormCurrencyRate)}
          >
            <Stack gap={5}>
              <Combobox
                store={comboboxCurrencyFrom}
                resetSelectionOnOptionHover
                onOptionSubmit={() => {
                  comboboxCurrencyFrom.closeDropdown();
                  comboboxCurrencyFrom.updateSelectedOptionIndex("active");
                }}
              >
                <Combobox.Target targetType="button">
                  <InputBase
                    label="From"
                    component="button"
                    type="button"
                    pointer
                    rightSection={
                      stateFormCurrencyRate.fromCurrency ? (
                        <CloseButton
                          size={16}
                          onClick={() => {
                            formCurrencyRate.setFieldValue(
                              "id_from_currency",
                              ""
                            );
                            updateStateFormCurrencyRate({ fromCurrency: "" });
                          }}
                          disabled={stateFormCurrencyRate.action === "view"}
                        />
                      ) : (
                        <Combobox.Chevron />
                      )
                    }
                    rightSectionPointerEvents="all"
                    onClick={() => comboboxCurrencyFrom.toggleDropdown()}
                    key={formCurrencyRate.key("id_from_currency")}
                    size={size}
                    disabled={true}
                    {...formCurrencyRate.getInputProps("id_from_currency")}
                  >
                    {stateFormCurrencyRate.fromCurrency || (
                      <Input.Placeholder>From Currency</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Search
                    value={stateFormCurrencyRate.fromCurrency}
                    onChange={(event) =>
                      updateStateFormCurrencyRate({
                        fromCurrency: event.currentTarget.value,
                      })
                    }
                    placeholder="Search From Currency"
                  />
                  <Combobox.Options>
                    <ScrollArea.Autosize
                      type="scroll"
                      mah={heightDropdown}
                      onScrollPositionChange={(position) => {
                        let maxY = 790;
                        const dataCount = optionsCurrencyFrom.length;
                        const multipleOf10 = Math.floor(dataCount / 10) * 10;
                        if (position.y >= maxY) {
                          maxY += Math.floor(multipleOf10 / 10) * 790;
                          if (
                            hasNextPageSelectCurrencies &&
                            !isFetchingNextPageSelectCurrencies
                          ) {
                            fetchNextPageSelectCurrencies();
                          }
                        }
                      }}
                    >
                      {optionsCurrencyFrom.length > 0 ? (
                        optionsCurrencyFrom
                      ) : (
                        <Combobox.Empty>Nothing found</Combobox.Empty>
                      )}
                    </ScrollArea.Autosize>
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <Combobox
                store={comboboxCurrencyTo}
                resetSelectionOnOptionHover
                onOptionSubmit={() => {
                  comboboxCurrencyTo.closeDropdown();
                  comboboxCurrencyTo.updateSelectedOptionIndex("active");
                }}
              >
                <Combobox.Target targetType="button">
                  <InputBase
                    label="To"
                    component="button"
                    type="button"
                    pointer
                    rightSection={
                      stateFormCurrencyRate.toCurrency ? (
                        <CloseButton
                          size={16}
                          onClick={() => {
                            formCurrencyRate.setFieldValue(
                              "id_to_currency",
                              ""
                            );
                            updateStateFormCurrencyRate({ toCurrency: "" });
                          }}
                          disabled={stateFormCurrencyRate.action === "view"}
                        />
                      ) : (
                        <Combobox.Chevron />
                      )
                    }
                    rightSectionPointerEvents="all"
                    onClick={() => comboboxCurrencyTo.toggleDropdown()}
                    key={formCurrencyRate.key("id_to_currency")}
                    size={size}
                    disabled={stateFormCurrencyRate.action === "view"}
                    {...formCurrencyRate.getInputProps("id_to_currency")}
                  >
                    {stateFormCurrencyRate.toCurrency || (
                      <Input.Placeholder>To Currency</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Search
                    value={stateFormCurrencyRate.toCurrency}
                    onChange={(event) =>
                      updateStateFormCurrencyRate({
                        toCurrency: event.currentTarget.value,
                      })
                    }
                    placeholder="Search To Currency"
                  />
                  <Combobox.Options>
                    <ScrollArea.Autosize
                      type="scroll"
                      mah={heightDropdown}
                      onScrollPositionChange={(position) => {
                        let maxY = 400;
                        const dataCount = optionsCurrencyTo.length;
                        const multipleOf10 = Math.floor(dataCount / 10) * 10;
                        if (position.y >= maxY) {
                          maxY += Math.floor(multipleOf10 / 10) * 400;
                          if (
                            hasNextPageSelectCurrencies &&
                            !isFetchingNextPageSelectCurrencies
                          ) {
                            fetchNextPageSelectCurrencies();
                          }
                        }
                      }}
                    >
                      {optionsCurrencyTo.length > 0 ? (
                        optionsCurrencyTo
                      ) : (
                        <Combobox.Empty>Nothing found</Combobox.Empty>
                      )}
                    </ScrollArea.Autosize>
                  </Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <NumberInput
                label="Buyying Rate"
                placeholder="Buyying Rate"
                key={formCurrencyRate.key("buy_rate")}
                size={size}
                disabled={stateFormCurrencyRate.action === "view"}
                {...formCurrencyRate.getInputProps("buy_rate")}
                prefix="Rp. "
                decimalSeparator=","
                thousandSeparator="."
                decimalScale={2}
                fixedDecimalScale
                hideControls
              />
              <NumberInput
                label="Selling Rate"
                placeholder="Selling Rate"
                key={formCurrencyRate.key("sell_rate")}
                size={size}
                disabled={stateFormCurrencyRate.action === "view"}
                {...formCurrencyRate.getInputProps("sell_rate")}
                prefix="Rp. "
                decimalSeparator=","
                thousandSeparator="."
                decimalScale={2}
                fixedDecimalScale
                hideControls
              />
              <DatePickerInput
                label="Effective Date"
                placeholder="Effective Date"
                valueFormat="DD-MM-YYYY"
                key={formCurrencyRate.key("effective_date")}
                size={size}
                disabled={stateFormCurrencyRate.action === "view"}
                {...formCurrencyRate.getInputProps("effective_date")}
                leftSection={<IconCalendarWeek size={16} />}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormCurrencyRate}
              >
                Close
              </Button>
              {stateFormCurrencyRate.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateCurrencyRate ||
                    isPendingMutateUpdateCurrencyRate
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteCurrencyRate}
          onClose={closeFormDeleteCurrencyRate}
          title={stateFormCurrencyRate.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>
            Are you sure you want to delete this currency rate?
          </Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormCurrencyRate}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteCurrencyRate}
              onClick={handleSubmitFormCurrencyRate}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingCurrencyRates && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessCurrencyRates ? (
          dataCurrencyRates?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "From",
                  },
                  {
                    name: "To",
                  },
                  {
                    name: "Buyying Rate",
                  },
                  {
                    name: "Selling Rate",
                  },
                  {
                    name: "Effective Date",
                  },
                  {
                    name: "Updated By",
                  },
                  {
                    name: "Last Updated",
                  },
                ]}
                rows={rowsCurrencyRate}
              />
              <TableFooter
                from={dataCurrencyRates.data.pagination.from}
                to={dataCurrencyRates.data.pagination.to}
                totalPages={dataCurrencyRates.data.pagination.total_pages}
                totalRows={dataCurrencyRates.data.pagination.total_rows}
                rowsPerPage={stateTableCurrencyRate.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableCurrencyRate({ rowsPerPage: rows || "" })
                }
                activePage={stateTableCurrencyRate.activePage}
                onPageChange={(page: number) =>
                  updateStateTableCurrencyRate({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingCurrencyRates &&
          (stateFilterCurrencyRate.idCurrency ? (
            <NoDataFound
              subTitle="There is no location data in the currency"
              remarks="Please add the location to the currency"
            />
          ) : (
            <NoDataFound
              subTitle="There is no location data in the currency"
              remarks="Please select the currency first"
            />
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default CurrencyPage;
