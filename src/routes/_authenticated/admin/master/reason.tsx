import { createFileRoute } from "@tanstack/react-router";
import ReasonPage from "../../../../pages/admin/master/Reason";

export const Route = createFileRoute("/_authenticated/admin/master/reason")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ReasonPage />;
}
