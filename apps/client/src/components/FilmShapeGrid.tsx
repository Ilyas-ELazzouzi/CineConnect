import { useEffect, useMemo, useRef } from 'react';
import './FilmShapeGrid.css';

type Direction = 'up' | 'down' | 'left' | 'right' | 'diagonal';
type Shape = 'square' | 'hexagon' | 'circle' | 'triangle';

type FilmShapeGridProps = {
  posters: string[];
  speed?: number;
  size?: number;
  gap?: number;
  direction?: Direction;
  borderColor?: string;
  hoverColor?: string;
  shape?: Shape;
  className?: string;
};

type Cell = { col: number; row: number };

export default function FilmShapeGrid({
  posters,
  speed = 0.5,
  size = 40,
  gap = 4,
  direction = 'diagonal',
  borderColor = '#271E37',
  hoverColor = '#222222',
  shape = 'hexagon',
  className = '',
}: FilmShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef<Cell | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(false);

  const safePosters = useMemo(() => posters.filter(Boolean), [posters]);

  useEffect(() => {
    if (safePosters.length === 0) {
      imagesRef.current = [];
      loadedRef.current = true;
      return;
    }

    loadedRef.current = false;
    let alive = true;
    const imgs: HTMLImageElement[] = [];
    let done = 0;
    const total = safePosters.length;

    safePosters.forEach((url) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        done += 1;
        if (!alive) return;
        if (done >= total) {
          imagesRef.current = imgs.filter((i) => i.complete && i.naturalWidth > 0);
          loadedRef.current = true;
        }
      };
      img.onerror = () => {
        done += 1;
        if (!alive) return;
        if (done >= total) {
          imagesRef.current = imgs.filter((i) => i.complete && i.naturalWidth > 0);
          loadedRef.current = true;
        }
      };
      img.src = url;
      imgs.push(img);
    });

    return () => {
      alive = false;
    };
  }, [safePosters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isHex = shape === 'hexagon';
    const cellStep = size + gap;
    const hexHoriz = size * 1.5;
    const hexVert = size * Math.sqrt(3);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const imageForCell = (col: number, row: number) => {
      const images = imagesRef.current;
      if (images.length === 0) return null;
      const idx = Math.abs((col * 97 + row * 131) % images.length);
      return images[idx] ?? null;
    };

    const drawHexPath = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const drawCirclePath = (cx: number, cy: number, s: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTrianglePath = (cx: number, cy: number, s: number, flip: boolean) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + s / 2);
        ctx.lineTo(cx + s / 2, cy - s / 2);
        ctx.lineTo(cx - s / 2, cy - s / 2);
      } else {
        ctx.moveTo(cx, cy - s / 2);
        ctx.lineTo(cx + s / 2, cy + s / 2);
        ctx.lineTo(cx - s / 2, cy + s / 2);
      }
      ctx.closePath();
    };

    const clipAndDrawImage = (img: HTMLImageElement | null, x: number, y: number, s: number) => {
      if (!img) return;
      const sw = img.naturalWidth;
      const sh = img.naturalHeight;
      if (!sw || !sh) return;
      const scale = Math.max(s / sw, s / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = x - (dw - s) / 2;
      const dy = y - (dh - s) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isHex) {
        const colShift = Math.floor(offsetRef.current.x / hexHoriz);
        const rowShift = Math.floor(offsetRef.current.y / hexVert);
        const offsetX = ((offsetRef.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((offsetRef.current.y % hexVert) + hexVert) % hexVert;
        const cols = Math.ceil(canvas.width / hexHoriz) + 3;
        const rows = Math.ceil(canvas.height / hexVert) + 3;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const cx = col * hexHoriz + offsetX;
            const cy = row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;
            const worldCol = col + colShift;
            const worldRow = row + rowShift;
            const img = imageForCell(worldCol, worldRow);

            ctx.save();
            drawHexPath(cx, cy, size);
            ctx.clip();
            clipAndDrawImage(img, cx - size, cy - size, size * 2);
            ctx.restore();

            drawHexPath(cx, cy, size);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (hoverRef.current?.col === worldCol && hoverRef.current?.row === worldRow) {
              drawHexPath(cx, cy, size);
              ctx.fillStyle = hoverColor;
              ctx.globalAlpha = 0.28;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      } else {
        const colShift = Math.floor(offsetRef.current.x / cellStep);
        const rowShift = Math.floor(offsetRef.current.y / cellStep);
        const offsetX = ((offsetRef.current.x % cellStep) + cellStep) % cellStep;
        const offsetY = ((offsetRef.current.y % cellStep) + cellStep) % cellStep;
        const cols = Math.ceil(canvas.width / cellStep) + 3;
        const rows = Math.ceil(canvas.height / cellStep) + 3;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const sx = col * cellStep + offsetX;
            const sy = row * cellStep + offsetY;
            const cx = sx + size / 2;
            const cy = sy + size / 2;
            const flip = (col + row) % 2 !== 0;
            const worldCol = col + colShift;
            const worldRow = row + rowShift;
            const img = imageForCell(worldCol, worldRow);

            ctx.save();
            if (shape === 'circle') drawCirclePath(cx, cy, size);
            else if (shape === 'triangle') drawTrianglePath(cx, cy, size, flip);
            else {
              ctx.beginPath();
              ctx.rect(sx, sy, size, size);
              ctx.closePath();
            }
            ctx.clip();
            clipAndDrawImage(img, sx, sy, size);
            ctx.restore();

            if (shape === 'circle') drawCirclePath(cx, cy, size);
            else if (shape === 'triangle') drawTrianglePath(cx, cy, size, flip);
            else {
              ctx.beginPath();
              ctx.rect(sx, sy, size, size);
              ctx.closePath();
            }
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (hoverRef.current?.col === worldCol && hoverRef.current?.row === worldRow) {
              if (shape === 'circle') drawCirclePath(cx, cy, size);
              else if (shape === 'triangle') drawTrianglePath(cx, cy, size, flip);
              else {
                ctx.beginPath();
                ctx.rect(sx, sy, size, size);
                ctx.closePath();
              }
              ctx.fillStyle = hoverColor;
              ctx.globalAlpha = 0.28;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2,
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const update = () => {
      const s = Math.max(speed, 0.1);
      if (direction === 'right') offsetRef.current.x -= s;
      if (direction === 'left') offsetRef.current.x += s;
      if (direction === 'up') offsetRef.current.y += s;
      if (direction === 'down') offsetRef.current.y -= s;
      if (direction === 'diagonal') {
        offsetRef.current.x -= s;
        offsetRef.current.y -= s;
      }

      drawGrid();
      frameRef.current = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isHex) {
        const colShift = Math.floor(offsetRef.current.x / hexHoriz);
        const rowShift = Math.floor(offsetRef.current.y / hexVert);
        const offsetX = ((offsetRef.current.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((offsetRef.current.y % hexVert) + hexVert) % hexVert;
        const col = Math.round((x - offsetX) / hexHoriz);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
        const row = Math.round((y - offsetY - rowOffset) / hexVert);
        hoverRef.current = { col: col + colShift, row: row + rowShift };
        return;
      }

      const colShift = Math.floor(offsetRef.current.x / cellStep);
      const rowShift = Math.floor(offsetRef.current.y / cellStep);
      const offsetX = ((offsetRef.current.x % cellStep) + cellStep) % cellStep;
      const offsetY = ((offsetRef.current.y % cellStep) + cellStep) % cellStep;
      hoverRef.current = {
        col: Math.floor((x - offsetX) / cellStep) + colShift,
        row: Math.floor((y - offsetY) / cellStep) + rowShift,
      };
    };

    const onLeave = () => {
      hoverRef.current = null;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    frameRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [borderColor, direction, gap, hoverColor, shape, size, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`film-shape-grid-canvas ${className}`}
      data-loaded={loadedRef.current ? '1' : '0'}
    />
  );
}
