import {
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { useUpdateRoleMenu, useRoleMenusQuery } from "../../hooks/roleMenu";
import TableScrollable from "../../components/table/TableScrollable";
import TableFooter from "../../components/table/TableFooter";
import NoDataFound from "../../components/table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../types/table";
import { StateForm } from "../../types/form";
import { RoleMenu } from "../../types/roleMenu";
import { Role } from "../../types/role";
import { useTreeMenu } from "../../hooks/menu";
import TreeMenu from "../../components/Forms/TreeMenu";

interface StateFilter {
  search: string;
}

interface FormValues {
  name: string;
  id_menu: string[];
}

interface StateFormRoleMenu extends StateForm {
  menu: string[];
}

const RolePermissionPage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormRoleMenu,
    { open: openFormRoleMenu, close: closeFormRoleMenu },
  ] = useDisclosure(false);

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

  const [stateForm, setStateForm] = useState<StateFormRoleMenu>({
    title: "",
    action: "",
    menu: [],
  });

  const updateStateTable = (newState: Partial<StateTable<Role>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormRoleMenu>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Role) => updateStateTable({ selected: row });

  const {
    data: dataRoleMenus,
    isSuccess: isSuccessRoleMenus,
    isLoading: isLoadingRoleMenus,
    refetch: refetchRoleMenus,
  } = useRoleMenusQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataTreeMenu,
    isSuccess: isSuccessTreeMenu,
    isLoading: isLoadingTreeMenu,
  } = useTreeMenu();

  const {
    mutate: mutateCreateRoleMenu,
    isPending: isPendingMutateCreateRoleMenu,
  } = useUpdateRoleMenu();

  const rows = useMemo(() => {
    if (!isSuccessRoleMenus || !dataRoleMenus?.data?.pagination.total_rows)
      return null;

    return dataRoleMenus.data.items.map((row: Role) => {
      const isSelected = stateTable.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      const roleNames = row.role_menus
        ?.map((item: RoleMenu) => item.menu?.label)
        .join(", ");

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w={300}>{row.name}</Table.Td>
          <Table.Td>{roleNames}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessRoleMenus, dataRoleMenus, stateTable.selected, colorScheme]);

  const formRoleMenu = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      id_menu: [],
    },

    validate: {
      id_menu: (value) => {
        return value.length == 0 ? "Role is required" : null;
      },
    },
  });

  const handleSetupRole = () => {
    formRoleMenu.clearErrors();
    formRoleMenu.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Setup Menu",
      action: "setup",
    });

    const menuIds =
      stateTable.selected.role_menus
        ?.map((item) => item.id_menu?.toString())
        .filter((id): id is string => id !== undefined) || [];

    formRoleMenu.setValues({
      name: stateTable.selected.name,
      id_menu: menuIds,
    });

    openFormRoleMenu();
  };

  const handleViewData = () => {
    formRoleMenu.clearErrors();
    formRoleMenu.reset();

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

    const menuIds =
      stateTable.selected.role_menus
        ?.map((item) => item.id_menu?.toString())
        .filter((id): id is string => id !== undefined) || [];

    formRoleMenu.setValues({
      name: stateTable.selected.name,
      id_menu: menuIds,
    });

    openFormRoleMenu();
  };

  const handleSubmitForm = () => {
    const dataRoleMenu = formRoleMenu.getValues();

    mutateCreateRoleMenu(
      {
        id: stateTable.selected?.id!,
        params: {
          id_menu: dataRoleMenu.id_menu.map((id) => parseInt(id)),
        },
      },
      {
        onSuccess(res) {
          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchRoleMenus();
          closeFormRoleMenu();
        },
        onError() {
          notifications.show({
            title: "Created Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormRoleMenu();
        },
      }
    );
  };

  const handleCloseFormRoleMenu = () => {
    closeFormRoleMenu();
    formRoleMenu.clearErrors();
    formRoleMenu.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Role Permission" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Button.Group>
          {[
            {
              icon: IconEdit,
              label: "Setup Menu",
              onClick: () => handleSetupRole(),
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
        opened={openedFormRoleMenu}
        onClose={closeFormRoleMenu}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formRoleMenu.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Name"
              placeholder="Name"
              key={formRoleMenu.key("name")}
              size={size}
              disabled={true}
              {...formRoleMenu.getInputProps("name")}
            />
            <Stack gap={5} mt={10}>
              <Text>Menu</Text>
              <ScrollArea h={300} type="scroll">
                <TreeMenu
                  data={dataTreeMenu?.data || []}
                  isLoading={isLoadingTreeMenu}
                  isSuccess={isSuccessTreeMenu}
                  onChange={(checked) => {
                    formRoleMenu.setFieldValue("id_menu", checked);
                  }}
                  checkedValues={formRoleMenu.getValues().id_menu}
                  disabled={stateForm.action === "view"}
                />
              </ScrollArea>
            </Stack>
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormRoleMenu}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateRoleMenu}
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      {isLoadingRoleMenus && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessRoleMenus ? (
        dataRoleMenus?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Role",
                },
                {
                  name: "Menu",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataRoleMenus.data.pagination.from}
              to={dataRoleMenus.data.pagination.to}
              totalPages={dataRoleMenus.data.pagination.total_pages}
              totalRows={dataRoleMenus.data.pagination.total_rows}
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
        !isLoadingRoleMenus && <NoDataFound />
      )}
    </Stack>
  );
};

export default RolePermissionPage;
