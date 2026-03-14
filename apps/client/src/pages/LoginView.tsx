import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '../hooks';

export const LoginView = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const register = useAuthStore.getState().register;
        await register(username, email, password);
      }
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.message || 'L\'authentification sera disponible en Phase 2');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('La connexion Google sera disponible en Phase 2');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(180deg, #0F0A1A 0%, #1C1033 35%, #301D52 80%)',
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl">
          <div className="flex mb-8 bg-gray-800 rounded-lg p-1 relative">
            <div
              className={`
                absolute top-1 bottom-1 bg-[#9747FF] rounded-lg transition-all duration-500 ease-in-out
                ${isLogin ? 'left-1 right-1/2' : 'left-1/2 right-1'}
              `}
            />
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`
                relative z-10 flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-300
                ${isLogin
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`
                relative z-10 flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-300
                ${!isLogin
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div
              className={`
                overflow-hidden transition-all duration-500 ease-in-out
                ${!isLogin
                  ? 'max-h-24 opacity-100'
                  : 'max-h-0 opacity-0'
                }
              `}
            >
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  minLength={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent transition-all"
                  placeholder="Votre nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent transition-all"
                placeholder="admin@gmail.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isLogin ? 1 : 6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9747FF] focus:border-transparent transition-all"
                placeholder="admin@gmail.com"
              />
              {isLogin && (
                <Link
                  to="/login"
                  className="text-[#9747FF] text-sm mt-2 inline-block hover:text-[#a974ff] transition-colors"
                >
                  Mot de passe oublié?
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#9747FF] hover:bg-[#8a3ae6] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">OU</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuez avec Google
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Vous n'avez pas un compte?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-[#9747FF] hover:text-[#a974ff] font-medium transition-colors"
                >
                  Inscription
                </button>
              </>
            ) : (
              <>
                Vous avez déjà un compte?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-[#9747FF] hover:text-[#a974ff] font-medium transition-colors"
                >
                  Connexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
