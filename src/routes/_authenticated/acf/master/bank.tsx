import { createFileRoute } from "@tanstack/react-router";
import BankPage from "../../../../pages/acf/master/Bank";

export const Route = createFileRoute("/_authenticated/acf/master/bank")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BankPage />;
}
