import { useEffect, useMemo } from 'react';
import { Film } from 'lucide-react';
import Noise from '../components/Noise';
import FilmShapeGrid from '../components/FilmShapeGrid';
import TextCursor from '../components/TextCursor';
import { TrendingSection } from '../components';
import { useFilmsStore } from '../hooks';

const MARQUEE_ITEMS = [
  'Films',
  'Communauté',
  'Avis & notes',
  'Discussions',
  'Tendances',
  'Votre passion cinéma',
  "Cin'hétic",
  'Partagez',
  'Découvrez',
];

export const HomeView = () => {
  const { films, fetchPopularFilms } = useFilmsStore();
  const posters = useMemo(
    () => films.map((f) => f.poster).filter((p): p is string => typeof p === 'string' && p.length > 0),
    [films],
  );

  useEffect(() => {
    void fetchPopularFilms(30);
  }, [fetchPopularFilms]);

  const line = MARQUEE_ITEMS.map((t) => ` · ${t}`).join('');

  return (
    <div className="relative bg-black">
      {/* Grain animé (fond) */}
      <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">
        <Noise
          patternSize={250}
          patternScaleX={2}
          patternScaleY={2}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
      </div>

      <div className="absolute inset-0 z-[2]">
        <FilmShapeGrid
          posters={posters}
          speed={0.35}
          direction="diagonal"
          borderColor="#271E37"
          hoverColor="#222222"
          size={200}
          gap={6}
          shape="square"
        />
      </div>

      {/* Hero */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
          <div className="relative h-[220px] w-full max-w-6xl">
            <h1 className="whitespace-nowrap font-display text-[clamp(2rem,6vw,5rem)] font-black tracking-wide text-white">
              WELCOME TO CINHETIC
            </h1>
            <div className="absolute inset-0">
              <TextCursor
                text={<Film size={28} strokeWidth={2.2} />}
                spacing={80}
                followMouseDirection
                randomFloat
                exitDuration={0.3}
                removalInterval={20}
                maxPoints={10}
              />
            </div>
          </div>
        </section>

        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 text-center">
          <p className="mb-2 font-mono text-sm uppercase tracking-[0.28em] text-gray-200">
            Scroll
          </p>
          <div className="animate-bounce text-4xl leading-none text-[#9747FF]">↓</div>
        </div>

        {/* Bandeau texte défilant en bas */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/60 py-3 backdrop-blur-md">
          <div className="overflow-hidden">
            <div className="flex w-max animate-home-marquee font-mono text-xs uppercase tracking-[0.35em] text-gray-400 md:text-sm">
              <span className="inline-block shrink-0 pr-12">{line}</span>
              <span className="inline-block shrink-0 pr-12" aria-hidden>
                {line}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tendances du moment (comme avant) */}
      <div className="relative z-10 overflow-x-hidden border-t border-gray-900 bg-black pb-24 pt-8">
        <TrendingSection />
      </div>
    </div>
  );
};
