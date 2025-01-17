import { createFileRoute } from "@tanstack/react-router";
import ProcessPage from "../../../../pages/egd/master/Process";

export const Route = createFileRoute("/_authenticated/egd/master/process")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProcessPage />;
}
