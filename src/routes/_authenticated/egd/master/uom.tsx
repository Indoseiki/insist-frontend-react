import { createFileRoute } from "@tanstack/react-router";
import UoMPage from "../../../../pages/egd/master/UoM";

export const Route = createFileRoute("/_authenticated/egd/master/uom")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UoMPage />;
}
