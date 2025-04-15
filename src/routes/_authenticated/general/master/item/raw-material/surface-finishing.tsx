import { createFileRoute } from "@tanstack/react-router";
import ItemSurfaceFinishingPage from "../../../../../../pages/general/master/item/rawMaterial/SurfaceFinishing";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/surface-finishing"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemSurfaceFinishingPage />;
}
