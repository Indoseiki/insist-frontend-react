import {
  ActionIcon,
  Avatar,
  Combobox,
  Group,
  Indicator,
  rem,
  ScrollArea,
  Text,
  UnstyledButton,
  useCombobox,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import classes from "../../assets/styles/UserButton.module.css";
import { useState } from "react";
import { useApprovalNotificationQuery } from "../../hooks/approvalHistory";
import { ViewApprovalNotification } from "../../types/approvalHistory";
import { useNavigate } from "@tanstack/react-router";

const Notification = () => {
  const navigate = useNavigate();
  const [_, setSelectedItem] = useState<string | null>(null);

  const { data: dataNotifications, isSuccess: isSuccessNotifications } =
    useApprovalNotificationQuery();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options =
    isSuccessNotifications && dataNotifications.data.length > 0 ? (
      dataNotifications.data.map((item: ViewApprovalNotification) => (
        <Combobox.Option
          value={item.current_approver_name!}
          key={item.id}
          onClick={() =>
            navigate({
              to: item.menu_path,
              search: {
                key: item.key,
              },
            })
          }
        >
          <UnstyledButton className={classes.user}>
            <Group>
              <Avatar src={null} radius="xl" />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {item.current_approver_name}
                </Text>
                <Text c="dimmed" size="xs">
                  Please {item.next_action} {item.menu_name} {item.key}
                </Text>
                {item.message && (
                  <Text c="dimmed" size="xs">
                    Note: {item.message}
                  </Text>
                )}
              </div>
            </Group>
          </UnstyledButton>
        </Combobox.Option>
      ))
    ) : (
      <Text size="sm" c="dimmed" ta="center" p="md">
        Notification not found
      </Text>
    );

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
        <Indicator
          inline
          processing
          disabled={
            isSuccessNotifications && dataNotifications?.data.length === 0
          }
          color="red"
          size={10}
        >
          <ActionIcon
            size={35}
            variant="default"
            radius="md"
            onClick={() => combobox.toggleDropdown()}
          >
            <IconBell style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>
        </Indicator>
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
