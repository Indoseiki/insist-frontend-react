import {
  ActionIcon,
  Code,
  Group,
  Input,
  rem,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import {
  IconFileText,
  IconLayoutDashboard,
  IconSearch,
} from "@tabler/icons-react";
import { useMenusUserInfinityQuery } from "../../hooks/menu";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface StateFilter {
  search: string;
}

const SearchMenu = () => {
  const navigate = useNavigate();

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const {
    data: dataSelectMenus,
    isSuccess: isSuccessSelectMenus,
    fetchNextPage: fetchNextPageSelectMenus,
    hasNextPage: hasNextPageSelectMenus,
    isFetchingNextPage: isFetchingNextPageSelectMenus,
  } = useMenusUserInfinityQuery({
    search: stateFilter.search,
  });

  const flatDataSelectMenus =
    (isSuccessSelectMenus &&
      dataSelectMenus?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const items = flatDataSelectMenus
    .filter((item) => !item.path?.includes("#"))
    .map((item) => (
      <Spotlight.Action
        key={item.id}
        onClick={() => {
          spotlight.close();
          navigate({ to: item.path });
          updateStateFilter({ search: "" });
        }}
      >
        <Group wrap="wrap">
          {item.path === "/" ? (
            <IconLayoutDashboard
              style={{ width: rem(23), height: rem(23) }}
              stroke={1.5}
            />
          ) : (
            <IconFileText
              style={{ width: rem(23), height: rem(23) }}
              stroke={1.5}
            />
          )}
          <Stack gap={1}>
            <Text size="md">{item.label}</Text>
            <Text size="sm" opacity={0.6}>
              {item.path}
            </Text>
          </Stack>
        </Group>
      </Spotlight.Action>
    ));

  return (
    <>
      <Input
        component="button"
        pointer
        radius="md"
        style={{ width: "200px" }}
        rightSectionPointerEvents="all"
        leftSection={<IconSearch size={16} />}
        rightSectionWidth={70}
        rightSection={<Code>Ctrl + K</Code>}
        visibleFrom="sm"
        onClick={spotlight.open}
      >
        <Input.Placeholder>Search</Input.Placeholder>
      </Input>
      <ActionIcon
        size={35}
        variant="default"
        radius="md"
        hiddenFrom="sm"
        onClick={spotlight.open}
      >
        <IconSearch style={{ width: rem(20), height: rem(20) }} />
      </ActionIcon>
      <Spotlight.Root shortcut="mod + k">
        <Spotlight.Search
          placeholder="Search..."
          leftSection={<IconSearch stroke={1.5} />}
          onChange={(event) =>
            updateStateFilter({ search: event.currentTarget.value })
          }
        />
        <Spotlight.ActionsList>
          {items.length > 0 ? (
            <ScrollArea.Autosize
              type="scroll"
              mah={365}
              onScrollPositionChange={(position) => {
                let maxY = 20;
                const dataCount = items.length;
                const multipleOf10 = Math.floor(dataCount / 10) * 10;
                if (position.y >= maxY) {
                  maxY += Math.floor(multipleOf10 / 10) * 20;
                  if (
                    hasNextPageSelectMenus &&
                    !isFetchingNextPageSelectMenus
                  ) {
                    fetchNextPageSelectMenus();
                  }
                }
              }}
            >
              {items}
            </ScrollArea.Autosize>
          ) : (
            <Spotlight.Empty>Nothing found...</Spotlight.Empty>
          )}
        </Spotlight.ActionsList>
      </Spotlight.Root>
    </>
  );
};

export default SearchMenu;
