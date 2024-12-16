import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
