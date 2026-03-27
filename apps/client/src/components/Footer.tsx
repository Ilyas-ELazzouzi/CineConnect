import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const Footer = () => {
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // progress 0 when footer enters viewport, 1 when it leaves
    offset: ['start end', 'end start'],
  });

  // Phase 1 -> Phase 2 (like mock)
  const bigY = useTransform(scrollYProgress, [0, 1], [170, 0]);
  const bigOpacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const bigBlur = useTransform(scrollYProgress, [0, 1], ['blur(3px)', 'blur(0px)']);
  const colsOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [0, 1, 1]);
  const colsY = useTransform(scrollYProgress, [0, 1], [18, 0]);

  return (
    <footer ref={ref} className="relative z-20 mt-auto bg-black">
      {/* Thin blue separator like mock */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-sky-500/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative mt-10 overflow-hidden rounded-none bg-black">
          {/* Top grid titles */}
          <motion.div
            style={{ opacity: colsOpacity, y: colsY }}
            className="relative z-10 grid grid-cols-3 gap-0 px-14 pt-12"
          >
            <div className="pl-6 text-left">
              <div className="text-base font-extrabold tracking-wide text-[#9747FF]">
                NAVIGATION
              </div>
            </div>
            <div className="pl-6 text-left">
              <div className="text-base font-extrabold tracking-wide text-[#9747FF]">COMPTE</div>
            </div>
            <div className="pl-6 text-left">
              <div className="text-base font-extrabold tracking-wide text-[#9747FF]">LEGAL</div>
            </div>
          </motion.div>

          {/* Vertical separators (4 lines) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-14 right-14 top-12 h-28">
              <div className="absolute left-0 top-0 h-full w-px bg-white/45" />
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/35" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/35" />
              <div className="absolute right-0 top-0 h-full w-px bg-white/45" />
            </div>
          </div>

          {/* Big background text */}
          <div className="relative h-[420px]">
            {/* subtle top fade like mock */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
            <motion.div
              style={{
                y: bigY,
                opacity: bigOpacity,
                filter: bigBlur,
              }}
              className="absolute inset-x-0 bottom-0"
            >
              <div className="px-14 pb-10">
                <div
                  className="select-none text-[clamp(5rem,16vw,12rem)] font-black tracking-[0.02em]"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.12))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
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
