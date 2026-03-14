import { useEffect } from "react";
import { Hero, TrendingSection } from "../components";
import { useFilmsStore } from "../hooks";

export const HomeView = () => {
  const {
    heroFilm,
    isLoading,
    fetchHeroFilm,
    fetchPopularFilms,
    fetchCategories,
  } = useFilmsStore();

  useEffect(() => {
    fetchHeroFilm();
    fetchPopularFilms(20);
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Hero film={heroFilm} isLoading={isLoading && !heroFilm} />
      <div className="pt-16 overflow-x-hidden" style={{ overflowY: "visible" }}>
        <TrendingSection />
      </div>
    </div>
  );
};
