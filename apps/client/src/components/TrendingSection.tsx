import { useEffect, useRef, useState } from 'react';
import { TrendingFilmCard } from './TrendingFilmCard';
import { Loading } from './Loading';
import { useFilmsStore } from '../hooks';

export const TrendingSection = () => {
  const { films, isLoading, fetchPopularFilms } = useFilmsStore();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    fetchPopularFilms(20);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 px-6 lg:px-8">
        <div className="text-center py-12">
          <Loading text="Chargement des tendances..." />
        </div>
      </section>
    );
  }

  if (films.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 px-8 lg:px-12 xl:px-16 relative overflow-visible"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`
            mb-10 transition-all duration-1000 ease-out px-4 relative z-20
            ${isInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-100 translate-y-0'
            }
          `}
        >
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-3">
            Tendances du moment
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            Les films les plus populaires de la semaine
          </p>
        </div>

        <div className="relative -mx-8 lg:-mx-12 xl:-mx-16 overflow-visible">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none" />

          <div
            className={`
              flex gap-6 overflow-x-auto overflow-y-visible scrollbar-hide py-8
              scroll-smooth px-8 lg:px-12 xl:px-16
              ${isInView ? 'animate-slide-in' : ''}
            `}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {films.slice(0, 20).map((film, index) => (
              <TrendingFilmCard
                key={film.id}
                film={film}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
