import {
  Accordion,
  ActionIcon,
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
  IconCheck,
  IconDeviceFloppy,
  IconEdit,
  IconForbid,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../contexts/useGlobalSizes";
import { useEffect, useMemo, useState } from "react";
import {
  useApprovalByMenuQuery,
  useApprovalStructuresQuery,
  useApprovalUsersByApprovalQuery,
  useCreateApproval,
  useDeleteApproval,
  useUpdateApproval,
  useUpdateApprovalUsers,
} from "../../hooks/approvalStructure";
import TableScrollable from "../../components/Table/TableScrollable";
import TableFooter from "../../components/Table/TableFooter";
import NoDataFound from "../../components/Table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../types/table";
import { StateForm } from "../../types/form";
import { Menu } from "../../types/menu";
import { Approval, ApprovalRequest } from "../../types/approval";
import { useUsersInfinityQuery } from "../../hooks/user";
import { useUserInfoQuery } from "../../hooks/auth";
import { useRolePermissionQuery } from "../../hooks/rolePermission";
import { createActivityLog } from "../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../types/response";

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
  idApproval: number;
  actionApprovalUser: string;
}

const ApprovalStructurePage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormApprovalStructure,
    { open: openFormApprovalStructure, close: closeFormApprovalStructure },
  ] = useDisclosure(false);

  const [
    openedFormApproval,
    { open: openFormApproval, close: closeFormApproval },
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
    idApproval: 0,
    actionApprovalUser: "",
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
    data: dataApprovalByMenu,
    isSuccess: isSuccessApprovalByMenu,
    refetch: refetchApprovalByMenu,
  } = useApprovalByMenuQuery(stateTable.selected?.id || 0);

  const {
    data: dataApprovalUsersByApproval,
    isSuccess: isSuccessApprovalUsersByApproval,
    refetch: refetchApprovalUsersByApproval,
  } = useApprovalUsersByApprovalQuery(stateForm.idApproval || 0);

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

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

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

  const formApproval = useForm<ApprovalRequest>({
    mode: "uncontrolled",
    initialValues: {
      id: 0,
      status: "",
      action: "",
      level: 0,
      count: 0,
      id_menu: 0,
    },

    validate: {
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

    openFormApprovalStructure();
  };

  useEffect(() => {
    if (stateTable.selected && isSuccessApprovalByMenu) {
      let approvals;

      if (isSuccessApprovalByMenu && dataApprovalByMenu?.data?.length > 0) {
        approvals = dataApprovalByMenu.data.map((approval: Approval) => ({
          id: approval.id ?? 0,
          id_menu: approval.id_menu ?? 0,
          status: approval.status ?? "",
          action: approval.action ?? "",
          level: approval.level ?? 0,
          count: approval.count ?? 0,
        }));
      }

      formApprovalStructure.setValues({
        path: stateTable.selected.path,
        approvals,
      });
    }
  }, [dataApprovalByMenu]);

  const handleViewData = () => {
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

    openFormApprovalStructure();
  };

  const handleAddApproval = () => {
    formApproval.clearErrors();
    formApproval.reset();
    openFormApproval();

    updateStateForm({
      action: "add",
    });
  };

  const handleSubmitFormApproval = () => {
    if (stateForm.action === "add") {
      formApproval.setFieldValue("id_menu", stateTable.selected?.id);
      const dataApproval = formApproval.getValues();
      mutateCreateApproval(dataApproval, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.path})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchApprovalByMenu();
          refetchApprovalStructures();
          closeFormApproval();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTable.selected?.path})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormApproval();
        },
      });
    }

    if (stateForm.action === "edit") {
      const dataApprovalStructure = formApprovalStructure.getValues();
      const dataApproval = dataApprovalStructure.approvals.find(
        (item) => item.id === stateForm.idApproval
      );
      mutateUpdateApproval(
        {
          id: stateForm.idApproval,
          params: dataApproval || {},
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.path})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateForm({ idApproval: 0 });
            refetchApprovalByMenu();
            refetchApprovalStructures();
            closeFormApproval();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.path})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormApproval();
          },
        }
      );
    }
  };

  const handleEditApproval = (id: number) => {
    formApproval.clearErrors();
    formApproval.reset();

    updateStateForm({
      idApproval: id,
      action: "edit",
      actionApprovalUser: "",
    });
  };

  const handleDeleteApproval = (id: number) => {
    const dataApprovalStructure = formApprovalStructure.getValues();
    const dataApproval = dataApprovalStructure.approvals.find(
      (item) => item.id === stateForm.idApproval
    );
    if (id) {
      mutateDeleteApproval(id, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataApproval?.status})`,
          });

          notifications.show({
            title: "Delete Successfully!",
            message: res.message,
            color: "green",
          });

          refetchApprovalByMenu();
          refetchApprovalStructures();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataApproval?.status})`,
          });

          notifications.show({
            title: "Delete Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      });
    }
  };

  const handleCloseFormApproval = () => {
    formApproval.clearErrors();
    formApproval.reset();
    refetchApprovalByMenu();
    closeFormApproval();
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

  const handleOpenApprovalUsers = (id: number) => {
    updateStateForm({
      idApproval: id,
      actionApprovalUser: "setup_approval_users",
    });

    openFormApprovalUsers();
  };

  useEffect(() => {
    if (
      isSuccessApprovalUsersByApproval &&
      dataApprovalUsersByApproval?.data?.length > 0
    ) {
      const approvalUsers = dataApprovalUsersByApproval.data
        ?.map((item) => item.user?.name)
        .filter((name): name is string => name !== undefined);

      formApprovalUsers.setValues({
        id_approval: stateForm.idApproval,
        id_user:
          dataApprovalUsersByApproval.data
            ?.map((item) => item.id_user?.toString())
            .filter((id): id is string => id !== undefined) || [],
      });

      updateStateForm({
        user: approvalUsers,
      });
    } else {
      formApprovalUsers.setValues({
        id_approval: stateForm.idApproval,
        id_user: [],
      });

      updateStateForm({
        user: [],
      });
    }
  }, [dataApprovalUsersByApproval]);

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
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Update",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.path})`,
          });
          notifications.show({
            title: "Updated Successfully!",
            message: res.message,
            color: "green",
          });

          refetchApprovalStructures();
          refetchApprovalByMenu();
          refetchApprovalUsersByApproval();
          closeFormApprovalUsers();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Update",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTable.selected?.path})`,
          });

          notifications.show({
            title: "Updated Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormApprovalUsers();
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
              disabled={
                stateForm.action === "view" ||
                stateForm.idApproval !== item.id ||
                stateForm.actionApprovalUser === "setup_approval_users"
              }
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
              disabled={
                stateForm.action === "view" ||
                stateForm.idApproval !== item.id ||
                stateForm.actionApprovalUser === "setup_approval_users"
              }
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
              disabled={
                stateForm.action === "view" ||
                stateForm.idApproval !== item.id ||
                stateForm.actionApprovalUser === "setup_approval_users"
              }
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
              disabled={
                stateForm.action === "view" ||
                stateForm.idApproval !== item.id ||
                stateForm.actionApprovalUser === "setup_approval_users"
              }
            />
            <Flex justify="end" w="100%" mt={10} gap={5}>
              {item.id && (
                <ActionIcon
                  color="teal"
                  variant="filled"
                  size={size}
                  onClick={() => handleOpenApprovalUsers(item.id || 0)}
                >
                  <IconUsers
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              )}
              {stateForm.action !== "view" && (
                <>
                  {stateForm.actionApprovalUser !== "setup_approval_users" ? (
                    stateForm.idApproval !== item.id ? (
                      <ActionIcon
                        color="blue"
                        variant="filled"
                        size={size}
                        onClick={() => handleEditApproval(item.id || 0)}
                      >
                        <IconEdit
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    ) : (
                      <ActionIcon
                        color="blue"
                        variant="filled"
                        size={size}
                        onClick={() => handleSubmitFormApproval()}
                      >
                        <IconCheck
                          style={{ width: "70%", height: "70%" }}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    )
                  ) : (
                    <ActionIcon
                      color="blue"
                      variant="filled"
                      size={size}
                      onClick={() => handleEditApproval(item.id || 0)}
                    >
                      <IconEdit
                        style={{ width: "70%", height: "70%" }}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  )}
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size={size}
                    onClick={() => handleDeleteApproval(item.id || 0)}
                    loading={isPendingMutateDeleteApproval}
                  >
                    <IconTrash
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  </ActionIcon>
                </>
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
              access: dataRolePermission?.data.is_update,
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
        opened={openedFormApprovalStructure}
        onClose={closeFormApprovalStructure}
        title={stateForm.title}
        size="xl"
        closeOnClickOutside={false}
      >
        <form>
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
            <Group justify="space-between">
              <Text fz={size} fw="bold" py={10}>
                Approval
              </Text>
              {stateForm.action !== "view" && (
                <ActionIcon
                  color="blue"
                  variant="filled"
                  size={size}
                  onClick={handleAddApproval}
                >
                  <IconPlus
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                  />
                </ActionIcon>
              )}
            </Group>
            <ScrollArea h={400} type="scroll">
              <Grid>{fieldsApproval}</Grid>
              {!fieldsApproval && (
                <Center h={400}>
                  <Stack justify="center" align="center" gap={1}>
                    <IconForbid size="100px" color="gray" />
                    <Text size="xl" my={20}>
                      Approval not found
                    </Text>
                  </Stack>
                </Center>
              )}
            </ScrollArea>
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={() => closeFormApprovalStructure()}
            >
              Close
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={openedFormApproval}
        onClose={closeFormApproval}
        title="Add Approval"
        size="sm"
        closeOnClickOutside={false}
      >
        <form onSubmit={formApproval.onSubmit(handleSubmitFormApproval)}>
          <Stack gap={5}>
            <TextInput
              label="Status"
              placeholder="Status"
              size={size}
              key={formApproval.key("status")}
              {...formApproval.getInputProps("status")}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <TextInput
              label="Action"
              placeholder="Action"
              size={size}
              key={formApproval.key("action")}
              {...formApproval.getInputProps("action")}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <NumberInput
              label="Level"
              placeholder="Level"
              size={size}
              key={formApproval.key("level")}
              {...formApproval.getInputProps("level")}
              w="100%"
              disabled={stateForm.action === "view"}
            />
            <NumberInput
              label="Count"
              placeholder="Count"
              size={size}
              key={formApproval.key("count")}
              {...formApproval.getInputProps("count")}
              w="100%"
              disabled={stateForm.action === "view"}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormApproval}
            >
              Close
            </Button>
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
