// Export des vues de l'application
export { HomePageView } from './homepage';

// Vues à créer
export const FilmsByCategoryView = ({ category }: { category: string }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Films - {category}</h1>
      <p className="text-gray-400">Cette vue sera implémentée prochainement.</p>
    </div>
  );
};

export const FilmDetailView = ({ filmId }: { filmId: string }) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Film - {filmId}</h1>
      <p className="text-gray-400">Cette vue sera implémentée prochainement.</p>
    </div>
  );
};
