import { createFileRoute } from "@tanstack/react-router";
import { FilmDetailView } from "../pages";

export const Route = createFileRoute("/film/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <FilmDetailView filmId={id} />;
  },
});
