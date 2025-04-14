import { createFileRoute } from "@tanstack/react-router";
import ItemProcessingPage from "../../../../../../pages/egd/master/item/rawMaterial/Processing";

export const Route = createFileRoute(
  "/_authenticated/egd/master/item/raw-material/processing"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemProcessingPage />;
}
