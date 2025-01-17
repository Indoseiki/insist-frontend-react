import {
  Accordion,
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Input,
  List,
  Loader,
  Menu,
  Modal,
  Pill,
  PillsInput,
  rem,
  ScrollArea,
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
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { FCS } from "../../../types/fcs";
import { useCreateFCS, useDeleteFCS, useUpdateFCS } from "../../../hooks/fcs";
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
import {
  useFCSBuildingsQuery,
  useUpdateFCSBuilding,
} from "../../../hooks/fcsBuilding";

interface StateFilter {
  search: string;
}

interface FormValues {
  code: string;
  description: string;
  remarks: string;
}

interface FormValuesBuilding {
  fcs: string;
  id_building: string[];
}

interface StateFormFCSBuilding extends StateForm {
  building: string[];
  searchBuilding: string;
}

const FCSPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown, sizeActionButton } =
    useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormFCS, { open: openFormFCS, close: closeFormFCS }] =
    useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);
  const [
    openedFormSetupBuilding,
    { open: openFormSetupBuilding, close: closeFormSetupBuilding },
  ] = useDisclosure(false);

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

  const [stateForm, setStateForm] = useState<StateFormFCSBuilding>({
    title: "",
    action: "",
    building: [],
    searchBuilding: "",
  });

  const updateStateTable = (newState: Partial<StateTable<FCS>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormFCSBuilding>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: FCS) => updateStateTable({ selected: row });

  const {
    data: dataFCSs,
    isSuccess: isSuccessFCSs,
    isLoading: isLoadingFCSs,
    refetch: refetchFCSs,
  } = useFCSBuildingsQuery({
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
    search: stateForm.searchBuilding,
    id_fcs: 0,
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

  const {
    mutate: mutateUpdateFCSBuilding,
    isPending: isPendingMutateUpdateFCSBuilding,
  } = useUpdateFCSBuilding();

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

      const buildings = (
        <List>
          {row.buildings?.map((item, index) => (
            <List.Item key={index}>
              <Group gap={5}>
                <Text fz={size} fw="bold">
                  {item.building?.code}
                </Text>
                <Text fz={size}>-</Text>
                <Text fz={size}>{item.building?.description}</Text>
                <Text fz={size}>({item.building?.plant})</Text>
              </Group>
            </List.Item>
          ))}
        </List>
      );

      const items = (
        <Accordion.Item value={row.id.toString()}>
          <Accordion.Control>
            <Text size={size}>List Building</Text>
          </Accordion.Control>
          <Accordion.Panel>{buildings}</Accordion.Panel>
        </Accordion.Item>
      );

      return (
        <Table.Tr
          key={row.id}
          onClick={() => handleClickRow(row)}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w={400}>
            {row.buildings && (
              <Accordion variant="separated" chevronPosition="left">
                {items}
              </Accordion>
            )}
          </Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessFCSs, dataFCSs, stateTable.selected, colorScheme]);

  const formFCS = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value.length === 0 ? "Code is required" : null),
    },
  });

  const handleAddData = () => {
    formFCS.clearErrors();
    formFCS.reset();
    updateStateForm({ title: "Add Data", action: "add" });
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
    });

    formFCS.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormFCS();
  };

  const handleDeleteData = () => {
    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

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
    });

    formFCS.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormFCS();
  };

  const handleSubmitForm = () => {
    const dataFCS = formFCS.getValues();

    if (stateForm.action === "add") {
      mutateCreateFCS(dataFCS, {
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
          params: dataFCS,
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

    if (stateForm.action === "setup") {
      const dataFCSBuilding = formFCSBuilding.getValues();

      mutateUpdateFCSBuilding(
        {
          id: stateTable.selected?.id!,
          params: {
            id_building: dataFCSBuilding.id_building.map((id) => parseInt(id)),
          },
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code})`,
            });

            notifications.show({
              title: "Created Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchFCSs();
            closeFormSetupBuilding();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code}) `,
            });

            notifications.show({
              title: "Created Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormSetupBuilding();
          },
        }
      );
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

  const formFCSBuilding = useForm<FormValuesBuilding>({
    mode: "uncontrolled",
    initialValues: {
      fcs: "",
      id_building: [],
    },

    validate: {
      id_building: (value) => {
        return value.length == 0 ? "Building is required" : null;
      },
    },
  });

  const handleSetupBuilding = () => {
    formFCSBuilding.clearErrors();
    formFCSBuilding.reset();

    if (!stateTable.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to process before proceeding",
      });
      return;
    }

    const buildings = stateTable.selected.buildings
      ?.map((item) => item.building?.description)
      .filter((building): building is string => building !== undefined);

    updateStateForm({
      title: "Setup Building",
      action: "setup",
      building: buildings,
    });

    formFCSBuilding.setValues({
      fcs: stateTable.selected.code,
      id_building:
        stateTable.selected.buildings
          ?.map((item) => item.id_building?.toString())
          .filter((id): id is string => id !== undefined) || [],
    });

    openFormSetupBuilding();
  };

  const handleCloseFormSetupBuilding = () => {
    closeFormSetupBuilding();
    formFCSBuilding.clearErrors();
    formFCSBuilding.reset();
  };

  const comboboxBuilding = useCombobox({
    onDropdownClose: () => comboboxBuilding.resetSelectedOption(),
    onDropdownOpen: () => comboboxBuilding.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val: string) => {
    setStateForm((prev: StateFormFCSBuilding) => {
      const currentBuildings = prev.building || [];
      const updatedBuildings = currentBuildings.includes(val)
        ? currentBuildings.filter((v) => v !== val)
        : [...currentBuildings, val];

      return { ...prev, building: updatedBuildings };
    });
  };

  const Buildings =
    Array.isArray(stateForm.building) &&
    stateForm.building.map((item) => <Pill key={item}>{item}</Pill>);

  const optionsBuilding = flatDataSelectBuildings.map((item) => (
    <Combobox.Option
      value={item.description!}
      key={item.id}
      active={
        Array.isArray(formFCSBuilding.getValues().id_building) &&
        formFCSBuilding.getValues().id_building.includes(item.id.toString())
      }
      onClick={() => {
        formFCSBuilding.setFieldValue("id_building", (prev) => {
          const currentBuildings = prev || [];
          if (currentBuildings.includes(item.id.toString())) {
            return currentBuildings.filter((v) => v !== item.id.toString());
          } else {
            return [...currentBuildings, item.id.toString()];
          }
        });
      }}
    >
      <Group gap="sm">
        {Array.isArray(formFCSBuilding.getValues().id_building) &&
        formFCSBuilding.getValues().id_building.includes(item.id.toString()) ? (
          <CheckIcon size={12} />
        ) : null}
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
  ));

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
          <Menu
            transitionProps={{ transition: "pop" }}
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <Button justify="center" variant="default" size={sizeButton}>
                <IconDotsVertical size={sizeActionButton} />
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {[
                {
                  icon: IconEdit,
                  label: "Setup Building",
                  onClick: () => handleSetupBuilding(),
                },
              ].map((item, idx) => (
                <Menu.Item
                  key={idx}
                  leftSection={
                    <item.icon
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                  onClick={item.onClick}
                >
                  <Text size={size}>{item.label}</Text>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
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
      <Modal
        opened={openedFormSetupBuilding}
        onClose={closeFormSetupBuilding}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formFCSBuilding.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="FCS"
              placeholder="FCS"
              key={formFCSBuilding.key("fcs")}
              size={size}
              disabled={true}
              {...formFCSBuilding.getInputProps("fcs")}
            />
            <Combobox
              store={comboboxBuilding}
              onOptionSubmit={handleValueSelect}
            >
              <Combobox.DropdownTarget>
                <PillsInput
                  label="Building"
                  key={formFCSBuilding.key("id_building")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formFCSBuilding.getInputProps("id_building")}
                  rightSection={
                    stateForm.building ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formFCSBuilding.setFieldValue("id_building", []);
                          updateStateForm({ building: [] });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                >
                  <Pill.Group>
                    {stateForm.building && stateForm.building.length > 0 ? (
                      Buildings
                    ) : (
                      <Input.Placeholder>Building</Input.Placeholder>
                    )}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        component="button"
                        pointer
                        onClick={() => comboboxBuilding.toggleDropdown()}
                        onChange={() => {
                          comboboxBuilding.updateSelectedOptionIndex();
                        }}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.searchBuilding}
                  onChange={(event) =>
                    updateStateForm({
                      searchBuilding: event.currentTarget.value,
                    })
                  }
                  placeholder="Search Building"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 37;
                      const dataCount = optionsBuilding.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 37;
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
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormSetupBuilding}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateUpdateFCSBuilding}
              >
                Save
              </Button>
            )}
          </Group>
        </form>
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
                  name: "Remarks",
                },
                {
                  name: "Building",
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
