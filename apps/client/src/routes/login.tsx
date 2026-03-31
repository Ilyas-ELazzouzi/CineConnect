import { createFileRoute } from "@tanstack/react-router";
import { LoginView } from "../pages";

export const Route = createFileRoute("/login")({
  component: LoginView,
});
