import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "../pages/Login";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return <LoginPage />;
}
