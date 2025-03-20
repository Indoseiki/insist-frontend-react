import {
  Badge,
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Table,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconCalendarWeek,
  IconRefresh,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { StateTable } from "../../../types/table";
import { Employee } from "../../../types/employee";
import { useEmployeesQuery, useSyncEmployees } from "../../../hooks/employee";
import { formatDate, formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useDisclosure, useOs } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import dayjs, { Dayjs } from "dayjs";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { createActivityLog } from "../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";

interface StateFilter {
  search: string;
}

interface FormValues {
  number: string;
  name: string;
  division: string;
  department: string;
  position: string;
  service: string;
  education: string;
  birthday: Dayjs;
}

const EmployeePage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormEmployee,
    { open: openFormEmployee, close: closeFormEmployee },
  ] = useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Employee>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: null,
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Employee>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Employee) => updateStateTable({ selected: row });

  const setSorting = (field: string) => {
    const reversed =
      field === stateTable.sortBy ? !stateTable.sortDirection : false;
    updateStateTable({ sortDirection: reversed, sortBy: field });
  };

  const {
    data: dataEmployees,
    isSuccess: isSuccessEmployees,
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useEmployeesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const { mutate: mutateSyncEmployees } = useSyncEmployees();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessEmployees || !dataEmployees?.data?.pagination.total_rows)
      return null;

    return dataEmployees.data.items.map((row: Employee) => {
      const isSelected = stateTable.selected?.number === row.number;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.number}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td w={120}>{row.number}</Table.Td>
          <Table.Td w={250}>{row.name}</Table.Td>
          <Table.Td>{row.division}</Table.Td>
          <Table.Td w={200}>{row.department}</Table.Td>
          <Table.Td w={150}>{row.position}</Table.Td>
          <Table.Td w={140}>
            <Badge size={size} color={row.is_active ? "blue" : "red"}>
              {row.is_active ? "Active" : "Inactive"}
            </Badge>
          </Table.Td>
          <Table.Td w={250}>{row.service}</Table.Td>
          <Table.Td>{row.education}</Table.Td>
          <Table.Td w={150}>{formatDate(row.birthday)}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessEmployees, dataEmployees, stateTable.selected, colorScheme]);

  const formEmployee = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      number: "",
      name: "",
      division: "",
      department: "",
      position: "",
      service: "",
      education: "",
      birthday: dayjs(),
    },
  });

  const handleSyncData = () => {
    const id = notifications.show({
      loading: true,
      title: "Waiting for Data Synchronization",
      message: "Please wait, employee data is being synchronized",
      autoClose: false,
      withCloseButton: false,
    });

    mutateSyncEmployees(
      {},
      {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Update",
            is_success: true,
            os: os,
            message: res?.message,
          });

          notifications.update({
            id,
            title: "Data Synchronization Successfully!",
            message: "Employee data has been synchronized, please check first",
            color: "green",
            loading: false,
            autoClose: 3000,
          });

          refetchEmployees();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Update",
            is_success: false,
            os: os,
            message: res?.data.message,
          });

          notifications.update({
            id,
            title: "Data Synchronization Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
            loading: false,
            autoClose: 3000,
          });
        },
      }
    );
  };

  const handleViewData = () => {
    formEmployee.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    formEmployee.setValues({
      number: stateTable.selected.number,
      name: stateTable.selected.name,
      division: stateTable.selected.division,
      department: stateTable.selected.department,
      position: stateTable.selected.position,
      service: stateTable.selected.service,
      education: stateTable.selected.education,
      birthday: dayjs(stateTable.selected.birthday),
    });

    openFormEmployee();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Employee" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Button.Group>
          {[
            {
              icon: IconRefresh,
              label: "Sync",
              onClick: () => handleSyncData(),
              access: dataRolePermission?.data.is_update,
            },
            {
              icon: IconBinoculars,
              label: "View",
              onClick: () => handleViewData(),
              access: true,
            },
          ].map((btn, idx) => (
            <Button
              key={idx}
              leftSection={<btn.icon size={16} />}
              variant="default"
              fullWidth={fullWidth}
              size={sizeButton}
              onClick={btn.onClick}
              style={{ display: btn.access ? "block" : "none" }}
            >
              {btn.label}
            </Button>
          ))}
        </Button.Group>
        <Flex gap={5}>
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
      <Modal
        opened={openedFormEmployee}
        onClose={closeFormEmployee}
        title="View Data"
        closeOnClickOutside={false}
      >
        <Stack gap={5}>
          <TextInput
            label="Number"
            placeholder="Number"
            key={formEmployee.key("number")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("number")}
          />
          <TextInput
            label="Name"
            placeholder="Name"
            key={formEmployee.key("name")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("name")}
          />
          <TextInput
            label="Division"
            placeholder="Division"
            key={formEmployee.key("division")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("division")}
          />
          <TextInput
            label="Department"
            placeholder="Department"
            key={formEmployee.key("department")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("department")}
          />
          <TextInput
            label="Position"
            placeholder="Position"
            key={formEmployee.key("position")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("position")}
          />
          <TextInput
            label="Service"
            placeholder="Service"
            key={formEmployee.key("service")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("service")}
          />
          <TextInput
            label="Education"
            placeholder="Education"
            key={formEmployee.key("education")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("education")}
          />
          <DatePickerInput
            label="Birthday"
            placeholder="Birthday"
            valueFormat="DD-MM-YYYY"
            key={formEmployee.key("birthday")}
            size={size}
            disabled={true}
            {...formEmployee.getInputProps("birthday")}
            leftSection={<IconCalendarWeek size={16} />}
          />
        </Stack>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={() => closeFormEmployee()}
          >
            Close
          </Button>
        </Group>
      </Modal>
      {isLoadingEmployees && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessEmployees ? (
        dataEmployees?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Number",
                  key: "number",
                  isSortable: true,
                  onSort: () => setSorting("number"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "Name",
                  key: "name",
                  isSortable: true,
                  onSort: () => setSorting("name"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "Division",
                },
                {
                  name: "Department",
                },
                {
                  name: "Position",
                },
                {
                  name: "Status",
                  key: "is_active",
                  isSortable: true,
                  onSort: () => setSorting("is_active"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "Service",
                },
                {
                  name: "Education",
                },
                {
                  name: "Birthday",
                  key: "birthday",
                  isSortable: true,
                  onSort: () => setSorting("birthday"),
                  sorted: stateTable.sortBy,
                  reversed: stateTable.sortDirection,
                },
                {
                  name: "Last Updated",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataEmployees.data.pagination.from}
              to={dataEmployees.data.pagination.to}
              totalPages={dataEmployees.data.pagination.total_pages}
              totalRows={dataEmployees.data.pagination.total_rows}
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
        !isLoadingEmployees && <NoDataFound />
      )}
    </Stack>
  );
};

export default EmployeePage;
