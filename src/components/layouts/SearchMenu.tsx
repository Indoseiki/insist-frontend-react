import { ActionIcon, Code, Input, rem } from "@mantine/core";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { dataSeacrhMenu } from "../../assets/data/dataSearchMenu";

const SearchMenu = () => {
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
      <Spotlight
        actions={dataSeacrhMenu}
        nothingFound="Nothing found..."
        highlightQuery
        searchProps={{
          leftSection: (
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          placeholder: "Search...",
        }}
      />
    </>
  );
};

export default SearchMenu;
