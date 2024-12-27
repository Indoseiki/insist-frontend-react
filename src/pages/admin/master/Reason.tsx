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
import { Reason } from "../../../types/reason";
import {
  useCreateReason,
  useDeleteReason,
  useReasonsQuery,
  useUpdateReason,
} from "../../../hooks/reason";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/table/TableScrollable";
import TableFooter from "../../../components/table/TableFooter";
import NoDataFound from "../../../components/table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useMenusInfinityQuery } from "../../../hooks/menu";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";

interface StateFilter {
  open: boolean;
  search: string;
  idMenu: string;
  menu: string;
}

interface FormValues {
  id_menu: string;
  key: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormReason extends StateForm {
  menu: string;
}

const ReasonPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormReason, { open: openFormReason, close: closeFormReason }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Reason>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "name",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    idMenu: "",
    menu: "",
  });

  const [stateForm, setStateForm] = useState<StateFormReason>({
    title: "",
    action: "",
    menu: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Reason>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormReason>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Reason) => updateStateTable({ selected: row });

  const {
    data: dataReasons,
    isSuccess: isSuccessReasons,
    isLoading: isLoadingReasons,
    refetch: refetchReasons,
  } = useReasonsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    id_menu: stateFilter.idMenu,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectMenus,
    isSuccess: isSuccessSelectMenus,
    fetchNextPage: fetchNextPageSelectMenus,
    hasNextPage: hasNextPageSelectMenus,
    isFetchingNextPage: isFetchingNextPageSelectMenus,
  } = useMenusInfinityQuery({
    search: stateForm.menu,
  });

  const flatDataSelectMenus =
    (isSuccessSelectMenus &&
      dataSelectMenus?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataFilterMenus,
    isSuccess: isSuccessFilterMenus,
    fetchNextPage: fetchNextPageFilterMenus,
    hasNextPage: hasNextPageFilterMenus,
    isFetchingNextPage: isFetchingNextPageFilterMenus,
  } = useMenusInfinityQuery({
    search: stateFilter.menu || "",
  });

  const flatDataFilterMenus =
    (isSuccessFilterMenus &&
      dataFilterMenus?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterMenu = useMemo(() => {
    return flatDataFilterMenus.map((menu) => ({
      value: menu.id.toString(),
      label: menu.label ? menu.label : "",
    }));
  }, [flatDataFilterMenus]);

  const { mutate: mutateCreateReason, isPending: isPendingMutateCreateReason } =
    useCreateReason();

  const { mutate: mutateUpdateReason, isPending: isPendingMutateUpdateReason } =
    useUpdateReason();

  const { mutate: mutateDeleteReason, isPending: isPendingMutateDeleteReason } =
    useDeleteReason();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessReasons || !dataReasons?.data?.pagination.total_rows)
      return null;

    return dataReasons.data.items.map((row: Reason) => {
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
          <Table.Td>{row.menu?.label}</Table.Td>
          <Table.Td>{row.key}</Table.Td>
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td w={300}>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessReasons, dataReasons, stateTable.selected, colorScheme]);

  const formReason = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      id_menu: "",
      key: "",
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      id_menu: (value) => (value.length === 0 ? "Menu is required" : null),
      key: (value) => (value.length === 0 ? "Key is required" : null),
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddData = () => {
    formReason.clearErrors();
    formReason.reset();
    updateStateForm({ title: "Add Data", action: "add", menu: "" });
    openFormReason();
  };

  const handleEditData = () => {
    formReason.clearErrors();
    formReason.reset();
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
      menu: stateTable.selected.menu?.label,
    });

    formReason.setValues({
      id_menu: stateTable.selected.id_menu?.toString(),
      key: stateTable.selected.key,
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormReason();
  };

  const handleDeleteData = () => {
    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formReason.clearErrors();
    formReason.reset();

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
      menu: stateTable.selected.menu?.label,
    });

    formReason.setValues({
      id_menu: stateTable.selected.id_menu?.toString(),
      key: stateTable.selected.key,
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormReason();
  };

  const handleSubmitForm = () => {
    const dataReason = formReason.getValues();

    let mapReason = {
      ...dataReason,
      id_menu: parseInt(dataReason.id_menu),
    };

    if (stateForm.action === "add") {
      mutateCreateReason(mapReason, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapReason.key})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchReasons();
          closeFormReason();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapReason.key})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormReason();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateReason(
        {
          id: stateTable.selected?.id!,
          params: mapReason,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.key} ⮕ ${mapReason.key})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchReasons();
            closeFormReason();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.key} ⮕ ${mapReason.key})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormReason();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteReason(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.key})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchReasons();
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
            message: `${res?.data.message} (${stateTable.selected?.key}) `,
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

  const handleCloseFormReason = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormReason();
    }
    formReason.clearErrors();
    formReason.reset();
  };

  const comboboxMenu = useCombobox({
    onDropdownClose: () => comboboxMenu.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxMenu.selectActiveOption();
      } else {
        comboboxMenu.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsParent = flatDataSelectMenus.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formReason.getValues().id_menu}
        onClick={() => {
          formReason.setFieldValue("id_menu", item.id.toString());
          updateStateForm({ menu: item.label });
          comboboxMenu.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formReason.getValues().id_menu && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Label
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
                    <Text fz={size}>{item.label}</Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Path
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
                    <Text fz={size}>{item.path}</Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Parent
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
                    <Text fz={size}>{item.parent?.label}</Text>
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
      <PageHeader title="Master Reason" />
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
                placeholder="Menu"
                data={mappedDataFilterMenu}
                size={size}
                searchable
                searchValue={stateFilter.menu || ""}
                onSearchChange={(value) =>
                  updateStateFilter({ menu: value || "" })
                }
                value={stateFilter.idMenu ? stateFilter.idMenu : ""}
                onChange={(value, _option) =>
                  updateStateFilter({ idMenu: value || "" })
                }
                maxDropdownHeight={heightDropdown}
                nothingFoundMessage="Nothing found..."
                clearable
                clearButtonProps={{
                  onClick: () => {
                    updateStateFilter({ menu: "" });
                  },
                }}
                scrollAreaProps={{
                  onScrollPositionChange: (position) => {
                    let maxY = 37;
                    const dataCount = mappedDataFilterMenu.length;
                    const multipleOf10 = Math.floor(dataCount / 10) * 10;
                    if (position.y >= maxY) {
                      maxY += Math.floor(multipleOf10 / 10) * 37;
                      if (
                        hasNextPageFilterMenus &&
                        !isFetchingNextPageFilterMenus
                      ) {
                        fetchNextPageFilterMenus();
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
        opened={openedFormReason}
        onClose={closeFormReason}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formReason.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <Combobox
              store={comboboxMenu}
              resetSelectionOnOptionHover
              onOptionSubmit={() => {
                comboboxMenu.closeDropdown();
                comboboxMenu.updateSelectedOptionIndex("active");
              }}
            >
              <Combobox.Target targetType="button">
                <InputBase
                  label="Parent"
                  component="button"
                  type="button"
                  pointer
                  rightSection={
                    stateForm.menu ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formReason.setFieldValue("id_menu", "");
                          updateStateForm({ menu: "" });
                        }}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxMenu.toggleDropdown()}
                  key={formReason.key("id_menu")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formReason.getInputProps("id_menu")}
                >
                  {stateForm.menu || (
                    <Input.Placeholder>Parent</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.menu}
                  onChange={(event) =>
                    updateStateForm({ menu: event.currentTarget.value })
                  }
                  placeholder="Search Menu"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 790;
                      const dataCount = optionsParent.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 790;
                        if (
                          hasNextPageSelectMenus &&
                          !isFetchingNextPageSelectMenus
                        ) {
                          fetchNextPageSelectMenus();
                        }
                      }
                    }}
                  >
                    {optionsParent.length > 0 ? (
                      optionsParent
                    ) : (
                      <Combobox.Empty>Nothing found</Combobox.Empty>
                    )}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
            <TextInput
              label="Key"
              placeholder="Key"
              key={formReason.key("key")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formReason.getInputProps("key")}
            />
            <TextInput
              label="Code"
              placeholder="Code"
              key={formReason.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formReason.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formReason.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formReason.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formReason.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formReason.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormReason}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateReason || isPendingMutateUpdateReason
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
        <Text size={size}>Are you sure you want to delete this reason?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormReason}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteReason}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingReasons && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessReasons ? (
        dataReasons?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Menu",
                },
                {
                  name: "Key",
                },
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
              from={dataReasons.data.pagination.from}
              to={dataReasons.data.pagination.to}
              totalPages={dataReasons.data.pagination.total_pages}
              totalRows={dataReasons.data.pagination.total_rows}
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
        !isLoadingReasons && <NoDataFound />
      )}
    </Stack>
  );
};

export default ReasonPage;
