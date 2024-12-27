import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/prd/master/building")({
  component: RouteComponent,
});

function RouteComponent() {
  return "Hello /_authenticated/prd/master/building!";
}
