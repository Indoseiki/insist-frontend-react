import { createFileRoute } from "@tanstack/react-router";
import ItemGroupPage from "../../../../../../pages/general/master/item/rawMaterial/Group";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/group"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemGroupPage />;
}
