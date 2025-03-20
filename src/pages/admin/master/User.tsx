import {
  ActionIcon,
  Badge,
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Menu,
  Modal,
  PasswordInput,
  rem,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useMemo, useState } from "react";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconDotsVertical,
  IconEdit,
  IconFilter,
  IconKey,
  IconPasswordUser,
  IconPlus,
  IconSearch,
  IconShieldCheck,
  IconShieldX,
  IconTrash,
  IconUserCheck,
  IconUserX,
  IconX,
} from "@tabler/icons-react";
import TableFooter from "../../../components/Table/TableFooter";
import TableScrollable from "../../../components/Table/TableScrollable";
import {
  useChangePassword,
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsersQuery,
} from "../../../hooks/user";
import { User } from "../../../types/user";
import { formatDateTime } from "../../../utils/formatTime";
import NoDataFound from "../../../components/Table/NoDataFound";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useDepartmentsInfinityQuery } from "../../../hooks/department";
import { notifications } from "@mantine/notifications";
import {
  useSendResetPassword,
  useSetTwoFactorAuth,
  useUserInfoQuery,
} from "../../../hooks/auth";
import PageHeader from "../../../components/layouts/PageHeader";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";

interface StateFilter {
  open: boolean;
  search: string;
  dept: string;
  idDept: string;
  isActive: string;
}

interface StateFormUser extends StateForm {
  search: string;
  dept: string;
}

interface FormValues {
  name: string;
  username: string;
  email: string;
  id_dept: string;
  password?: string;
  is_active: boolean;
  is_two_fa: boolean;
}

const UserPage = () => {
  const { size, sizeButton, sizeActionButton, fullWidth, heightDropdown } =
    useSizes();
  const { colorScheme } = useMantineColorScheme();
  const [openedFormUser, { open: openFormUser, close: closeFormUser }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);
  const [
    openedFormChangePassword,
    { open: openFormChangePassword, close: closeFormChangePassword },
  ] = useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<User>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: null,
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    dept: "",
    idDept: "",
    isActive: "",
  });

  const [stateForm, setStateForm] = useState<StateFormUser>({
    title: "",
    action: "",
    search: "",
    dept: "",
  });

  const updateStateTable = (newState: Partial<StateTable<User>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormUser>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: User) => updateStateTable({ selected: row });

  const setSorting = (field: string) => {
    const reversed =
      field === stateTable.sortBy ? !stateTable.sortDirection : false;
    updateStateTable({ sortDirection: reversed, sortBy: field });
  };

  const {
    data: dataUsers,
    isSuccess: isSuccessUsers,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useUsersQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    idDept: stateFilter.idDept,
    isActive: stateFilter.isActive,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectDepts,
    isSuccess: isSuccessSelectDepts,
    fetchNextPage: fetchNextPageSelectDepts,
    hasNextPage: hasNextPageSelectDepts,
    isFetchingNextPage: isFetchingNextPageSelectDepts,
  } = useDepartmentsInfinityQuery({
    search: stateForm.dept,
  });

  const flatDataSelectDepts =
    (isSuccessSelectDepts &&
      dataSelectDepts?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataSelectDepts = useMemo(() => {
    return flatDataSelectDepts.map((dept) => ({
      value: dept.id.toString(),
      label: dept.code ? dept.code : "",
    }));
  }, [flatDataSelectDepts]);

  const {
    data: dataFilterDepts,
    isSuccess: isSuccessFilterDepts,
    fetchNextPage: fetchNextPageFilterDepts,
    hasNextPage: hasNextPageFilterDepts,
    isFetchingNextPage: isFetchingNextPageFilterDepts,
  } = useDepartmentsInfinityQuery({
    search: stateFilter.dept || "",
  });

  const flatDataFilterDepts =
    (isSuccessFilterDepts &&
      dataFilterDepts?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterDept = useMemo(() => {
    return flatDataFilterDepts.map((dept) => ({
      value: dept.id.toString(),
      label: dept.code ? dept.code : "",
    }));
  }, [flatDataFilterDepts]);

  const { mutate: mutateCreateUser, isPending: isPendingMutateCreateUser } =
    useCreateUser();

  const { mutate: mutateUpdateUser, isPending: isPendingMutateUpdateUser } =
    useUpdateUser();

  const { mutate: mutateDeleteUser, isPending: isPendingMutateDeleteUser } =
    useDeleteUser();

  const { mutate: mutateSetTwoFactorAuth } = useSetTwoFactorAuth();

  const { mutate: mutateSendResetPassword } = useSendResetPassword();

  const { mutate: mutateChangePassword, isPending: isPendingChangePassword } =
    useChangePassword();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessUsers || !dataUsers?.data?.pagination.total_rows) return null;

    return dataUsers.data.items.map((row: User) => {
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
          <Table.Td>{row.username}</Table.Td>
          <Table.Td>{row.email}</Table.Td>
          <Table.Td>{row.dept?.code}</Table.Td>
          <Table.Td>
            <Badge size={size} color={row.is_active ? "blue" : "red"}>
              {row.is_active ? "Active" : "Inactive"}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge size={size} color={row.is_two_fa ? "teal" : "red"}>
              {row.is_two_fa ? "Active" : "Inactive"}
            </Badge>
          </Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessUsers, dataUsers, stateTable.selected, colorScheme]);

  const formUser = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      username: "",
      email: "",
      id_dept: "",
      password: "",
      is_active: true,
      is_two_fa: false,
    },

    validate: {
      name: (value) => (value.length === 0 ? "Name is required" : null),
      username: (value) => (value.length === 0 ? "Username is required" : null),
      email: (value) => {
        if (value.length === 0) {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Invalid email";
        }
        return null;
      },
      id_dept: (value) => (value === "" ? "Department is required" : null),
      password: (value) => {
        if (stateForm.action === "edit") {
          return null;
        }

        if (value?.length === 0) {
          return "Password is required";
        }
        if (value && value.length < 8) {
          return "Password must be at least 8 characters long";
        }
        if (value && !/[A-Z]/.test(value)) {
          return "Password must contain at least 1 uppercase letter";
        }
        if (value && !/[0-9]/.test(value)) {
          return "Password must contain at least 1 number";
        }
        if (value && !/[@$!%*?&]/.test(value)) {
          return "Password must contain at least 1 special character";
        }
      },
    },
  });

  const handleAddData = () => {
    formUser.clearErrors();
    formUser.reset();
    updateStateForm({ title: "Add Data", action: "add", dept: "" });
    openFormUser();
  };

  const handleEditData = () => {
    formUser.clearErrors();
    formUser.reset();

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
      dept: stateTable.selected.dept?.code || "",
    });

    formUser.setValues({
      name: stateTable.selected.name,
      username: stateTable.selected.username,
      email: stateTable.selected.email,
      id_dept: stateTable.selected.dept?.id.toString(),
      is_active: stateTable.selected.is_active,
      is_two_fa: stateTable.selected.is_two_fa,
    });

    openFormUser();
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
    formUser.clearErrors();
    formUser.reset();

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
      dept: stateTable.selected.dept?.code || "",
    });

    formUser.setValues({
      name: stateTable.selected.name,
      username: stateTable.selected.username,
      email: stateTable.selected.email,
      id_dept: stateTable.selected.dept?.id.toString(),
    });

    openFormUser();
  };

  const handleSubmitForm = () => {
    const dataUsers = formUser.getValues();

    let mapUsers = {
      ...dataUsers,
      id_dept: parseInt(dataUsers.id_dept),
    };

    if (stateForm.action === "add") {
      mutateCreateUser(mapUsers, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapUsers.name})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchUsers();
          closeFormUser();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapUsers.name})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormUser();
        },
      });
    }

    if (stateForm.action === "edit") {
      const { password, ...rest } = mapUsers;
      mapUsers = { ...rest };

      mutateUpdateUser(
        {
          id: stateTable.selected?.id!,
          params: mapUsers,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.name} ⮕ ${mapUsers.name})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchUsers();
            closeFormUser();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.name} ⮕ ${mapUsers.name})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormUser();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteUser(stateTable.selected?.id!, {
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
          refetchUsers();
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

  const handleCloseFormUsers = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormUser();
    }
    formUser.clearErrors();
    formUser.reset();
  };

  const handleActiveUser = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    mutateUpdateUser(
      {
        id: stateTable.selected?.id!,
        params: { is_active: true, is_two_fa: stateTable.selected.is_two_fa! },
      },
      {
        onSuccess() {
          notifications.show({
            title: "Status Updated Successfully!",
            message: "User status is now active",
            color: "green",
          });

          refetchUsers();
          updateStateTable({ selected: null });
        },
        onError() {
          notifications.show({
            title: "Status Updated Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const handleInactiveUser = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    mutateUpdateUser(
      {
        id: stateTable.selected?.id!,
        params: { is_active: false, is_two_fa: stateTable.selected.is_two_fa! },
      },
      {
        onSuccess() {
          notifications.show({
            title: "Status Updated Successfully!",
            message: "User status is now inactive",
            color: "green",
          });

          refetchUsers();
          updateStateTable({ selected: null });
        },
        onError() {
          notifications.show({
            title: "Status Updated Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const handleActiveTwoFA = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    mutateSetTwoFactorAuth(stateTable.selected.id, {
      onSuccess() {
        notifications.show({
          title: "Two-Factor Auth Updated Successfully!",
          message: "Two-Factor Auth status is now active",
          color: "green",
        });

        refetchUsers();
        updateStateTable({ selected: null });
      },
      onError() {
        notifications.show({
          title: "Two-Factor Auth Updated Failed!",
          message:
            "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
          color: "red",
        });
      },
    });
  };

  const handleInactiveTwoFA = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    mutateUpdateUser(
      {
        id: stateTable.selected?.id!,
        params: { is_active: stateTable.selected.is_active!, is_two_fa: false },
      },
      {
        onSuccess() {
          notifications.show({
            title: "Two-Factor Auth Updated Successfully!",
            message: "Two-Factor Auth status is now inactive",
            color: "green",
          });

          refetchUsers();
          updateStateTable({ selected: null });
        },
        onError() {
          notifications.show({
            title: "Two-Factor Auth Updated Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const handleResetPassword = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    const id = notifications.show({
      loading: true,
      title: "Processing",
      message:
        "The system is processing your data. Please wait a moment until the process is complete.",
      autoClose: false,
      withCloseButton: false,
    });

    mutateSendResetPassword(stateTable.selected.id, {
      onSuccess() {
        mutateUpdateUser(
          {
            id: stateTable.selected?.id!,
            params: {
              is_active: stateTable.selected?.is_active!,
              is_two_fa: true,
            },
          },
          {
            onSuccess() {
              notifications.update({
                id,
                loading: false,
                autoClose: 3000,
                title: "Send Reset Password Successfully!",
                message:
                  "Password reset has been sent and Two-Factor Authentication has been active",
                color: "green",
              });

              refetchUsers();
              updateStateTable({ selected: null });
            },
          }
        );
      },
      onError() {
        notifications.update({
          id,
          loading: false,
          autoClose: 3000,
          title: "Send Reset Password Failed!",
          message:
            "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
          color: "red",
        });
      },
    });
  };

  const formChangePassword = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirm_password: "",
    },

    validate: {
      password: (value) => {
        if (value.length === 0) {
          return "Password is required";
        }
        if (value && value.length < 8) {
          return "Password must be at least 8 characters long";
        }
        if (value && !/[A-Z]/.test(value)) {
          return "Password must contain at least 1 uppercase letter";
        }
        if (value && !/[0-9]/.test(value)) {
          return "Password must contain at least 1 number";
        }
        if (value && !/[@$!%*?&]/.test(value)) {
          return "Password must contain at least 1 special character";
        }

        return null;
      },
      confirm_password: (value, values) => {
        if (value.length === 0) {
          return "Confirm Password is required";
        }

        return value !== values.password
          ? "Confirm Password did not match"
          : null;
      },
    },
  });

  const handleSubmitChangePassword = () => {
    mutateChangePassword(
      {
        id: stateTable.selected?.id!,
        ...formChangePassword.getValues(),
      },
      {
        onSuccess() {
          notifications.show({
            title: "Change Password Successfully!",
            message: "Password has been updated",
            color: "green",
          });

          refetchUsers();
          updateStateTable({ selected: null });
          formChangePassword.reset();
          closeFormChangePassword();
        },
        onError() {
          notifications.show({
            title: "Change Password Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const handleCloseChangePassword = () => {
    formChangePassword.clearErrors();
    formChangePassword.reset();
    closeFormChangePassword();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master User" />
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
          {dataRolePermission?.data.is_update && (
            <Menu
              transitionProps={{ transition: "pop" }}
              position="bottom-end"
              withinPortal
            >
              <Menu.Target>
                <Button justify="center" variant="default" size={sizeButton}>
                  <IconDotsVertical size={sizeActionButton} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {[
                  {
                    icon: IconUserCheck,
                    label: "Activate User",
                    onClick: () => handleActiveUser(),
                  },
                  {
                    icon: IconUserX,
                    label: "Inactivate User",
                    onClick: () => handleInactiveUser(),
                  },
                  {
                    icon: IconShieldCheck,
                    label: "Activate 2FA",
                    onClick: () => handleActiveTwoFA(),
                  },
                  {
                    icon: IconShieldX,
                    label: "Inactivate 2FA",
                    onClick: () => handleInactiveTwoFA(),
                  },
                  {
                    icon: IconPasswordUser,
                    label: "Reset Password",
                    onClick: () => handleResetPassword(),
                  },
                  {
                    icon: IconKey,
                    label: "Change Password",
                    onClick: () => {
                      if (!stateTable.selected) {
                        notifications.show({
                          title: "Select Data First!",
                          message:
                            "Please select the data you want to process before proceeding",
                        });
                        return;
                      }

                      openFormChangePassword();
                    },
                  },
                ].map((item, idx) => (
                  <Menu.Item
                    key={idx}
                    leftSection={
                      <item.icon
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }
                    onClick={item.onClick}
                  >
                    <Text size={size}>{item.label}</Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
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
              <SimpleGrid cols={{ base: 2, sm: 2 }}>
                <Select
                  placeholder="Department"
                  data={mappedDataFilterDept}
                  size={size}
                  searchable
                  searchValue={stateFilter.dept || ""}
                  onSearchChange={(value) =>
                    updateStateFilter({ dept: value || "" })
                  }
                  value={stateFilter.idDept ? stateFilter.idDept : ""}
                  onChange={(value, _option) =>
                    updateStateFilter({ idDept: value || "" })
                  }
                  maxDropdownHeight={heightDropdown}
                  nothingFoundMessage="Nothing found..."
                  clearable
                  clearButtonProps={{
                    onClick: () => {
                      updateStateFilter({ dept: "" });
                    },
                  }}
                  scrollAreaProps={{
                    onScrollPositionChange: (position) => {
                      let maxY = 37;
                      const dataCount = mappedDataFilterDept.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
                        if (
                          hasNextPageFilterDepts &&
                          !isFetchingNextPageFilterDepts
                        ) {
                          fetchNextPageFilterDepts();
                        }
                      }
                    },
                  }}
                />
                <Select
                  placeholder="Status"
                  size={size}
                  data={[
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                  ]}
                  value={stateFilter.isActive ? stateFilter.isActive : ""}
                  onChange={(value, _option) =>
                    updateStateFilter({ isActive: value || "" })
                  }
                  clearable
                  clearButtonProps={{
                    onClick: () => updateStateFilter({ isActive: "" }),
                  }}
                />
              </SimpleGrid>
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
        opened={openedFormUser}
        onClose={closeFormUser}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formUser.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Name"
              placeholder="Name"
              key={formUser.key("name")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUser.getInputProps("name")}
            />
            <TextInput
              label="Username"
              placeholder="Username"
              key={formUser.key("username")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUser.getInputProps("username")}
            />
            <TextInput
              label="Email"
              placeholder="Email"
              key={formUser.key("email")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formUser.getInputProps("email")}
            />
            <Select
              label="Department"
              placeholder="Department"
              data={mappedDataSelectDepts}
              key={formUser.key("id_dept")}
              size={size}
              {...formUser.getInputProps("id_dept")}
              searchable
              searchValue={stateForm.dept}
              onSearchChange={(value) => updateStateForm({ dept: value })}
              maxDropdownHeight={heightDropdown}
              nothingFoundMessage="Nothing found..."
              clearable
              clearButtonProps={{
                onClick: () => {
                  formUser.setFieldValue("id_dept", "");
                  updateStateForm({ dept: "" });
                },
              }}
              scrollAreaProps={{
                onScrollPositionChange: (position) => {
                  let maxY = 37;
                  const dataCount = mappedDataSelectDepts.length;
                  const multipleOf10 = Math.floor(dataCount / 10) * 10;
                  if (position.y >= maxY) {
                    maxY += Math.floor(multipleOf10 / 10) * 37;
                    if (
                      hasNextPageSelectDepts &&
                      !isFetchingNextPageSelectDepts
                    ) {
                      fetchNextPageSelectDepts();
                    }
                  }
                },
              }}
              disabled={stateForm.action === "view"}
            />
            {stateForm.action === "add" && (
              <PasswordInput
                label="Password"
                placeholder="Password"
                key={formUser.key("password")}
                size={size}
                {...formUser.getInputProps("password")}
              />
            )}
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormUsers}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateUser || isPendingMutateUpdateUser}
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
        <Text size={size}>Are you sure you want to delete this user?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormUsers}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteUser}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={openedFormChangePassword}
        onClose={closeFormChangePassword}
        title="Change Password"
        closeOnClickOutside={false}
      >
        <form
          onSubmit={formChangePassword.onSubmit(handleSubmitChangePassword)}
        >
          <Stack gap={5}>
            <PasswordInput
              label="New Password"
              placeholder="Password"
              key={formChangePassword.key("password")}
              size={size}
              {...formChangePassword.getInputProps("password")}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Password"
              key={formChangePassword.key("confirm_password")}
              size={size}
              {...formChangePassword.getInputProps("confirm_password")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseChangePassword}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              type="submit"
              size={sizeButton}
              loading={isPendingChangePassword}
            >
              Save
            </Button>
          </Group>
        </form>
      </Modal>
      {isLoadingUsers && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessUsers ? (
        dataUsers?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Name",
                  key: "name",
                  isSortable: true,
                  onSort: () => setSorting("name"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "Username",
                },
                {
                  name: "Email",
                },
                {
                  name: "Department",
                },
                {
                  name: "Status",
                  key: "is_active",
                  isSortable: true,
                  onSort: () => setSorting("is_active"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "2FA",
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
              from={dataUsers.data.pagination.from}
              to={dataUsers.data.pagination.to}
              totalPages={dataUsers.data.pagination.total_pages}
              totalRows={dataUsers.data.pagination.total_rows}
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
        !isLoadingUsers && <NoDataFound />
      )}
    </Stack>
  );
};

export default UserPage;
