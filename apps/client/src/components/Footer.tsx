import { Link } from '@tanstack/react-router';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/films', label: 'Films' },
  { to: '/discussion', label: 'Communauté' },
  { to: '/messages', label: 'Messages' },
  { to: '/profil', label: 'Profil' },
] as const;

const legalLinks = [
  { to: '/' as const, label: 'Mentions légales' },
  { to: '/' as const, label: 'Confidentialité' },
  { to: '/' as const, label: 'CGU' },
] as const;

/** Liens colonnes : translation + couleur + soulignement au survol */
const footerLinkClass =
  'inline-block text-base font-semibold text-gray-300 transition-all duration-300 ease-out hover:translate-x-2 hover:text-[#9747FF] hover:underline hover:decoration-2 hover:underline-offset-[6px] hover:decoration-[#9747FF] hover:drop-shadow-[0_0_12px_rgba(151,71,255,0.35)] active:scale-[0.98]';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-auto border-t border-gray-900 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-3xl font-bold text-white tracking-tight transition-all duration-300 ease-out hover:translate-x-1 hover:text-[#9747FF] hover:drop-shadow-[0_0_20px_rgba(151,71,255,0.45)] active:scale-[0.98]">
                CINHETIC
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-base font-semibold leading-relaxed text-gray-400">
              Votre espace cinéma : films, avis, communauté et passion partagée.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9747FF]">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3.5">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9747FF]">
              Compte
            </h3>
            <ul className="mt-5 space-y-3.5">
              <li>
                <Link to="/login" className={footerLinkClass}>
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/register" className={footerLinkClass}>
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9747FF]">
              Légal
            </h3>
            <ul className="mt-5 space-y-3.5">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-center text-sm font-semibold text-gray-500 sm:text-left">
            © {year} Cin&apos;hétic. Tous droits réservés.
          </p>
          <p className="text-sm font-semibold text-gray-500">Fait avec passion pour les cinéphiles.</p>
        </div>
      </div>
    </footer>
  );
};
