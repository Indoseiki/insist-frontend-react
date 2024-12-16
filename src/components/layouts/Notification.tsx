import {
  ActionIcon,
  Avatar,
  Combobox,
  Group,
  rem,
  ScrollArea,
  Text,
  UnstyledButton,
  useCombobox,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import classes from "../../assets/styles/UserButton.module.css";
import { useState } from "react";
import { dataNotification } from "../../assets/data/dataNotification";

const Notification = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = dataNotification.map((item: any) => (
    <Combobox.Option value={item.name} key={item.name}>
      <UnstyledButton className={classes.user}>
        <Group>
          <Avatar
            src={`https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-${item.id}.png`}
            radius="xl"
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {item.name}
            </Text>
            <Text c="dimmed" size="xs">
              Please approve {item.number_spk}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Combobox.Option>
  ));
  return (
    <Combobox
      store={combobox}
      width={300}
      position="bottom"
      withArrow
      withinPortal={false}
      onOptionSubmit={(val) => {
        setSelectedItem(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <ActionIcon
          size={35}
          variant="default"
          radius="md"
          onClick={() => combobox.toggleDropdown()}
        >
          <IconBell style={{ width: rem(20), height: rem(20) }} />
        </ActionIcon>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Header>
          <Text fw="bold">Notification</Text>
        </Combobox.Header>
        <Combobox.Options>
          <ScrollArea.Autosize type="scroll" mah={365}>
            {options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default Notification;
