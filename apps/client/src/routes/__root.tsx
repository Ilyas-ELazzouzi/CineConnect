import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header, Footer } from '../components';

export const Route = createRootRoute({
  component: () => {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  },
});
