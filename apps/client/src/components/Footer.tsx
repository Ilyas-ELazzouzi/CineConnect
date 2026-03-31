import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/films", label: "Films" },
  { to: "/discussion", label: "Communauté" },
  { to: "/messages", label: "Messages" },
  { to: "/profil", label: "Profil" },
] as const;

const legalLinks = [
  { to: "/", label: "Mentions légales" },
  { to: "/", label: "Confidentialité" },
  { to: "/", label: "CGU" },
] as const;

const footerLinkClass =
  "inline-block text-base font-semibold text-gray-300 transition-all duration-300 ease-out hover:text-[#9747FF] hover:drop-shadow-[0_0_14px_rgba(151,71,255,0.35)] active:scale-[0.98]";

export const Footer = () => {
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // progress 0 when footer enters viewport, 1 when it leaves
    offset: ["start end", "end start"],
  });

  // Phase 1 -> Phase 2 (like mock)
  const bigY = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const bigOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const bigBlur = "none";
  const colsOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [0, 1, 1]);
  const colsY = useTransform(scrollYProgress, [0, 1], [18, 0]);

  return (
    <footer ref={ref} className="relative z-20 mt-auto bg-black">
      {/* Thin blue separator like mock */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative mt-2 overflow-hidden rounded-none bg-black">
          {/* Top grid titles + content (animated height) */}
          <div className="relative z-10 px-14 pt-12 pb-6">
            {/* Vertical separators (4 lines) — dynamic height (follows content) */}
            <div className="pointer-events-none absolute left-14 right-14 top-12 bottom-6">
              <div className="absolute left-0 top-0 h-full w-px bg-white/45" />
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/35" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/35" />
              <div className="absolute right-0 top-0 h-full w-px bg-white/45" />
            </div>

            <motion.div
              style={{ opacity: colsOpacity, y: colsY }}
              className="relative grid grid-cols-3 gap-0"
            >
              <div className="pl-6 text-left group">
                <div className="cursor-pointer select-none text-base font-extrabold tracking-wide text-[#9747FF]">
                  NAVIGATION
                </div>
                <div className="grid grid-rows-[0fr] overflow-hidden opacity-0 -translate-y-2 transition-all duration-300 ease-out delay-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 group-focus-within:translate-y-0">
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
              </div>

              <div className="pl-6 text-left group">
                <div className="cursor-pointer select-none text-base font-extrabold tracking-wide text-[#9747FF]">
                  COMPTE
                </div>
                <div className="grid grid-rows-[0fr] overflow-hidden opacity-0 -translate-y-2 transition-all duration-300 ease-out delay-100 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 group-focus-within:translate-y-0">
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
              </div>

              <div className="pl-6 text-left group">
                <div className="cursor-pointer select-none text-base font-extrabold tracking-wide text-[#9747FF]">
                  LEGAL
                </div>
                <div className="grid grid-rows-[0fr] overflow-hidden opacity-0 -translate-y-2 transition-all duration-300 ease-out delay-200 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 group-focus-within:translate-y-0">
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
            </motion.div>
          </div>

          {/* Big background text */}
          <div className="relative h-[230px]">
            {/* subtle top fade like mock */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black to-transparent" />
            <motion.div
              style={{
                y: bigY,
                opacity: bigOpacity,
                filter: bigBlur,
              }}
              className="absolute inset-x-0 bottom-0"
            >
              <div className="px-14 pb-4">
                <div
                  className="select-none text-[clamp(5rem,16vw,12rem)] font-black tracking-[0.02em]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.12))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  CINEHETIC
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};
