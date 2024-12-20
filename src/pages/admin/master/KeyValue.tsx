import {
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
  Text,
  Textarea,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { KeyValue } from "../../../types/keyValue";
import {
  useCreateKeyValue,
  useDeleteKeyValue,
  useKeyValuesQuery,
  useUpdateKeyValue,
} from "../../../hooks/keyValue";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/table/TableScrollable";
import TableFooter from "../../../components/table/TableFooter";
import NoDataFound from "../../../components/table/NoDataFound";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";

interface StateFilter {
  search: string;
}

interface FormValues {
  key: string;
  value: string;
  remarks: string;
}

const KeyValuePage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormKeyValue,
    { open: openFormKeyValue, close: closeFormKeyValue },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<KeyValue>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "name",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<KeyValue>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: KeyValue) => updateStateTable({ selected: row });

  const {
    data: dataKeyValues,
    isSuccess: isSuccessKeyValues,
    isLoading: isLoadingKeyValues,
    refetch: refetchKeyValues,
  } = useKeyValuesQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateKeyValue,
    isPending: isPendingMutateCreateKeyValue,
  } = useCreateKeyValue();

  const {
    mutate: mutateUpdateKeyValue,
    isPending: isPendingMutateUpdateKeyValue,
  } = useUpdateKeyValue();

  const {
    mutate: mutateDeleteKeyValue,
    isPending: isPendingMutateDeleteKeyValue,
  } = useDeleteKeyValue();

  const rows = useMemo(() => {
    if (!isSuccessKeyValues || !dataKeyValues?.data?.pagination.total_rows)
      return null;

    return dataKeyValues.data.items.map((row: KeyValue) => {
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
          <Table.Td>{row.key}</Table.Td>
          <Table.Td>{row.value}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessKeyValues, dataKeyValues, stateTable.selected, colorScheme]);

  const formKeyValue = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      key: "",
      value: "",
      remarks: "",
    },

    validate: {
      key: (value) => (value.length === 0 ? "Key is required" : null),
      value: (value) => (value.length === 0 ? "Value is required" : null),
    },
  });

  const handleAddData = () => {
    formKeyValue.clearErrors();
    formKeyValue.reset();
    updateStateForm({ title: "Add Data", action: "add" });
    openFormKeyValue();
  };

  const handleEditData = () => {
    formKeyValue.clearErrors();
    formKeyValue.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "Edit Data",
      action: "edit",
    });

    formKeyValue.setValues({
      key: stateTable.selected.key,
      value: stateTable.selected.value,
      remarks: stateTable.selected.remarks,
    });

    openFormKeyValue();
  };

  const handleDeleteData = () => {
    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formKeyValue.clearErrors();
    formKeyValue.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    updateStateForm({
      title: "View Data",
      action: "view",
    });

    formKeyValue.setValues({
      key: stateTable.selected.key,
      value: stateTable.selected.value,
      remarks: stateTable.selected.remarks,
    });

    openFormKeyValue();
  };

  const handleSubmitForm = () => {
    const dataKeyValue = formKeyValue.getValues();

    if (stateForm.action === "add") {
      mutateCreateKeyValue(dataKeyValue, {
        onSuccess(res) {
          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchKeyValues();
          closeFormKeyValue();
        },
        onError() {
          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormKeyValue();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateKeyValue(
        {
          id: stateTable.selected?.id!,
          params: dataKeyValue,
        },
        {
          onSuccess(res) {
            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchKeyValues();
            closeFormKeyValue();
          },
          onError() {
            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormKeyValue();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteKeyValue(stateTable.selected?.id!, {
        onSuccess(res) {
          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchKeyValues();
          closeFormDelete();
        },
        onError() {
          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDelete();
        },
      });
    }
  };

  const handleCloseFormKeyValue = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormKeyValue();
    }
    formKeyValue.clearErrors();
    formKeyValue.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Key Value" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Button.Group>
          {[
            { icon: IconPlus, label: "Add", onClick: () => handleAddData() },
            { icon: IconEdit, label: "Edit", onClick: () => handleEditData() },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
            },
            {
              icon: IconBinoculars,
              label: "View",
              onClick: () => handleViewData(),
            },
          ].map((btn, idx) => (
            <Button
              key={idx}
              leftSection={<btn.icon size={16} />}
              variant="default"
              fullWidth={fullWidth}
              size={sizeButton}
              onClick={btn.onClick}
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
        opened={openedFormKeyValue}
        onClose={closeFormKeyValue}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formKeyValue.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Key"
              placeholder="Key"
              key={formKeyValue.key("key")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formKeyValue.getInputProps("key")}
            />
            <TextInput
              label="Value"
              placeholder="Value"
              key={formKeyValue.key("value")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formKeyValue.getInputProps("value")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formKeyValue.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formKeyValue.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormKeyValue}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateKeyValue || isPendingMutateUpdateKeyValue
                }
              >
                Save
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      <Modal
        opened={openedFormDelete}
        onClose={closeFormDelete}
        title={stateForm.title}
        centered
        closeOnClickOutside={false}
      >
        <Text size={size}>Are you sure you want to delete this Key Value?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormKeyValue}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteKeyValue}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingKeyValues && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessKeyValues ? (
        dataKeyValues?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Key",
                },
                {
                  name: "Value",
                },
                {
                  name: "Remarks",
                },
                {
                  name: "Updated By",
                },
                {
                  name: "Last Updated",
                },
              ]}
              rows={rows}
            />
            <TableFooter
              from={dataKeyValues.data.pagination.from}
              to={dataKeyValues.data.pagination.to}
              totalPages={dataKeyValues.data.pagination.total_pages}
              totalRows={dataKeyValues.data.pagination.total_rows}
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
        !isLoadingKeyValues && <NoDataFound />
      )}
    </Stack>
  );
};

export default KeyValuePage;
