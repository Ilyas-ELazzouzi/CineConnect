import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Header, Footer } from '../components';

export const Route = createRootRoute({
  component: () => {
    const lenisRef = useRef<Lenis | null>(null);
    const href = useRouterState({ select: (s) => s.location.href });

    useEffect(() => {
      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.25,
      });
      lenisRef.current = lenis;

      let raf = 0;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(raf);
        lenisRef.current = null;
        lenis.destroy();
      };
    }, []);

    // Scroll-to-top on navigation so you don't land on footer.
    useEffect(() => {
      // Prefer Lenis when available; fallback to native.
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, [href]);

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
