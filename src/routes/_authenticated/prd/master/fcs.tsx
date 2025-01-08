import { createFileRoute } from "@tanstack/react-router";
import FCSPage from "../../../../pages/prd/master/FCS";

export const Route = createFileRoute("/_authenticated/prd/master/fcs")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FCSPage />;
}
