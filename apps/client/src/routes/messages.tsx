import { createFileRoute } from "@tanstack/react-router";
import { MessagesView } from "../pages";

export const Route = createFileRoute("/messages")({
  component: MessagesView,
});
