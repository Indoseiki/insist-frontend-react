import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  Image,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import Profile from "./Profile";
import LogoLight from "../../assets/images/logo_light.gif";
import LogoDark from "../../assets/images/logo_dark.gif";
import Notification from "./Notification";
import SearchMenu from "./SearchMenu";

interface HeaderProps {
  mobileOpened: boolean;
  toggleMobile: () => void;
  desktopOpened: boolean;
  toggleDesktop: () => void;
}

const Header = ({
  mobileOpened,
  toggleMobile,
  desktopOpened,
  toggleDesktop,
}: HeaderProps) => {
  const { setColorScheme, colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const computedColorScheme = useComputedColorScheme("light");

  const toogleColorScheme = () => {
    setColorScheme(colorScheme === "light" ? "dark" : "light");
  };

  return (
    <AppShell.Header>
      <Group justify="space-between" h="100%" px="md">
        <Group align="center" h="100%">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Image
            src={colorScheme === "dark" ? LogoDark : LogoLight}
            h={38}
            hiddenFrom="sm"
          />
          <Image
            src={colorScheme === "dark" ? LogoDark : LogoLight}
            h={45}
            visibleFrom="sm"
          />
        </Group>
        <Group gap={10}>
          <SearchMenu />
          <Notification />
          <ActionIcon
            size={35}
            variant="default"
            radius="md"
            onClick={toogleColorScheme}
          >
            {computedColorScheme === "light" ? (
              <IconMoon style={{ width: rem(20), height: rem(20) }} />
            ) : (
              <IconSun style={{ width: rem(20), height: rem(20) }} />
            )}
          </ActionIcon>
          <Profile />
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default Header;
