import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import './TextCursor.css';

type TrailItem = {
  id: number;
  x: number;
  y: number;
  angle: number;
  randomX?: number;
  randomY?: number;
  randomRotate?: number;
};

type TextCursorProps = {
  text?: ReactNode;
  spacing?: number;
  followMouseDirection?: boolean;
  randomFloat?: boolean;
  exitDuration?: number;
  removalInterval?: number;
  maxPoints?: number;
};

export default function TextCursor({
  text = '⚛️',
  spacing = 100,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 4,
}: TextCursorProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMoveTimeRef = useRef(Date.now());
  const lastHandledMoveRef = useRef(0);
  const idCounter = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createRandomData = () =>
      randomFloat
        ? {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5,
          }
        : {};

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // Throttle mouse handling to ~60fps max (et encore moins si CPU chargé)
      if (now - lastHandledMoveRef.current < 16) return;
      lastHandledMoveRef.current = now;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTrail((prev) => {
        const next = [...prev];
        if (next.length === 0) {
          next.push({ id: idCounter.current++, x: mouseX, y: mouseY, angle: 0, ...createRandomData() });
        } else {
          const last = next[next.length - 1];
          if (!last) return next;
          const dx = mouseX - last.x;
          const dy = mouseY - last.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= spacing) {
            const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const computedAngle = followMouseDirection ? rawAngle : 0;
            const steps = Math.floor(distance / spacing);

            for (let i = 1; i <= steps; i += 1) {
              const t = (spacing * i) / distance;
              next.push({
                id: idCounter.current++,
                x: last.x + dx * t,
                y: last.y + dy * t,
                angle: computedAngle,
                ...createRandomData(),
              });
            }
          }
        }
        return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
      });

      lastMoveTimeRef.current = Date.now();
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [followMouseDirection, maxPoints, randomFloat, spacing]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval]);

  return (
    <div ref={containerRef} className="text-cursor-container">
      <div className="text-cursor-inner">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 1, rotate: item.angle }}
              animate={{
                opacity: 1,
                scale: 1,
                x: randomFloat ? [0, item.randomX ?? 0, 0] : 0,
                y: randomFloat ? [0, item.randomY ?? 0, 0] : 0,
                rotate: randomFloat
                  ? [item.angle, item.angle + (item.randomRotate ?? 0), item.angle]
                  : item.angle,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: 'easeOut' },
                ...(randomFloat && {
                  x: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                  y: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                  rotate: { duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                }),
              }}
              className="text-cursor-item"
              style={{ left: item.x, top: item.y }}
            >
              {text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
