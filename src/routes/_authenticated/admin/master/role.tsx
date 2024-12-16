import { createFileRoute } from "@tanstack/react-router";
import RolePage from "../../../../pages/admin/master/Role";

export const Route = createFileRoute("/_authenticated/admin/master/role")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RolePage />;
}
