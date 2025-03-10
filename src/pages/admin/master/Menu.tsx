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
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { StateTable } from "../../../types/table";
import { Menu } from "../../../types/menu";
import {
  useCreateMenu,
  useDeleteMenu,
  useMenusInfinityQuery,
  useMenusQuery,
  useUpdateMenu,
} from "../../../hooks/menu";
import { formatDateTime } from "../../../utils/formatTime";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import NoDataFound from "../../../components/Table/NoDataFound";
import TableFooter from "../../../components/Table/TableFooter";
import TableScrollable from "../../../components/Table/TableScrollable";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";

interface StateFilter {
  search: string;
}

interface FormValues {
  label: string;
  path: string;
  id_parent: string;
  sort: number;
  icon: string;
}

interface StateFormMenu extends StateForm {
  menu: string;
}

const MenuPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();
  const { colorScheme } = useMantineColorScheme();
  const [openedFormMenu, { open: openFormMenu, close: closeFormMenu }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Menu>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "label",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormMenu>({
    title: "",
    action: "",
    menu: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Menu>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormMenu>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Menu) => updateStateTable({ selected: row });

  const {
    data: dataMenus,
    isSuccess: isSuccessMenus,
    isLoading: isLoadingMenus,
    refetch: refetchMenus,
  } = useMenusQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
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

  const { mutate: mutateCreateMenu, isPending: isPendingMutateCreateMenu } =
    useCreateMenu();

  const { mutate: mutateUpdateMenu, isPending: isPendingMutateUpdateMenu } =
    useUpdateMenu();

  const { mutate: mutateDeleteMenu, isPending: isPendingMutateDeleteMenu } =
    useDeleteMenu();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessMenus || !dataMenus?.data?.pagination.total_rows) return null;

    return dataMenus.data.items.map((row: Menu) => {
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
          <Table.Td>{row.label}</Table.Td>
          <Table.Td>{row.path}</Table.Td>
          <Table.Td>{row.parent?.label}</Table.Td>
          <Table.Td>{row.icon}</Table.Td>
          <Table.Td>{row.sort ?? "0"}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessMenus, dataMenus, stateTable.selected, colorScheme]);

  const formMenu = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      label: "",
      path: "",
      id_parent: "",
      sort: 0,
      icon: "",
    },

    validate: {
      label: (value) => (value.length === 0 ? "Label is required" : null),
      path: (value) => (value.length === 0 ? "Path is required" : null),
      sort: (value) => (value === undefined ? "Sort is required" : null),
      icon: (value) => (value === "" ? "Icon is required" : null),
    },
  });

  const handleAddData = () => {
    formMenu.clearErrors();
    formMenu.reset();
    updateStateForm({ title: "Add Data", action: "add", menu: "" });
    openFormMenu();
  };

  const handleEditData = () => {
    formMenu.clearErrors();
    formMenu.reset();

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
      menu: stateTable.selected.parent?.label,
    });

    formMenu.setValues({
      label: stateTable.selected.label,
      path: stateTable.selected.path,
      id_parent: stateTable.selected.id_parent?.toString(),
      sort: stateTable.selected.sort,
      icon: stateTable.selected.icon,
    });

    openFormMenu();
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
    formMenu.clearErrors();
    formMenu.reset();

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
      menu: stateTable.selected.parent?.label,
    });

    formMenu.setValues({
      label: stateTable.selected.label,
      path: stateTable.selected.path,
      id_parent: stateTable.selected.id_parent?.toString(),
      sort: stateTable.selected.sort,
      icon: stateTable.selected.icon,
    });

    openFormMenu();
  };

  const handleSubmitForm = () => {
    const dataMenu = formMenu.getValues();

    let mapMenu = {
      ...dataMenu,
      id_parent: parseInt(dataMenu.id_parent),
    };

    if (stateForm.action === "add") {
      mutateCreateMenu(mapMenu, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapMenu.path})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchMenus();
          closeFormMenu();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapMenu.path})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormMenu();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateMenu(
        {
          id: stateTable.selected?.id!,
          params: mapMenu,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.path} ⮕ ${mapMenu.path})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchMenus();
            closeFormMenu();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.path} ⮕ ${mapMenu.path})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormMenu();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteMenu(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.path})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchMenus();
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
            message: `${res?.data.message} (${stateTable.selected?.path}) `,
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

  const handleCloseFormMenu = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormMenu();
    }
    formMenu.clearErrors();
    formMenu.reset();
  };

  const comboboxParent = useCombobox({
    onDropdownClose: () => comboboxParent.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxParent.selectActiveOption();
      } else {
        comboboxParent.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsParent = flatDataSelectMenus.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formMenu.getValues().id_parent}
        onClick={() => {
          formMenu.setFieldValue("id_parent", item.id.toString());
          updateStateForm({ menu: item.label });
          comboboxParent.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formMenu.getValues().id_parent && (
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
      <PageHeader title="Master Menu" />
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
        opened={openedFormMenu}
        onClose={closeFormMenu}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formMenu.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Label"
              placeholder="Label"
              key={formMenu.key("label")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formMenu.getInputProps("label")}
            />
            <TextInput
              label="Path"
              placeholder="Path"
              key={formMenu.key("path")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formMenu.getInputProps("path")}
            />
            <Combobox
              store={comboboxParent}
              resetSelectionOnOptionHover
              onOptionSubmit={() => {
                comboboxParent.closeDropdown();
                comboboxParent.updateSelectedOptionIndex("active");
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
                          formMenu.setFieldValue("id_parent", "");
                          updateStateForm({ menu: "" });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxParent.toggleDropdown()}
                  key={formMenu.key("id_parent")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formMenu.getInputProps("id_parent")}
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
              label="Icon"
              placeholder="Icon"
              key={formMenu.key("icon")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formMenu.getInputProps("icon")}
            />
            <NumberInput
              label="Sort"
              placeholder="Sort"
              key={formMenu.key("sort")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formMenu.getInputProps("sort")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormMenu}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateMenu || isPendingMutateUpdateMenu}
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
        <Text size={size}>Are you sure you want to delete this menu?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormMenu}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteMenu}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingMenus && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessMenus ? (
        dataMenus?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Label",
                },
                {
                  name: "Path",
                },
                {
                  name: "Parent",
                },
                {
                  name: "Icon",
                },
                {
                  name: "Sort",
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
              from={dataMenus.data.pagination.from}
              to={dataMenus.data.pagination.to}
              totalPages={dataMenus.data.pagination.total_pages}
              totalRows={dataMenus.data.pagination.total_rows}
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
        !isLoadingMenus && <NoDataFound />
      )}
    </Stack>
  );
};

export default MenuPage;
