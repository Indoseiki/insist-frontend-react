import { Center, Stack, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface TextNoFound {
  subTitle?: string;
  remarks?: string;
}

const NoDataFound = ({
  subTitle = "There is no data matching this filter",
  remarks = "Remove all filters to display the data",
}: TextNoFound) => {
  return (
    <Center style={{ flex: 1 }}>
      <Stack justify="center" align="center" gap={1}>
        <IconSearch size={100} color="gray" />
        <Text size="xl" my={20}>
          No data found
        </Text>
        <Text size="md" c="dimmed">
          {subTitle}
        </Text>
        <Text size="md" c="dimmed">
          {remarks}
        </Text>
      </Stack>
    </Center>
  );
};

export default NoDataFound;
