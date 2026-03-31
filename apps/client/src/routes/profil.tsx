import { createFileRoute } from "@tanstack/react-router";
import { ProfilView } from "../pages";

export const Route = createFileRoute("/profil")({
  component: ProfilView,
});
