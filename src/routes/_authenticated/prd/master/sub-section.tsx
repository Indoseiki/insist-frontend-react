import { createFileRoute } from "@tanstack/react-router";
import SubSectionPage from "../../../../pages/prd/master/SubSection";

export const Route = createFileRoute("/_authenticated/prd/master/sub-section")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SubSectionPage />;
}
