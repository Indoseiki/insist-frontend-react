import {
  ActionIcon,
  Badge,
  Button,
  Center,
  CloseButton,
  Flex,
  Grid,
  Input,
  Loader,
  Menu,
  rem,
  Select,
  Spoiler,
  Stack,
  Table,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../components/layouts/PageHeader";
import {
  IconCalendarWeek,
  IconFilter,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { ActivityLog } from "../../types/activityLog";
import { formatDateTime } from "../../utils/formatTime";
import TableScrollable from "../../components/Table/TableScrollable";
import TableFooter from "../../components/Table/TableFooter";
import NoDataFound from "../../components/Table/NoDataFound";
import { StateTable } from "../../types/table";
import { useActivityLogsQuery } from "../../hooks/activityLog";
import { useSizes } from "../../contexts/useGlobalSizes";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";

interface StateFilter {
  open: boolean;
  search: string;
  action: string;
  isSuccess: string;
  rangeDate: [Date | null, Date | null];
}

const ActivityLogPage = () => {
  const { size, sizeButton } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [stateTable, setStateTable] = useState<StateTable<ActivityLog>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "created_at",
    sortDirection: true,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    action: "",
    isSuccess: "",
    rangeDate: [null, null],
  });

  const updateStateTable = (newState: Partial<StateTable<ActivityLog>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: ActivityLog) =>
    updateStateTable({ selected: row });

  const rangeDate = stateFilter.rangeDate
    .map((date) => {
      return dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : null;
    })
    .join("~");

  const {
    data: dataActivityLogs,
    isSuccess: isSuccessActivityLogs,
    isLoading: isLoadingActivityLogs,
  } = useActivityLogsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    action: stateFilter.action,
    isSuccess: stateFilter.isSuccess,
    rangeDate: rangeDate,
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

      type Action = "Login" | "Logout" | "Create" | "Update" | "Delete";
      const actionColors: { [key in Action]: string } = {
        Login: "cyan",
        Logout: "red",
        Create: "teal",
        Update: "blue",
        Delete: "orange",
      };

      const actionColor =
        actionColors[row.action as keyof typeof actionColors] ?? "defaultColor";

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.user?.name}</Table.Td>
          <Table.Td>{row.ip_address}</Table.Td>
          <Table.Td>
            <Badge size={size} color={actionColor}>
              {row.action}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Badge size={size} color={row.is_success ? "blue" : "red"}>
              {row.is_success ? "Success" : "Failure"}
            </Badge>
          </Table.Td>
          <Table.Td w={400}>
            <Spoiler maxHeight={25} showLabel="Show more" hideLabel="Hide">
              {row.message}
            </Spoiler>
          </Table.Td>
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
          <Menu
            shadow="md"
            closeOnClickOutside={false}
            opened={stateFilter.open}
            onChange={(isOpen) => updateStateFilter({ open: isOpen })}
          >
            <Menu.Target>
              <ActionIcon variant="filled">
                <IconFilter
                  style={{ width: rem(16), height: rem(16) }}
                  stroke={1.5}
                  onClick={() => updateStateFilter({ open: !stateFilter.open })}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown p={15} maw="400px">
              <Text mb={5}>Filter</Text>
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    placeholder="Action"
                    size={size}
                    data={[
                      { label: "Create", value: "Create" },
                      { label: "Update", value: "Update" },
                      { label: "Delete", value: "Delete" },
                      { label: "Login", value: "Login" },
                      { label: "Logout", value: "Logout" },
                    ]}
                    value={stateFilter.action ? stateFilter.action : ""}
                    onChange={(value, _option) =>
                      updateStateFilter({ action: value || "" })
                    }
                    clearable
                    clearButtonProps={{
                      onClick: () => updateStateFilter({ action: "" }),
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    placeholder="Status"
                    size={size}
                    data={[
                      { label: "Success", value: "true" },
                      { label: "Failure", value: "false" },
                    ]}
                    value={stateFilter.isSuccess ? stateFilter.isSuccess : ""}
                    onChange={(value, _option) =>
                      updateStateFilter({ isSuccess: value || "" })
                    }
                    clearable
                    clearButtonProps={{
                      onClick: () => updateStateFilter({ isSuccess: "" }),
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <DatePickerInput
                    type="range"
                    size={size}
                    placeholder="Range Date"
                    valueFormat="DD-MM-YYYY"
                    value={
                      stateFilter.rangeDate
                        ? stateFilter.rangeDate
                        : [null, null]
                    }
                    onChange={(value) =>
                      updateStateFilter({ rangeDate: value })
                    }
                    clearable
                    clearButtonProps={{
                      onClick: () =>
                        updateStateFilter({ rangeDate: [null, null] }),
                    }}
                    leftSection={<IconCalendarWeek size={16} />}
                  />
                </Grid.Col>
              </Grid>
              <Flex justify="end" pt={10}>
                <Button
                  leftSection={<IconX size={14} />}
                  variant="default"
                  size={sizeButton}
                  onClick={() => updateStateFilter({ open: false })}
                >
                  Close
                </Button>
              </Flex>
            </Menu.Dropdown>
          </Menu>
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
                  name: "Date TIme",
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
