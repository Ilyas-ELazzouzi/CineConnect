import { Link, useLocation } from '@tanstack/react-router';
import { HomeIcon, FilmsIcon, CommunityIcon, MessagesIcon, ProfileIcon, SearchIcon } from './icons';

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Accueil', icon: HomeIcon },
    { to: '/films', label: 'Films', icon: FilmsIcon },
    { to: '/discussion', label: 'Communauté', icon: CommunityIcon },
    { to: '/messages', label: 'Messages', icon: MessagesIcon },
    { to: '/profil', label: 'Profil', icon: ProfileIcon },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-900">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-display font-bold text-white group-hover:text-[#9747FF] transition-colors duration-300">
              CINHETIC
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${isActive
                      ? 'bg-[#9747FF]/20 text-[#9747FF]'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300">
            <SearchIcon className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </header>
  );
};
