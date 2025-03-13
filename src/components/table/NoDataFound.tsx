import { Center, Stack, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useSizes } from "../../contexts/useGlobalSizes";

interface TextNoFound {
  subTitle?: string;
  remarks?: string;
}

const NoDataFound = ({
  subTitle = "There is no data matching this filter",
  remarks = "Remove all filters to display the data",
}: TextNoFound) => {
  const { size, sizeSubTitle } = useSizes();
  return (
    <Center style={{ flex: 1 }}>
      <Stack justify="center" align="center" gap={1}>
        <IconSearch size={100} color="gray" />
        <Text size={sizeSubTitle} my={5}>
          No data found
        </Text>
        <Text size={size} c="dimmed">
          {subTitle}
        </Text>
        <Text size={size} c="dimmed">
          {remarks}
        </Text>
      </Stack>
    </Center>
  );
};

export default NoDataFound;
