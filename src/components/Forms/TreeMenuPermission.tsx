import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import {
  Checkbox,
  Group,
  RenderTreeNodePayload,
  Skeleton,
  Stack,
  Tree,
  TreeNodeData,
} from "@mantine/core";
import styles from "../../assets/styles/TreeMenu.module.css";
import { Menu } from "../../types/menu";
import { RolePermissionRequest } from "../../types/rolePermission";

interface FileIconProps {
  props: any;
  isFolder: boolean;
  expanded: boolean;
}

interface TreeProps {
  isLoading: boolean;
  isSuccess: boolean;
  data: Menu[];
  disabled: boolean;
  onChange: (data: RolePermissionRequest) => void;
}

function FileIcon({ props, isFolder, expanded }: FileIconProps) {
  if (isFolder) {
    return expanded ? (
      <IconFolderOpen
        color="var(--mantine-color-yellow-9)"
        size={16}
        stroke={2.5}
      />
    ) : (
      <IconFolder
        color="var(--mantine-color-yellow-9)"
        size={16}
        stroke={2.5}
      />
    );
  }

  if (props?.icon === "dashboard") {
    return (
      <IconLayoutDashboard
        color="var(--mantine-color-blue-5)"
        size={16}
        stroke={2.5}
      />
    );
  }

  return (
    <IconFile color="var(--mantine-color-blue-5)" size={16} stroke={2.5} />
  );
}

function Leaf({
  node,
  expanded,
  hasChildren,
  elementProps,
  disabled,
  onChange,
}: RenderTreeNodePayload & {
  onChange: (data: RolePermissionRequest) => void;
  disabled: boolean;
}) {
  return (
    <Group
      {...elementProps}
      gap={5}
      data-selected={elementProps["data-selected"]}
      style={{ borderRadius: "5px" }}
    >
      <FileIcon
        props={node.nodeProps}
        isFolder={hasChildren}
        expanded={expanded}
      />
      <span>{node.label}</span>
      {node.children?.length == 0 && (
        <Group gap={10} w="100%" justify="start" ms={20}>
          <Checkbox
            label="Create"
            size="xs"
            checked={node.nodeProps?.role_permissions?.is_create || false}
            disabled={disabled}
            onChange={(event) => {
              onChange({
                id_menu: node.nodeProps?.id || 0,
                id_role: parseInt(node.nodeProps?.role_permissions?.id_role),
                is_create: event.target.checked,
                is_update: node.nodeProps?.role_permissions?.is_update || false,
                is_delete: node.nodeProps?.role_permissions?.is_delete || false,
              });
            }}
          />
          <Checkbox
            label="Update"
            size="xs"
            checked={node.nodeProps?.role_permissions?.is_update || false}
            disabled={disabled}
            onChange={(event) => {
              onChange({
                id_menu: node.nodeProps?.id || 0,
                id_role: parseInt(node.nodeProps?.role_permissions?.id_role),
                is_create: node.nodeProps?.role_permissions?.is_create || false,
                is_update: event.target.checked,
                is_delete: node.nodeProps?.role_permissions?.is_delete || false,
              });
            }}
          />
          <Checkbox
            label="Delete"
            size="xs"
            checked={node.nodeProps?.role_permissions?.is_delete || false}
            disabled={disabled}
            onChange={(event) => {
              onChange({
                id_menu: node.nodeProps?.id || 0,
                id_role: parseInt(node.nodeProps?.role_permissions?.id_role),
                is_create: node.nodeProps?.role_permissions?.is_create || false,
                is_update: node.nodeProps?.role_permissions?.is_update || false,
                is_delete: event.target.checked,
              });
            }}
          />
        </Group>
      )}
    </Group>
  );
}

function transformMenuData(menu: Menu[] = []): TreeNodeData[] {
  return menu.map((item) => ({
    label: item.label || "",
    value: item.id.toString() || "",
    nodeProps: item,
    children: transformMenuData(item.children || []),
  }));
}

function TreeMenuPermission({
  isLoading,
  isSuccess,
  data,
  disabled,
  onChange,
}: TreeProps) {
  const treeData: TreeNodeData[] =
    isSuccess && Array.isArray(data) ? transformMenuData(data) : [];

  return (
    <>
      {isLoading && (
        <Stack gap={6}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} height={35} />
          ))}
        </Stack>
      )}
      {isSuccess && (
        <Tree
          classNames={styles}
          selectOnClick
          data={treeData}
          renderNode={(payload) => (
            <Leaf {...payload} disabled={disabled} onChange={onChange} />
          )}
        />
      )}
    </>
  );
}

export default TreeMenuPermission;
