import {
  Avatar,
  Button,
  Flex,
  Group,
  Menu,
  Modal,
  PasswordInput,
  rem,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconKey,
  IconPower,
  IconX,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  useChangePassword,
  useLogout,
  useUserInfoQuery,
} from "../../hooks/auth";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useSizes } from "../../contexts/useGlobalSizes";
import { createActivityLog } from "../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../types/response";

const Profile = () => {
  const os = useOs();
  const { size, sizeButton } = useSizes();

  const navigate = useNavigate();

  const [
    openedFormChangePassword,
    { open: openFormChangePassword, close: closeFormChangePassword },
  ] = useDisclosure(false);

  const {
    data: dataUser,
    isSuccess: isSuccessUser,
    isLoading: isLoadingUser,
  } = useUserInfoQuery();

  const { mutate: mutateLogout } = useLogout();

  const { mutate: mutateChangePassword, isPending: isPendingChangePassword } =
    useChangePassword();

  const handleLogout = () => {
    mutateLogout(
      {},
      {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Logout",
            is_success: true,
            os: os,
            message: res?.message,
          });

          notifications.show({
            title: "Logout Successfully!",
            message: "You're logged out! Hope to see you again soon",
            color: "green",
          });

          localStorage.removeItem("accessToken");
          navigate({ to: "/login", replace: true });
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Logout",
            is_success: false,
            os: os,
            message: res?.data.message,
          });

          notifications.show({
            title: "Logout Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });
        },
      }
    );
  };

  const formChangePassword = useForm({
    mode: "uncontrolled",
    initialValues: {
      current_password: "",
      new_password: "",
    },

    validate: {
      current_password: (value) => {
        if (value.length === 0) {
          return "Current Password is required";
        }

        return null;
      },
      new_password: (value) => {
        if (value.length === 0) {
          return "New Password is required";
        }
        if (value && value.length < 8) {
          return "New Password must be at least 8 characters long";
        }
        if (value && !/[A-Z]/.test(value)) {
          return "New Password must contain at least 1 uppercase letter";
        }
        if (value && !/[0-9]/.test(value)) {
          return "New Password must contain at least 1 number";
        }
        if (value && !/[@$!%*?&]/.test(value)) {
          return "New Password must contain at least 1 special character";
        }

        return null;
      },
    },
  });

  const handleSubmitChangePassword = () => {
    mutateChangePassword(
      {
        ...formChangePassword.getValues(),
      },
      {
        onSuccess() {
          notifications.show({
            title: "Change Password Successfully!",
            message: "Password has been updated",
            color: "green",
          });

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
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton>
            <Group gap={10}>
              {isSuccessUser && (
                <Avatar
                  src={null}
                  alt="profile"
                  style={{ cursor: "pointer" }}
                />
              )}
              {isLoadingUser && <Skeleton height={35} circle />}
              <Flex visibleFrom="sm" direction="column" w={100}>
                <Text size="sm" fw={500} truncate="end">
                  {isSuccessUser && dataUser.data?.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {isSuccessUser && dataUser.data?.dept?.code} Department
                </Text>
              </Flex>
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Flex direction="column" align="center" p={5} hiddenFrom="sm">
            <Avatar src={null} alt="no image here" size="xl" />
            <Text mt={5} size="md" fw={500} truncate="end">
              {isSuccessUser && dataUser.data?.name}
            </Text>
            <Text size="sm" c="dimmed">
              {isSuccessUser && dataUser.data?.dept?.code} Department
            </Text>
          </Flex>
          <Menu.Divider hiddenFrom="sm" />
          <Menu.Item
            leftSection={
              <IconKey style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={() => openFormChangePassword()}
          >
            Change Password
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconPower style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
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
              label="Current Password"
              placeholder="Current Password"
              key={formChangePassword.key("current_password")}
              size={size}
              {...formChangePassword.getInputProps("current_password")}
            />
            <PasswordInput
              label="New Password"
              placeholder="New Password"
              key={formChangePassword.key("new_password")}
              size={size}
              {...formChangePassword.getInputProps("new_password")}
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
    </>
  );
};

export default Profile;
