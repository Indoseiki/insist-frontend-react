import { createFileRoute } from "@tanstack/react-router";
import CurrencyPage from "../../../../pages/acf/master/Currency";

export const Route = createFileRoute("/_authenticated/acf/master/currency")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CurrencyPage />;
}
