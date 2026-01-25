import { createFileRoute } from '@tanstack/react-router';
import { FilmsByCategoryView } from '../views';

export const Route = createFileRoute('/films/$categorie')({
  component: () => {
    const { categorie } = Route.useParams();
    return <FilmsByCategoryView category={categorie} />;
  },
});
