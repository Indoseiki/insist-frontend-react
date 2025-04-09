import {
  Button,
  Center,
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
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { Bank } from "../../../types/bank";
import {
  useCreateBank,
  useDeleteBank,
  useBanksQuery,
  useUpdateBank,
} from "../../../hooks/bank";
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
import { useChartOfAccountsInfinityQuery } from "../../../hooks/chartOfAccount";
import { useCurrenciesInfinityQuery } from "../../../hooks/currency";
import {
  useCitiesQuery,
  useCountriesQuery,
  useStatesQuery,
} from "../../../hooks/country";
import { City, Country, State } from "../../../types/country";

interface StateFilter {
  search: string;
}

interface StateFormBank extends StateForm {
  account: string | number;
  currency: string;
  country: string;
  state: string;
  city: string;
}

const BankPage = () => {
  const location = useLocation();

  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormBank, { open: openFormBank, close: closeFormBank }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Bank>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormBank>({
    title: "",
    action: "",
    account: "",
    currency: "",
    country: "",
    state: "",
    city: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Bank>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormBank>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Bank) => updateStateTable({ selected: row });

  const {
    data: dataBanks,
    isSuccess: isSuccessBanks,
    isLoading: isLoadingBanks,
    refetch: refetchBanks,
  } = useBanksQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const { mutate: mutateCreateBank, isPending: isPendingMutateCreateBank } =
    useCreateBank();

  const { mutate: mutateUpdateBank, isPending: isPendingMutateUpdateBank } =
    useUpdateBank();

  const { mutate: mutateDeleteBank, isPending: isPendingMutateDeleteBank } =
    useDeleteBank();

  const {
    data: dataSelectAccount,
    isSuccess: isSuccessSelectAccount,
    fetchNextPage: fetchNextPageSelectAccount,
    hasNextPage: hasNextPageSelectAccount,
    isFetchingNextPage: isFetchingNextPageSelectAccount,
  } = useChartOfAccountsInfinityQuery({
    search: stateForm.account.toString(),
  });

  const flatDataSelectAccount =
    (isSuccessSelectAccount &&
      dataSelectAccount?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectCurrencies,
    isSuccess: isSuccessSelectCurrencies,
    fetchNextPage: fetchNextPageSelectCurrencies,
    hasNextPage: hasNextPageSelectCurrencies,
    isFetchingNextPage: isFetchingNextPageSelectCurrencies,
  } = useCurrenciesInfinityQuery({
    search: stateForm.currency,
  });

  const flatDataSelectCurrencies =
    (isSuccessSelectCurrencies &&
      dataSelectCurrencies?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const { data: dataCountries, isSuccess: isSuccessCountries } =
    useCountriesQuery();

  const mappedDataCountries = useMemo(() => {
    if (!isSuccessCountries || !dataCountries) return undefined;

    return dataCountries.map((country: Country) => ({
      value: country.name,
      label: country.name,
    }));
  }, [isSuccessCountries, dataCountries]);

  const selectedCountryIso2 = useMemo(() => {
    return dataCountries?.find(
      (item: Country) => item.name === stateForm.country
    )?.iso2;
  }, [dataCountries, stateForm.country]);

  const { data: dataStates, isSuccess: isSuccessStates } = useStatesQuery(
    selectedCountryIso2!
  );

  const mappedDataStates = useMemo(() => {
    if (!isSuccessStates || !dataStates) return [];
    return dataStates.map((state: State) => ({
      value: state.name,
      label: state.name,
    }));
  }, [isSuccessStates, dataStates]);

  const selectedStateIso2 = useMemo(() => {
    return dataStates?.find((item: State) => item.name === stateForm.state)
      ?.iso2;
  }, [dataStates, stateForm.state]);

  const { data: dataCities, isSuccess: isSuccessCities } = useCitiesQuery({
    idCountry: selectedCountryIso2!,
    idState: selectedStateIso2!,
  });

  const mappedDataCities = useMemo(() => {
    if (!isSuccessCities || !dataCities) return [];
    return dataCities.map((city: City) => ({
      value: city.name,
      label: city.name,
    }));
  }, [isSuccessCities, dataCities]);

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessBanks || !dataBanks?.data?.pagination.total_rows) return null;

    return dataBanks.data.items.map((row: Bank) => {
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
          <Table.Td>{row.name}</Table.Td>
          <Table.Td>{row.account_num}</Table.Td>
          <Table.Td>{row.account?.account}</Table.Td>
          <Table.Td>{row.account?.description}</Table.Td>
          <Table.Td>{row.currency?.currency}</Table.Td>
          <Table.Td w="250px">{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessBanks, dataBanks, stateTable.selected, colorScheme]);

  const formBank = useForm<Partial<Bank>>({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      name: "",
      account_num: "",
      id_account: "",
      id_currency: "",
      bic: "",
      country: "",
      state: "",
      city: "",
      address: "",
      zip_code: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value?.length === 0 ? "Code is required" : null),
      name: (value) => (value?.length === 0 ? "Name is required" : null),
      account_num: (value) =>
        value?.length === 0 ? "Account Number is required" : null,
      id_account: (value) => (value === "" ? "Cash Account is required" : null),
      id_currency: (value) => (value === "" ? "Currency is required" : null),
      country: (value) => (value?.length === 0 ? "Country is required" : null),
      state: (value) => (value?.length === 0 ? "State is required" : null),
      city: (value) => (value?.length === 0 ? "City is required" : null),
      address: (value) => (value?.length === 0 ? "Address is required" : null),
      zip_code: (value) =>
        value?.length === 0 ? "Zip Code is required" : null,
    },
  });

  const handleAddData = () => {
    formBank.clearErrors();
    formBank.reset();
    updateStateForm({
      title: "Add Data",
      action: "add",
      account: "",
      currency: "",
      country: "",
      state: "",
      city: "",
    });
    openFormBank();
  };

  const handleEditData = () => {
    formBank.clearErrors();
    formBank.reset();
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
      account: stateTable.selected.account?.account,
      currency: stateTable.selected.currency?.currency,
      country: stateTable.selected.country,
      state: stateTable.selected.state,
      city: stateTable.selected.city,
    });

    formBank.setValues({
      code: stateTable.selected.code,
      name: stateTable.selected.name,
      account_num: stateTable.selected.account_num,
      id_account: stateTable.selected.id_account,
      id_currency: stateTable.selected.id_currency,
      bic: stateTable.selected.bic,
      country: stateTable.selected.country,
      state: stateTable.selected.state,
      city: stateTable.selected.city,
      address: stateTable.selected.address,
      zip_code: stateTable.selected.zip_code,
      remarks: stateTable.selected.remarks,
    });

    openFormBank();
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
    formBank.clearErrors();
    formBank.reset();

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
      account: stateTable.selected.account?.account,
      currency: stateTable.selected.currency?.currency,
      country: stateTable.selected.country,
      state: stateTable.selected.state,
      city: stateTable.selected.city,
    });

    formBank.setValues({
      code: stateTable.selected.code,
      name: stateTable.selected.name,
      account_num: stateTable.selected.account_num,
      id_account: stateTable.selected.id_account,
      id_currency: stateTable.selected.id_currency,
      bic: stateTable.selected.bic,
      country: stateTable.selected.country,
      state: stateTable.selected.state,
      city: stateTable.selected.city,
      address: stateTable.selected.address,
      zip_code: stateTable.selected.zip_code,
      remarks: stateTable.selected.remarks,
    });

    openFormBank();
  };

  const handleSubmitForm = () => {
    const dataBank = formBank.getValues();

    let mapBank = {
      ...dataBank,
      id_account: Number(dataBank.id_account),
      id_currency: Number(dataBank.id_currency),
    };

    if (stateForm.action === "add") {
      mutateCreateBank(mapBank, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapBank.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchBanks();
          closeFormBank();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapBank.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormBank();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateBank(
        {
          id: stateTable.selected?.id!,
          params: mapBank,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${mapBank.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchBanks();
            closeFormBank();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${mapBank.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormBank();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteBank(stateTable.selected?.id!, {
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
          refetchBanks();
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

  const handleCloseFormBank = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormBank();
    }
    formBank.clearErrors();
    formBank.reset();
  };

  const comboboxAccount = useCombobox({
    onDropdownClose: () => comboboxAccount.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxAccount.selectActiveOption();
      } else {
        comboboxAccount.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsAccount = flatDataSelectAccount.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formBank.getValues().id_account}
        onClick={() => {
          formBank.setFieldValue("id_account", item.id.toString());
          updateStateForm({ account: item.description });
          comboboxAccount.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formBank.getValues().id_account && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Account
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
    );
  });

  const comboboxCurrency = useCombobox({
    onDropdownClose: () => comboboxCurrency.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxCurrency.selectActiveOption();
      } else {
        comboboxCurrency.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsCurrency = flatDataSelectCurrencies.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formBank.getValues().id_currency}
        onClick={() => {
          formBank.setFieldValue("id_currency", item.id.toString());
          updateStateForm({ currency: item.currency });
          comboboxCurrency.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formBank.getValues().id_currency && (
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
    <Stack h="100%">
      <PageHeader title="Master Bank" />
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
        opened={openedFormBank}
        onClose={closeFormBank}
        title={stateForm.title}
        closeOnClickOutside={false}
        size="xl"
      >
        <form onSubmit={formBank.onSubmit(handleSubmitForm)}>
          <ScrollArea h={600} type="scroll">
            <Stack gap={5}>
              <fieldset>
                <legend>Bank Information</legend>
                <Grid gutter="sm">
                  <Grid.Col span={12}>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 2 }}>
                        <TextInput
                          label="Code"
                          placeholder="Code"
                          key={formBank.key("code")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formBank.getInputProps("code")}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 5 }}>
                        <TextInput
                          label="Name"
                          placeholder="Name"
                          key={formBank.key("name")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formBank.getInputProps("name")}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 5 }}>
                        <TextInput
                          label="Account Number"
                          placeholder="Account Number"
                          key={formBank.key("account_num")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formBank.getInputProps("account_num")}
                        />
                      </Grid.Col>
                    </Grid>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 7 }}>
                        <Combobox
                          store={comboboxAccount}
                          resetSelectionOnOptionHover
                          onOptionSubmit={() => {
                            comboboxAccount.closeDropdown();
                            comboboxAccount.updateSelectedOptionIndex("active");
                          }}
                        >
                          <Combobox.Target targetType="button">
                            <InputBase
                              label="Cash Account"
                              component="button"
                              type="button"
                              pointer
                              rightSection={
                                stateForm.account ? (
                                  <CloseButton
                                    size={16}
                                    onClick={() => {
                                      formBank.setFieldValue("id_account", "");
                                      updateStateForm({ account: "" });
                                    }}
                                    disabled={stateForm.action === "view"}
                                  />
                                ) : (
                                  <Combobox.Chevron />
                                )
                              }
                              rightSectionPointerEvents="all"
                              onClick={() => comboboxAccount.toggleDropdown()}
                              key={formBank.key("id_account")}
                              size={size}
                              {...formBank.getInputProps("id_account")}
                              disabled={stateForm.action === "view"}
                            >
                              {stateForm.account || (
                                <Input.Placeholder>
                                  Cash Account
                                </Input.Placeholder>
                              )}
                            </InputBase>
                          </Combobox.Target>
                          <Combobox.Dropdown>
                            <Combobox.Search
                              value={stateForm.account}
                              onChange={(event) =>
                                updateStateForm({
                                  account: event.currentTarget.value,
                                })
                              }
                              placeholder="Search Cash Account"
                            />
                            <Combobox.Options>
                              <ScrollArea.Autosize
                                type="scroll"
                                mah={heightDropdown}
                                onScrollPositionChange={(position) => {
                                  let maxY = 400;
                                  const dataCount = optionsAccount.length;
                                  const multipleOf10 =
                                    Math.floor(dataCount / 10) * 10;
                                  if (position.y >= maxY) {
                                    maxY += Math.floor(multipleOf10 / 10) * 400;
                                    if (
                                      hasNextPageSelectAccount &&
                                      !isFetchingNextPageSelectAccount
                                    ) {
                                      fetchNextPageSelectAccount();
                                    }
                                  }
                                }}
                              >
                                {optionsAccount.length > 0 ? (
                                  optionsAccount
                                ) : (
                                  <Combobox.Empty>Nothing found</Combobox.Empty>
                                )}
                              </ScrollArea.Autosize>
                            </Combobox.Options>
                          </Combobox.Dropdown>
                        </Combobox>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 5 }}>
                        <Combobox
                          store={comboboxCurrency}
                          resetSelectionOnOptionHover
                          onOptionSubmit={() => {
                            comboboxCurrency.closeDropdown();
                            comboboxCurrency.updateSelectedOptionIndex(
                              "active"
                            );
                          }}
                        >
                          <Combobox.Target targetType="button">
                            <InputBase
                              label="Currency"
                              component="button"
                              type="button"
                              pointer
                              rightSection={
                                stateForm.currency ? (
                                  <CloseButton
                                    size={16}
                                    onClick={() => {
                                      formBank.setFieldValue("id_currency", "");
                                      updateStateForm({ currency: "" });
                                    }}
                                    disabled={stateForm.action === "view"}
                                  />
                                ) : (
                                  <Combobox.Chevron />
                                )
                              }
                              rightSectionPointerEvents="all"
                              onClick={() => comboboxCurrency.toggleDropdown()}
                              key={formBank.key("id_currency")}
                              size={size}
                              {...formBank.getInputProps("id_currency")}
                              disabled={stateForm.action === "view"}
                            >
                              {stateForm.currency || (
                                <Input.Placeholder>Currency</Input.Placeholder>
                              )}
                            </InputBase>
                          </Combobox.Target>
                          <Combobox.Dropdown>
                            <Combobox.Search
                              value={stateForm.currency}
                              onChange={(event) =>
                                updateStateForm({
                                  currency: event.currentTarget.value,
                                })
                              }
                              placeholder="Search Currency"
                            />
                            <Combobox.Options>
                              <ScrollArea.Autosize
                                type="scroll"
                                mah={heightDropdown}
                                onScrollPositionChange={(position) => {
                                  let maxY = 400;
                                  const dataCount = optionsCurrency.length;
                                  const multipleOf10 =
                                    Math.floor(dataCount / 10) * 10;
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
                                {optionsCurrency.length > 0 ? (
                                  optionsCurrency
                                ) : (
                                  <Combobox.Empty>Nothing found</Combobox.Empty>
                                )}
                              </ScrollArea.Autosize>
                            </Combobox.Options>
                          </Combobox.Dropdown>
                        </Combobox>
                      </Grid.Col>
                    </Grid>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 7 }}>
                    <Textarea
                      label="Remarks"
                      placeholder="Remarks"
                      key={formBank.key("remarks")}
                      rows={4}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBank.getInputProps("remarks")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <TextInput
                      label="BIC"
                      placeholder="BIC"
                      key={formBank.key("bic")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formBank.getInputProps("bic")}
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Office Address</legend>
                <Grid gutter="sm">
                  <Grid.Col span={12}>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                          label="Country"
                          placeholder="Country"
                          data={mappedDataCountries}
                          key={formBank.key("country")}
                          size={size}
                          {...formBank.getInputProps("country")}
                          searchable
                          searchValue={stateForm.country}
                          onSearchChange={(value) =>
                            updateStateForm({ country: value })
                          }
                          maxDropdownHeight={heightDropdown}
                          nothingFoundMessage="Nothing found..."
                          clearable
                          clearButtonProps={{
                            onClick: () => {
                              formBank.setFieldValue("country", "");
                              formBank.setFieldValue("state", "");
                              formBank.setFieldValue("city", "");
                              formBank.setFieldValue("address", "");
                              updateStateForm({
                                country: "",
                                state: "",
                                city: "",
                              });
                            },
                          }}
                          disabled={stateForm.action === "view"}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                          label="State"
                          placeholder="State"
                          data={mappedDataStates}
                          key={formBank.key("state")}
                          size={size}
                          {...formBank.getInputProps("state")}
                          searchable
                          searchValue={stateForm.state}
                          onSearchChange={(value) =>
                            updateStateForm({ state: value })
                          }
                          maxDropdownHeight={heightDropdown}
                          nothingFoundMessage="Nothing found..."
                          clearable
                          clearButtonProps={{
                            onClick: () => {
                              formBank.setFieldValue("state", "");
                              formBank.setFieldValue("city", "");
                              formBank.setFieldValue("address", "");
                              updateStateForm({
                                state: "",
                                city: "",
                              });
                            },
                          }}
                          disabled={
                            stateForm.action === "view" ||
                            stateForm.country === ""
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                          label="City"
                          placeholder="City"
                          data={mappedDataCities}
                          key={formBank.key("city")}
                          size={size}
                          {...formBank.getInputProps("city")}
                          searchable
                          searchValue={stateForm.city}
                          onSearchChange={(value) =>
                            updateStateForm({ city: value })
                          }
                          maxDropdownHeight={heightDropdown}
                          nothingFoundMessage="Nothing found..."
                          clearable
                          clearButtonProps={{
                            onClick: () => {
                              formBank.setFieldValue("city", "");
                              formBank.setFieldValue("address", "");
                              updateStateForm({
                                city: "",
                              });
                            },
                          }}
                          disabled={
                            stateForm.action === "view" ||
                            stateForm.country === "" ||
                            stateForm.state === ""
                          }
                        />
                      </Grid.Col>
                    </Grid>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 8 }}>
                        <Textarea
                          label="Address"
                          placeholder="Address"
                          key={formBank.key("address")}
                          rows={4}
                          size={size}
                          disabled={
                            stateForm.action === "view" ||
                            stateForm.country === "" ||
                            stateForm.state === "" ||
                            stateForm.city === ""
                          }
                          {...formBank.getInputProps("address")}
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                          label="Zip Code"
                          placeholder="Zip Code"
                          key={formBank.key("zip_code")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formBank.getInputProps("zip_code")}
                        />
                      </Grid.Col>
                    </Grid>
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
              onClick={handleCloseFormBank}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateBank || isPendingMutateUpdateBank}
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
        <Text size={size}>Are you sure you want to delete this bank?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormBank}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteBank}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingBanks && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessBanks ? (
        dataBanks?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Code",
                },
                {
                  name: "Name",
                },
                {
                  name: "Account Number",
                },
                {
                  name: "Cash Account",
                },
                {
                  name: "Description",
                },
                {
                  name: "Currency",
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
              from={dataBanks.data.pagination.from}
              to={dataBanks.data.pagination.to}
              totalPages={dataBanks.data.pagination.total_pages}
              totalRows={dataBanks.data.pagination.total_rows}
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
        !isLoadingBanks && <NoDataFound />
      )}
    </Stack>
  );
};

export default BankPage;
