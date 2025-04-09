import {
  ActionIcon,
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
  Menu,
  Modal,
  rem,
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
  IconFilter,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { SubSection } from "../../../types/subSection";
import {
  useCreateSubSection,
  useDeleteSubSection,
  useSubSectionsQuery,
  useUpdateSubSection,
} from "../../../hooks/subSection";
import { formatDateTime } from "../../../utils/formatTime";
import TableScrollable from "../../../components/Table/TableScrollable";
import TableFooter from "../../../components/Table/TableFooter";
import NoDataFound from "../../../components/Table/NoDataFound";
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
import { useSectionsInfinityQuery } from "../../../hooks/section";
import { useBuildingsInfinityQuery } from "../../../hooks/building";

interface StateFilter {
  open: boolean;
  search: string;
  idSection: string;
  section: string;
}

interface FormValues {
  id_section: string;
  id_building: string;
  code: string;
  description: string;
  remarks: string;
}

interface StateFormSubSection extends StateForm {
  id_fcs: number;
  section: string;
  building: string;
}

const SubSubSectionPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormSubSection,
    { open: openFormSubSection, close: closeFormSubSection },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<SubSection>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    open: false,
    search: "",
    idSection: "",
    section: "",
  });

  const [stateForm, setStateForm] = useState<StateFormSubSection>({
    title: "",
    action: "",
    section: "",
    building: "",
    id_fcs: 0,
  });

  const updateStateTable = (newState: Partial<StateTable<SubSection>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormSubSection>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: SubSection) =>
    updateStateTable({ selected: row });

  const {
    data: dataSubSections,
    isSuccess: isSuccessSubSections,
    isLoading: isLoadingSubSections,
    refetch: refetchSubSections,
  } = useSubSectionsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    id_section: stateFilter.idSection,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
  });

  const {
    data: dataFilterSections,
    isSuccess: isSuccessFilterSections,
    fetchNextPage: fetchNextPageFilterSections,
    hasNextPage: hasNextPageFilterSections,
    isFetchingNextPage: isFetchingNextPageFilterSections,
  } = useSectionsInfinityQuery({
    search: stateFilter.section,
  });

  const flatDataFilterSections =
    (isSuccessFilterSections &&
      dataFilterSections?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const mappedDataFilterSections = useMemo(() => {
    return flatDataFilterSections.map((section) => ({
      value: section.id.toString(),
      label: section.code ? section.code : "",
    }));
  }, [flatDataFilterSections]);

  const {
    mutate: mutateCreateSubSection,
    isPending: isPendingMutateCreateSubSection,
  } = useCreateSubSection();

  const {
    mutate: mutateUpdateSubSection,
    isPending: isPendingMutateUpdateSubSection,
  } = useUpdateSubSection();

  const {
    mutate: mutateDeleteSubSection,
    isPending: isPendingMutateDeleteSubSection,
  } = useDeleteSubSection();

  const {
    data: dataSelectSections,
    isSuccess: isSuccessSelectSections,
    fetchNextPage: fetchNextPageSelectSections,
    hasNextPage: hasNextPageSelectSections,
    isFetchingNextPage: isFetchingNextPageSelectSections,
  } = useSectionsInfinityQuery({
    search: stateForm.section,
  });

  const flatDataSelectSections =
    (isSuccessSelectSections &&
      dataSelectSections?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectBuildings,
    isSuccess: isSuccessSelectBuildings,
    fetchNextPage: fetchNextPageSelectBuildings,
    hasNextPage: hasNextPageSelectBuildings,
    isFetchingNextPage: isFetchingNextPageSelectBuildings,
  } = useBuildingsInfinityQuery({
    search: stateForm.building,
    id_fcs: stateForm.id_fcs,
  });

  const flatDataSelectBuildings =
    (isSuccessSelectBuildings &&
      dataSelectBuildings?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataSubSectionPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (!isSuccessSubSections || !dataSubSections?.data?.pagination.total_rows)
      return null;

    return dataSubSections.data.items.map((row: SubSection) => {
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
          <Table.Td>{row.section?.code}</Table.Td>
          <Table.Td>{row.section?.fcs?.code}</Table.Td>
          <Table.Td>{row.building?.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessSubSections, dataSubSections, stateTable.selected, colorScheme]);

  const formSubSection = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      id_section: "",
      id_building: "",
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      id_section: (value) =>
        value.length === 0 ? "Section is required" : null,
      id_building: (value) =>
        value.length === 0 ? "Building is required" : null,
      code: (value) => (value.length === 0 ? "Code is required" : null),
      description: (value) =>
        value.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddData = () => {
    formSubSection.clearErrors();
    formSubSection.reset();
    updateStateForm({
      title: "Add Data",
      action: "add",
      section: "",
      building: "",
      id_fcs: 0,
    });
    openFormSubSection();
  };

  const handleEditData = () => {
    formSubSection.clearErrors();
    formSubSection.reset();
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
      building: stateTable.selected.building?.description,
      section: stateTable.selected.section?.code,
      id_fcs: stateTable.selected.section?.fcs?.id,
    });

    formSubSection.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormSubSection();
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
    formSubSection.clearErrors();
    formSubSection.reset();

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
      building: stateTable.selected.building?.description,
      section: stateTable.selected.section?.code,
      id_fcs: stateTable.selected.section?.fcs?.id,
    });

    formSubSection.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormSubSection();
  };

  const handleSubmitForm = () => {
    const dataSubSection = formSubSection.getValues();

    let mapSubSection = {
      ...dataSubSection,
      id_section: parseInt(dataSubSection.id_section),
      id_building: parseInt(dataSubSection.id_building),
    };

    if (stateForm.action === "add") {
      mutateCreateSubSection(mapSubSection, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapSubSection.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchSubSections();
          closeFormSubSection();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapSubSection.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormSubSection();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateSubSection(
        {
          id: stateTable.selected?.id!,
          params: mapSubSection,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${mapSubSection.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchSubSections();
            closeFormSubSection();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${mapSubSection.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormSubSection();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteSubSection(stateTable.selected?.id!, {
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
          refetchSubSections();
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

  const handleCloseFormSubSection = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormSubSection();
    }
    formSubSection.clearErrors();
    formSubSection.reset();
  };

  const comboboxSection = useCombobox({
    onDropdownClose: () => comboboxSection.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxSection.selectActiveOption();
      } else {
        comboboxSection.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsSection = flatDataSelectSections.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === formSubSection.getValues().id_section}
        onClick={() => {
          formSubSection.setFieldValue("id_section", item.id.toString());
          updateStateForm({ section: item.code, id_fcs: item.fcs?.id });
          comboboxSection.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formSubSection.getValues().id_section && (
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
                      FCS
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
                    <Text fz={size}>{item.fcs?.code}</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Stack>
        </Group>
      </Combobox.Option>
    );
  });

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
        active={item.id.toString() === formSubSection.getValues().id_building}
        onClick={() => {
          formSubSection.setFieldValue("id_building", item.id.toString());
          updateStateForm({ building: item.description });
          comboboxBuilding.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === formSubSection.getValues().id_building && (
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
              </tbody>
            </table>
          </Stack>
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Stack h="100%">
      <PageHeader title="Master Sub Section" />
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
              access: dataSubSectionPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataSubSectionPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataSubSectionPermission?.data.is_delete,
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
            <Menu.Dropdown p={15} w="fit-content">
              <Text mb={5}>Filter</Text>
              <Select
                placeholder="Section"
                data={mappedDataFilterSections}
                size={size}
                searchable
                searchValue={stateFilter.section || ""}
                onSearchChange={(value) =>
                  updateStateFilter({ section: value || "" })
                }
                value={stateFilter.idSection ? stateFilter.idSection : ""}
                onChange={(value, _option) =>
                  updateStateFilter({ idSection: value || "" })
                }
                maxDropdownHeight={heightDropdown}
                nothingFoundMessage="Nothing found..."
                clearable
                clearButtonProps={{
                  onClick: () => {
                    updateStateFilter({ section: "" });
                  },
                }}
                scrollAreaProps={{
                  onScrollPositionChange: (position) => {
                    let maxY = 37;
                    const dataCount = mappedDataFilterSections.length;
                    const multipleOf10 = Math.floor(dataCount / 10) * 10;
                    if (position.y >= maxY) {
                      maxY += Math.floor(multipleOf10 / 10) * 37;
                      if (
                        hasNextPageFilterSections &&
                        !isFetchingNextPageFilterSections
                      ) {
                        fetchNextPageFilterSections();
                      }
                    }
                  },
                }}
              />
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
      <Modal
        opened={openedFormSubSection}
        onClose={closeFormSubSection}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formSubSection.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <Combobox
              store={comboboxSection}
              resetSelectionOnOptionHover
              onOptionSubmit={() => {
                comboboxSection.closeDropdown();
                comboboxSection.updateSelectedOptionIndex("active");
              }}
            >
              <Combobox.Target targetType="button">
                <InputBase
                  label="Section"
                  component="button"
                  type="button"
                  pointer
                  rightSection={
                    stateForm.section ? (
                      <CloseButton
                        size={16}
                        onClick={() => {
                          formSubSection.setFieldValue("id_section", "");
                          formSubSection.setFieldValue("id_building", "");
                          updateStateForm({
                            section: "",
                            id_fcs: 0,
                            building: "",
                          });
                        }}
                        disabled={stateForm.action === "view"}
                      />
                    ) : (
                      <Combobox.Chevron />
                    )
                  }
                  rightSectionPointerEvents="all"
                  onClick={() => comboboxSection.toggleDropdown()}
                  key={formSubSection.key("id_section")}
                  size={size}
                  disabled={stateForm.action === "view"}
                  {...formSubSection.getInputProps("id_section")}
                >
                  {stateForm.section || (
                    <Input.Placeholder>Section</Input.Placeholder>
                  )}
                </InputBase>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Search
                  value={stateForm.section}
                  onChange={(event) =>
                    updateStateForm({ section: event.currentTarget.value })
                  }
                  placeholder="Search Section"
                />
                <Combobox.Options>
                  <ScrollArea.Autosize
                    type="scroll"
                    mah={heightDropdown}
                    onScrollPositionChange={(position) => {
                      let maxY = 400;
                      const dataCount = optionsSection.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 400;
                        if (
                          hasNextPageSelectSections &&
                          !isFetchingNextPageSelectSections
                        ) {
                          fetchNextPageSelectSections();
                        }
                      }
                    }}
                  >
                    {optionsSection.length > 0 ? (
                      optionsSection
                    ) : (
                      <Combobox.Empty>Nothing found</Combobox.Empty>
                    )}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
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
                          formSubSection.setFieldValue("id_building", "");
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
                  key={formSubSection.key("id_building")}
                  size={size}
                  disabled={
                    stateForm.action === "view" || stateForm.id_fcs === 0
                  }
                  {...formSubSection.getInputProps("id_building")}
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
                      let maxY = 400;
                      const dataCount = optionsBuilding.length;
                      const multipleOf10 = Math.floor(dataCount / 10) * 10;
                      if (position.y >= maxY) {
                        maxY += Math.floor(multipleOf10 / 10) * 400;
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
              key={formSubSection.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSubSection.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formSubSection.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSubSection.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formSubSection.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formSubSection.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormSubSection}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateSubSection ||
                  isPendingMutateUpdateSubSection
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
        <Text size={size}>
          Are you sure you want to delete this sub section?
        </Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormSubSection}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteSubSection}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingSubSections && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessSubSections ? (
        dataSubSections?.data?.pagination.total_rows > 0 ? (
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
                  name: "Section",
                },
                {
                  name: "FCS",
                },
                {
                  name: "Building",
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
              from={dataSubSections.data.pagination.from}
              to={dataSubSections.data.pagination.to}
              totalPages={dataSubSections.data.pagination.total_pages}
              totalRows={dataSubSections.data.pagination.total_rows}
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
        !isLoadingSubSections && <NoDataFound />
      )}
    </Stack>
  );
};

export default SubSubSectionPage;
