import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components';
import { useAuthStore } from '../store';

export const RegisterView = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.message || 'L\'inscription sera disponible en Phase 2');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 shadow-lg rounded-lg p-8 border border-gray-800">
          <h1 className="text-3xl font-display font-bold text-center text-white mb-8">
            Inscription
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-gray-300 mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9747FF] bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9747FF] bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#9747FF] bg-gray-800 text-white"
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              S'inscrire
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
