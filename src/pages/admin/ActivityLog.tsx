import {
  Badge,
  Center,
  CloseButton,
  Flex,
  Input,
  Loader,
  Spoiler,
  Stack,
  Table,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../components/layouts/PageHeader";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ActivityLog } from "../../types/activityLog";
import { formatDateTime } from "../../utils/formatTime";
import TableScrollable from "../../components/table/TableScrollable";
import TableFooter from "../../components/table/TableFooter";
import NoDataFound from "../../components/table/NoDataFound";
import { StateTable } from "../../types/table";
import { useActivityLogsQuery } from "../../hooks/activityLog";

interface StateFilter {
  search: string;
}

const ActivityLogPage = () => {
  const { colorScheme } = useMantineColorScheme();

  const [stateTable, setStateTable] = useState<StateTable<ActivityLog>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "created_at",
    sortDirection: true,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const updateStateTable = (newState: Partial<StateTable<ActivityLog>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: ActivityLog) =>
    updateStateTable({ selected: row });

  const {
    data: dataActivityLogs,
    isSuccess: isSuccessActivityLogs,
    isLoading: isLoadingActivityLogs,
  } = useActivityLogsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const rows = useMemo(() => {
    if (
      !isSuccessActivityLogs ||
      !dataActivityLogs?.data?.pagination.total_rows
    )
      return null;

    return dataActivityLogs.data.items.map((row: ActivityLog) => {
      const isSelected = stateTable.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.user?.name}</Table.Td>
          <Table.Td>{row.ip_address}</Table.Td>
          <Table.Td>{row.action}</Table.Td>
          <Table.Td>
            <Badge color={row.is_success ? "blue" : "red"}>
              {row.is_success ? "Success" : "Failure"}
            </Badge>
          </Table.Td>
          <Table.Td>{row.message}</Table.Td>
          <Table.Td>{row.os}</Table.Td>
          <Table.Td w={400}>
            <Spoiler maxHeight={20} showLabel="Show more" hideLabel="Hide">
              {row.user_agent}
            </Spoiler>
          </Table.Td>
          <Table.Td w="150px">{formatDateTime(row.created_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessActivityLogs,
    dataActivityLogs,
    stateTable.selected,
    colorScheme,
  ]);

  return (
    <Stack h="100%">
      <PageHeader title="Activity Log" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Flex gap={5} justify="end" w="100%">
          <Input
            placeholder="Search"
            leftSection={<IconSearch size={16} />}
            size="xs"
            value={stateFilter.search}
            w={{ base: "100%", sm: 200 }}
            onChange={(event) =>
              updateStateFilter({
                search: event.currentTarget.value,
              })
            }
            rightSectionPointerEvents="all"
            rightSection={
              <CloseButton
                size={16}
                onClick={() => updateStateFilter({ search: "" })}
                style={{ display: stateFilter.search ? undefined : "none" }}
              />
            }
          />
        </Flex>
      </Flex>
      {isLoadingActivityLogs && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessActivityLogs ? (
        dataActivityLogs?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "User",
                },
                {
                  name: "IP Address",
                },
                {
                  name: "Action",
                },
                {
                  name: "Status",
                },
                {
                  name: "Message",
                },
                {
                  name: "OS",
                },
                {
                  name: "User Agent",
                },
                {
                  name: "TIme",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataActivityLogs.data.pagination.from}
              to={dataActivityLogs.data.pagination.to}
              totalPages={dataActivityLogs.data.pagination.total_pages}
              totalRows={dataActivityLogs.data.pagination.total_rows}
              rowsPerPage={stateTable.rowsPerPage}
              onRowsPerPageChange={(rows) =>
                updateStateTable({ rowsPerPage: rows || "" })
              }
              activePage={stateTable.activePage}
              onPageChange={(page: number) =>
                updateStateTable({ activePage: page })
              }
            />
          </>
        ) : (
          <NoDataFound />
        )
      ) : (
        !isLoadingActivityLogs && <NoDataFound />
      )}
    </Stack>
  );
};

export default ActivityLogPage;
