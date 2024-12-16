import {
  Flex,
  Group,
  Pagination,
  Select,
  Text,
  useMatches,
} from "@mantine/core";

interface TableFooterProps {
  totalRows: number;
  totalPages: number;
  rowsPerPage: string;
  activePage: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (value: string | null) => void;
}

const TableFooter: React.FC<TableFooterProps> = ({
  totalRows,
  totalPages,
  rowsPerPage,
  activePage,
  from,
  to,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const size = useMatches({
    base: "xs",
    sm: "sm",
  });

  const widthSelect = useMatches({
    base: "65px",
    sm: "80px",
  });

  const sizePagination = useMatches({
    base: "sm",
    sm: "md",
  });
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={10}
      justify={{ base: "center", md: "space-between" }}
      align="center"
    >
      <Group gap={5}>
        <Text size={size}>Rows per page</Text>
        <Select
          data={["20", "50", "100", "500", "1000"]}
          value={rowsPerPage}
          w={widthSelect}
          size={size}
          comboboxProps={{ width: 80, position: "top-end" }}
          onChange={onRowsPerPageChange}
        />
        <Text size={size} ms={10}>
          Displaying {from} to {to} of {totalRows} rows
        </Text>
      </Group>
      <Pagination
        size={sizePagination}
        siblings={1}
        total={totalPages}
        value={activePage}
        onChange={onPageChange}
      />
    </Flex>
  );
};

export default TableFooter;
