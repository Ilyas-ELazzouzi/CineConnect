import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "../pages";

export const Route = createFileRoute("/")({
  component: HomeView,
});
