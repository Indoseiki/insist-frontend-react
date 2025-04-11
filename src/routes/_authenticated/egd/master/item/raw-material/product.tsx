import { createFileRoute } from "@tanstack/react-router";
import ItemProductPage from "../../../../../../pages/egd/master/item/rawMaterial/Product";

export const Route = createFileRoute(
  "/_authenticated/egd/master/item/raw-material/product"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemProductPage />;
}
