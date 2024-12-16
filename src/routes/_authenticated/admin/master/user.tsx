import { createFileRoute } from "@tanstack/react-router";
import UserPage from "../../../../pages/admin/master/User";

export const Route = createFileRoute("/_authenticated/admin/master/user")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserPage />;
}
