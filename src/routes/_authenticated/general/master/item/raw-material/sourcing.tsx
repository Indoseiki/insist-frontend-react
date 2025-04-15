import { createFileRoute } from "@tanstack/react-router";
import ItemSourcingPage from "../../../../../../pages/general/master/item/rawMaterial/Sourcing";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/sourcing"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemSourcingPage />;
}
