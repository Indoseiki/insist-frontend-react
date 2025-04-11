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
  useCreateItemProductType,
  useDeleteItemProductType,
  useItemProductTypesQuery,
  useUpdateItemProductType,
} from "../../../../../hooks/itemProductType";
import { ItemProduct } from "../../../../../types/itemProduct";
import {
  useCreateItemProduct,
  useDeleteItemProduct,
  useItemProductsQuery,
  useUpdateItemProduct,
} from "../../../../../hooks/itemProduct";
import { useItemCategoryQuery } from "../../../../../hooks/itemCategory";
import { ItemProductType } from "../../../../../types/itemProductType";

interface StateFilterProduct {
  search: string;
}

interface StateFilterProductType {
  search: string;
  idItemProduct: string;
}

const ItemProductPage = () => {
  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormProduct,
    { open: openFormProduct, close: closeFormProduct },
  ] = useDisclosure(false);

  const [
    openedFormDeleteProduct,
    { open: openFormDeleteProduct, close: closeFormDeleteProduct },
  ] = useDisclosure(false);

  const [
    openedFormProductType,
    { open: openFormProductType, close: closeFormProductType },
  ] = useDisclosure(false);

  const [
    openedFormDeleteProductType,
    { open: openFormDeleteProductType, close: closeFormDeleteProductType },
  ] = useDisclosure(false);

  const [stateTableProduct, setStateTableProduct] = useState<
    StateTable<ItemProduct>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilterProduct, setStateFilterProduct] =
    useState<StateFilterProduct>({
      search: "",
    });

  const [stateFormProduct, setStateFormProduct] = useState<StateForm>({
    title: "",
    action: "",
  });

  const [stateTableProductType, setStateTableProductType] = useState<
    StateTable<ItemProductType>
  >({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilterProductType, setStateFilterProductType] =
    useState<StateFilterProductType>({
      search: "",
      idItemProduct: "",
    });

  const [stateFormProductType, setStateFormProductType] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTableProduct = (
    newState: Partial<StateTable<ItemProduct>>
  ) => setStateTableProduct((prev) => ({ ...prev, ...newState }));

  const updateStateFilterProduct = (newState: Partial<StateFilterProduct>) =>
    setStateFilterProduct((prev) => ({ ...prev, ...newState }));

  const updateStateFormProduct = (newState: Partial<StateForm>) =>
    setStateFormProduct((prev) => ({ ...prev, ...newState }));

  const handleClickRowProduct = (row: ItemProduct) => {
    updateStateTableProduct({ selected: row });
  };

  const updateStateTableProductType = (
    newState: Partial<StateTable<ItemProductType>>
  ) => setStateTableProductType((prev) => ({ ...prev, ...newState }));

  const updateStateFilterProductType = (
    newState: Partial<StateFilterProductType>
  ) => setStateFilterProductType((prev) => ({ ...prev, ...newState }));

  const updateStateFormProductType = (newState: Partial<StateForm>) =>
    setStateFormProductType((prev) => ({ ...prev, ...newState }));

  const handleClickRowProductType = (row: ItemProductType) => {
    updateStateTableProductType({ selected: row });
  };

  const { data: dataCategory } = useItemCategoryQuery("A");

  const {
    data: dataProducts,
    isSuccess: isSuccessProducts,
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useItemProductsQuery({
    page: stateTableProduct.activePage,
    rows: stateTableProduct.rowsPerPage,
    search: stateFilterProduct.search,
    sortBy: stateTableProduct.sortBy,
    sortDirection: stateTableProduct.sortDirection,
    categoryCode: "A",
  });

  const {
    data: dataProductTypes,
    isSuccess: isSuccessProductTypes,
    isLoading: isLoadingProductTypes,
    refetch: refetchProductTypes,
  } = useItemProductTypesQuery({
    page: stateTableProductType.activePage,
    rows: stateTableProductType.rowsPerPage,
    idItemProduct: stateFilterProductType.idItemProduct,
    search: stateFilterProductType.search,
    sortBy: stateTableProductType.sortBy,
    sortDirection: stateTableProductType.sortDirection,
  });

  const {
    mutate: mutateCreateProduct,
    isPending: isPendingMutateCreateProduct,
  } = useCreateItemProduct();

  const {
    mutate: mutateUpdateProduct,
    isPending: isPendingMutateUpdateProduct,
  } = useUpdateItemProduct();

  const {
    mutate: mutateDeleteProduct,
    isPending: isPendingMutateDeleteProduct,
  } = useDeleteItemProduct();

  const {
    mutate: mutateCreateProductType,
    isPending: isPendingMutateCreateProductType,
  } = useCreateItemProductType();

  const {
    mutate: mutateUpdateProductType,
    isPending: isPendingMutateUpdateProductType,
  } = useUpdateItemProductType();

  const {
    mutate: mutateDeleteProductType,
    isPending: isPendingMutateDeleteProductType,
  } = useDeleteItemProductType();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataProductPermission } = useRolePermissionQuery(
    location.pathname
  );

  const rowsProduct = useMemo(() => {
    if (!isSuccessProducts || !dataProducts?.data?.pagination.total_rows)
      return null;

    return dataProducts.data.items.map((row: ItemProduct) => {
      const isSelected = stateTableProduct.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowProduct(row);
            updateStateFilterProductType({ idItemProduct: row.id.toString() });
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
    isSuccessProducts,
    dataProducts,
    stateTableProduct.selected,
    colorScheme,
  ]);

  const rowsProductType = useMemo(() => {
    if (
      !isSuccessProductTypes ||
      !dataProductTypes?.data?.pagination.total_rows
    )
      return null;

    return dataProductTypes.data.items.map((row: ItemProductType) => {
      const isSelected = stateTableProductType.selected?.id === row.id;
      const rowBg = isSelected
        ? colorScheme === "light"
          ? "#f8f9fa"
          : "#2e2e2e"
        : undefined;

      return (
        <Table.Tr
          key={row.id}
          onClick={() => {
            handleClickRowProductType(row);
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
    isSuccessProductTypes,
    dataProductTypes,
    stateTableProductType.selected,
    colorScheme,
  ]);

  const formProduct = useForm<Partial<ItemProduct>>({
    mode: "uncontrolled",
    initialValues: {
      id_item_category: 0,
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

  const formProductType = useForm<Partial<ItemProductType>>({
    mode: "uncontrolled",
    initialValues: {
      id_item_product: 0,
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

  const handleAddDataProduct = () => {
    formProduct.clearErrors();
    formProduct.reset();
    formProduct.setFieldValue("id_item_category", dataCategory?.data.id);
    updateStateFormProduct({
      title: "Add Data",
      action: "add",
    });
    openFormProduct();
  };

  const handleEditDataProduct = () => {
    formProduct.clearErrors();
    formProduct.reset();
    formProduct.setFieldValue("id_item_category", dataCategory?.data.id);

    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to product before proceeding",
      });
      return;
    }

    updateStateFormProduct({
      title: "Edit Data",
      action: "edit",
    });

    formProduct.setValues({
      code: stateTableProduct.selected.code,
      description: stateTableProduct.selected.description,
      remarks: stateTableProduct.selected.remarks,
    });

    openFormProduct();
  };

  const handleDeleteDataProduct = () => {
    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to product before proceeding",
      });
      return;
    }

    updateStateFormProduct({ title: "Delete Data", action: "delete" });
    openFormDeleteProduct();
  };

  const handleViewDataProduct = () => {
    formProduct.clearErrors();
    formProduct.reset();

    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data First!",
        message: "Please select the data you want to product before proceeding",
      });
      return;
    }

    updateStateFormProduct({
      title: "View Data",
      action: "view",
    });

    formProduct.setValues({
      code: stateTableProduct.selected.code,
      description: stateTableProduct.selected.description,
      remarks: stateTableProduct.selected.remarks,
    });

    openFormProduct();
  };

  const handleSubmitFormProduct = () => {
    const dataProduct = formProduct.getValues();

    if (stateFormProduct.action === "add") {
      mutateCreateProduct(dataProduct, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataProduct.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchProducts();
          closeFormProduct();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataProduct.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormProduct();
        },
      });
    }

    if (stateFormProduct.action === "edit") {
      mutateUpdateProduct(
        {
          id: stateTableProduct.selected?.id!,
          params: dataProduct,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableProduct.selected?.code} ⮕ ${dataProduct.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableProduct({ selected: null });
            refetchProducts();
            closeFormProduct();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableProduct.selected?.code} ⮕ ${dataProduct.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormProduct();
          },
        }
      );
    }

    if (stateFormProduct.action === "delete") {
      mutateDeleteProduct(stateTableProduct.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableProduct.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableProduct({ selected: null });
          refetchProducts();
          closeFormDeleteProduct();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableProduct.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteProduct();
        },
      });
    }
  };

  const handleCloseFormProduct = () => {
    if (stateFormProduct.action === "delete") {
      closeFormDeleteProduct();
    } else {
      closeFormProduct();
    }
    formProduct.clearErrors();
    formProduct.reset();
  };

  const handleAddDataProductType = () => {
    formProductType.clearErrors();
    formProductType.reset();

    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data Product First!",
        message:
          "Please select the data product you want to process before proceeding",
      });
      return;
    }

    formProductType.setFieldValue(
      "id_item_product",
      stateTableProduct.selected.id
    );

    updateStateFormProductType({
      title: "Add Data",
      action: "add",
    });
    openFormProductType();
  };

  const handleEditDataProductType = () => {
    formProductType.clearErrors();
    formProductType.reset();

    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data Product First!",
        message:
          "Please select the data product you want to process before proceeding",
      });
      return;
    }

    updateStateFormProductType({
      title: "Edit Data",
      action: "edit",
    });

    formProductType.setValues({
      id_item_product: stateTableProductType.selected?.id_item_product,
      code: stateTableProductType.selected?.code,
      description: stateTableProductType.selected?.description,
      remarks: stateTableProductType.selected?.remarks,
    });

    openFormProductType();
  };

  const handleDeleteDataProductType = () => {
    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data Product First!",
        message:
          "Please select the data product you want to process before proceeding",
      });
      return;
    }

    updateStateFormProductType({ title: "Delete Data", action: "delete" });
    openFormDeleteProductType();
  };

  const handleViewDataProductType = () => {
    formProductType.clearErrors();
    formProductType.reset();

    if (!stateTableProduct.selected) {
      notifications.show({
        title: "Select Data Product First!",
        message:
          "Please select the data product you want to process before proceeding",
      });
      return;
    }

    updateStateFormProductType({
      title: "View Data",
      action: "view",
    });

    formProductType.setValues({
      id_item_product: stateTableProductType.selected?.id_item_product,
      code: stateTableProductType.selected?.code,
      description: stateTableProductType.selected?.description,
      remarks: stateTableProductType.selected?.remarks,
    });

    openFormProductType();
  };

  const handleSubmitFormProductType = () => {
    const dataProductType = formProductType.getValues();

    if (stateFormProductType.action === "add") {
      mutateCreateProductType(dataProductType, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataProductType.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchProductTypes();
          closeFormProductType();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataProductType.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormProductType();
        },
      });
    }

    if (stateFormProductType.action === "edit") {
      mutateUpdateProductType(
        {
          id: stateTableProductType.selected?.id!,
          params: dataProductType,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTableProductType.selected?.code} ⮕ ${dataProductType.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTableProductType({ selected: null });
            refetchProductTypes();
            closeFormProductType();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTableProductType.selected?.code} ⮕ ${dataProductType.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormProductType();
          },
        }
      );
    }

    if (stateFormProductType.action === "delete") {
      mutateDeleteProductType(stateTableProduct.selected?.id!, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: true,
            os: os,
            message: `${res?.message} (${stateTableProductType.selected?.code})`,
          });

          notifications.show({
            title: "Deleted Successfully!",
            message: res.message,
            color: "green",
          });

          updateStateTableProductType({ selected: null });
          refetchProductTypes();
          closeFormDeleteProductType();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Delete",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${stateTableProductType.selected?.code}) `,
          });

          notifications.show({
            title: "Deleted Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormDeleteProductType();
        },
      });
    }
  };

  const handleCloseFormProductType = () => {
    if (stateFormProductType.action === "delete") {
      closeFormDeleteProductType();
    } else {
      closeFormProductType();
    }
    formProductType.clearErrors();
    formProductType.reset();
  };

  return (
    <Stack h="100%" gap={20}>
      <Stack h="50%">
        <PageHeader title="Product" />
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
                onClick: () => handleAddDataProduct(),
                access: dataProductPermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataProduct(),
                access: dataProductPermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataProduct(),
                access: dataProductPermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataProduct(),
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
              value={stateFilterProduct.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterProduct({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterProduct({ search: "" })}
                  style={{
                    display: stateFilterProduct.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormProduct}
          onClose={closeFormProduct}
          title={stateFormProduct.title}
          closeOnClickOutside={false}
        >
          <form onSubmit={formProduct.onSubmit(handleSubmitFormProduct)}>
            <Stack gap={5}>
              <TextInput
                label="Code"
                placeholder="Code"
                key={formProduct.key("code")}
                size={size}
                disabled={stateFormProduct.action === "view"}
                {...formProduct.getInputProps("code")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formProduct.key("description")}
                size={size}
                disabled={stateFormProduct.action === "view"}
                {...formProduct.getInputProps("description")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formProduct.key("remarks")}
                size={size}
                disabled={stateFormProduct.action === "view"}
                {...formProduct.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormProduct}
              >
                Close
              </Button>
              {stateFormProduct.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateProduct || isPendingMutateUpdateProduct
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteProduct}
          onClose={closeFormDeleteProduct}
          title={stateFormProduct.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>Are you sure you want to delete this product?</Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormProduct}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteProduct}
              onClick={handleSubmitFormProduct}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingProducts && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessProducts ? (
          dataProducts?.data?.pagination.total_rows > 0 ? (
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
                rows={rowsProduct}
              />
              <TableFooter
                from={dataProducts.data.pagination.from}
                to={dataProducts.data.pagination.to}
                totalPages={dataProducts.data.pagination.total_pages}
                totalRows={dataProducts.data.pagination.total_rows}
                rowsPerPage={stateTableProduct.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableProduct({ rowsPerPage: rows || "" })
                }
                activePage={stateTableProduct.activePage}
                onPageChange={(page: number) =>
                  updateStateTableProduct({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingProducts && <NoDataFound />
        )}
      </Stack>
      <Stack
        pt={10}
        h="50%"
        style={{
          borderTop: "1px solid gray",
        }}
      >
        <PageSubHeader title="Product Type" />
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
                onClick: () => handleAddDataProductType(),
                access: dataProductPermission?.data.is_create,
              },
              {
                icon: IconEdit,
                label: "Edit",
                onClick: () => handleEditDataProductType(),
                access: dataProductPermission?.data.is_update,
              },
              {
                icon: IconTrash,
                label: "Delete",
                onClick: () => handleDeleteDataProductType(),
                access: dataProductPermission?.data.is_delete,
              },
              {
                icon: IconBinoculars,
                label: "View",
                onClick: () => handleViewDataProductType(),
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
              value={stateFilterProductType.search}
              w={{ base: "100%", sm: 200 }}
              onChange={(event) =>
                updateStateFilterProductType({
                  search: event.currentTarget.value,
                })
              }
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={() => updateStateFilterProductType({ search: "" })}
                  style={{
                    display: stateFilterProductType.search ? undefined : "none",
                  }}
                />
              }
            />
          </Flex>
        </Flex>
        <Modal
          opened={openedFormProductType}
          onClose={closeFormProductType}
          title={stateFormProductType.title}
          closeOnClickOutside={false}
        >
          <form
            onSubmit={formProductType.onSubmit(handleSubmitFormProductType)}
          >
            <Stack gap={5}>
              <TextInput
                label="Code"
                placeholder="Code"
                key={formProductType.key("code")}
                size={size}
                disabled={stateFormProductType.action === "view"}
                {...formProductType.getInputProps("code")}
              />
              <TextInput
                label="Description"
                placeholder="Description"
                key={formProductType.key("description")}
                size={size}
                disabled={stateFormProductType.action === "view"}
                {...formProductType.getInputProps("description")}
              />
              <Textarea
                label="Remarks"
                placeholder="Remarks"
                autosize
                minRows={2}
                maxRows={4}
                key={formProductType.key("remarks")}
                size={size}
                disabled={stateFormProductType.action === "view"}
                {...formProductType.getInputProps("remarks")}
              />
            </Stack>
            <Group justify="end" gap={5} mt="md">
              <Button
                leftSection={<IconX size={16} />}
                variant="default"
                size={sizeButton}
                onClick={handleCloseFormProductType}
              >
                Close
              </Button>
              {stateFormProductType.action !== "view" && (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  type="submit"
                  size={sizeButton}
                  loading={
                    isPendingMutateCreateProductType ||
                    isPendingMutateUpdateProductType
                  }
                >
                  Save
                </Button>
              )}
            </Group>
          </form>
        </Modal>
        <Modal
          opened={openedFormDeleteProductType}
          onClose={closeFormDeleteProductType}
          title={stateFormProductType.title}
          centered
          closeOnClickOutside={false}
        >
          <Text size={size}>
            Are you sure you want to delete this item Product Type?
          </Text>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormProductType}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              type="submit"
              size={sizeButton}
              color="red"
              loading={isPendingMutateDeleteProductType}
              onClick={handleSubmitFormProductType}
            >
              Delete
            </Button>
          </Group>
        </Modal>
        {isLoadingProductTypes && (
          <Center flex={1}>
            <Loader size={100} />
          </Center>
        )}
        {isSuccessProductTypes ? (
          dataProductTypes?.data?.pagination.total_rows > 0 ? (
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
                rows={rowsProductType}
              />
              <TableFooter
                from={dataProductTypes.data.pagination.from}
                to={dataProductTypes.data.pagination.to}
                totalPages={dataProductTypes.data.pagination.total_pages}
                totalRows={dataProductTypes.data.pagination.total_rows}
                rowsPerPage={stateTableProductType.rowsPerPage}
                onRowsPerPageChange={(rows) =>
                  updateStateTableProductType({ rowsPerPage: rows || "" })
                }
                activePage={stateTableProductType.activePage}
                onPageChange={(page: number) =>
                  updateStateTableProductType({ activePage: page })
                }
              />
            </>
          ) : (
            <NoDataFound />
          )
        ) : (
          !isLoadingProductTypes &&
          (stateFilterProductType.idItemProduct ? (
            <NoDataFound
              subTitle="There is no itemProductType data in the product"
              remarks="Please add the itemProductType to the product"
            />
          ) : (
            <NoDataFound
              subTitle="There is no itemProductType data in the product"
              remarks="Please select the product first"
            />
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default ItemProductPage;
