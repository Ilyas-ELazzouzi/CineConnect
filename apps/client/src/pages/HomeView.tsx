import Noise from '../components/Noise';
import { TrendingSection } from '../components';

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

      {/* Hero */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
          <h1 className="font-display text-4xl font-black tracking-wide text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block sm:inline">WELCOME TO </span>
            <span className="text-[#9747FF]">CIN&apos;HETIC</span>
          </h1>
        </section>

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
