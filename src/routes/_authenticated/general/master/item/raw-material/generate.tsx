import { createFileRoute } from "@tanstack/react-router";
import ItemRawMaterialPage from "../../../../../../pages/general/master/item/rawMaterial/Generate";

export const Route = createFileRoute(
  "/_authenticated/general/master/item/raw-material/generate"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ItemRawMaterialPage />;
}
