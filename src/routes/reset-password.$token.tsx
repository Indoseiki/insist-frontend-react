import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "../pages/ResetPassword";

export const Route = createFileRoute("/reset-password/$token")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();
  return <ResetPasswordPage token={token} />;
}
