import { createFileRoute } from "@tanstack/react-router";
import ChartOfAccountPage from "../../../../pages/acf/master/ChartOfAccount";

export const Route = createFileRoute(
  "/_authenticated/acf/master/chart-of-account"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <ChartOfAccountPage />;
}
