import { useEffect } from "react";
import {
  Outlet,
  createRootRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AppShell } from "@mantine/core";
import { useDisclosure, useIdle } from "@mantine/hooks";
import Header from "../components/layouts/Header";
import Navbar from "../components/layouts/Navbar";
import NotFound from "../components/layouts/NotFound";
import { memo } from "react";
import { useLogout } from "../hooks/auth";
import { notifications } from "@mantine/notifications";

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

  const idle = useIdle(15 * 60 * 1000, { initialState: false });

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    if (idle && path !== "/login" && !path.includes("/reset-password")) {
      mutateLogout(
        {},
        {
          onSuccess() {
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
          onError() {
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
  }, [idle, mutateLogout, path]);

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
