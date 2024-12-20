import {
  Avatar,
  Flex,
  Group,
  Menu,
  rem,
  Skeleton,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconKey, IconPower } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useLogout, useUserInfoQuery } from "../../hooks/auth";
import { notifications } from "@mantine/notifications";

const Profile = () => {
  const navigate = useNavigate();

  const {
    data: dataUser,
    isSuccess: isSuccessUser,
    isLoading: isLoadingUser,
  } = useUserInfoQuery();

  const { mutate: mutateLogout } = useLogout();

  const handleLogout = () => {
    mutateLogout(
      {},
      {
        onSuccess() {
          notifications.show({
            title: "Logout Successfully!",
            message: "You're logged out! Hope to see you again soon",
            color: "green",
          });

          localStorage.removeItem("accessToken");
          navigate({ to: "/login", replace: true });
        },
        onError() {
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

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton>
          <Group gap={10}>
            {isSuccessUser && (
              <Avatar src={null} alt="profile" style={{ cursor: "pointer" }} />
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
          leftSection={<IconKey style={{ width: rem(14), height: rem(14) }} />}
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
  );
};

export default Profile;
