import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Paper,
  PasswordInput,
  rem,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useSizes } from "../contexts/useGlobalSizes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import LogoLight from "../assets/images/logo_light.gif";
import LogoDark from "../assets/images/logo_dark.gif";
import { useChangePassword } from "../hooks/auth";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";

const ResetPasswordPage = ({ token }: { token: string }) => {
  const { size } = useSizes();
  const navigate = useNavigate();

  const { setColorScheme, colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const computedColorScheme = useComputedColorScheme("light");

  const toogleColorScheme = () => {
    setColorScheme(colorScheme === "light" ? "dark" : "light");
  };

  const {
    mutate: mutateChangePassword,
    isPending: isPendingMutateChangePassword,
  } = useChangePassword();

  const formChangePassword = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirm_password: "",
    },

    validate: {
      password: (value) => {
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
        token,
        ...formChangePassword.getValues(),
      },
      {
        onSuccess() {
          notifications.show({
            title: "Change Password Successfully!",
            message: "Password has been changed, please login",
            color: "green",
          });

          formChangePassword.reset();

          navigate({
            to: "/login",
            replace: true,
          });
        },
        onError() {
          notifications.show({
            title: "Change Password Failed!",
            message: "Make sure the password reset link has not been used",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <Box h="100%" pos="relative">
      <Group w="100%" justify="end" pos="absolute" p={20}>
        <ActionIcon
          size={35}
          variant="default"
          radius="lg"
          onClick={toogleColorScheme}
        >
          {computedColorScheme === "light" ? (
            <IconMoon style={{ width: rem(20), height: rem(20) }} />
          ) : (
            <IconSun style={{ width: rem(20), height: rem(20) }} />
          )}
        </ActionIcon>
      </Group>
      <Stack justify="center" align="center" h="100%" p="md" gap={20}>
        <Box>
          <Image
            src={colorScheme === "dark" ? LogoDark : LogoLight}
            h={100}
            hiddenFrom="sm"
            fit="contain"
          />
          <Image
            src={colorScheme === "dark" ? LogoDark : LogoLight}
            h={130}
            visibleFrom="sm"
            fit="contain"
          />
        </Box>
        <Paper shadow="xl" radius="md" withBorder w="380px" p={20}>
          <form
            onSubmit={formChangePassword.onSubmit(handleSubmitChangePassword)}
          >
            <Stack gap={10} justify="center" align="center">
              <Text fw="bold" fz="h3">
                Change Password
              </Text>
              <Text fz="h6" c="dimmed">
                Enter a new password to change your password
              </Text>
              <Stack gap={5} w="100%">
                <PasswordInput
                  label="New Password"
                  placeholder="Password"
                  size={size}
                  key={formChangePassword.key("password")}
                  {...formChangePassword.getInputProps("password")}
                />
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Password"
                  size={size}
                  key={formChangePassword.key("confirm_password")}
                  {...formChangePassword.getInputProps("confirm_password")}
                />
              </Stack>
              <Button
                fullWidth
                type="submit"
                size={size}
                loading={isPendingMutateChangePassword}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ResetPasswordPage;
