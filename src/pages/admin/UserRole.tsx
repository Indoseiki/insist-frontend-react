import {
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  Pill,
  PillsInput,
  ScrollArea,
  Stack,
  Table,
  TextInput,
  useCombobox,
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
import { useUpdateUserRole, useUserRolesQuery } from "../../hooks/userRole";
import TableScrollable from "../../components/table/TableScrollable";
import TableFooter from "../../components/table/TableFooter";
import NoDataFound from "../../components/table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../types/table";
import { StateForm } from "../../types/form";
import { User } from "../../types/user";
import { UserRole } from "../../types/userRole";
import { useRolesInfinityQuery } from "../../hooks/role";

interface StateFilter {
  search: string;
}

interface FormValues {
  name: string;
  id_role: string[];
}

interface StateFormUserRole extends StateForm {
  role: string[];
  searchRole: string;
}

const UserRolePage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormUserRole,
    { open: openFormUserRole, close: closeFormUserRole },
  ] = useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<User>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "name",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormUserRole>({
    title: "",
    action: "",
    role: [],
    searchRole: "",
  });

  const updateStateTable = (newState: Partial<StateTable<User>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormUserRole>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: User) => updateStateTable({ selected: row });

  const {
    data: dataUserRoles,
    isSuccess: isSuccessUserRoles,
    isLoading: isLoadingUserRoles,
    refetch: refetchUserRoles,
  } = useUserRolesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectRoles,
    isSuccess: isSuccessSelectRoles,
    fetchNextPage: fetchNextPageSelectRoles,
    hasNextPage: hasNextPageSelectRoles,
    isFetchingNextPage: isFetchingNextPageSelectRoles,
  } = useRolesInfinityQuery({
    search: stateForm.searchRole,
  });

  const flatDataSelectRoles =
    (isSuccessSelectRoles &&
      dataSelectRoles?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataSelectRoles = useMemo(() => {
    return flatDataSelectRoles.map((dept) => ({
      value: dept.id.toString(),
      label: dept.name ? dept.name : "",
    }));
  }, [flatDataSelectRoles]);

  const {
    mutate: mutateCreateUserRole,
    isPending: isPendingMutateCreateUserRole,
  } = useUpdateUserRole();

  const rows = useMemo(() => {
    if (!isSuccessUserRoles || !dataUserRoles?.data?.pagination.total_rows)
      return null;

    return dataUserRoles.data.items.map((row: User) => {
      const isSelected = stateTable.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      const roleNames = row.user_roles
        ?.map((item: UserRole) => item.role?.name)
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
  }, [isSuccessUserRoles, dataUserRoles, stateTable.selected, colorScheme]);

  const formUserRole = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      id_role: [],
    },

    validate: {
      id_role: (value) => {
        return value.length == 0 ? "Role is required" : null;
      },
    },
  });

  const handleSetupRole = () => {
    formUserRole.clearErrors();
    formUserRole.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    const roles = stateTable.selected.user_roles
      ?.map((item) => item.role?.name)
      .filter((role): role is string => role !== undefined);

    updateStateForm({
      title: "Setup Role",
      action: "setup",
      role: roles,
    });

    formUserRole.setValues({
      name: stateTable.selected.name,
      id_role:
        stateTable.selected.user_roles
          ?.map((item) => item.id_role?.toString())
          .filter((id): id is string => id !== undefined) || [],
    });

    openFormUserRole();
  };

  const handleViewData = () => {
    formUserRole.clearErrors();
    formUserRole.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    const roles =
      stateTable.selected.user_roles
        ?.map((item) => item.role?.name)
        .filter((role): role is string => role !== undefined) || [];

    updateStateForm({
      title: "View Data",
      action: "view",
      role: roles,
    });

    formUserRole.setValues({
      name: stateTable.selected.name,
    });

    openFormUserRole();
  };

  const handleSubmitForm = () => {
    const dataUserRole = formUserRole.getValues();

    mutateCreateUserRole(
      {
        id: stateTable.selected?.id!,
        params: {
          id_role: dataUserRole.id_role.map((id) => parseInt(id)),
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
          refetchUserRoles();
          closeFormUserRole();
        },
        onError() {
          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormUserRole();
        },
      }
    );
  };

  const handleCloseFormUserRole = () => {
    closeFormUserRole();
    formUserRole.clearErrors();
    formUserRole.reset();
  };

  const comboboxRole = useCombobox({
    onDropdownClose: () => comboboxRole.resetSelectedOption(),
    onDropdownOpen: () => comboboxRole.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val: string) => {
    setStateForm((prev: StateFormUserRole) => {
      const currentRoles = prev.role || [];
      const updatedRoles = currentRoles.includes(val)
        ? currentRoles.filter((v) => v !== val)
        : [...currentRoles, val];

      return { ...prev, role: updatedRoles };
    });
  };

  const Roles =
    Array.isArray(stateForm.role) &&
    stateForm.role.map((item) => <Pill key={item}>{item}</Pill>);

  const optionsRole = mappedDataSelectRoles.map((item) => (
    <Combobox.Option
      value={item.label}
      key={item.value}
      active={
        Array.isArray(formUserRole.getValues().id_role) &&
        formUserRole.getValues().id_role.includes(item.value)
      }
      onClick={() => {
        formUserRole.setFieldValue("id_role", (prev) => {
          const currentRoles = prev || [];
          if (currentRoles.includes(item.value)) {
            return currentRoles.filter((v) => v !== item.value);
          } else {
            return [...currentRoles, item.value];
          }
        });
      }}
    >
      <Group gap="sm">
        {Array.isArray(formUserRole.getValues().id_role) &&
        formUserRole.getValues().id_role.includes(item.value) ? (
          <CheckIcon size={12} />
        ) : null}
        <span>{item.label}</span>
      </Group>
    </Combobox.Option>
  ));

  return (
    <Stack h="100%">
      <PageHeader title="User Role" />
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
              label: "Setup Role",
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
        opened={openedFormUserRole}
        onClose={closeFormUserRole}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formUserRole.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Name"
              placeholder="Name"
              key={formUserRole.key("name")}
              size={size}
              disabled={true}
              {...formUserRole.getInputProps("name")}
            />
            <Combobox store={comboboxRole} onOptionSubmit={handleValueSelect}>
              <Combobox.DropdownTarget>
                <PillsInput
                  label="Role"
                  key={formUserRole.key("id_role")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formUserRole.getInputProps("id_role")}
                  rightSection={
                    stateForm.role ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formUserRole.setFieldValue("id_role", []);
                          updateStateForm({ role: [] });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                >
                  <Pill.Group>
                    {stateForm.role && stateForm.role.length > 0 ? (
                      Roles
                    ) : (
                      <Input.Placeholder>Role</Input.Placeholder>
                    )}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        component="button"
                        pointer
                        onClick={() => comboboxRole.toggleDropdown()}
                        onChange={() => {
                          comboboxRole.updateSelectedOptionIndex();
                        }}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.searchRole}
                  onChange={(event) =>
                    updateStateForm({ searchRole: event.currentTarget.value })
                  }
                  placeholder="Search Role"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 37;
                      const dataCount = optionsRole.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
                        if (
                          hasNextPageSelectRoles &&
                          !isFetchingNextPageSelectRoles
                        ) {
                          fetchNextPageSelectRoles();
                        }
                      }
                    }}
                  >
                    {optionsRole.length > 0 ? (
                      optionsRole
                    ) : (
                      <Combobox.Empty>Nothing found</Combobox.Empty>
                    )}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormUserRole}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateUserRole}
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      {isLoadingUserRoles && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessUserRoles ? (
        dataUserRoles?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Name",
                },
                {
                  name: "Role",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataUserRoles.data.pagination.from}
              to={dataUserRoles.data.pagination.to}
              totalPages={dataUserRoles.data.pagination.total_pages}
              totalRows={dataUserRoles.data.pagination.total_rows}
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
        !isLoadingUserRoles && <NoDataFound />
      )}
    </Stack>
  );
};

export default UserRolePage;
