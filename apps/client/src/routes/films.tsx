import { createFileRoute } from "@tanstack/react-router";
import { FilmsView } from "../pages";

export const Route = createFileRoute("/films")({
  component: FilmsView,
});
