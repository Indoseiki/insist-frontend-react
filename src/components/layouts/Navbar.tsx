import { AppShell, ScrollArea, useMantineColorScheme } from "@mantine/core";
import TreeMenu from "./TreeMenu";

const Navbar = () => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <AppShell.Navbar p="sm" bg={colorScheme === "dark" ? "dark" : undefined}>
      <AppShell.Section grow component={ScrollArea}>
        <TreeMenu />
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default Navbar;
