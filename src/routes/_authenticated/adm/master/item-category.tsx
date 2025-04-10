import { createFileRoute } from "@tanstack/react-router";
import ItemCategoryPage from "../../../../pages/admin/master/ItemCategory";

export const Route = createFileRoute(
  "/_authenticated/adm/master/item-category"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemCategoryPage />;
}
