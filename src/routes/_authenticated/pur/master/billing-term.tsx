import { createFileRoute } from "@tanstack/react-router";
import BillingTermPage from "../../../../pages/general/master/BillingTerm";

export const Route = createFileRoute("/_authenticated/pur/master/billing-term")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return <BillingTermPage />;
}
