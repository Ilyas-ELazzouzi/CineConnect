import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Logo Component
const CinHeticLogo = () => (
  <svg width="151" height="22" viewBox="0 0 151 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.55 21.84C9.89 21.84 8.35 21.58 6.93 21.06C5.53 20.52 4.31 19.76 3.27 18.78C2.25 17.8 1.45 16.65 0.869996 15.33C0.289996 13.99 -4.21703e-06 12.52 -4.21703e-06 10.92C-4.21703e-06 9.32 0.289996 7.86 0.869996 6.54C1.45 5.2 2.25 4.04 3.27 3.06C4.31 2.08 5.53 1.33 6.93 0.810001C8.35 0.270001 9.89 5.96046e-07 11.55 5.96046e-07C13.49 5.96046e-07 15.22 0.340001 16.74 1.02C18.28 1.7 19.56 2.68 20.58 3.96L16.8 7.38C16.12 6.58 15.37 5.97 14.55 5.55C13.75 5.13 12.85 4.92 11.85 4.92C10.99 4.92 10.2 5.06 9.48 5.34C8.76 5.62 8.14 6.03 7.62 6.57C7.12 7.09 6.72 7.72 6.42 8.46C6.14 9.2 6 10.02 6 10.92C6 11.82 6.14 12.64 6.42 13.38C6.72 14.12 7.12 14.76 7.62 15.3C8.14 15.82 8.76 16.22 9.48 16.5C10.2 16.78 10.99 16.92 11.85 16.92C12.85 16.92 13.75 16.71 14.55 16.29C15.37 15.87 16.12 15.26 16.8 14.46L20.58 17.88C19.56 19.14 18.28 20.12 16.74 20.82C15.22 21.5 13.49 21.84 11.55 21.84ZM23.2284 21.42V0.420001H29.1684V21.42H23.2284ZM33.3944 21.42V0.420001H38.2844L49.8644 14.4H47.5545V0.420001H53.3745V21.42H48.4844L36.9044 7.44H39.2144V21.42H33.3944Z" fill="url(#paint0_linear_169_1168)"/>
    <path d="M71.6044 0.420001H77.5444V21.42H71.6044V0.420001ZM63.5044 21.42H57.5644V0.420001H63.5044V21.42ZM72.0244 13.23H63.0844V8.31H72.0244V13.23ZM87.1943 8.55H96.9443V12.99H87.1943V8.55ZM87.6143 16.83H98.5943V21.42H81.7343V0.420001H98.2043V5.01H87.6143V16.83ZM106.361 21.42V5.13H99.9105V0.420001H118.721V5.13H112.301V21.42H106.361ZM120.934 21.42V0.420001H126.874V21.42H120.934ZM141.57 21.84C139.91 21.84 138.37 21.58 136.95 21.06C135.55 20.52 134.33 19.76 133.29 18.78C132.27 17.8 131.47 16.65 130.89 15.33C130.31 13.99 130.02 12.52 130.02 10.92C130.02 9.32 130.31 7.86 130.89 6.54C131.47 5.2 132.27 4.04 133.29 3.06C134.33 2.08 135.55 1.33 136.95 0.810001C138.37 0.270001 139.91 5.96046e-07 141.57 5.96046e-07C143.51 5.96046e-07 145.24 0.340001 146.76 1.02C148.3 1.7 149.58 2.68 150.6 3.96L146.82 7.38C146.14 6.58 145.39 5.97 144.57 5.55C143.77 5.13 142.87 4.92 141.87 4.92C141.01 4.92 140.22 5.06 139.5 5.34C138.78 5.62 138.16 6.03 137.64 6.57C137.14 7.09 136.74 7.72 136.44 8.46C136.16 9.2 136.02 10.02 136.02 10.92C136.02 11.82 136.16 12.64 136.44 13.38C136.74 14.12 137.14 14.76 137.64 15.3C138.16 15.82 138.78 16.22 139.5 16.5C140.22 16.78 141.01 16.92 141.87 16.92C142.87 16.92 143.77 16.71 144.57 16.29C145.39 15.87 146.14 15.26 146.82 14.46L150.6 17.88C149.58 19.14 148.3 20.12 146.76 20.82C145.24 21.5 143.51 21.84 141.57 21.84Z" fill="#9747FF"/>
    <defs>
      <linearGradient id="paint0_linear_169_1168" x1="-1.02" y1="13.42" x2="178.98" y2="13.42" gradientUnits="userSpaceOnUse">
        <stop offset="0.0625" stopColor="#999999"/>
        <stop offset="0.4375" stopColor="#9747FF"/>
      </linearGradient>
    </defs>
  </svg>
)

// Home Icon Component
const HomeIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3.90712 2.80203L3.07379 3.45249C1.8099 4.43901 1.17796 4.93227 0.83901 5.62777C0.500061 6.32327 0.500061 7.12671 0.500061 8.73358V10.4763C0.500061 13.6301 0.500061 15.2071 1.47637 16.1869C2.45268 17.1667 4.02403 17.1667 7.16673 17.1667H8.83339C11.9761 17.1667 13.5474 17.1667 14.5237 16.1869C15.5001 15.2071 15.5001 13.6301 15.5001 10.4763V8.73358C15.5001 7.12671 15.5001 6.32327 15.1611 5.62777C14.8222 4.93227 14.1902 4.43901 12.9263 3.45249L12.093 2.80203C10.1268 1.26734 9.14375 0.5 8.00006 0.5C6.85637 0.5 5.87329 1.26734 3.90712 2.80203Z" stroke="white" strokeLinejoin="round"/>
  </svg>
)

// Video Icon Component
const VideoIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19.0205 2.56859C18.4185 2.28178 17.7229 2.36723 17.2078 2.79157L15.6332 4.08912C15.321 4.34647 15.2751 4.8101 15.5307 5.12638C15.7863 5.43972 16.2478 5.48687 16.561 5.22854L18.1356 3.93098C18.238 3.84651 18.3424 3.87499 18.3941 3.89955C18.4478 3.92607 18.5366 3.98795 18.5366 4.12547V10.8745C18.5366 11.012 18.4478 11.0739 18.3941 11.1005C18.3424 11.126 18.238 11.1535 18.1346 11.069L14.4059 7.99457V4.08716C14.4059 1.68064 12.6888 0 10.2302 0H4.17561C1.71707 0 0 1.68064 0 4.08716V10.9236C0 13.3233 1.71317 15 4.16585 15C4.56976 15 4.89756 14.67 4.89756 14.2633C4.89756 13.8567 4.56976 13.5266 4.16585 13.5266C2.49854 13.5266 1.46341 12.5296 1.46341 10.9236V4.08716C1.46341 2.4743 2.50244 1.47338 4.17561 1.47338H10.2302C11.9034 1.47338 12.9424 2.4743 12.9424 4.08716V10.9236C12.9424 12.5296 11.9034 13.5266 10.2302 13.5266H8.54342C8.13951 13.5266 7.81171 13.8567 7.81171 14.2633C7.81171 14.67 8.13951 15 8.54342 15H10.2302C12.6888 15 14.4059 13.3233 14.4059 10.9236V9.89916L17.2078 12.2084C17.52 12.4668 17.8995 12.5994 18.2839 12.5994C18.5327 12.5994 18.7834 12.5444 19.0205 12.4314C19.6244 12.1436 20 11.5474 20 10.8745V4.12547C20 3.45262 19.6244 2.85639 19.0205 2.56859" fill="white"/>
  </svg>
)

// Community Icon Component
const CommunityIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11.982 20.575C9.58398 20.58 7.33698 20.132 5.42798 18.969C6.37598 15.97 8.94798 14.582 11.982 14.59C15.012 14.582 17.588 15.974 18.535 18.969C17.516 19.59 16.401 20.007 15.218 20.26" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M6.59476 13.7399C4.46976 13.7349 2.66376 14.7099 1.99976 16.8099C2.36276 17.0309 2.74176 17.2149 3.13676 17.3659" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M17.406 13.7399C19.53 13.7349 21.336 14.7099 22 16.8099C21.611 17.0479 21.201 17.2419 20.775 17.3989" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M12.7326 3.42493C14.6466 3.76993 16.0986 5.44493 16.0986 7.45793C16.0986 9.72193 14.2636 11.5569 11.9996 11.5569C9.73661 11.5569 7.90161 9.72193 7.90161 7.45793C7.90161 6.20893 8.46061 5.08993 9.34261 4.33793" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M17.406 5.86682C18.996 5.86682 20.286 7.15582 20.286 8.74682C20.286 10.3368 18.996 11.6268 17.406 11.6268" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M6.59509 5.86682C5.00409 5.86682 3.71509 7.15582 3.71509 8.74682C3.71509 10.3368 5.00409 11.6268 6.59509 11.6268" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
  </svg>
)

// Profile Icon Component
const ProfileIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.92048 13.246C4.05286 13.246 0.75 13.8308 0.75 16.1727C0.75 18.5146 4.0319 19.1203 7.92048 19.1203C11.7881 19.1203 15.09 18.5346 15.09 16.1936C15.09 13.8527 11.809 13.246 7.92048 13.246Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.92044 9.90571C10.4585 9.90571 12.5157 7.84762 12.5157 5.30953C12.5157 2.77143 10.4585 0.714287 7.92044 0.714287C5.38234 0.714287 3.32425 2.77143 3.32425 5.30953C3.31567 7.83905 5.35948 9.89714 7.88806 9.90571H7.92044Z" stroke="white" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Search Icon Component
const SearchIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19.7555 18.6065L16.3182 15.2458L16.2376 15.1233C16.0878 14.9742 15.883 14.8902 15.6692 14.8902C15.4554 14.8902 15.2505 14.9742 15.1007 15.1233C12.1795 17.8033 7.67815 17.949 4.58201 15.4637C1.48586 12.9784 0.755668 8.63337 2.87568 5.31017C4.9957 1.98697 9.30807 0.716847 12.9528 2.34214C16.5976 3.96743 18.4438 7.98379 17.267 11.7276C17.1823 11.9981 17.2515 12.2922 17.4487 12.4992C17.6459 12.7062 17.9411 12.7946 18.223 12.7311C18.505 12.6676 18.7309 12.4619 18.8156 12.1914C20.2224 7.74864 18.0977 2.96755 13.8161 0.941058C9.53449 -1.08544 4.38084 0.250824 1.68905 4.08542C-1.00273 7.92001 -0.424821 13.1021 3.04893 16.2795C6.52268 19.4569 11.8498 19.6759 15.5841 16.7949L18.6277 19.7705C18.942 20.0765 19.4502 20.0765 19.7645 19.7705C20.0785 19.4602 20.0785 18.9606 19.7645 18.6503L19.7555 18.6065Z" fill="white"/>
  </svg>
)

export const Header = () => {
  return (
    <header className="bg-black w-full px-6 py-4 flex items-center justify-between relative fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <CinHeticLogo />
        </Link>
      </div>

      {/* Navigation Links - Centered */}
      <nav className="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 text-white hover:opacity-80 transition-opacity [&.active]:opacity-100"
          )}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Accueil</span>
        </Link>
        
        <Link
          to="/films"
          className={cn(
            "flex items-center gap-2 text-white hover:opacity-80 transition-opacity [&.active]:opacity-100"
          )}
        >
          <VideoIcon className="w-5 h-4" />
          <span className="text-sm font-medium">Films</span>
        </Link>
        
        <Link
          to="/communaute"
          className={cn(
            "flex items-center gap-2 text-white hover:opacity-80 transition-opacity [&.active]:opacity-100"
          )}
        >
          <CommunityIcon className="w-6 h-6" />
          <span className="text-sm font-medium">Communauté</span>
        </Link>
        
        <Link
          to="/profil"
          className={cn(
            "flex items-center gap-2 text-white hover:opacity-80 transition-opacity [&.active]:opacity-100"
          )}
        >
          <ProfileIcon className="w-4 h-5" />
          <span className="text-sm font-medium">Profil</span>
        </Link>
      </nav>

      {/* Search Icon */}
      <div className="flex items-center">
        <button
          type="button"
          className="text-white hover:opacity-80 transition-opacity p-0 bg-transparent border-0 cursor-pointer flex items-center justify-center"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
