import { createFileRoute } from "@tanstack/react-router";
import MachinePage from "../../../../pages/mnt/master/Machine";

export const Route = createFileRoute("/_authenticated/mnt/master/machine")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MachinePage />;
}
