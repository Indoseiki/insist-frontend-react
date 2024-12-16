import React, { useState } from "react";
import { Center, Group, ScrollArea, Table } from "@mantine/core";
import cx from "clsx";
import classes from "../../assets/styles/TableScrollArea.module.css";
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from "@tabler/icons-react";

interface Header {
  key?: string;
  name: string;
  isSortable?: boolean;
  onSort?: () => void;
  reversed?: boolean;
  sorted?: string | null;
}

interface ScrollableTableProps {
  headers: Header[];
  rows: React.ReactNode;
  minWidth?: number;
}

const TableScrollable: React.FC<ScrollableTableProps> = ({
  headers,
  rows,
  minWidth = 1200,
}) => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  return (
    <ScrollArea
      flex={1}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <Table miw={minWidth} className={classes.root}>
        <Table.Thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
        >
          <Table.Tr>
            {headers.map((header, index) => {
              const Icon =
                header.sorted == header.key
                  ? header.reversed
                    ? IconChevronUp
                    : IconChevronDown
                  : IconSelector;
              return (
                <Table.Th
                  key={index}
                  style={{ cursor: header.isSortable ? "pointer" : undefined }}
                >
                  <Group justify="space-between" onClick={header.onSort}>
                    {header.name}
                    {header.isSortable && (
                      <Center>
                        <Icon size={16} stroke={1.5} />
                      </Center>
                    )}
                  </Group>
                </Table.Th>
              );
            })}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

export default TableScrollable;
