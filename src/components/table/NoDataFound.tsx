import { Center, Stack, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const NoDataFound = () => {
  return (
    <Center flex={1}>
      <Stack justify="center" align="center" gap={1}>
        <IconSearch size="100px" color="gray" />
        <Text size="xl" my={20}>
          No data found
        </Text>
        <Text size="md" c="dimmed">
          There is no data matching this filter.
        </Text>
        <Text size="md" c="dimmed">
          Remove all filters to display the data.
        </Text>
      </Stack>
    </Center>
  );
};

export default NoDataFound;
