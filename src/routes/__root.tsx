import { useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AppShell } from "@mantine/core";
import { useDisclosure, useIdle, useOs } from "@mantine/hooks";
import Header from "../components/layouts/Header";
import Navbar from "../components/layouts/Navbar";
import NotFound from "../components/layouts/NotFound";
import { memo } from "react";
import { useLogout, useUserInfoQuery } from "../hooks/auth";
import { notifications } from "@mantine/notifications";
import { createActivityLog } from "../api/activityLog";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
});

const HeaderMemo = memo(Header);
const NavbarMemo = memo(Navbar);

function RootComponent() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { mutate: mutateLogout } = useLogout();

  const idle = useIdle(15 * 60 * 1000, {
    initialState: false,
    events: ["mousemove", "keydown", "scroll", "click"],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const os = useOs();
  const { data: dataUser, isSuccess: isSuccessUser } = useUserInfoQuery();

  useEffect(() => {
    if (idle && path !== "/login" && !path.includes("/reset-password")) {
      mutateLogout(
        {},
        {
          onSuccess: async () => {
            if (isSuccessUser) {
              await createActivityLog({
                username: dataUser?.data.username,
                action: "Logout",
                is_success: true,
                os: os,
                message: "Auto-logout due to inactivity.",
              });
            }

            localStorage.removeItem("accessToken");
            setTimeout(() => {
              notifications.show({
                title: "Logged Out Successfully",
                message:
                  "You've been inactive for 15 minutes. For your security, you've been logged out.",
                color: "green",
              });
              navigate({ to: "/login", replace: true });
            }, 500);
          },
          onError: async () => {
            if (isSuccessUser) {
              await createActivityLog({
                username: dataUser?.data.username,
                action: "Logout",
                is_success: false,
                os: os,
                message: "Failed to logout automatically.",
              });
            }

            notifications.show({
              title: "Logged Out Failed",
              message:
                "Unable to log out due to a system error. Please contact support.",
              color: "red",
            });
          },
        }
      );
    }
  }, [idle, mutateLogout, path, isSuccessUser, dataUser, os, navigate]);

  if (path === "/login" || path.includes("/reset-password")) {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    );
  }

  return (
    <AppShell
      header={{ height: 65 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <HeaderMemo
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
        desktopOpened={desktopOpened}
        toggleDesktop={toggleDesktop}
      />
      <NavbarMemo />
      <AppShell.Main h="90vh">
        <Outlet />
        <TanStackRouterDevtools />
      </AppShell.Main>
    </AppShell>
  );
}
