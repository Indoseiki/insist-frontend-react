import { createFileRoute } from "@tanstack/react-router";
import WarehousePage from "../../../../pages/pid/master/Warehouse";

export const Route = createFileRoute("/_authenticated/pid/master/warehouse")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WarehousePage />;
}
