import { createFileRoute } from "@tanstack/react-router";
import EmployeePage from "../../../../pages/admin/master/Employee";

export const Route = createFileRoute("/_authenticated/admin/master/employee")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployeePage />;
}
