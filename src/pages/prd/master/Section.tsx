import {
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Input,
  Loader,
  Modal,
  Select,
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
import { Section } from "../../../types/section";
import {
  useCreateSection,
  useDeleteSection,
  useSectionsQuery,
  useUpdateSection,
} from "../../../hooks/section";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/table/TableScrollable";
import TableFooter from "../../../components/table/TableFooter";
import NoDataFound from "../../../components/table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../types/table";
import { StateForm } from "../../../types/form";
import { useUserInfoQuery } from "../../../hooks/auth";
import { useRolePermissionQuery } from "../../../hooks/rolePermission";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../types/response";
import { createActivityLog } from "../../../api/activityLog";
import { useFCSsInfinityQuery } from "../../../hooks/fcs";

interface StateFilter {
  search: string;
}

interface FormValues {
  id_fcs: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormSection extends StateForm {
  fcs: string;
}

const SectionPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormSection,
    { open: openFormSection, close: closeFormSection },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<Section>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormSection>({
    title: "",
    action: "",
    fcs: "",
  });

  const updateStateTable = (newState: Partial<StateTable<Section>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormSection>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: Section) => updateStateTable({ selected: row });

  const {
    data: dataSections,
    isSuccess: isSuccessSections,
    isLoading: isLoadingSections,
    refetch: refetchSections,
  } = useSectionsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    mutate: mutateCreateSection,
    isPending: isPendingMutateCreateSection,
  } = useCreateSection();

  const {
    mutate: mutateUpdateSection,
    isPending: isPendingMutateUpdateSection,
  } = useUpdateSection();

  const {
    mutate: mutateDeleteSection,
    isPending: isPendingMutateDeleteSection,
  } = useDeleteSection();

  const {
    data: dataSelectFCSs,
    isSuccess: isSuccessSelectFCSs,
    fetchNextPage: fetchNextPageSelectFCSs,
    hasNextPage: hasNextPageSelectFCSs,
    isFetchingNextPage: isFetchingNextPageSelectFCSs,
  } = useFCSsInfinityQuery({
    search: stateForm.fcs,
  });

  const flatDataSelectFCSs =
    (isSuccessSelectFCSs &&
      dataSelectFCSs?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataSelectFCSs = useMemo(() => {
    return flatDataSelectFCSs.map((dept) => ({
      value: dept.id.toString(),
      label: dept.code ? dept.code : "",
    }));
  }, [flatDataSelectFCSs]);

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataSectionPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessSections || !dataSections?.data?.pagination.total_rows)
      return null;

    return dataSections.data.items.map((row: Section) => {
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
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.fcs?.code}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessSections, dataSections, stateTable.selected, colorScheme]);

  const formSection = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      id_fcs: "",
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      id_fcs: (value) => (value.length === 0 ? "FCS is required" : null),
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddData = () => {
    formSection.clearErrors();
    formSection.reset();
    updateStateForm({ title: "Add Data", action: "add", fcs: "" });
    openFormSection();
  };

  const handleEditData = () => {
    formSection.clearErrors();
    formSection.reset();
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
      fcs: stateTable.selected.fcs?.code || "",
    });

    formSection.setValues({
      id_fcs: stateTable.selected.id_fcs.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormSection();
  };

  const handleDeleteData = () => {
    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formSection.clearErrors();
    formSection.reset();

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
      fcs: stateTable.selected.fcs?.code || "",
    });

    formSection.setValues({
      id_fcs: stateTable.selected.id_fcs.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormSection();
  };

  const handleSubmitForm = () => {
    const dataSection = formSection.getValues();

    let mapSection = {
      ...dataSection,
      id_fcs: parseInt(dataSection.id_fcs),
    };

    if (stateForm.action === "add") {
      mutateCreateSection(mapSection, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapSection.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchSections();
          closeFormSection();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapSection.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormSection();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateSection(
        {
          id: stateTable.selected?.id!,
          params: mapSection,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${mapSection.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchSections();
            closeFormSection();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${mapSection.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormSection();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteSection(stateTable.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTable.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchSections();
          closeFormDelete();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTable.selected?.code}) `,
          });

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

  const handleCloseFormSection = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormSection();
    }
    formSection.clearErrors();
    formSection.reset();
  };

  return (
    <Stack h="100%">
      <PageHeader title="Master Section" />
      <Flex
        direction={{ base: "column-reverse", sm: "row" }}
        justify="space-between"
        align={{ base: "normal", sm: "center" }}
        gap={10}
      >
        <Button.Group>
          {[
            {
              icon: IconPlus,
              label: "Add",
              onClick: () => handleAddData(),
              access: dataSectionPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataSectionPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataSectionPermission?.data.is_delete,
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
        opened={openedFormSection}
        onClose={closeFormSection}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formSection.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <Select
              label="FCS"
              placeholder="FCS"
              data={mappedDataSelectFCSs}
              key={formSection.key("id_fcs")}
              size={size}
              {...formSection.getInputProps("id_fcs")}
              searchable
              searchValue={stateForm.fcs}
              onSearchChange={(value) => updateStateForm({ fcs: value })}
              maxDropdownHeight={heightDropdown}
              nothingFoundMessage="Nothing found..."
              clearable
              clearButtonProps={{
                onClick: () => {
                  formSection.setFieldValue("id_fcs", "");
                  updateStateForm({ fcs: "" });
                },
              }}
              scrollAreaProps={{
                onScrollPositionChange: (position) => {
                  let maxY = 37;
                  const dataCount = mappedDataSelectFCSs.length;
                  const multipleOf10 = Math.floor(dataCount / 10) * 10;
                  if (position.y >= maxY) {
                    maxY += Math.floor(multipleOf10 / 10) * 37;
                    if (
                      hasNextPageSelectFCSs &&
                      !isFetchingNextPageSelectFCSs
                    ) {
                      fetchNextPageSelectFCSs();
                    }
                  }
                },
              }}
              disabled={stateForm.action === "view"}
            />
            <TextInput
              label="Code"
              placeholder="Code"
              key={formSection.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSection.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formSection.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSection.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formSection.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSection.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormSection}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateSection || isPendingMutateUpdateSection
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
        <Text size={size}>Are you sure you want to delete this section?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormSection}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteSection}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingSections && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessSections ? (
        dataSections?.data?.pagination.total_rows > 0 ? (
          <>
            <TableScrollable
              headers={[
                {
                  name: "Code",
                },
                {
                  name: "Description",
                },
                {
                  name: "FCS",
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
              from={dataSections.data.pagination.from}
              to={dataSections.data.pagination.to}
              totalPages={dataSections.data.pagination.total_pages}
              totalRows={dataSections.data.pagination.total_rows}
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
        !isLoadingSections && <NoDataFound />
      )}
    </Stack>
  );
};

export default SectionPage;
