import { createFileRoute } from "@tanstack/react-router";
import BuildingPage from "../../../../pages/prd/master/Building";

export const Route = createFileRoute("/_authenticated/prd/master/building")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BuildingPage />;
}
