import { createFileRoute } from "@tanstack/react-router";
import LocationPage from "../../../../pages/pid/master/Location";

export const Route = createFileRoute("/_authenticated/pid/master/location")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LocationPage />;
}
