import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Header from "../components/layouts/Header";
import Navbar from "../components/layouts/Navbar";
import NotFound from "../components/layouts/NotFound";
import { memo } from "react";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
});

const HeaderMemo = memo(Header);
const NavbarMemo = memo(Navbar);

function RootComponent() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const location = useLocation();
  const path = location.pathname;

  if (path === "/login" || path.includes("/reset-password")) {
    return (
      <>
        <Outlet />
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
      </AppShell.Main>
    </AppShell>
  );
}
