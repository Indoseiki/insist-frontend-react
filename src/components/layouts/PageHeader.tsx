import { Box, Breadcrumbs, Flex, SimpleGrid, Text, Title } from "@mantine/core";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSizes } from "../../contexts/useGlobalSizes";

const PageHeader = ({ title }: { title: string }) => {
  const location = useLocation();
  const { size, sizeTitle } = useSizes();

  const pathArray = useMemo(() => {
    return location.pathname
      .split("/")
      .filter((item) => item !== "")
      .map((item) => item.replace(/[^a-zA-Z0-9]/g, " "));
  }, [location.pathname]);

  const breadcrumbItems = useMemo(
    () =>
      pathArray.map((item, index) => (
        <Text key={index} size={size} tt="capitalize" c="blue">
          {item}
        </Text>
      )),
    [pathArray, size]
  );

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} verticalSpacing={{ base: "sm" }}>
      <Box>
        <Title size={sizeTitle} c="blue">
          {title}
        </Title>
      </Box>
      <Flex justify={{ base: "start", sm: "end" }}>
        <Breadcrumbs separatorMargin="xs">{breadcrumbItems}</Breadcrumbs>
      </Flex>
    </SimpleGrid>
  );
};

export default PageHeader;
