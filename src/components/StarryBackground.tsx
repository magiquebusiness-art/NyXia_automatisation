'use client';

import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   StarryBackground — Animated cosmic night canvas
   Twinkling stars, shooting stars, and purple nebula effects
   Fixed behind all content for the NyXia design system
   ───────────────────────────────────────────────────────────── */

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  twinkleSpeed: number;
  phase: number;
  /** Some stars have a subtle color tint */
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  /** Current head position */
  cx: number;
  cy: number;
}

interface NebulaBlob {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  hue: number;
  opacity: number;
  driftX: number;
  driftY: number;
  phase: number;
}

const STAR_COUNT = 280;
const SHOOTING_INTERVAL = 4500; // ms between shooting stars
const NEBULA_COUNT = 3;

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const nebulaRef = useRef<NebulaBlob[]>([]);
  const animRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  /* ── Star creation ────────────────────────────────────────── */

  const createStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      // Most stars are white, some have a slight blue/purple tint
      const hueRoll = Math.random();
      let hue = 0;
      if (hueRoll > 0.85) {
        hue = 240 + Math.random() * 30; // blue-ish
      } else if (hueRoll > 0.75) {
        hue = 260 + Math.random() * 20; // purple-ish
      }

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.2,
        baseOpacity: Math.random() * 0.7 + 0.15,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
        hue,
      });
    }
    starsRef.current = stars;
  }, []);

  /* ── Nebula blobs ─────────────────────────────────────────── */

  const createNebulae = useCallback((width: number, height: number) => {
    const nebulae: NebulaBlob[] = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radiusX: Math.random() * 250 + 150,
        radiusY: Math.random() * 200 + 100,
        hue: 250 + Math.random() * 40, // purple range
        opacity: 0.02 + Math.random() * 0.025,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    nebulaRef.current = nebulae;
  }, []);

  /* ── Shooting star creation ───────────────────────────────── */

  const createShootingStar = useCallback((width: number, height: number) => {
    const x = Math.random() * width * 0.8;
    const y = Math.random() * height * 0.4;
    shootingRef.current.push({
      x,
      y,
      cx: x,
      cy: y,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 7 + 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
      opacity: 1,
      life: 1,
    });
  }, []);

  /* ── Draw helpers ─────────────────────────────────────────── */

  const drawNebulae = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    for (const n of nebulaRef.current) {
      const breathe = Math.sin(time * 0.0003 + n.phase) * 0.3 + 0.7;
      const nx = n.x + Math.sin(time * 0.0002 + n.phase) * 30;
      const ny = n.y + Math.cos(time * 0.00015 + n.phase) * 20;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(nx, ny, n.radiusX, n.radiusY, 0, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radiusX);
      grad.addColorStop(0, `hsla(${n.hue}, 60%, 40%, ${(n.opacity * breathe).toFixed(4)})`);
      grad.addColorStop(0.5, `hsla(${n.hue}, 50%, 30%, ${(n.opacity * breathe * 0.5).toFixed(4)})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    for (const s of starsRef.current) {
      const flicker = Math.sin(time * s.twinkleSpeed + s.phase) * 0.35 + 0.65;
      const opacity = s.baseOpacity * flicker;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

      if (s.hue > 0) {
        ctx.fillStyle = `hsla(${s.hue}, 50%, 85%, ${opacity.toFixed(3)})`;
      } else {
        ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
      }
      ctx.fill();

      // Subtle glow for brighter stars
      if (s.radius > 1 && opacity > 0.5) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(opacity * 0.08).toFixed(4)})`;
        ctx.fill();
      }
    }
  }, []);

  const drawShootingStars = useCallback((ctx: CanvasRenderingContext2D) => {
    const ss = shootingRef.current;
    for (let i = ss.length - 1; i >= 0; i--) {
      const s = ss[i];
      const tailX = s.cx - Math.cos(s.angle) * s.length;
      const tailY = s.cy - Math.sin(s.angle) * s.length;

      // Main trail
      const grad = ctx.createLinearGradient(tailX, tailY, s.cx, s.cy);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.6, `rgba(200,210,255,${(s.opacity * s.life * 0.5).toFixed(3)})`);
      grad.addColorStop(1, `rgba(255,255,255,${(s.opacity * s.life).toFixed(3)})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.cx, s.cy);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Bright head dot
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(s.opacity * s.life).toFixed(3)})`;
      ctx.fill();

      // Subtle glow around head
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(123,92,255,${(s.opacity * s.life * 0.15).toFixed(4)})`;
      ctx.fill();

      // Move
      s.cx += Math.cos(s.angle) * s.speed;
      s.cy += Math.sin(s.angle) * s.speed;
      s.life -= 0.012;

      if (s.life <= 0) {
        ss.splice(i, 1);
      }
    }
  }, []);

  /* ── Main effect ──────────────────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { w, h };
      createStars(w, h);
      createNebulae(w, h);
    };

    const animate = (time: number) => {
      const { w, h } = dimensionsRef.current;
      ctx.clearRect(0, 0, w, h);

      // Layer 1: Nebula (subtle purple clouds)
      drawNebulae(ctx, time);

      // Layer 2: Stars (twinkling)
      drawStars(ctx, time);

      // Layer 3: Shooting stars
      drawShootingStars(ctx);

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    animRef.current = requestAnimationFrame(animate);

    // Spawn shooting stars periodically
    intervalRef.current = setInterval(() => {
      const { w, h } = dimensionsRef.current;
      if (w > 0 && h > 0) {
        createShootingStar(w, h);
      }
    }, SHOOTING_INTERVAL);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createStars, createNebulae, createShootingStar, drawNebulae, drawStars, drawShootingStars]);

  return (
    <canvas
      id="starry-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
