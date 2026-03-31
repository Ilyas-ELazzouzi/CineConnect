import { createFileRoute } from "@tanstack/react-router";
import { DiscussionView } from "../pages";

export const Route = createFileRoute("/discussion")({
  component: DiscussionView,
});
