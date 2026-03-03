import { createFileRoute } from "@tanstack/react-router";
import { FilmsByCategoryView } from "../pages";

export const Route = createFileRoute("/films/$categorie")({
  component: () => {
    const { categorie } = Route.useParams();
    return <FilmsByCategoryView category={categorie} />;
  },
});
