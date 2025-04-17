import {
  Button,
  Center,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Grid,
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
import { useEffect, useMemo, useState } from "react";
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
import {
  useCreateItemRawMaterial,
  useDeleteItemRawMaterial,
  useItemRawMaterialsQuery,
  useUpdateItemRawMaterial,
} from "../../../../../hooks/itemRawMaterial";
import { useItemCategoryQuery } from "../../../../../hooks/itemCategory";
import { Item } from "../../../../../types/item";
import { ItemRawMaterial } from "../../../../../types/itemRawMaterial";
import {
  useCreateItem,
  useDeleteItem,
  useUpdateItem,
} from "../../../../../hooks/item";
import { useItemInforsInfinityQuery } from "../../../../../hooks/itemInfor";
import { useItemProductsInfinityQuery } from "../../../../../hooks/itemProduct";
import { useItemProductTypesInfinityQuery } from "../../../../../hooks/itemProductType";
import { useItemGroupTypesInfinityQuery } from "../../../../../hooks/itemGroupType";
import { useItemGroupsInfinityQuery } from "../../../../../hooks/itemGroup";
import { useItemProcessesInfinityQuery } from "../../../../../hooks/itemProcess";
import { formatDiameter } from "../../../../../utils/formatDiameter";
import { formatThousand } from "../../../../../utils/formatThousand";
import { useItemSurfacesInfinityQuery } from "../../../../../hooks/itemSurface";
import { useItemSourcesInfinityQuery } from "../../../../../hooks/itemSource";
import { useUoMInfinityQuery } from "../../../../../hooks/uom";

interface StateFilter {
  search: string;
}

interface FormValueItem {
  item: Partial<Item>;
  item_raw_material: Partial<ItemRawMaterial>;
}

interface StateFormItemRawMaterial extends StateForm {
  infor_code: string;
  id_item_product: string;
  code_item_product: string;
  desc_item_product: string;
  code_item_product_type: string;
  desc_item_product_type: string;
  id_item_group: string;
  code_item_group: string;
  desc_item_group: string;
  code_item_group_type: string;
  desc_item_group_type: string;
  code_item_process: string;
  desc_item_process: string;
  code_item_surface: string;
  desc_item_surface: string;
  code_item_source: string;
  desc_item_source: string;
  format_diameter_size: string;
  diameter_size: string;
  length_size: string;
  format_length_size: string;
  inner_diameter_size: string;
  format_inner_diameter_size: string;
  uom: string;
}

const ItemRawMaterialPage = () => {
  const { size, sizeButton, fullWidth, heightDropdown } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormItemRawMaterial,
    { open: openFormItemRawMaterial, close: closeFormItemRawMaterial },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<ItemRawMaterial>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "mst_items.code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateFormItemRawMaterial>({
    title: "",
    action: "",
    infor_code: "",
    id_item_product: "",
    code_item_product: "",
    desc_item_product: "",
    code_item_product_type: "",
    desc_item_product_type: "",
    id_item_group: "",
    code_item_group: "",
    desc_item_group: "",
    code_item_group_type: "",
    desc_item_group_type: "",
    code_item_process: "",
    desc_item_process: "",
    code_item_surface: "",
    desc_item_surface: "",
    code_item_source: "",
    desc_item_source: "",
    diameter_size: "",
    length_size: "",
    inner_diameter_size: "",
    format_diameter_size: "",
    format_length_size: "",
    format_inner_diameter_size: "",
    uom: "",
  });

  const updateStateTable = (newState: Partial<StateTable<ItemRawMaterial>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateFormItemRawMaterial>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: ItemRawMaterial) =>
    updateStateTable({ selected: row });

  const { data: dataCategory } = useItemCategoryQuery("A");

  const {
    data: dataItemRawMaterials,
    isSuccess: isSuccessItemRawMaterials,
    isLoading: isLoadingItemRawMaterials,
    refetch: refetchItemRawMaterials,
  } = useItemRawMaterialsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
    categoryCode: "A",
  });

  const { mutate: mutateCreateItem, isPending: isPendingMutateCreateItem } =
    useCreateItem();

  const { mutate: mutateUpdateItem, isPending: isPendingMutateUpdateItem } =
    useUpdateItem();

  const { mutate: mutateDeleteItem, isPending: isPendingMutateDeleteItem } =
    useDeleteItem();

  const { mutate: mutateCreateItemRawMaterial } = useCreateItemRawMaterial();

  const { mutate: mutateUpdateItemRawMaterial } = useUpdateItemRawMaterial();

  const { mutate: mutateDeleteItemRawMaterial } = useDeleteItemRawMaterial();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataItemRawMaterialPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (
      !isSuccessItemRawMaterials ||
      !dataItemRawMaterials?.data?.pagination.total_rows
    )
      return null;

    return dataItemRawMaterials.data.items.map((row: ItemRawMaterial) => {
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
          <Table.Td w="200px">{row.item?.code}</Table.Td>
          <Table.Td>{row.item?.description}</Table.Td>
          <Table.Td w="150px">{row.item?.infor_code}</Table.Td>
          <Table.Td>{row.item?.infor_description}</Table.Td>
          <Table.Td w="100px">{row.item?.uom?.code}</Table.Td>
          <Table.Td w="250px">{row.item?.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessItemRawMaterials,
    dataItemRawMaterials,
    stateTable.selected,
    colorScheme,
  ]);

  const formItemRawMaterial = useForm<Partial<FormValueItem>>({
    mode: "uncontrolled",
    initialValues: {
      item: {
        code: "",
        infor_code: "",
        infor_description: "",
        description: "",
        remarks: "",
        id_uom: "",
      },
      item_raw_material: {
        id_item: "",
        id_item_product_type: "",
        id_item_group_type: "",
        id_item_process: "",
        id_item_surface: "",
        id_item_source: "",
        diameter_size: "",
        length_size: "",
        inner_diameter_size: "",
      },
    },
    validate: {
      item: {
        code: (value) => (!value ? "Code is required" : null),
        description: (value) => (!value ? "Description is required" : null),
        infor_code: (value) => (!value ? "Code is required" : null),
        infor_description: (value) =>
          !value ? "Description is required" : null,
        id_uom: (value) => (!value ? "UoM is required" : null),
      },
      item_raw_material: {
        id_item_product_type: (value) =>
          !value ? "Product Type is required" : null,
        id_item_group_type: (value) =>
          !value ? "Group Type is required" : null,
        id_item_process: (value) => (!value ? "Processing is required" : null),
        id_item_surface: (value) =>
          !value ? "Surface Finishing is required" : null,
        id_item_source: (value) => (!value ? "Sourcing is required" : null),
        diameter_size: (value) => (!value ? "Diameter Size is required" : null),
        length_size: (value) => (!value ? "Length Size is required" : null),
        inner_diameter_size: (value) =>
          !value ? "Inner Diameter Size is required" : null,
      },
    },
  });

  const {
    data: dataSelectItemInfors,
    isSuccess: isSuccessSelectItemInfors,
    fetchNextPage: fetchNextPageSelectItemInfors,
    hasNextPage: hasNextPageSelectItemInfors,
    isFetchingNextPage: isFetchingNextPageSelectItemInfors,
  } = useItemInforsInfinityQuery({
    search: stateForm.infor_code,
  });

  const flatDataSelectItemInfors =
    (isSuccessSelectItemInfors &&
      dataSelectItemInfors?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectProducts,
    isSuccess: isSuccessSelectProducts,
    fetchNextPage: fetchNextPageSelectProducts,
    hasNextPage: hasNextPageSelectProducts,
    isFetchingNextPage: isFetchingNextPageSelectProducts,
  } = useItemProductsInfinityQuery({
    search: stateForm.desc_item_product,
    categoryCode: "A",
  });

  const flatDataSelectProducts =
    (isSuccessSelectProducts &&
      dataSelectProducts?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectProductTypes,
    isSuccess: isSuccessSelectProductTypes,
    fetchNextPage: fetchNextPageSelectProductTypes,
    hasNextPage: hasNextPageSelectProductTypes,
    isFetchingNextPage: isFetchingNextPageSelectProductTypes,
  } = useItemProductTypesInfinityQuery({
    search: stateForm.desc_item_product_type,
    idItemProduct: stateForm.id_item_product,
  });

  const flatDataSelectProductTypes =
    (isSuccessSelectProductTypes &&
      dataSelectProductTypes?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectGroups,
    isSuccess: isSuccessSelectGroups,
    fetchNextPage: fetchNextPageSelectGroups,
    hasNextPage: hasNextPageSelectGroups,
    isFetchingNextPage: isFetchingNextPageSelectGroups,
  } = useItemGroupsInfinityQuery({
    search: stateForm.desc_item_group,
    categoryCode: "A",
    idProductType: formItemRawMaterial
      .getValues()
      .item_raw_material?.id_item_product_type?.toString()!,
  });

  const flatDataSelectGroups =
    (isSuccessSelectGroups &&
      dataSelectGroups?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectGroupTypes,
    isSuccess: isSuccessSelectGroupTypes,
    fetchNextPage: fetchNextPageSelectGroupTypes,
    hasNextPage: hasNextPageSelectGroupTypes,
    isFetchingNextPage: isFetchingNextPageSelectGroupTypes,
  } = useItemGroupTypesInfinityQuery({
    search: stateForm.desc_item_group_type,
    idItemGroup: stateForm.id_item_group,
  });

  const flatDataSelectGroupTypes =
    (isSuccessSelectGroupTypes &&
      dataSelectGroupTypes?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectProcessings,
    isSuccess: isSuccessSelectProcessings,
    fetchNextPage: fetchNextPageSelectProcessings,
    hasNextPage: hasNextPageSelectProcessings,
    isFetchingNextPage: isFetchingNextPageSelectProcessings,
  } = useItemProcessesInfinityQuery({
    search: stateForm.desc_item_process,
    categoryCode: "A",
  });

  const flatDataSelectProcessings =
    (isSuccessSelectProcessings &&
      dataSelectProcessings?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectSurfaces,
    isSuccess: isSuccessSelectSurfaces,
    fetchNextPage: fetchNextPageSelectSurfaces,
    hasNextPage: hasNextPageSelectSurfaces,
    isFetchingNextPage: isFetchingNextPageSelectSurfaces,
  } = useItemSurfacesInfinityQuery({
    search: stateForm.desc_item_surface,
    categoryCode: "A",
  });

  const flatDataSelectSurfaces =
    (isSuccessSelectSurfaces &&
      dataSelectSurfaces?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectSources,
    isSuccess: isSuccessSelectSources,
    fetchNextPage: fetchNextPageSelectSources,
    hasNextPage: hasNextPageSelectSources,
    isFetchingNextPage: isFetchingNextPageSelectSources,
  } = useItemSourcesInfinityQuery({
    search: stateForm.desc_item_source,
    categoryCode: "A",
  });

  const flatDataSelectSources =
    (isSuccessSelectSources &&
      dataSelectSources?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const {
    data: dataSelectUoMs,
    isSuccess: isSuccessSelectUoMs,
    fetchNextPage: fetchNextPageSelectUoMs,
    hasNextPage: hasNextPageSelectUoMs,
    isFetchingNextPage: isFetchingNextPageSelectUoMs,
  } = useUoMInfinityQuery({
    search: stateForm.uom,
  });

  const flatDataSelectUoMs =
    (isSuccessSelectUoMs &&
      dataSelectUoMs?.pages.flatMap((page) =>
        page.status === 200 ? page.data?.items : []
      )) ||
    [];

  const handleAddData = () => {
    formItemRawMaterial.clearErrors();
    formItemRawMaterial.reset();
    updateStateForm({
      title: "Add Data",
      action: "add",
      infor_code: "",
      id_item_product: "",
      code_item_product: "",
      desc_item_product: "",
      code_item_product_type: "",
      desc_item_product_type: "",
      id_item_group: "",
      code_item_group: "",
      desc_item_group: "",
      code_item_group_type: "",
      desc_item_group_type: "",
      code_item_process: "",
      desc_item_process: "",
      code_item_surface: "",
      desc_item_surface: "",
      code_item_source: "",
      desc_item_source: "",
      diameter_size: "",
      length_size: "",
      inner_diameter_size: "",
      format_diameter_size: "",
      format_length_size: "",
      format_inner_diameter_size: "",
      uom: "",
    });
    openFormItemRawMaterial();
  };

  const handleEditData = () => {
    formItemRawMaterial.clearErrors();
    formItemRawMaterial.reset();
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
      infor_code: stateTable.selected.item?.infor_code,
      id_item_product:
        stateTable.selected.item_product_type?.id_item_product.toString(),
      code_item_product:
        stateTable.selected.item_product_type?.item_product?.code,
      desc_item_product:
        stateTable.selected.item_product_type?.item_product?.description,
      code_item_product_type: stateTable.selected.item_product_type?.code,
      desc_item_product_type:
        stateTable.selected.item_product_type?.description,
      id_item_group:
        stateTable.selected.item_group_type?.id_item_group.toString(),
      code_item_group: stateTable.selected.item_group_type?.item_group?.code,
      desc_item_group:
        stateTable.selected.item_group_type?.item_group?.description,
      code_item_group_type: stateTable.selected.item_group_type?.code,
      desc_item_group_type: stateTable.selected.item_group_type?.description,
      code_item_process: stateTable.selected.item_process?.code,
      desc_item_process: stateTable.selected.item_process?.description,
      code_item_surface: stateTable.selected.item_surface?.code,
      desc_item_surface: stateTable.selected.item_surface?.description,
      code_item_source: stateTable.selected.item_source?.code,
      desc_item_source: stateTable.selected.item_source?.description,
      diameter_size: stateTable.selected.diameter_size,
      length_size: stateTable.selected.length_size,
      inner_diameter_size: stateTable.selected.inner_diameter_size,
      format_diameter_size: formatDiameter(stateTable.selected.diameter_size),
      format_length_size: formatThousand(stateTable.selected.length_size),
      format_inner_diameter_size: formatDiameter(
        stateTable.selected.inner_diameter_size
      ),
      uom: stateTable.selected.item?.uom?.code,
    });

    formItemRawMaterial.setValues({
      item: {
        id_item_category: stateTable.selected.item?.id_item_category,
        id_uom: stateTable.selected.item?.id_uom,
        code: stateTable.selected.item?.code,
        description: stateTable.selected.item?.description,
        infor_code: stateTable.selected.item?.infor_code,
        infor_description: stateTable.selected.item?.infor_description,
        remarks: stateTable.selected.item?.remarks,
      },
      item_raw_material: {
        id_item: stateTable.selected.id_item,
        id_item_product_type: stateTable.selected.id_item_product_type,
        id_item_group_type: stateTable.selected.id_item_group_type,
        id_item_process: stateTable.selected.id_item_process,
        id_item_surface: stateTable.selected.id_item_surface,
        id_item_source: stateTable.selected.id_item_source,
        diameter_size: stateTable.selected.diameter_size,
        length_size: stateTable.selected.length_size,
        inner_diameter_size: stateTable.selected.inner_diameter_size,
      },
    });

    openFormItemRawMaterial();
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
    formItemRawMaterial.clearErrors();
    formItemRawMaterial.reset();

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
      infor_code: stateTable.selected.item?.infor_code,
      id_item_product:
        stateTable.selected.item_product_type?.id_item_product.toString(),
      code_item_product:
        stateTable.selected.item_product_type?.item_product?.code,
      desc_item_product:
        stateTable.selected.item_product_type?.item_product?.description,
      code_item_product_type: stateTable.selected.item_product_type?.code,
      desc_item_product_type:
        stateTable.selected.item_product_type?.description,
      id_item_group:
        stateTable.selected.item_group_type?.id_item_group.toString(),
      code_item_group: stateTable.selected.item_group_type?.item_group?.code,
      desc_item_group:
        stateTable.selected.item_group_type?.item_group?.description,
      code_item_group_type: stateTable.selected.item_group_type?.code,
      desc_item_group_type: stateTable.selected.item_group_type?.description,
      code_item_process: stateTable.selected.item_process?.code,
      desc_item_process: stateTable.selected.item_process?.description,
      code_item_surface: stateTable.selected.item_surface?.code,
      desc_item_surface: stateTable.selected.item_surface?.description,
      code_item_source: stateTable.selected.item_source?.code,
      desc_item_source: stateTable.selected.item_source?.description,
      diameter_size: stateTable.selected.diameter_size,
      length_size: stateTable.selected.length_size,
      inner_diameter_size: stateTable.selected.inner_diameter_size,
      format_diameter_size: formatDiameter(stateTable.selected.diameter_size),
      format_length_size: formatThousand(stateTable.selected.length_size),
      format_inner_diameter_size: formatDiameter(
        stateTable.selected.inner_diameter_size
      ),
      uom: stateTable.selected.item?.uom?.code,
    });

    formItemRawMaterial.setValues({
      item: {
        id_item_category: stateTable.selected.item?.id_item_category,
        id_uom: stateTable.selected.item?.id_uom,
        code: stateTable.selected.item?.code,
        description: stateTable.selected.item?.description,
        infor_code: stateTable.selected.item?.infor_code,
        infor_description: stateTable.selected.item?.infor_description,
        remarks: stateTable.selected.item?.remarks,
      },
      item_raw_material: {
        id_item: stateTable.selected.id_item,
        id_item_product_type: stateTable.selected.id_item_product_type,
        id_item_group_type: stateTable.selected.id_item_group_type,
        id_item_process: stateTable.selected.id_item_process,
        id_item_surface: stateTable.selected.id_item_surface,
        id_item_source: stateTable.selected.id_item_source,
        diameter_size: stateTable.selected.diameter_size,
        length_size: stateTable.selected.length_size,
        inner_diameter_size: stateTable.selected.inner_diameter_size,
      },
    });

    openFormItemRawMaterial();
  };

  const handleSubmitForm = () => {
    const dataItem = formItemRawMaterial.getValues().item!;
    dataItem.id_item_category = dataCategory?.data.id;
    const dataItemRawMaterial =
      formItemRawMaterial.getValues().item_raw_material!;

    if (stateForm.action === "add") {
      mutateCreateItem(dataItem, {
        onSuccess: async (resItem) => {
          mutateCreateItemRawMaterial(
            {
              ...dataItemRawMaterial,
              id_item: resItem.data.id,
            },
            {
              onSuccess: async (resRawMaterial) => {
                await createActivityLog({
                  username: dataUser?.data.username,
                  action: "Create",
                  is_success: true,
                  os,
                  message: `${resItem?.message} + ${resRawMaterial?.message} (${dataItem?.code})`,
                });

                notifications.show({
                  title: "Created Successfully!",
                  message: resRawMaterial.message,
                  color: "green",
                });

                refetchItemRawMaterials();
                closeFormItemRawMaterial();
              },
              onError: async (err) => {
                const error = err as AxiosError<ApiResponse<null>>;
                const res = error.response;
                await createActivityLog({
                  username: dataUser?.data.username,
                  action: "Create Raw Material",
                  is_success: false,
                  os,
                  message: `${res?.data.message} (${dataItem?.code})`,
                });

                notifications.show({
                  title: "Created Failed!",
                  message:
                    "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
                  color: "red",
                });

                closeFormItemRawMaterial();
              },
            }
          );
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os,
            message: `${res?.data.message} (${dataItem?.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormItemRawMaterial();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateItem(
        {
          id: Number(stateTable.selected?.id_item!),
          params: dataItem,
        },
        {
          onSuccess: async (resItem) => {
            mutateUpdateItemRawMaterial(
              {
                id: stateTable.selected?.id!,
                params: dataItemRawMaterial,
              },
              {
                onSuccess: async (resRawMaterial) => {
                  await createActivityLog({
                    username: dataUser?.data.username,
                    action: "Update",
                    is_success: true,
                    os,
                    message: `${resItem?.message} + ${resRawMaterial?.message} (${stateTable.selected?.item?.code} ⮕ ${dataItem?.code})`,
                  });

                  notifications.show({
                    title: "Updated Successfully!",
                    message: resRawMaterial.message,
                    color: "green",
                  });

                  updateStateTable({ selected: null });
                  refetchItemRawMaterials();
                  closeFormItemRawMaterial();
                },
                onError: async (err) => {
                  const error = err as AxiosError<ApiResponse<null>>;
                  const res = error.response;
                  await createActivityLog({
                    username: dataUser?.data.username,
                    action: "Update Raw Material",
                    is_success: false,
                    os,
                    message: `${res?.data.message} (${dataItem?.code})`,
                  });

                  notifications.show({
                    title: "Updated Failed!",
                    message:
                      "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
                    color: "red",
                  });

                  closeFormItemRawMaterial();
                },
              }
            );
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os,
              message: `${res?.data.message} (${stateTable.selected?.item?.code} ⮕ ${dataItem?.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormItemRawMaterial();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteItem(stateTable.selected?.id!, {
        onSuccess: async (resItem) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os,
            message: `${resItem?.message} + ${resItem?.message} (${stateTable.selected?.item?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: resItem.message,
            color: "green",
          });

          updateStateTable({ selected: null });
          refetchItemRawMaterials();
          closeFormDelete();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete Item",
            is_success: false,
            os,
            message: `${res?.data.message} (${stateTable.selected?.item?.code}) `,
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

  const handleCloseFormItemRawMaterial = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormItemRawMaterial();
    }
    formItemRawMaterial.clearErrors();
    formItemRawMaterial.reset();
  };

  const comboboxItemInfor = useCombobox({
    onDropdownClose: () => comboboxItemInfor.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxItemInfor.selectActiveOption();
      } else {
        comboboxItemInfor.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsItemInfor = flatDataSelectItemInfors
    .filter(
      (item): item is { code: string; description: string; uom: string } =>
        item !== null &&
        typeof item === "object" &&
        "code" in item &&
        "description" in item
    )
    .map((item) => {
      return (
        <Combobox.Option
          value={item.code}
          key={item.code}
          active={
            item.code === formItemRawMaterial.getValues().item?.infor_code
          }
          onClick={() => {
            formItemRawMaterial.setFieldValue("item.infor_code", item.code);
            formItemRawMaterial.setFieldValue(
              "item.infor_description",
              item.description
            );
            updateStateForm({
              infor_code: item.code,
            });
            comboboxItemInfor.resetSelectedOption();
          }}
        >
          <Group gap="xs">
            {item.code === formItemRawMaterial.getValues().item?.infor_code && (
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
                    <td style={{ padding: "4px" }}>:</td>
                    <td>
                      <Text fz={size}>{item.code}</Text>
                    </td>
                  </tr>
                  <tr>
                    <td width="80px" style={{ verticalAlign: "top" }}>
                      <Text fz={size} fw="bold">
                        Description
                      </Text>
                    </td>
                    <td style={{ padding: "0 4px", verticalAlign: "top" }}>
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

  const comboboxProduct = useCombobox({
    onDropdownClose: () => comboboxProduct.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxProduct.selectActiveOption();
      } else {
        comboboxProduct.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsProduct = flatDataSelectProducts.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === stateForm.id_item_product}
        onClick={() => {
          updateStateForm({
            id_item_product: item.id.toString(),
            code_item_product: item.code,
            desc_item_product: item.description,
          });
          comboboxProduct.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === stateForm.id_item_product && (
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
          item.id.toString() ===
          formItemRawMaterial
            .getValues()
            .item_raw_material?.id_item_product_type?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue(
            "item_raw_material.id_item_product_type",
            item.id
          );
          updateStateForm({
            code_item_product_type: item.code,
            desc_item_product_type: item.description,
          });
          comboboxProductType.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial
              .getValues()
              .item_raw_material?.id_item_product_type?.toString() && (
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

  const comboboxGroup = useCombobox({
    onDropdownClose: () => comboboxGroup.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxGroup.selectActiveOption();
      } else {
        comboboxGroup.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsGroup = flatDataSelectGroups.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={item.id.toString() === stateForm.id_item_group}
        onClick={() => {
          updateStateForm({
            id_item_group: item.id.toString(),
            code_item_group: item.code,
            desc_item_group: item.description,
          });
          comboboxGroup.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() === stateForm.id_item_group && (
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

  const comboboxGroupType = useCombobox({
    onDropdownClose: () => comboboxGroupType.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxGroupType.selectActiveOption();
      } else {
        comboboxGroupType.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsGroupType = flatDataSelectGroupTypes.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() ===
          formItemRawMaterial
            .getValues()
            .item_raw_material?.id_item_group_type?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue(
            "item_raw_material.id_item_group_type",
            item.id
          );
          updateStateForm({
            code_item_group_type: item.code,
            desc_item_group_type: item.description,
          });
          comboboxGroupType.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial
              .getValues()
              .item_raw_material?.id_item_group_type?.toString() && (
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

  const comboboxProcessing = useCombobox({
    onDropdownClose: () => comboboxProcessing.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxProcessing.selectActiveOption();
      } else {
        comboboxProcessing.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsProcessing = flatDataSelectProcessings.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() ===
          formItemRawMaterial
            .getValues()
            .item_raw_material?.id_item_process?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue(
            "item_raw_material.id_item_process",
            item.id
          );
          updateStateForm({
            code_item_process: item.code,
            desc_item_process: item.description,
          });
          comboboxProcessing.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial
              .getValues()
              .item_raw_material?.id_item_process?.toString() && (
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

  const comboboxSurface = useCombobox({
    onDropdownClose: () => comboboxSurface.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxSurface.selectActiveOption();
      } else {
        comboboxSurface.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsSurface = flatDataSelectSurfaces.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() ===
          formItemRawMaterial
            .getValues()
            .item_raw_material?.id_item_surface?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue(
            "item_raw_material.id_item_surface",
            item.id
          );
          updateStateForm({
            code_item_surface: item.code,
            desc_item_surface: item.description,
          });
          comboboxSurface.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial
              .getValues()
              .item_raw_material?.id_item_surface?.toString() && (
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

  const comboboxSource = useCombobox({
    onDropdownClose: () => comboboxSource.resetSelectedOption(),
    onDropdownOpen: (eventSource) => {
      if (eventSource === "keyboard") {
        comboboxSource.selectActiveOption();
      } else {
        comboboxSource.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsSource = flatDataSelectSources.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() ===
          formItemRawMaterial
            .getValues()
            .item_raw_material?.id_item_source?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue(
            "item_raw_material.id_item_source",
            item.id
          );
          updateStateForm({
            code_item_source: item.code,
            desc_item_source: item.description,
          });
          comboboxSource.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial
              .getValues()
              .item_raw_material?.id_item_source?.toString() && (
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

  const comboboxUoM = useCombobox({
    onDropdownClose: () => comboboxUoM.resetSelectedOption(),
    onDropdownOpen: (eventUoM) => {
      if (eventUoM === "keyboard") {
        comboboxUoM.selectActiveOption();
      } else {
        comboboxUoM.updateSelectedOptionIndex("active");
      }
    },
  });

  const optionsUoM = flatDataSelectUoMs.map((item) => {
    return (
      <Combobox.Option
        value={item.id.toString()}
        key={item.id}
        active={
          item.id.toString() ===
          formItemRawMaterial.getValues().item?.id_uom?.toString()
        }
        onClick={() => {
          formItemRawMaterial.setFieldValue("item.id_uom", item.id);
          updateStateForm({
            uom: item.code,
          });
          comboboxUoM.resetSelectedOption();
        }}
      >
        <Group gap="xs">
          {item.id.toString() ===
            formItemRawMaterial.getValues().item?.id_uom?.toString() && (
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

  useEffect(() => {
    const generateItemCode = `A${stateForm.code_item_product}${stateForm.code_item_product_type}${stateForm.code_item_group}${stateForm.code_item_group_type}${stateForm.code_item_process}${stateForm.diameter_size}${stateForm.length_size}${stateForm.inner_diameter_size}${stateForm.code_item_surface}${stateForm.code_item_source}`;

    const generateItemDescription = `${stateForm.desc_item_product_type} ${stateForm.desc_item_group} ${stateForm.desc_item_group_type} ${stateForm.desc_item_process} ${stateForm.format_diameter_size ? `- ${stateForm.format_diameter_size}` : ""} ${stateForm.format_length_size ? `x ${stateForm.format_length_size} mm` : ""} ${stateForm.format_inner_diameter_size ? `x ${stateForm.format_inner_diameter_size}` : ""}`;

    formItemRawMaterial.setFieldValue("item.code", generateItemCode);
    formItemRawMaterial.setFieldValue(
      "item.description",
      generateItemDescription
    );
  }, [
    stateForm.code_item_product,
    stateForm.code_item_product_type,
    stateForm.code_item_group,
    stateForm.code_item_group_type,
    stateForm.code_item_process,
    stateForm.code_item_surface,
    stateForm.code_item_source,
    stateForm.diameter_size,
    stateForm.length_size,
    stateForm.inner_diameter_size,
    stateForm.desc_item_product_type,
    stateForm.desc_item_group,
    stateForm.desc_item_group_type,
    stateForm.desc_item_process,
    stateForm.format_diameter_size,
    stateForm.format_length_size,
    stateForm.format_inner_diameter_size,
  ]);

  return (
    <Stack h="100%">
      <PageHeader title="Generate" />
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
              access: dataItemRawMaterialPermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataItemRawMaterialPermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataItemRawMaterialPermission?.data.is_delete,
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
        opened={openedFormItemRawMaterial}
        onClose={closeFormItemRawMaterial}
        title={stateForm.title}
        closeOnClickOutside={false}
        size="xl"
      >
        <form onSubmit={formItemRawMaterial.onSubmit(handleSubmitForm)}>
          <ScrollArea h={600} type="scroll">
            <Stack gap={5}>
              <fieldset>
                <legend>Auto Generated</legend>
                <Grid gutter="sm">
                  <Grid.Col span={12}>
                    <TextInput
                      label="Code"
                      placeholder="Code"
                      key={formItemRawMaterial.key("item.code")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formItemRawMaterial.getInputProps("item.code")}
                      readOnly
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      key={formItemRawMaterial.key("item.description")}
                      size={size}
                      disabled={stateForm.action === "view"}
                      {...formItemRawMaterial.getInputProps("item.description")}
                      readOnly
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>INFOR</legend>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxItemInfor}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxItemInfor.closeDropdown();
                        comboboxItemInfor.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Code"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.infor_code ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item.infor_code",
                                    ""
                                  );
                                  formItemRawMaterial.setFieldValue(
                                    "item.infor_description",
                                    ""
                                  );
                                  updateStateForm({
                                    infor_code: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxItemInfor.toggleDropdown()}
                          key={formItemRawMaterial.key("item.infor_code")}
                          size={size}
                          disabled={stateForm.action === "view"}
                          {...formItemRawMaterial.getInputProps(
                            "item.infor_code"
                          )}
                        >
                          {stateForm.infor_code || (
                            <Input.Placeholder>Code</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.infor_code}
                          onChange={(event) =>
                            updateStateForm({
                              infor_code: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Code"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsItemInfor.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectItemInfors &&
                                  !isFetchingNextPageSelectItemInfors
                                ) {
                                  fetchNextPageSelectItemInfors();
                                }
                              }
                            }}
                          >
                            {optionsItemInfor.length > 0 ? (
                              optionsItemInfor
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Description"
                      placeholder="Description"
                      key={formItemRawMaterial.key("item.infor_description")}
                      size={size}
                      {...formItemRawMaterial.getInputProps(
                        "item.infor_description"
                      )}
                      disabled
                    />
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Code</legend>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxProduct}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxProduct.closeDropdown();
                        comboboxProduct.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Product"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_product ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_product_type",
                                    ""
                                  );
                                  updateStateForm({
                                    id_item_product: "",
                                    code_item_product: "",
                                    desc_item_product: "",
                                    code_item_product_type: "",
                                    desc_item_product_type: "",
                                    id_item_group: "",
                                    code_item_group: "",
                                    desc_item_group: "",
                                    code_item_group_type: "",
                                    desc_item_group_type: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxProduct.toggleDropdown()}
                          size={size}
                          disabled={stateForm.action === "view"}
                        >
                          {stateForm.desc_item_product || (
                            <Input.Placeholder>Product</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_product}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_product: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Product"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsProduct.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectProducts &&
                                  !isFetchingNextPageSelectProducts
                                ) {
                                  fetchNextPageSelectProducts();
                                }
                              }
                            }}
                          >
                            {optionsProduct.length > 0 ? (
                              optionsProduct
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
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
                            stateForm.desc_item_product_type ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_product_type",
                                    ""
                                  );
                                  updateStateForm({
                                    code_item_product_type: "",
                                    desc_item_product_type: "",
                                    id_item_group: "",
                                    code_item_group: "",
                                    desc_item_group: "",
                                    code_item_group_type: "",
                                    desc_item_group_type: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxProductType.toggleDropdown()}
                          key={formItemRawMaterial.key(
                            "item_raw_material.id_item_product_type"
                          )}
                          {...formItemRawMaterial.getInputProps(
                            "item_raw_material.id_item_product_type"
                          )}
                          size={size}
                          disabled={
                            stateForm.action === "view" ||
                            stateForm.id_item_product === ""
                          }
                        >
                          {stateForm.desc_item_product_type || (
                            <Input.Placeholder>Product Type</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_product_type}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_product_type: event.currentTarget.value,
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
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
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
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxGroup}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxGroup.closeDropdown();
                        comboboxGroup.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Group"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_group ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_group_type",
                                    ""
                                  );
                                  updateStateForm({
                                    id_item_group: "",
                                    code_item_group: "",
                                    desc_item_group: "",
                                    code_item_group_type: "",
                                    desc_item_group_type: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxGroup.toggleDropdown()}
                          size={size}
                          disabled={
                            stateForm.action === "view" ||
                            formItemRawMaterial
                              .getValues()
                              .item_raw_material?.id_item_product_type?.toString() ===
                              ""
                          }
                        >
                          {stateForm.desc_item_group || (
                            <Input.Placeholder>Group</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_group}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_group: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Group"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsGroup.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectGroups &&
                                  !isFetchingNextPageSelectGroups
                                ) {
                                  fetchNextPageSelectGroups();
                                }
                              }
                            }}
                          >
                            {optionsGroup.length > 0 ? (
                              optionsGroup
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxGroupType}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxGroupType.closeDropdown();
                        comboboxGroupType.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Group Type"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_group_type ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_group_type",
                                    ""
                                  );
                                  updateStateForm({
                                    code_item_group_type: "",
                                    desc_item_group_type: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxGroupType.toggleDropdown()}
                          key={formItemRawMaterial.key(
                            "item_raw_material.id_item_group_type"
                          )}
                          {...formItemRawMaterial.getInputProps(
                            "item_raw_material.id_item_group_type"
                          )}
                          size={size}
                          disabled={
                            stateForm.action === "view" ||
                            stateForm.id_item_group === ""
                          }
                        >
                          {stateForm.desc_item_group_type || (
                            <Input.Placeholder>Group Type</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_group_type}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_group_type: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Group Type"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsGroupType.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectGroupTypes &&
                                  !isFetchingNextPageSelectGroupTypes
                                ) {
                                  fetchNextPageSelectGroupTypes();
                                }
                              }
                            }}
                          >
                            {optionsGroupType.length > 0 ? (
                              optionsGroupType
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxProcessing}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxProcessing.closeDropdown();
                        comboboxProcessing.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Processing"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_process ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_process",
                                    ""
                                  );
                                  updateStateForm({
                                    code_item_process: "",
                                    desc_item_process: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxProcessing.toggleDropdown()}
                          key={formItemRawMaterial.key(
                            "item_raw_material.id_item_process"
                          )}
                          {...formItemRawMaterial.getInputProps(
                            "item_raw_material.id_item_process"
                          )}
                          size={size}
                          disabled={stateForm.action === "view"}
                        >
                          {stateForm.desc_item_process || (
                            <Input.Placeholder>Processing</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_process}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_process: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Processing"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsProcessing.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectProcessings &&
                                  !isFetchingNextPageSelectProcessings
                                ) {
                                  fetchNextPageSelectProcessings();
                                }
                              }
                            }}
                          >
                            {optionsProcessing.length > 0 ? (
                              optionsProcessing
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Diameter Size"
                      placeholder="2 digits behind point"
                      key={formItemRawMaterial.key(
                        "item_raw_material.diameter_size"
                      )}
                      {...formItemRawMaterial.getInputProps(
                        "item_raw_material.diameter_size"
                      )}
                      maxLength={5}
                      onChange={(event) => {
                        formItemRawMaterial
                          .getInputProps("item_raw_material.diameter_size")
                          .onChange(event);
                        const rawValue = event.currentTarget.value;
                        const formatted = formatDiameter(rawValue);
                        updateStateForm({
                          diameter_size: rawValue,
                          format_diameter_size: formatted,
                        });
                      }}
                      size={size}
                      disabled={stateForm.action === "view"}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Length Size"
                      placeholder="0 digits behind point"
                      key={formItemRawMaterial.key(
                        "item_raw_material.length_size"
                      )}
                      {...formItemRawMaterial.getInputProps(
                        "item_raw_material.length_size"
                      )}
                      maxLength={6}
                      onChange={(event) => {
                        formItemRawMaterial
                          .getInputProps("item_raw_material.length_size")
                          .onChange(event);
                        const rawValue = event.currentTarget.value;
                        const formatted = formatThousand(rawValue);
                        updateStateForm({
                          length_size: rawValue,
                          format_length_size: formatted,
                        });
                      }}
                      size={size}
                      disabled={stateForm.action === "view"}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Inner Diameter Size"
                      placeholder="2 digits behind point"
                      key={formItemRawMaterial.key(".inner_diameter_size")}
                      {...formItemRawMaterial.getInputProps(
                        "item_raw_material.inner_diameter_size"
                      )}
                      maxLength={4}
                      onChange={(event) => {
                        formItemRawMaterial
                          .getInputProps(
                            "item_raw_material.inner_diameter_size"
                          )
                          .onChange(event);
                        const rawValue = event.currentTarget.value;
                        const formatted = formatDiameter(rawValue);
                        updateStateForm({
                          inner_diameter_size: rawValue,
                          format_inner_diameter_size: formatted,
                        });
                      }}
                      size={size}
                      disabled={stateForm.action === "view"}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxSurface}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxSurface.closeDropdown();
                        comboboxSurface.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Surface Finishing"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_surface ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_surface",
                                    ""
                                  );
                                  updateStateForm({
                                    code_item_surface: "",
                                    desc_item_surface: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxSurface.toggleDropdown()}
                          key={formItemRawMaterial.key(
                            "item_raw_material.id_item_surface"
                          )}
                          {...formItemRawMaterial.getInputProps(
                            "item_raw_material.id_item_surface"
                          )}
                          size={size}
                          disabled={stateForm.action === "view"}
                        >
                          {stateForm.desc_item_surface || (
                            <Input.Placeholder>
                              Surface Finihsing
                            </Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_surface}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_surface: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Surface Finihsing"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsSurface.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectSurfaces &&
                                  !isFetchingNextPageSelectSurfaces
                                ) {
                                  fetchNextPageSelectSurfaces();
                                }
                              }
                            }}
                          >
                            {optionsSurface.length > 0 ? (
                              optionsSurface
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxSource}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxSource.closeDropdown();
                        comboboxSource.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="Sourcing"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.desc_item_source ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item_raw_material.id_item_source",
                                    ""
                                  );
                                  updateStateForm({
                                    code_item_source: "",
                                    desc_item_source: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxSource.toggleDropdown()}
                          key={formItemRawMaterial.key(
                            "item_raw_material.id_item_source"
                          )}
                          {...formItemRawMaterial.getInputProps(
                            "item_raw_material.id_item_source"
                          )}
                          size={size}
                          disabled={stateForm.action === "view"}
                        >
                          {stateForm.desc_item_source || (
                            <Input.Placeholder>Sourcing</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.desc_item_source}
                          onChange={(event) =>
                            updateStateForm({
                              desc_item_source: event.currentTarget.value,
                            })
                          }
                          placeholder="Search Sourcing"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsSource.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectSources &&
                                  !isFetchingNextPageSelectSources
                                ) {
                                  fetchNextPageSelectSources();
                                }
                              }
                            }}
                          >
                            {optionsSource.length > 0 ? (
                              optionsSource
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Combobox
                      store={comboboxUoM}
                      resetSelectionOnOptionHover
                      onOptionSubmit={() => {
                        comboboxUoM.closeDropdown();
                        comboboxUoM.updateSelectedOptionIndex("active");
                      }}
                    >
                      <Combobox.Target targetType="button">
                        <InputBase
                          label="UoM"
                          component="button"
                          type="button"
                          pointer
                          rightSection={
                            stateForm.uom ? (
                              <CloseButton
                                size={16}
                                onClick={() => {
                                  formItemRawMaterial.setFieldValue(
                                    "item.id_uom",
                                    ""
                                  );
                                  updateStateForm({
                                    uom: "",
                                  });
                                }}
                                disabled={stateForm.action === "view"}
                              />
                            ) : (
                              <Combobox.Chevron />
                            )
                          }
                          rightSectionPointerEvents="all"
                          onClick={() => comboboxUoM.toggleDropdown()}
                          key={formItemRawMaterial.key("item.id_uom")}
                          {...formItemRawMaterial.getInputProps("item.id_uom")}
                          size={size}
                          disabled={stateForm.action === "view"}
                        >
                          {stateForm.uom || (
                            <Input.Placeholder>UoM</Input.Placeholder>
                          )}
                        </InputBase>
                      </Combobox.Target>
                      <Combobox.Dropdown>
                        <Combobox.Search
                          value={stateForm.uom}
                          onChange={(event) =>
                            updateStateForm({
                              uom: event.currentTarget.value,
                            })
                          }
                          placeholder="Search UoM"
                        />
                        <Combobox.Options>
                          <ScrollArea.Autosize
                            type="scroll"
                            mah={heightDropdown}
                            onScrollPositionChange={(position) => {
                              let maxY = 400;
                              const dataCount = optionsUoM.length;
                              const multipleOf10 =
                                Math.floor(dataCount / 10) * 10;
                              if (position.y >= maxY) {
                                maxY += Math.floor(multipleOf10 / 10) * 400;
                                if (
                                  hasNextPageSelectUoMs &&
                                  !isFetchingNextPageSelectUoMs
                                ) {
                                  fetchNextPageSelectUoMs();
                                }
                              }
                            }}
                          >
                            {optionsUoM.length > 0 ? (
                              optionsUoM
                            ) : (
                              <Combobox.Empty>Nothing found</Combobox.Empty>
                            )}
                          </ScrollArea.Autosize>
                        </Combobox.Options>
                      </Combobox.Dropdown>
                    </Combobox>
                  </Grid.Col>
                </Grid>
              </fieldset>
              <fieldset>
                <legend>Remarks</legend>
                <Textarea
                  placeholder="Remarks"
                  rows={3}
                  key={formItemRawMaterial.key("item.remarks")}
                  {...formItemRawMaterial.getInputProps("item.remarks")}
                  size={size}
                  disabled={stateForm.action === "view"}
                />
              </fieldset>
            </Stack>
          </ScrollArea>
          <Group justify="center" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormItemRawMaterial}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={isPendingMutateCreateItem || isPendingMutateUpdateItem}
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
          Are you sure you want to delete this item Raw Material?
        </Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormItemRawMaterial}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteItem}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingItemRawMaterials && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessItemRawMaterials ? (
        dataItemRawMaterials?.data?.pagination.total_rows > 0 ? (
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
                  name: "INFOR Code",
                },
                {
                  name: "INFOR Description",
                },
                {
                  name: "UoM",
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
              from={dataItemRawMaterials.data.pagination.from}
              to={dataItemRawMaterials.data.pagination.to}
              totalPages={dataItemRawMaterials.data.pagination.total_pages}
              totalRows={dataItemRawMaterials.data.pagination.total_rows}
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
        !isLoadingItemRawMaterials && <NoDataFound />
      )}
    </Stack>
  );
};

export default ItemRawMaterialPage;
