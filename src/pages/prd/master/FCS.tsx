import {
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  useCombobox,
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
import { FCS } from "../../../types/fcs";
import {
  useCreateFCS,
  useDeleteFCS,
  useFCSsQuery,
  useUpdateFCS,
} from "../../../hooks/fcs";
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
import { useBuildingsInfinityQuery } from "../../../hooks/building";

interface StateFilter {
  search: string;
}

interface FormValues {
  id_building: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormBuilding extends StateForm {
  building: string;
}

const FCSPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormFCS, { open: openFormFCS, close: closeFormFCS }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<FCS>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormBuilding>({
    title: "",
    action: "",
    building: "",
  });

  const updateStateTable = (newState: Partial<StateTable<FCS>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormBuilding>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: FCS) => updateStateTable({ selected: row });

  const {
    data: dataFCSs,
    isSuccess: isSuccessFCSs,
    isLoading: isLoadingFCSs,
    refetch: refetchFCSs,
  } = useFCSsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataSelectBuildings,
    isSuccess: isSuccessSelectBuildings,
    fetchNextPage: fetchNextPageSelectBuildings,
    hasNextPage: hasNextPageSelectBuildings,
    isFetchingNextPage: isFetchingNextPageSelectBuildings,
  } = useBuildingsInfinityQuery({
    search: stateForm.building,
  });

  const flatDataSelectBuildings =
    (isSuccessSelectBuildings &&
      dataSelectBuildings?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const { mutate: mutateCreateFCS, isPending: isPendingMutateCreateFCS } =
    useCreateFCS();

  const { mutate: mutateUpdateFCS, isPending: isPendingMutateUpdateFCS } =
    useUpdateFCS();

  const { mutate: mutateDeleteFCS, isPending: isPendingMutateDeleteFCS } =
    useDeleteFCS();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataFCSPermission } = useRolePermissionQuery(location.pathname);

  const rows = useMemo(() => {
    if (!isSuccessFCSs || !dataFCSs?.data?.pagination.total_rows) return null;

    return dataFCSs.data.items.map((row: FCS) => {
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
          <Table.Td>{row.building?.description}</Table.Td>
          <Table.Td>{row.building?.plant}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessFCSs, dataFCSs, stateTable.selected, colorScheme]);

  const formFCS = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      id_building: "",
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      id_building: (value) =>
        value.length === 0 ? "Building is required" : null,
      code: (value) => (value.length === 0 ? "Code is required" : null),
    },
  });

  const handleAddData = () => {
    formFCS.clearErrors();
    formFCS.reset();
    updateStateForm({ title: "Add Data", action: "add", building: "" });
    openFormFCS();
  };

  const handleEditData = () => {
    formFCS.clearErrors();
    formFCS.reset();
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
      building: stateTable.selected.building?.code,
    });

    formFCS.setValues({
      id_building: stateTable.selected.id_building?.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormFCS();
  };

  const handleDeleteData = () => {
    updateStateForm({ title: "Delete Data", action: "delete" });
    openFormDelete();
  };

  const handleViewData = () => {
    formFCS.clearErrors();
    formFCS.reset();

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
      building: stateTable.selected.building?.code,
    });

    formFCS.setValues({
      id_building: stateTable.selected.id_building?.toString(),
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormFCS();
  };

  const handleSubmitForm = () => {
    const dataFCS = formFCS.getValues();

    let mapFCS = {
      ...dataFCS,
      id_building: parseInt(dataFCS.id_building),
    };

    if (stateForm.action === "add") {
      mutateCreateFCS(mapFCS, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataFCS.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchFCSs();
          closeFormFCS();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataFCS.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormFCS();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateFCS(
        {
          id: stateTable.selected?.id!,
          params: mapFCS,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${dataFCS.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchFCSs();
            closeFormFCS();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${dataFCS.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormFCS();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteFCS(stateTable.selected?.id!, {
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
          refetchFCSs();
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

  const handleCloseFormFCS = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormFCS();
    }
    formFCS.clearErrors();
    formFCS.reset();
  };

  const comboboxBuilding = useCombobox({
    onDropdownClose: () => comboboxBuilding.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxBuilding.selectActiveOption();
      } else {
        comboboxBuilding.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsBuilding = flatDataSelectBuildings.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formFCS.getValues().id_building}
        onClick={() => {
          formFCS.setFieldValue("id_building", item.id.toString());
          updateStateForm({ building: item.code });
          comboboxBuilding.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formFCS.getValues().id_building && (
            <CheckIcon size={12} />
          )}
          <Stack gap={5}>
            <table style={{ width: "100%", border: "none" }}>
              <tbody>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Code
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "4px",
                    }}
                  >
                    :
                  </td>
                  <td>
                    <Text fz={size}>{item.code}</Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Description
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "4px",
                    }}
                  >
                    :
                  </td>
                  <td>
                    <Text fz={size}>{item.description}</Text>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Text fz={size} fw="bold">
                      Plant
                    </Text>
                  </td>
                  <td
                    style={{
                      padding: "4px",
                    }}
                  >
                    :
                  </td>
                  <td>
                    <Text fz={size}>{item.plant}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Stack>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Stack h="100%">
      <PageHeader title="Master FCS" />
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
              access: dataFCSPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataFCSPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataFCSPermission?.data.is_delete,
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
        opened={openedFormFCS}
        onClose={closeFormFCS}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formFCS.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <Combobox
              store={comboboxBuilding}
              resetSelectionOnOptionHover
              onOptionSubmit={() => {
                comboboxBuilding.closeDropdown();
                comboboxBuilding.updateSelectedOptionIndex("active");
              }}
            >
              <Combobox.Target targetType="button">
                <InputBase
                  label="Building"
                  component="button"
                  type="button"
                  pointer
                  rightSection={
                    stateForm.building ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formFCS.setFieldValue("id_building", "");
                          updateStateForm({ building: "" });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxBuilding.toggleDropdown()}
                  key={formFCS.key("id_building")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formFCS.getInputProps("id_building")}
                >
                  {stateForm.building || (
                    <Input.Placeholder>Building</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.building}
                  onChange={(event) =>
                    updateStateForm({ building: event.currentTarget.value })
                  }
                  placeholder="Search Building"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 790;
                      const dataCount = optionsBuilding.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 790;
                        if (
                          hasNextPageSelectBuildings &&
                          !isFetchingNextPageSelectBuildings
                        ) {
                          fetchNextPageSelectBuildings();
                        }
                      }
                    }}
                  >
                    {optionsBuilding.length > 0 ? (
                      optionsBuilding
                    ) : (
                      <Combobox.Empty>Nothing found</Combobox.Empty>
                    )}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
            <TextInput
              label="Code"
              placeholder="Code"
              key={formFCS.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formFCS.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formFCS.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formFCS.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formFCS.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formFCS.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormFCS}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateFCS || isPendingMutateUpdateFCS}
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
        <Text size={size}>Are you sure you want to delete this fcs?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormFCS}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteFCS}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingFCSs && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessFCSs ? (
        dataFCSs?.data?.pagination.total_rows > 0 ? (
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
                  name: "Building",
                },
                {
                  name: "Plant",
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
              from={dataFCSs.data.pagination.from}
              to={dataFCSs.data.pagination.to}
              totalPages={dataFCSs.data.pagination.total_pages}
              totalRows={dataFCSs.data.pagination.total_rows}
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
        !isLoadingFCSs && <NoDataFound />
      )}
    </Stack>
  );
};

export default FCSPage;
