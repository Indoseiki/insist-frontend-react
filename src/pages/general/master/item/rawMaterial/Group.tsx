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
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  useCombobox,
  useMantineColorScheme,
} from "@mantine/core";
import PageHeader from "../../../../../components/layouts/PageHeader";
import {
  IconBinoculars,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useSizes } from "../../../../../contexts/useGlobalSizes";
import { useMemo, useState } from "react";
import { formatDateTime } from "../../../../../utils/formatTime";
import TableScrollable from "../../../../../components/Table/TableScrollable";
import TableFooter from "../../../../../components/Table/TableFooter";
import NoDataFound from "../../../../../components/Table/NoDataFound";
import { useDisclosure, useOs } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { StateTable } from "../../../../../types/table";
import { StateForm } from "../../../../../types/form";
import { useUserInfoQuery } from "../../../../../hooks/auth";
import { useRolePermissionQuery } from "../../../../../hooks/rolePermission";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../../../types/response";
import { createActivityLog } from "../../../../../api/activityLog";
import PageSubHeader from "../../../../../components/layouts/PageSubHeader";
import {
  useCreateItemGroupType,
  useDeleteItemGroupType,
  useItemGroupTypesQuery,
  useUpdateItemGroupType,
} from "../../../../../hooks/itemGroupType";
import { ItemGroup } from "../../../../../types/itemGroup";
import {
  useCreateItemGroup,
  useDeleteItemGroup,
  useItemGroupsQuery,
  useUpdateItemGroup,
} from "../../../../../hooks/itemGroup";
import { ItemGroupType } from "../../../../../types/itemGroupType";
import { useItemProductTypesInfinityQuery } from "../../../../../hooks/itemProductType";

interface stateFormGroup extends StateForm {
  productType: string;
}

interface StateFilterGroup {
  search: string;
}

interface StateFilterGroupType {
  search: string;
  idItemGroup: string;
}

const ItemGroupPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [openedFormGroup, { open: openFormGroup, close: closeFormGroup }] =
    useDisclosure(false);

  const [
    openedFormDeleteGroup,
    { open: openFormDeleteGroup, close: closeFormDeleteGroup },
  ] = useDisclosure(false);

  const [
    openedFormGroupType,
    { open: openFormGroupType, close: closeFormGroupType },
  ] = useDisclosure(false);

  const [
    openedFormDeleteGroupType,
    { open: openFormDeleteGroupType, close: closeFormDeleteGroupType },
  ] = useDisclosure(false);

  const [stateTableGroup, setStateTableGroup] = useState<StateTable<ItemGroup>>(
    {
      activePage: 1,
      rowsPerPage: "20",
      selected: null,
      sortBy: "mst_item_product_types.code",
      sortDirection: false,
    }
  );

  const [stateFilterGroup, setStateFilterGroup] = useState<StateFilterGroup>({
    search: "",
  });

  const [stateFormGroup, setStateFormGroup] = useState<stateFormGroup>({
    title: "",
    action: "",
    productType: "",
  });

  const [stateTableGroupType, setStateTableGroupType] = useState<
    StateTable<ItemGroupType>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilterGroupType, setStateFilterGroupType] =
    useState<StateFilterGroupType>({
      search: "",
      idItemGroup: "",
    });

  const [stateFormGroupType, setStateFormGroupType] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTableGroup = (newState: Partial<StateTable<ItemGroup>>) =>
    setStateTableGroup((prev) => ({ ...prev, ...newState }));

  const updateStateFilterGroup = (newState: Partial<StateFilterGroup>) =>
    setStateFilterGroup((prev) => ({ ...prev, ...newState }));

  const updateStateFormGroup = (newState: Partial<stateFormGroup>) =>
    setStateFormGroup((prev) => ({ ...prev, ...newState }));

  const handleClickRowGroup = (row: ItemGroup) => {
    updateStateTableGroup({ selected: row });
  };

  const updateStateTableGroupType = (
    newState: Partial<StateTable<ItemGroupType>>
  ) => setStateTableGroupType((prev) => ({ ...prev, ...newState }));

  const updateStateFilterGroupType = (
    newState: Partial<StateFilterGroupType>
  ) => setStateFilterGroupType((prev) => ({ ...prev, ...newState }));

  const updateStateFormGroupType = (newState: Partial<StateForm>) =>
    setStateFormGroupType((prev) => ({ ...prev, ...newState }));

  const handleClickRowGroupType = (row: ItemGroupType) => {
    updateStateTableGroupType({ selected: row });
  };

  const {
    data: dataGroups,
    isSuccess: isSuccessGroups,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
  } = useItemGroupsQuery({
    page: stateTableGroup.activePage,
    rows: stateTableGroup.rowsPerPage,
    search: stateFilterGroup.search,
    sortBy: stateTableGroup.sortBy,
    sortDirection: stateTableGroup.sortDirection,
    categoryCode: "A",
  });

  const {
    data: dataGroupTypes,
    isSuccess: isSuccessGroupTypes,
    isLoading: isLoadingGroupTypes,
    refetch: refetchGroupTypes,
  } = useItemGroupTypesQuery({
    page: stateTableGroupType.activePage,
    rows: stateTableGroupType.rowsPerPage,
    idItemGroup: stateFilterGroupType.idItemGroup,
    search: stateFilterGroupType.search,
    sortBy: stateTableGroupType.sortBy,
    sortDirection: stateTableGroupType.sortDirection,
  });

  const { mutate: mutateCreateGroup, isPending: isPendingMutateCreateGroup } =
    useCreateItemGroup();

  const { mutate: mutateUpdateGroup, isPending: isPendingMutateUpdateGroup } =
    useUpdateItemGroup();

  const { mutate: mutateDeleteGroup, isPending: isPendingMutateDeleteGroup } =
    useDeleteItemGroup();

  const {
    mutate: mutateCreateGroupType,
    isPending: isPendingMutateCreateGroupType,
  } = useCreateItemGroupType();

  const {
    mutate: mutateUpdateGroupType,
    isPending: isPendingMutateUpdateGroupType,
  } = useUpdateItemGroupType();

  const {
    mutate: mutateDeleteGroupType,
    isPending: isPendingMutateDeleteGroupType,
  } = useDeleteItemGroupType();

  const {
    data: dataSelectProductTypes,
    isSuccess: isSuccessSelectProductTypes,
    fetchNextPage: fetchNextPageSelectProductTypes,
    hasNextPage: hasNextPageSelectProductTypes,
    isFetchingNextPage: isFetchingNextPageSelectProductTypes,
  } = useItemProductTypesInfinityQuery({
    search: stateFormGroup.productType,
  });

  const flatDataSelectProductTypes =
    (isSuccessSelectProductTypes &&
      dataSelectProductTypes?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataGroupPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rowsGroup = useMemo(() => {
    if (!isSuccessGroups || !dataGroups?.data?.pagination.total_rows)
      return null;

    return dataGroups.data.items.map((row: ItemGroup) => {
      const isSelected = stateTableGroup.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowGroup(row);
            updateStateFilterGroupType({ idItemGroup: row.id.toString() });
          }}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>
            {row.item_product_type?.code} - {row.item_product_type?.description}
          </Table.Td>
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [isSuccessGroups, dataGroups, stateTableGroup.selected, colorScheme]);

  const rowsGroupType = useMemo(() => {
    if (!isSuccessGroupTypes || !dataGroupTypes?.data?.pagination.total_rows)
      return null;

    return dataGroupTypes.data.items.map((row: ItemGroupType) => {
      const isSelected = stateTableGroupType.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowGroupType(row);
          }}
          className="hover-row"
          style={{ cursor: "pointer", backgroundColor: rowBg }}
        >
          <Table.Td>{row.code}</Table.Td>
          <Table.Td>{row.description}</Table.Td>
          <Table.Td>{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessGroupTypes,
    dataGroupTypes,
    stateTableGroupType.selected,
    colorScheme,
  ]);

  const formGroup = useForm<Partial<ItemGroup>>({
    mode: "uncontrolled",
    initialValues: {
      id_item_product_type: 0,
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value!.length === 0 ? "Code is required" : null),
      description: (value) =>
        value!.length === 0 ? "Description is required" : null,
    },
  });

  const formGroupType = useForm<Partial<ItemGroupType>>({
    mode: "uncontrolled",
    initialValues: {
      id_item_group: 0,
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value!.length === 0 ? "Code is required" : null),
      description: (value) =>
        value!.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddDataGroup = () => {
    formGroup.clearErrors();
    formGroup.reset();
    updateStateFormGroup({
      title: "Add Data",
      action: "add",
      productType: "",
    });
    openFormGroup();
  };

  const handleEditDataGroup = () => {
    formGroup.clearErrors();
    formGroup.reset();

    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to group before proceeding",
      });
      return;
    }

    updateStateFormGroup({
      title: "Edit Data",
      action: "edit",
      productType: stateTableGroup.selected.item_product_type?.description,
    });

    formGroup.setValues({
      id_item_product_type:
        stateTableGroup.selected.id_item_product_type.toString(),
      code: stateTableGroup.selected.code,
      description: stateTableGroup.selected.description,
      remarks: stateTableGroup.selected.remarks,
    });

    openFormGroup();
  };

  const handleDeleteDataGroup = () => {
    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to group before proceeding",
      });
      return;
    }

    updateStateFormGroup({ title: "Delete Data", action: "delete" });
    openFormDeleteGroup();
  };

  const handleViewDataGroup = () => {
    formGroup.clearErrors();
    formGroup.reset();

    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to group before proceeding",
      });
      return;
    }

    updateStateFormGroup({
      title: "View Data",
      action: "view",
      productType: stateTableGroup.selected.item_product_type?.description,
    });

    formGroup.setValues({
      id_item_product_type:
        stateTableGroup.selected.id_item_product_type.toString(),
      code: stateTableGroup.selected.code,
      description: stateTableGroup.selected.description,
      remarks: stateTableGroup.selected.remarks,
    });

    openFormGroup();
  };

  const handleSubmitFormGroup = () => {
    const dataGroup = formGroup.getValues();
    let mapGroup = {
      ...dataGroup,
      id_item_product_type: Number(dataGroup.id_item_product_type),
    };

    if (stateFormGroup.action === "add") {
      mutateCreateGroup(mapGroup, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${mapGroup.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchGroups();
          closeFormGroup();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${mapGroup.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormGroup();
        },
      });
    }

    if (stateFormGroup.action === "edit") {
      mutateUpdateGroup(
        {
          id: stateTableGroup.selected?.id!,
          params: mapGroup,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableGroup.selected?.code} ⮕ ${mapGroup.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableGroup({ selected: null });
            refetchGroups();
            closeFormGroup();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableGroup.selected?.code} ⮕ ${mapGroup.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormGroup();
          },
        }
      );
    }

    if (stateFormGroup.action === "delete") {
      mutateDeleteGroup(stateTableGroup.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableGroup.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableGroup({ selected: null });
          refetchGroups();
          closeFormDeleteGroup();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableGroup.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteGroup();
        },
      });
    }
  };

  const handleCloseFormGroup = () => {
    if (stateFormGroup.action === "delete") {
      closeFormDeleteGroup();
    } else {
      closeFormGroup();
    }
    formGroup.clearErrors();
    formGroup.reset();
  };

  const handleAddDataGroupType = () => {
    formGroupType.clearErrors();
    formGroupType.reset();

    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data Group First!",
        message:
          "Please select the data group you want to process before proceeding",
      });
      return;
    }

    formGroupType.setFieldValue("id_item_group", stateTableGroup.selected.id);

    updateStateFormGroupType({
      title: "Add Data",
      action: "add",
    });
    openFormGroupType();
  };

  const handleEditDataGroupType = () => {
    formGroupType.clearErrors();
    formGroupType.reset();

    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data Group First!",
        message:
          "Please select the data group you want to process before proceeding",
      });
      return;
    }

    updateStateFormGroupType({
      title: "Edit Data",
      action: "edit",
    });

    formGroupType.setValues({
      id_item_group: stateTableGroupType.selected?.id_item_group,
      code: stateTableGroupType.selected?.code,
      description: stateTableGroupType.selected?.description,
      remarks: stateTableGroupType.selected?.remarks,
    });

    openFormGroupType();
  };

  const handleDeleteDataGroupType = () => {
    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data Group First!",
        message:
          "Please select the data group you want to process before proceeding",
      });
      return;
    }

    updateStateFormGroupType({ title: "Delete Data", action: "delete" });
    openFormDeleteGroupType();
  };

  const handleViewDataGroupType = () => {
    formGroupType.clearErrors();
    formGroupType.reset();

    if (!stateTableGroup.selected) {
      notifications.show({
        title: "Select Data Group First!",
        message:
          "Please select the data group you want to process before proceeding",
      });
      return;
    }

    updateStateFormGroupType({
      title: "View Data",
      action: "view",
    });

    formGroupType.setValues({
      id_item_group: stateTableGroupType.selected?.id_item_group,
      code: stateTableGroupType.selected?.code,
      description: stateTableGroupType.selected?.description,
      remarks: stateTableGroupType.selected?.remarks,
    });

    openFormGroupType();
  };

  const handleSubmitFormGroupType = () => {
    const dataGroupType = formGroupType.getValues();

    if (stateFormGroupType.action === "add") {
      mutateCreateGroupType(dataGroupType, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataGroupType.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchGroupTypes();
          closeFormGroupType();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataGroupType.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormGroupType();
        },
      });
    }

    if (stateFormGroupType.action === "edit") {
      mutateUpdateGroupType(
        {
          id: stateTableGroupType.selected?.id!,
          params: dataGroupType,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableGroupType.selected?.code} ⮕ ${dataGroupType.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableGroupType({ selected: null });
            refetchGroupTypes();
            closeFormGroupType();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableGroupType.selected?.code} ⮕ ${dataGroupType.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormGroupType();
          },
        }
      );
    }

    if (stateFormGroupType.action === "delete") {
      mutateDeleteGroupType(stateTableGroup.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableGroupType.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableGroupType({ selected: null });
          refetchGroupTypes();
          closeFormDeleteGroupType();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableGroupType.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteGroupType();
        },
      });
    }
  };

  const handleCloseFormGroupType = () => {
    if (stateFormGroupType.action === "delete") {
      closeFormDeleteGroupType();
    } else {
      closeFormGroupType();
    }
    formGroupType.clearErrors();
    formGroupType.reset();
  };

  const comboboxProductType = useCombobox({
    onDropdownClose: () => comboboxProductType.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxProductType.selectActiveOption();
      } else {
        comboboxProductType.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsProductType = flatDataSelectProductTypes.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() === formGroup.getValues().id_item_product_type
        }
        onClick={() => {
          formGroup.setFieldValue("id_item_product_type", item.id.toString());
          updateStateFormGroup({ productType: item.description });
          comboboxProductType.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formGroup.getValues().id_item_product_type && (
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
    <Stack h="100%" gap={20}>
      <Stack h="50%">
        <PageHeader title="Group" />
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
                onClick: () => handleAddDataGroup(),
                access: dataGroupPermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataGroup(),
                access: dataGroupPermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataGroup(),
                access: dataGroupPermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataGroup(),
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
              value={stateFilterGroup.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterGroup({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterGroup({ search: "" })}
                  style={{
                    display: stateFilterGroup.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormGroup}
          onClose={closeFormGroup}
          title={stateFormGroup.title}
          closeOnClickOutside={false}
        >
          <form onSubmit={formGroup.onSubmit(handleSubmitFormGroup)}>
            <Stack gap={5}>
              <Combobox
                store={comboboxProductType}
                resetSelectionOnOptionHover
                onOptionSubmit={() => {
                  comboboxProductType.closeDropdown();
                  comboboxProductType.updateSelectedOptionIndex("active");
                }}
              >
                <Combobox.Target targetType="button">
                  <InputBase
                    label="Product Type"
                    component="button"
                    type="button"
                    pointer
                    rightSection={
                      stateFormGroup.productType ? (
                        <CloseButton
                          size={16}
                          onClick={() => {
                            formGroup.setFieldValue("id_item_product_type", "");
                            updateStateFormGroup({ productType: "" });
                          }}
                          disabled={stateFormGroup.action === "view"}
                        />
                      ) : (
                        <Combobox.Chevron />
                      )
                    }
                    rightSectionPointerEvents="all"
                    onClick={() => comboboxProductType.toggleDropdown()}
                    key={formGroup.key("id_item_product_type")}
                    size={size}
                    disabled={stateFormGroup.action === "view"}
                    {...formGroup.getInputProps("id_item_product_type")}
                  >
                    {stateFormGroup.productType || (
                      <Input.Placeholder>Product Type</Input.Placeholder>
                    )}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Search
                    value={stateFormGroup.productType}
                    onChange={(event) =>
                      updateStateFormGroup({
                        productType: event.currentTarget.value,
                      })
                    }
                    placeholder="Search Product Type"
                  />
                  <Combobox.Options>
                    <ScrollArea.Autosize
                      type="scroll"
                      mah={heightDropdown}
                      onScrollPositionChange={(position) => {
                        let maxY = 400;
                        const dataCount = optionsProductType.length;
                        const multipleOf10 = Math.floor(dataCount / 10) * 10;
                        if (position.y >= maxY) {
                          maxY += Math.floor(multipleOf10 / 10) * 400;
                          if (
                            hasNextPageSelectProductTypes &&
                            !isFetchingNextPageSelectProductTypes
                          ) {
                            fetchNextPageSelectProductTypes();
                          }
                        }
                      }}
                    >
                      {optionsProductType.length > 0 ? (
                        optionsProductType
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
                key={formGroup.key("code")}
                size={size}
                disabled={stateFormGroup.action === "view"}
                {...formGroup.getInputProps("code")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formGroup.key("description")}
                size={size}
                disabled={stateFormGroup.action === "view"}
                {...formGroup.getInputProps("description")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formGroup.key("remarks")}
                size={size}
                disabled={stateFormGroup.action === "view"}
                {...formGroup.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormGroup}
              >
                Close
              </Button>
              {stateFormGroup.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateGroup || isPendingMutateUpdateGroup
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteGroup}
          onClose={closeFormDeleteGroup}
          title={stateFormGroup.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>Are you sure you want to delete this group?</Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormGroup}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteGroup}
              onClick={handleSubmitFormGroup}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingGroups && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessGroups ? (
          dataGroups?.data?.pagination.total_rows > 0 ? (
            <>
              <TableScrollable
                headers={[
                  {
                    name: "Product Type",
                  },
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
                    name: "Updated By",
                  },
                  {
                    name: "Last Updated",
                  },
                ]}
                rows={rowsGroup}
              />
              <TableFooter
                from={dataGroups.data.pagination.from}
                to={dataGroups.data.pagination.to}
                totalPages={dataGroups.data.pagination.total_pages}
                totalRows={dataGroups.data.pagination.total_rows}
                rowsPerPage={stateTableGroup.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableGroup({ rowsPerPage: rows || "" })
                }
                activePage={stateTableGroup.activePage}
                onPageChange={(page: number) =>
                  updateStateTableGroup({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingGroups && <NoDataFound />
        )}
      </Stack>
      <Stack
        pt={10}
        h="50%"
        style={{
          borderTop: "1px solid gray",
        }}
      >
        <PageSubHeader title="Group Type" />
        <Flex
          pb={10}
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
                onClick: () => handleAddDataGroupType(),
                access: dataGroupPermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataGroupType(),
                access: dataGroupPermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataGroupType(),
                access: dataGroupPermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataGroupType(),
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
              value={stateFilterGroupType.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterGroupType({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterGroupType({ search: "" })}
                  style={{
                    display: stateFilterGroupType.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormGroupType}
          onClose={closeFormGroupType}
          title={stateFormGroupType.title}
          closeOnClickOutside={false}
        >
          <form onSubmit={formGroupType.onSubmit(handleSubmitFormGroupType)}>
            <Stack gap={5}>
              <TextInput
                label="Code"
                placeholder="Code"
                key={formGroupType.key("code")}
                size={size}
                disabled={stateFormGroupType.action === "view"}
                {...formGroupType.getInputProps("code")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formGroupType.key("description")}
                size={size}
                disabled={stateFormGroupType.action === "view"}
                {...formGroupType.getInputProps("description")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formGroupType.key("remarks")}
                size={size}
                disabled={stateFormGroupType.action === "view"}
                {...formGroupType.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormGroupType}
              >
                Close
              </Button>
              {stateFormGroupType.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateGroupType ||
                    isPendingMutateUpdateGroupType
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteGroupType}
          onClose={closeFormDeleteGroupType}
          title={stateFormGroupType.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>
            Are you sure you want to delete this item Group Type?
          </Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormGroupType}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteGroupType}
              onClick={handleSubmitFormGroupType}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingGroupTypes && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessGroupTypes ? (
          dataGroupTypes?.data?.pagination.total_rows > 0 ? (
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
                    name: "Updated By",
                  },
                  {
                    name: "Last Updated",
                  },
                ]}
                rows={rowsGroupType}
              />
              <TableFooter
                from={dataGroupTypes.data.pagination.from}
                to={dataGroupTypes.data.pagination.to}
                totalPages={dataGroupTypes.data.pagination.total_pages}
                totalRows={dataGroupTypes.data.pagination.total_rows}
                rowsPerPage={stateTableGroupType.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableGroupType({ rowsPerPage: rows || "" })
                }
                activePage={stateTableGroupType.activePage}
                onPageChange={(page: number) =>
                  updateStateTableGroupType({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingGroupTypes &&
          (stateFilterGroupType.idItemGroup ? (
            <NoDataFound
              subTitle="There is no item Group Type data in the group"
              remarks="Please add the item Group Type to the group"
            />
          ) : (
            <NoDataFound
              subTitle="There is no item Group Type data in the group"
              remarks="Please select the group first"
            />
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default ItemGroupPage;
