import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '../components';

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    );
  },
});
