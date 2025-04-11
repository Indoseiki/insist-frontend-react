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
import { ItemProduct } from "../../../../../types/itemProduct";
import {
  useCreateItemProduct,
  useDeleteItemProduct,
  useItemProductsQuery,
  useUpdateItemProduct,
} from "../../../../../hooks/itemProduct";
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
import { createActivityLog } from "../../../../../api/activityLog";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../../../types/response";
import { useRolePermissionQuery } from "../../../../../hooks/rolePermission";
import { useLocation } from "@tanstack/react-router";
import { useItemCategoryQuery } from "../../../../../hooks/itemCategory";

interface StateFilter {
  search: string;
}

const ItemProductPage = () => {
  const location = useLocation();

  const { size, sizeButton, fullWidth } = useSizes();

  const { colorScheme } = useMantineColorScheme();

  const [
    openedFormItemProduct,
    { open: openFormItemProduct, close: closeFormItemProduct },
  ] = useDisclosure(false);
  const [openedFormDelete, { open: openFormDelete, close: closeFormDelete }] =
    useDisclosure(false);

  const [stateTable, setStateTable] = useState<StateTable<ItemProduct>>({
    activePage: 1,
    rowsPerPage: "20",
    selected: null,
    sortBy: "code",
    sortDirection: false,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>({
    search: "",
  });

  const [stateForm, setStateForm] = useState<StateForm>({
    title: "",
    action: "",
  });

  const updateStateTable = (newState: Partial<StateTable<ItemProduct>>) =>
    setStateTable((prev) => ({ ...prev, ...newState }));

  const updateStateFilter = (newState: Partial<StateFilter>) =>
    setStateFilter((prev) => ({ ...prev, ...newState }));

  const updateStateForm = (newState: Partial<StateForm>) =>
    setStateForm((prev) => ({ ...prev, ...newState }));

  const handleClickRow = (row: ItemProduct) =>
    updateStateTable({ selected: row });

  const { data: dataItemCategory, isSuccess: isSuccessItemCategory } =
    useItemCategoryQuery("A");

  const {
    data: dataItemProducts,
    isSuccess: isSuccessItemProducts,
    isLoading: isLoadingItemProducts,
    refetch: refetchItemProducts,
  } = useItemProductsQuery({
    page: stateTable.activePage,
    rows: stateTable.rowsPerPage,
    search: stateFilter.search,
    sortBy: stateTable.sortBy,
    sortDirection: stateTable.sortDirection,
    categoryCode: "A",
  });

  const {
    mutate: mutateCreateItemProduct,
    isPending: isPendingMutateCreateItemProduct,
  } = useCreateItemProduct();

  const {
    mutate: mutateUpdateItemProduct,
    isPending: isPendingMutateUpdateItemProduct,
  } = useUpdateItemProduct();

  const {
    mutate: mutateDeleteItemProduct,
    isPending: isPendingMutateDeleteItemProduct,
  } = useDeleteItemProduct();

  const os = useOs();
  const { data: dataUser } = useUserInfoQuery();
  const { data: dataRolePermission } = useRolePermissionQuery(
    location.pathname
  );

  const rows = useMemo(() => {
    if (
      !isSuccessItemProducts ||
      !dataItemProducts?.data?.pagination.total_rows
    )
      return null;

    return dataItemProducts.data.items.map((row: ItemProduct) => {
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
          <Table.Td w="250px">{row.remarks}</Table.Td>
          <Table.Td w="150px">{row.updated_by?.name}</Table.Td>
          <Table.Td w="150px">{formatDateTime(row.updated_at)}</Table.Td>
        </Table.Tr>
      );
    });
  }, [
    isSuccessItemProducts,
    dataItemProducts,
    stateTable.selected,
    colorScheme,
  ]);

  const formItemProduct = useForm<Partial<ItemProduct>>({
    mode: "uncontrolled",
    initialValues: {
      id_item_category: 0,
      code: "",
      description: "",
      remarks: "",
    },

    validate: {
      code: (value) => (value?.length === 0 ? "Code is required" : null),
      description: (value) =>
        value?.length === 0 ? "Description is required" : null,
    },
  });

  const handleAddData = () => {
    formItemProduct.clearErrors();
    formItemProduct.reset();
    formItemProduct.setFieldValue(
      "id_item_category",
      dataItemCategory?.data.id
    );
    updateStateForm({
      title: "Add Data",
      action: "add",
    });
    openFormItemProduct();
  };

  const handleEditData = () => {
    formItemProduct.clearErrors();
    formItemProduct.reset();
    formItemProduct.setFieldValue(
      "id_item_category",
      dataItemCategory?.data.id
    );
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

    formItemProduct.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormItemProduct();
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
    formItemProduct.clearErrors();
    formItemProduct.reset();

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

    formItemProduct.setValues({
      code: stateTable.selected.code,
      description: stateTable.selected.description,
      remarks: stateTable.selected.remarks,
    });

    openFormItemProduct();
  };

  const handleSubmitForm = () => {
    const dataItemProduct = formItemProduct.getValues();

    if (stateForm.action === "add") {
      mutateCreateItemProduct(dataItemProduct, {
        onSuccess: async (res) => {
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: true,
            os: os,
            message: `${res?.message} (${dataItemProduct.code})`,
          });

          notifications.show({
            title: "Created Successfully!",
            message: res.message,
            color: "green",
          });

          refetchItemProducts();
          closeFormItemProduct();
        },
        onError: async (err) => {
          const error = err as AxiosError<ApiResponse<null>>;
          const res = error.response;
          await createActivityLog({
            username: dataUser?.data.username,
            action: "Create",
            is_success: false,
            os: os,
            message: `${res?.data.message} (${dataItemProduct.code})`,
          });

          notifications.show({
            title: "Created Failed!",
            message:
              "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
            color: "red",
          });

          closeFormItemProduct();
        },
      });
    }

    if (stateForm.action === "edit") {
      mutateUpdateItemProduct(
        {
          id: stateTable.selected?.id!,
          params: dataItemProduct,
        },
        {
          onSuccess: async (res) => {
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: true,
              os: os,
              message: `${res?.message} (${stateTable.selected?.code} ⮕ ${dataItemProduct.code})`,
            });

            notifications.show({
              title: "Updated Successfully!",
              message: res.message,
              color: "green",
            });

            updateStateTable({ selected: null });
            refetchItemProducts();
            closeFormItemProduct();
          },
          onError: async (err) => {
            const error = err as AxiosError<ApiResponse<null>>;
            const res = error.response;
            await createActivityLog({
              username: dataUser?.data.username,
              action: "Update",
              is_success: false,
              os: os,
              message: `${res?.data.message} (${stateTable.selected?.code} ⮕ ${dataItemProduct.code})`,
            });

            notifications.show({
              title: "Updated Failed!",
              message:
                "Action failed due to system restrictions. Please check your data and try again, or contact support for assistance.",
              color: "red",
            });

            closeFormItemProduct();
          },
        }
      );
    }

    if (stateForm.action === "delete") {
      mutateDeleteItemProduct(stateTable.selected?.id!, {
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
          refetchItemProducts();
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

  const handleCloseFormItemProduct = () => {
    if (stateForm.action === "delete") {
      closeFormDelete();
    } else {
      closeFormItemProduct();
    }
    formItemProduct.clearErrors();
    formItemProduct.reset();
  };

  return (
    <Stack h="100%">
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
              onClick: () => handleAddData(),
              access: dataRolePermission?.data.is_create,
            },
            {
              icon: IconEdit,
              label: "Edit",
              onClick: () => handleEditData(),
              access: dataRolePermission?.data.is_update,
            },
            {
              icon: IconTrash,
              label: "Delete",
              onClick: () => handleDeleteData(),
              access: dataRolePermission?.data.is_delete,
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
        opened={openedFormItemProduct}
        onClose={closeFormItemProduct}
        title={stateForm.title}
        closeOnClickOutside={false}
      >
        <form onSubmit={formItemProduct.onSubmit(handleSubmitForm)}>
          <Stack gap={5}>
            <TextInput
              label="Code"
              placeholder="Code"
              key={formItemProduct.key("code")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formItemProduct.getInputProps("code")}
            />
            <TextInput
              label="Description"
              placeholder="Description"
              key={formItemProduct.key("description")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formItemProduct.getInputProps("description")}
            />
            <Textarea
              label="Remarks"
              placeholder="Remarks"
              autosize
              minRows={2}
              maxRows={4}
              key={formItemProduct.key("remarks")}
              size={size}
              disabled={stateForm.action === "view"}
              {...formItemProduct.getInputProps("remarks")}
            />
          </Stack>
          <Group justify="end" gap={5} mt="md">
            <Button
              leftSection={<IconX size={16} />}
              variant="default"
              size={sizeButton}
              onClick={handleCloseFormItemProduct}
            >
              Close
            </Button>
            {stateForm.action !== "view" && (
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                type="submit"
                size={sizeButton}
                loading={
                  isPendingMutateCreateItemProduct ||
                  isPendingMutateUpdateItemProduct
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
        <Text size={size}>Are you sure you want to delete this Product?</Text>
        <Group justify="end" gap={5} mt="md">
          <Button
            leftSection={<IconX size={16} />}
            variant="default"
            size={sizeButton}
            onClick={handleCloseFormItemProduct}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconTrash size={16} />}
            type="submit"
            size={sizeButton}
            color="red"
            loading={isPendingMutateDeleteItemProduct}
            onClick={handleSubmitForm}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      {isLoadingItemProducts && (
        <Center flex={1}>
          <Loader size={100} />
        </Center>
      )}
      {isSuccessItemProducts ? (
        dataItemProducts?.data?.pagination.total_rows > 0 ? (
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
              rows={rows}
            />
            <TableFooter
              from={dataItemProducts.data.pagination.from}
              to={dataItemProducts.data.pagination.to}
              totalPages={dataItemProducts.data.pagination.total_pages}
              totalRows={dataItemProducts.data.pagination.total_rows}
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
        !isLoadingItemProducts && <NoDataFound />
      )}
    </Stack>
  );
};

export default ItemProductPage;
