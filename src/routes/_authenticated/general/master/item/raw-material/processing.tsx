import { createFileRoute } from "@tanstack/react-router";
import ItemProcessingPage from "../../../../../../pages/general/master/item/rawMaterial/Processing";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/processing"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemProcessingPage />;
}
