'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
}

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const animRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const createStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  const createShootingStar = useCallback((width: number, height: number) => {
    shootingRef.current.push({
      x: Math.random() * width * 0.7,
      y: Math.random() * height * 0.3,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: 1,
      life: 1,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars(canvas.width, canvas.height);
    };

    const drawStars = (time: number) => {
      for (const s of starsRef.current) {
        const flicker = Math.sin(time * s.twinkleSpeed + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.opacity * flicker).toFixed(3)})`;
        ctx.fill();
      }
    };

    const drawShootingStars = () => {
      const ss = shootingRef.current;
      for (let i = ss.length - 1; i >= 0; i--) {
        const s = ss[i];
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${(s.opacity * s.life).toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.life -= 0.015;

        if (s.life <= 0) ss.splice(i, 1);
      }
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStars(time);
      drawShootingStars();
      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    animRef.current = requestAnimationFrame(animate);

    // Shooting stars every 3 seconds
    intervalRef.current = setInterval(() => {
      createShootingStar(canvas.width, canvas.height);
    }, 3000);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createStars, createShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
