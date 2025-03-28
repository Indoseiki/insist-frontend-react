import { Box, Title } from "@mantine/core";
import { useSizes } from "../../contexts/useGlobalSizes";

const PageSubHeader = ({ title }: { title: string }) => {
  const { sizeSubTitle } = useSizes();

  return (
    <Box>
      <Title size={sizeSubTitle} c="blue">
        {title}
      </Title>
    </Box>
  );
};

export default PageSubHeader;
