import {
  ActionIcon,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Image,
  Modal,
  Paper,
  PasswordInput,
  PinInput,
  rem,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import ImageISMOffice from "../assets/images/office_ism.png";
import LogoLight from "../assets/images/logo_light.gif";
import LogoDark from "../assets/images/logo_dark.gif";
import {
  IconLogin2,
  IconMoon,
  IconPassword,
  IconSun,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useLogin, useTwoFactorAuth } from "../hooks/auth";
import {
  LoginPayload,
  LoginResponse,
  TwoFactorAuthPayload,
  TwoFactorAuthResponse,
} from "../types/auth";
import { AxiosError } from "axios";
import { ApiResponse } from "../types/response";
import { useSizes } from "../contexts/useGlobalSizes";

const LoginPage = () => {
  const navigate = useNavigate();

  const { size } = useSizes();

  const { setColorScheme, colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const computedColorScheme = useComputedColorScheme("light");

  const toogleColorScheme = () => {
    setColorScheme(colorScheme === "light" ? "dark" : "light");
  };

  const [openedOTP, { open: openOTP, close: closeOTP }] = useDisclosure(false);

  const { mutate: mutateLogin, isPending: isPendingLogin } = useLogin();
  const { mutate: mutateTwoFactorAuth, isPending: isPendingTwoFactorAuth } =
    useTwoFactorAuth();

  const formLogin = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },

    validate: {
      username: (value) => (value.length === 0 ? "Username is required" : null),
      password: (value) => (value.length === 0 ? "Password is required" : null),
    },
  });

  const formTwoFactorAuth = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      otp_key: "",
    },

    validate: {
      otp_key: (value) =>
        value.length < 6 ? "OTP Code must consist of 6 numbers" : null,
    },
  });

  const handleSubmitLogin = (payload: LoginPayload) => {
    mutateLogin(
      {
        username: payload.username,
        password: payload.password,
      },
      {
        onSuccess: (res) => {
          localStorage.setItem("accessToken", res.data.access_token);

          notifications.show({
            title: "Login Successfully",
            message: res?.message,
            color: "green",
          });

          navigate({
            to: "/",
            replace: true,
          });
        },
        onError: (err) => {
          const error = err as AxiosError<ApiResponse<LoginResponse>>;
          const res = error.response;
          if (res?.status !== 403) {
            notifications.show({
              title: "Login Failed",
              message: res?.data.message,
              color: "red",
            });
            return;
          }

          openOTP();
        },
      }
    );
  };

  const handleSubmitTwoFactorAuth = (payload: TwoFactorAuthPayload) => {
    mutateTwoFactorAuth(
      {
        username: formLogin.getValues().username,
        otp_key: payload.otp_key,
      },
      {
        onSuccess: (res) => {
          localStorage.setItem("accessToken", res.data.access_token);

          notifications.show({
            title: "Login Successfully",
            message: res?.message,
            color: "green",
          });

          navigate({
            to: "/",
            replace: true,
          });
        },
        onError: (err) => {
          const error = err as AxiosError<ApiResponse<TwoFactorAuthResponse>>;
          const res = error.response;
          if (res?.status) {
            notifications.show({
              title: "Login Failed",
              message: res?.data.message,
              color: "red",
            });
            return;
          }
        },
      }
    );
  };

  return (
    <Flex h="100%">
      <Flex h="100%" direction="column" justify="start" flex={1} pos="relative">
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
        <Center h="100%">
          <Paper w={350} radius="md">
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
            <Title ta="center" size="1.5rem" mt={20}>
              Welcome👋
            </Title>
            <Text style={{ textAlign: "center" }} my={10}>
              Let's login in your workspaces
            </Text>
            <form onSubmit={formLogin.onSubmit(handleSubmitLogin)}>
              <Stack gap={10} w="100%">
                <TextInput
                  label="Username"
                  placeholder="Username"
                  size={size}
                  key={formLogin.key("username")}
                  {...formLogin.getInputProps("username")}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Password"
                  size={size}
                  key={formLogin.key("password")}
                  {...formLogin.getInputProps("password")}
                />
                <Button
                  leftSection={<IconLogin2 size={20} />}
                  size={size}
                  fullWidth
                  type="submit"
                  loading={isPendingLogin}
                >
                  Login
                </Button>
              </Stack>
            </form>
          </Paper>
          <Flex direction="column" pos="absolute" bottom={20}>
            <Flex justify="center" gap={2}>
              <Text size="sm">Have trouble?</Text>
              <Text
                size="sm"
                td="underline"
                c="blue"
                style={{ cursor: "pointer" }}
              >
                Contact Us
              </Text>
            </Flex>
            <Divider my="xs" size="sm" />
            <Stack gap={0} justify="center" align="center">
              <Text size="sm" c="dimmed">
                &copy; Copyright 2024 PT. Indoseiki Metalutama
              </Text>
              <Text size="sm" c="dimmed">
                Powered by ICT Department
              </Text>
            </Stack>
          </Flex>
        </Center>
        <Modal
          opened={openedOTP}
          onClose={closeOTP}
          centered
          closeOnClickOutside={false}
        >
          <form
            onSubmit={formTwoFactorAuth.onSubmit(handleSubmitTwoFactorAuth)}
          >
            <Flex direction="column" justify="center" align="center" gap={20}>
              <ThemeIcon size="lg">
                <IconPassword style={{ width: "70%", height: "70%" }} />
              </ThemeIcon>
              <Title size="1.2rem">Enter OTP Code</Title>
              <PinInput
                length={6}
                type="number"
                key={formTwoFactorAuth.key("otp_key")}
                {...formTwoFactorAuth.getInputProps("otp_key")}
              />
              <Text size="xs" c="dimmed" style={{ textAlign: "center" }}>
                Enter the 6-digit OTP code from google authenticator
              </Text>
              <Button type="submit" fullWidth loading={isPendingTwoFactorAuth}>
                Submit
              </Button>
            </Flex>
          </form>
        </Modal>
      </Flex>
      <Box h="100%" w="65%" visibleFrom="sm" pos="relative">
        <Group h="100%" pos="relative">
          <Box
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              borderRadius: "150px 0px 0px 0px",
            }}
          />
          <Image
            h="100%"
            fit="cover"
            src={ImageISMOffice}
            style={{
              borderRadius: "150px 0px 0px 0px",
            }}
            alt="Office ISM"
          />
        </Group>
      </Box>
    </Flex>
  );
};

export default LoginPage;
