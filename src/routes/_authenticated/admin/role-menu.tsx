import { createFileRoute } from "@tanstack/react-router";
import RoleMenuPage from "../../../pages/admin/RoleMenu";

export const Route = createFileRoute("/_authenticated/admin/role-menu")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoleMenuPage />;
}
