import { createFileRoute } from "@tanstack/react-router";
import SectionPage from "../../../../pages/prd/master/Section";

export const Route = createFileRoute("/_authenticated/prd/master/section")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SectionPage />;
}
