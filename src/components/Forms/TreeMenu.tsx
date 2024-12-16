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

interface FileIconProps {
  props: any;
  isFolder: boolean;
  expanded: boolean;
}

interface TreeProps {
  isLoading: boolean;
  isSuccess: boolean;
  data: Menu[];
  checkedValues: string[];
  onChange: (checkedNodes: string[]) => void;
  disabled: boolean;
}

function getDescendants(node: TreeNodeData): string[] {
  let descendants: string[] = [node.value];

  if (node.children) {
    node.children.forEach((child) => {
      descendants = [...descendants, ...getDescendants(child)];
    });
  }

  return descendants;
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
  tree,
  onChange,
  checkedValues,
  disabled,
}: RenderTreeNodePayload & {
  onChange: (checkedNodes: string[]) => void;
  checkedValues: string[];
  disabled: boolean;
}) {
  const checked =
    checkedValues.includes(node.value) || tree.isNodeChecked(node.value);
  const indeterminate = tree.isNodeIndeterminate(node.value);

  const handleCheck = () => {
    if (!disabled) {
      if (!checked) {
        tree.checkNode(node.value);
        const allDescendants = getDescendants(node);
        const updatedCheckedNodes = [...checkedValues, ...allDescendants];
        const uniqueCheckedNodes = Array.from(new Set(updatedCheckedNodes));
        onChange(uniqueCheckedNodes);
      } else {
        tree.uncheckNode(node.value);
        const allDescendants = getDescendants(node);
        const updatedCheckedNodes = checkedValues.filter(
          (value) => !allDescendants.includes(value)
        );
        onChange(updatedCheckedNodes);
      }
    }
  };

  return (
    <Group
      {...elementProps}
      gap={5}
      data-selected={elementProps["data-selected"]}
      style={{ borderRadius: "5px" }}
    >
      <Checkbox.Indicator
        disabled={disabled}
        checked={checked}
        indeterminate={indeterminate}
        onClick={handleCheck}
      />
      <FileIcon
        props={node.nodeProps}
        isFolder={hasChildren}
        expanded={expanded}
      />
      <span>{node.label}</span>
    </Group>
  );
}

function transformMenuData(
  menu: Menu[],
  checkedValues: string[]
): TreeNodeData[] {
  return menu.map((item) => ({
    label: item.label ?? "",
    value: item.id.toString() ?? "#",
    nodeProps: item,
    children: item.children
      ? transformMenuData(item.children, checkedValues)
      : undefined,
  }));
}

function TreeMenu({
  isLoading,
  isSuccess,
  data,
  checkedValues,
  disabled,
  onChange,
}: TreeProps) {
  const treeData: TreeNodeData[] = isSuccess
    ? transformMenuData(data, checkedValues)
    : [];

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
            <Leaf
              {...payload}
              onChange={onChange}
              checkedValues={checkedValues}
              disabled={disabled}
            />
          )}
        />
      )}
    </>
  );
}

export default TreeMenu;
