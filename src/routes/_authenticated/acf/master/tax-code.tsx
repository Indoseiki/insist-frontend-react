import { createFileRoute } from "@tanstack/react-router";
import TaxCodePage from "../../../../pages/acf/master/TaxCode";

export const Route = createFileRoute("/_authenticated/acf/master/tax-code")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TaxCodePage />;
}
