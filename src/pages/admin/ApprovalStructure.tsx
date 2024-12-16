import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Grid,
  Group,
  Input,
  List,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Pill,
  PillsInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  useCombobox,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import {
  useApprovalStructuresQuery,
  useCreateApproval,
  useDeleteApproval,
  useUpdateApproval,
  useUpdateApprovalUsers,
  //   useUpdateApproval,
} from "../../hooks/approvalStructure";
import TableScrollable from "../../components/table/TableScrollable";
import TableFooter from "../../components/table/TableFooter";
import NoDataFound from "../../components/table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../types/table";
import { StateForm } from "../../types/form";
import { Menu } from "../../types/menu";
import { ApprovalRequest } from "../../types/approval";
import { useUsersInfinityQuery } from "../../hooks/user";

interface StateFilter {
  search: string;
}

interface FormValuesApprovalStructure {
  menu: string;
  path: string;
  approvals: ApprovalRequest[];
}

interface FormValuesApprovalUsers {
  id_approval: number;
  id_user: string[];
}

interface StateFormApprovalStructure extends StateForm {
  user: string[];
  searchUser: string;
}

const ApprovalStructurePage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormApprovalStructure,
    { open: openFormApprovalStructure, close: closeFormApprovalStructure },
  ] = useDisclosure(false);

  const [
    openedFormApprovalUsers,
    { open: openFormApprovalUsers, close: closeFormApprovalUsers },
  ] = useDisclosure(false);

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

  const [stateForm, setStateForm] = useState<StateFormApprovalStructure>({
    title: "",
    action: "",
    user: [],
    searchUser: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Menu>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormApprovalStructure>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Menu) => updateStateTable({ selected: row });

  const {
    data: dataApprovalStructures,
    isSuccess: isSuccessApprovalStructures,
    isLoading: isLoadingApprovalStructures,
    refetch: refetchApprovalStructures,
  } = useApprovalStructuresQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectUsers,
    isSuccess: isSuccessSelectUsers,
    fetchNextPage: fetchNextPageSelectUsers,
    hasNextPage: hasNextPageSelectUsers,
    isFetchingNextPage: isFetchingNextPageSelectUsers,
  } = useUsersInfinityQuery({
    search: stateForm.searchUser,
  });

  const flatDataSelectUsers =
    (isSuccessSelectUsers &&
      dataSelectUsers?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataSelectUsers = useMemo(() => {
    return flatDataSelectUsers.map((dept) => ({
      value: dept.id.toString(),
      label: dept.name ? dept.name : "",
    }));
  }, [flatDataSelectUsers]);

  const {
    mutate: mutateCreateApproval,
    isPending: isPendingMutateCreateApproval,
  } = useCreateApproval();

  const {
    mutate: mutateUpdateApproval,
    isPending: isPendingMutateUpdateApproval,
  } = useUpdateApproval();

  const {
    mutate: mutateDeleteApproval,
    isPending: isPendingMutateDeleteApproval,
  } = useDeleteApproval();

  const {
    mutate: mutateUpdateApprovalUsers,
    isPending: isPendingMutateUpdateApprovalUsers,
  } = useUpdateApprovalUsers();

  const rows = useMemo(() => {
    if (
      !isSuccessApprovalStructures ||
      !dataApprovalStructures?.data?.pagination.total_rows
    )
      return null;

    return dataApprovalStructures.data.items.map((row: Menu) => {
      const isSelected = stateTable.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      const approvals = (
        <List>
          {row.menu_approvals?.map((approval, index) => (
            <List.Item key={index}>
              <Group gap={5}>
                <Text fz={size} fw="bold">
                  {approval.status}
                </Text>
                <Text fz={size} fw="bold">
                  :
                </Text>
                <Text fz={size}>
                  {approval.approval_users
                    ?.map((user) => user.user?.name)
                    .join(", ")}
                </Text>
              </Group>
            </List.Item>
          ))}
        </List>
      );

      const items = (
        <Accordion.Item value={row.id.toString()}>
          <Accordion.Control>
            <Text size={size}>Detail Approvals</Text>
          </Accordion.Control>
          <Accordion.Panel>{approvals}</Accordion.Panel>
        </Accordion.Item>
      );

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w={300}>{row.label}</Table.Td>
          <Table.Td w={400}>{row.path}</Table.Td>
          <Table.Td>
            {row.menu_approvals && (
              <Accordion variant="separated" chevronPosition="left">
                {items}
              </Accordion>
            )}
          </Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessApprovalStructures,
    dataApprovalStructures,
    stateTable.selected,
    colorScheme,
  ]);

  const formApprovalStructure = useForm<FormValuesApprovalStructure>({
    mode: "uncontrolled",
    initialValues: {
      menu: "",
      path: "",
      approvals: [
        {
          status: "",
          action: "",
          level: 0,
          count: 0,
          id_menu: 0,
        },
      ],
    },

    validate: {
      approvals: {
        status: (value) => {
          return value?.length == 0 ? "Status is required" : null;
        },
        action: (value) => {
          return value?.length == 0 ? "Action is required" : null;
        },
        level: (value) => {
          return value == 0 ? "Level is required" : null;
        },
        count: (value) => {
          return value == 0 ? "Count is required" : null;
        },
      },
    },
  });

  const formApprovalUsers = useForm<FormValuesApprovalUsers>({
    mode: "uncontrolled",
    initialValues: {
      id_approval: 0,
      id_user: [],
    },

    validate: {
      id_user: (value) => {
        return value.length == 0 ? "User is required" : null;
      },
    },
  });

  const handleSetupApproval = () => {
    formApprovalStructure.clearErrors();
    formApprovalStructure.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Setup Approvals",
      action: "setup",
    });

    const approvals = stateTable.selected.menu_approvals
      ? stateTable.selected.menu_approvals?.map((approval) => {
          return {
            id: approval.id,
            id_menu: approval.id_menu,
            status: approval.status,
            action: approval.action,
            level: approval.level,
            count: approval.count,
          };
        })
      : [
          {
            id_menu: stateTable.selected.id,
            status: "",
            action: "",
            level: 0,
            count: 0,
          },
        ];

    formApprovalStructure.setValues({
      menu: stateTable.selected.label,
      path: stateTable.selected.path,
      approvals,
    });

    openFormApprovalStructure();
  };

  const handleViewData = () => {
    formApprovalStructure.clearErrors();
    formApprovalStructure.reset();

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

    const approvals = stateTable.selected.menu_approvals?.map((approval) => {
      return {
        id: approval.id,
        id_menu: approval.id_menu,
        status: approval.status,
        action: approval.action,
        level: approval.level,
        count: approval.count,
      };
    });

    formApprovalStructure.setValues({
      menu: stateTable.selected.label,
      path: stateTable.selected.path,
      approvals,
    });

    openFormApprovalStructure();
  };

  const handleSubmitFormApprovalStructure = () => {
    const dataApproval = formApprovalStructure.getValues();
    const approvals = dataApproval.approvals;

    if (!stateTable.selected?.menu_approvals) {
      mutateCreateApproval(approvals, {
        onSuccess(res) {
          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchApprovalStructures();
          closeFormApprovalStructure();
        },
        onError() {
          notifications.show({
            title: "Created Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormApprovalStructure();
        },
      });
    } else {
      mutateUpdateApproval(approvals, {
        onSuccess(res) {
          notifications.show({
            title: "Updated Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchApprovalStructures();
          closeFormApprovalStructure();
        },
        onError() {
          notifications.show({
            title: "Updated Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormApprovalStructure();
        },
      });
    }
  };

  const handleDeleteApproval = (index: number) => {
    formApprovalStructure.removeListItem("approvals", index);

    const data =
      stateTable.selected?.menu_approvals &&
      stateTable.selected?.menu_approvals[index];

    if (data) {
      const id = data.id;
      mutateDeleteApproval(id, {
        onSuccess(res) {
          notifications.show({
            title: "Delete Successfully!",
            message: res.message,
            color: "green",
          });

          if (index == 0) {
            closeFormApprovalStructure();
            updateStateTable({ selected: null });
          }
          refetchApprovalStructures();
        },
        onError() {
          notifications.show({
            title: "Delete Failed!",
            message: "Please check and try again",
            color: "red",
          });
        },
      });
    }
  };

  const handleCloseFormApprovalStructure = () => {
    updateStateTable({ selected: null });
    closeFormApprovalStructure();
    formApprovalStructure.clearErrors();
    formApprovalStructure.reset();
  };

  const comboboxUser = useCombobox({
    onDropdownClose: () => comboboxUser.resetSelectedOption(),
    onDropdownOpen: () => comboboxUser.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val: string) => {
    setStateForm((prev: StateFormApprovalStructure) => {
      const currentUsers = prev.user || [];
      const updatedUsers = currentUsers.includes(val)
        ? currentUsers.filter((v) => v !== val)
        : [...currentUsers, val];

      return { ...prev, user: updatedUsers };
    });
  };

  const Users =
    Array.isArray(stateForm.user) &&
    stateForm.user.map((item) => <Pill key={item}>{item}</Pill>);

  const optionsUser = mappedDataSelectUsers.map((item) => (
    <Combobox.Option
      value={item.label}
      key={item.value}
      active={
        Array.isArray(formApprovalUsers.getValues().id_user) &&
        formApprovalUsers.getValues().id_user.includes(item.value)
      }
      onClick={() => {
        formApprovalUsers.setFieldValue("id_user", (prev) => {
          const currentUsers = prev || [];
          if (currentUsers.includes(item.value)) {
            return currentUsers.filter((v) => v !== item.value);
          } else {
            return [...currentUsers, item.value];
          }
        });
      }}
    >
      <Group gap="sm">
        {Array.isArray(formApprovalUsers.getValues().id_user) &&
        formApprovalUsers.getValues().id_user.includes(item.value) ? (
          <CheckIcon size={12} />
        ) : null}
        <span>{item.label}</span>
      </Group>
    </Combobox.Option>
  ));

  const handleOpenApprovalUsers = (index: number) => {
    openFormApprovalUsers();

    const data =
      stateTable.selected?.menu_approvals &&
      stateTable.selected?.menu_approvals[index];

    if (data) {
      const approvalUsers = data.approval_users
        ?.map((item) => item.user?.name)
        .filter((name): name is string => name !== undefined);

      formApprovalUsers.setValues({
        id_approval: data.id,
        id_user:
          data.approval_users
            ?.map((item) => item.id_user?.toString())
            .filter((id): id is string => id !== undefined) || [],
      });

      updateStateForm({
        user: approvalUsers,
      });
    }
  };

  const handleSubmitFormApprovalUsers = () => {
    const approvalUsers = formApprovalUsers.getValues();

    mutateUpdateApprovalUsers(
      {
        id: approvalUsers.id_approval,
        params: {
          id_user: approvalUsers.id_user.map((id) => parseInt(id)),
        },
      },
      {
        onSuccess(res) {
          notifications.show({
            title: "Updated Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchApprovalStructures();
          closeFormApprovalUsers();
          closeFormApprovalStructure();
        },
        onError() {
          notifications.show({
            title: "Updated Failed!",
            message: "Please check and try again",
            color: "red",
          });

          closeFormApprovalUsers();
          closeFormApprovalStructure();
        },
      }
    );
  };

  const fieldsApproval =
    formApprovalStructure.getValues().approvals &&
    formApprovalStructure.getValues().approvals.length > 0 &&
    formApprovalStructure.getValues().approvals.map((item, index) => (
      <Grid.Col span={{ base: 12, md: 6 }} key={index}>
        <Paper shadow="xs" p="sm" w="100%" withBorder>
          <Group gap={5} w="100%">
            <TextInput
              label="Status"
              placeholder="Status"
              size={size}
              key={formApprovalStructure.key(`approvals.${index}.status`)}
              {...formApprovalStructure.getInputProps(
                `approvals.${index}.status`
              )}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <TextInput
              label="Action"
              placeholder="Action"
              size={size}
              key={formApprovalStructure.key(`approvals.${index}.action`)}
              {...formApprovalStructure.getInputProps(
                `approvals.${index}.action`
              )}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <NumberInput
              label="Level"
              placeholder="Level"
              size={size}
              key={formApprovalStructure.key(`approvals.${index}.level`)}
              {...formApprovalStructure.getInputProps(
                `approvals.${index}.level`
              )}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <NumberInput
              label="Count"
              placeholder="Count"
              size={size}
              key={formApprovalStructure.key(`approvals.${index}.count`)}
              {...formApprovalStructure.getInputProps(
                `approvals.${index}.count`
              )}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <Flex justify="end" w="100%" mt={10} gap={5}>
              {item.id && (
                <ActionIcon
                  color="blue"
                  variant="filled"
                  aria-label="Settings"
                  size={size}
                  onClick={() => handleOpenApprovalUsers(index)}
                >
                  <IconUsers
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              )}
              {stateForm.action !== "view" && (
                <ActionIcon
                  color="red"
                  variant="filled"
                  aria-label="Settings"
                  size={size}
                  onClick={() => handleDeleteApproval(index)}
                  loading={isPendingMutateDeleteApproval}
                >
                  <IconTrash
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              )}
            </Flex>
          </Group>
        </Paper>
      </Grid.Col>
    ));

  return (
    <Stack h="100%">
      <PageHeader title="Approval Structure" />
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
              label: "Setup Approvals",
              onClick: () => handleSetupApproval(),
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
        opened={openedFormApprovalStructure}
        onClose={closeFormApprovalStructure}
        title={stateForm.title}
        size="xl"
        closeOnClickOutside={false}
      >
        <form
          onSubmit={formApprovalStructure.onSubmit(
            handleSubmitFormApprovalStructure
          )}
        >
          <Stack gap={5}>
            <TextInput
              label="Menu"
              placeholder="Menu"
              key={formApprovalStructure.key("menu")}
              size={size}
              disabled={true}
              {...formApprovalStructure.getInputProps("menu")}
            />
            <TextInput
              label="Path"
              placeholder="Path"
              key={formApprovalStructure.key("path")}
              size={size}
              disabled={true}
              {...formApprovalStructure.getInputProps("path")}
            />
            <Box>
              <Text fz={size} fw="bold" py={10}>
                Approval
              </Text>
              <Grid>{fieldsApproval}</Grid>
              {stateForm.action !== "view" && (
                <Center>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    size={sizeButton}
                    onClick={() =>
                      formApprovalStructure.insertListItem("approvals", {
                        id_menu: stateTable.selected?.id,
                        status: "",
                        action: "",
                        level: 0,
                        count: 0,
                      })
                    }
                    mt={20}
                  >
                    Add Approval
                  </Button>
                </Center>
              )}
            </Box>
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormApprovalStructure}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateApproval || isPendingMutateUpdateApproval
                }
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      <Modal
        opened={openedFormApprovalUsers}
        onClose={closeFormApprovalUsers}
        title="Approval Users"
        size="md"
        closeOnClickOutside={false}
      >
        <form
          onSubmit={formApprovalUsers.onSubmit(handleSubmitFormApprovalUsers)}
        >
          <Stack gap={5}>
            <Combobox store={comboboxUser} onOptionSubmit={handleValueSelect}>
              <Combobox.DropdownTarget>
                <PillsInput
                  label="User"
                  key={formApprovalStructure.key("id_user")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formApprovalStructure.getInputProps("id_user")}
                  rightSection={
                    stateForm.user ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formApprovalStructure.setFieldValue("id_user", []);
                          updateStateForm({ user: [] });
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
                    {stateForm.user && stateForm.user.length > 0 ? (
                      Users
                    ) : (
                      <Input.Placeholder>User</Input.Placeholder>
                    )}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        component="button"
                        pointer
                        onClick={() => comboboxUser.toggleDropdown()}
                        onChange={() => {
                          comboboxUser.updateSelectedOptionIndex();
                        }}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.searchUser}
                  onChange={(event) =>
                    updateStateForm({ searchUser: event.currentTarget.value })
                  }
                  placeholder="Search User"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 37;
                      const dataCount = optionsUser.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
                        if (
                          hasNextPageSelectUsers &&
                          !isFetchingNextPageSelectUsers
                        ) {
                          fetchNextPageSelectUsers();
                        }
                      }
                    }}
                  >
                    {optionsUser.length > 0 ? (
                      optionsUser
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
              onClick={() => closeFormApprovalUsers()}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateUpdateApprovalUsers}
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      {isLoadingApprovalStructures && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessApprovalStructures ? (
        dataApprovalStructures?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Menu",
                },
                {
                  name: "Path",
                },
                {
                  name: "Status",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataApprovalStructures.data.pagination.from}
              to={dataApprovalStructures.data.pagination.to}
              totalPages={dataApprovalStructures.data.pagination.total_pages}
              totalRows={dataApprovalStructures.data.pagination.total_rows}
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
        !isLoadingApprovalStructures && <NoDataFound />
      )}
    </Stack>
  );
};

export default ApprovalStructurePage;
