import { createFileRoute } from "@tanstack/react-router";
import ActivityLogPage from "../../../pages/admin/ActivityLog";

export const Route = createFileRoute("/_authenticated/admin/activity-log")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ActivityLogPage />;
}