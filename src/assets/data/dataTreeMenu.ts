import { TreeNodeData } from "@mantine/core";

export const data: TreeNodeData[] = [
  {
    label: "Dashboard",
    value: "/",
  },
  {
    label: "Admin",
    value: "admin",
    children: [
      {
        label: "Master",
        value: "master",
        children: [
          { label: "Master User", value: "/admin/master/users" },
          { label: "Master Department", value: "/users/management/edit" },
          { label: "Master Menu", value: "/users/management/delete" },
        ],
      },
      {
        label: "Roles & Permissions",
        value: "users/roles",
      },
    ],
  },
  {
    label: "Settings",
    value: "settings",
    children: [
      {
        label: "General",
        value: "/settings/general",
      },
      {
        label: "Security",
        value: "/settings/security",
      },
      {
        label: "Notifications",
        value: "/settings/notifications",
      },
    ],
  },
  {
    label: "Logs",
    value: "logs",
    children: [
      {
        label: "Activity Logs",
        value: "/logs/activity",
      },
      {
        label: "System Logs",
        value: "/logs/system",
      },
    ],
  },
  {
    label: "Help",
    value: "help",
    children: [
      {
        label: "Documentation",
        value: "/help/documentation",
      },
      {
        label: "Support",
        value: "/help/support",
      },
    ],
  },
];
