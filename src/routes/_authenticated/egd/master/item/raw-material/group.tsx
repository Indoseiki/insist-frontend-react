import { createFileRoute } from "@tanstack/react-router";
import ItemGroupPage from "../../../../../../pages/egd/master/item/rawMaterial/Group";

export const Route = createFileRoute(
  "/_authenticated/egd/master/item/raw-material/group"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemGroupPage />;
}
