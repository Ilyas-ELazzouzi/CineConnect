import { createFileRoute } from "@tanstack/react-router";
import { RegisterView } from "../pages";

export const Route = createFileRoute("/register")({
  component: RegisterView,
});
