import { createFileRoute } from "@tanstack/react-router";
import ItemProductPage from "../../../../../../pages/general/master/item/rawMaterial/Product";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/product"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemProductPage />;
}
