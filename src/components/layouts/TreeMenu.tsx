import {
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import {
  Group,
  RenderTreeNodePayload,
  Skeleton,
  Stack,
  Tree,
  TreeNodeData,
} from "@mantine/core";
import styles from "../../assets/styles/TreeMenu.module.css";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useTreeMenuUser } from "../../hooks/menu";
import { Menu } from "../../types/menu";

interface FileIconProps {
  props: any;
  isFolder: boolean;
  expanded: boolean;
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
}: RenderTreeNodePayload) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === node.value;

  const handleClick = (event: React.MouseEvent) => {
    elementProps.onClick(event);

    if (!hasChildren && !event.defaultPrevented) {
      navigate({ to: node.value });
    }
  };

  return (
    <Group
      {...elementProps}
      gap={5}
      data-selected={isActive || elementProps["data-selected"]}
      onClick={handleClick}
      style={{ borderRadius: "5px" }}
    >
      <FileIcon
        props={node.nodeProps}
        isFolder={hasChildren}
        expanded={expanded}
      />
      <span>{node.label}</span>
    </Group>
  );
}

function transformMenuData(menu: Menu[]): TreeNodeData[] {
  return menu.map((item) => ({
    label: item.label ?? "",
    value: item.path ?? "#",
    nodeProps: item,
    children: item.children ? transformMenuData(item.children) : undefined,
  }));
}

function TreeMenu() {
  const {
    data: dataTreeMenuUser,
    isSuccess: isSuccessTreeMenuUser,
    isLoading: isLoadingTreeMenuUser,
  } = useTreeMenuUser();

  const treeData: TreeNodeData[] = isSuccessTreeMenuUser
    ? transformMenuData(dataTreeMenuUser.data)
    : [];

  return (
    <>
      {isLoadingTreeMenuUser && (
        <Stack gap={6}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} height={35} />
          ))}
        </Stack>
      )}
      {isSuccessTreeMenuUser && (
        <Tree
          classNames={styles}
          selectOnClick
          data={treeData}
          renderNode={(payload) => <Leaf {...payload} />}
        />
      )}
    </>
  );
}

export default TreeMenu;
