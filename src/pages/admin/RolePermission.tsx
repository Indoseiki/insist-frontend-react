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
  IconEdit,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { useRolesQuery } from "../../hooks/role";
import TableScrollable from "../../components/Table/TableScrollable";
import TableFooter from "../../components/Table/TableFooter";
import NoDataFound from "../../components/Table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../types/table";
import { StateForm } from "../../types/form";
import { Role } from "../../types/role";
import {
  useRolePermissionsQuery,
  useUpdateRolePermission,
} from "../../hooks/rolePermission";
import TreeMenuPermission from "../../components/Forms/TreeMenuPermission";
import { RolePermissionRequest } from "../../types/rolePermission";

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

  const {
    data: dataRolePermission,
    isSuccess: isSuccessRolePermission,
    isLoading: isLoadingRolePermission,
    refetch: refetchRolePermission,
  } = useRolePermissionsQuery(stateTable.selected?.id!);

  const { mutate: mutateUpdateRolePesmission } = useUpdateRolePermission();

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
          <Table.Td w={300}>{row.name}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessRoles, dataRoles, stateTable.selected, colorScheme]);

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
      title: "Setup Permission",
      action: "setup",
    });

    formRoleMenu.setValues({
      name: stateTable.selected.name,
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

    formRoleMenu.setValues({
      name: stateTable.selected.name,
    });

    openFormRoleMenu();
  };

  const handleChecked = (data: RolePermissionRequest) => {
    const mappedData: RolePermissionRequest = {
      ...data,
      id_role: stateTable.selected?.id!,
    };

    mutateUpdateRolePesmission(
      {
        params: mappedData,
      },
      {
        onSuccess(res) {
          notifications.show({
            title: "Updated Successfully!",
            message: res.message,
            color: "green",
          });

          refetchRoles();
          refetchRolePermission();
        },
        onError() {
          notifications.show({
            title: "Updated Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const handleCloseFormRoleMenu = () => {
    updateStateTable({ selected: null });
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
              label: "Setup Permission",
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
              <TreeMenuPermission
                data={dataRolePermission?.data || []}
                isLoading={isLoadingRolePermission}
                isSuccess={isSuccessRolePermission}
                disabled={stateForm.action === "view"}
                onChange={handleChecked}
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
                  name: "Role",
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

export default RolePermissionPage;
