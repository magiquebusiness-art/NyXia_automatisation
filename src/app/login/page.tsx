'use client';

import { useState, useCallback, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarryBackground from '@/components/StarryBackground';

/* ------------------------------------------------------------------ */
/*  Eye Toggle Icon                                                    */
/* ------------------------------------------------------------------ */

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Login Page                                                         */
/* ------------------------------------------------------------------ */

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        });
        const data = await res.json();

        if (data.success && data.token) {
          // Store token and redirect to dashboard
          localStorage.setItem('nyxia-token', data.token);
          if (data.user) {
            localStorage.setItem('nyxia-user', JSON.stringify(data.user));
          }
          window.location.href = '/dashboard';
        } else {
          setError(data.error || 'Identifiants incorrects.');
        }
      } catch {
        setError('Erreur de connexion. Vérifie ton réseau.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password],
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Starry background */}
      <StarryBackground />

      {/* Cosmic glow overlays */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(123,92,255,0.15) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 40% at 70% 80%, rgba(79,163,255,0.08) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Ambient purple glow blob behind the card */}
      <div
        aria-hidden="true"
        className="absolute z-[2] w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(123,92,255,0.5) 0%, rgba(90,108,255,0.2) 40%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* ---- Card ---- */}
      <div
        className="relative z-10 w-full max-w-[440px] nx-glass-static p-10 md:p-12"
        style={{
          animation: 'nx-card-in 0.65s cubic-bezier(0.23,1,0.32,1) both',
        }}
      >
        {/* ---- Header ---- */}
        <div className="text-center mb-8">
          {/* NyXia Avatar Image */}
          <div className="nx-breathe mx-auto mb-5 w-20 h-20 rounded-full border-2 border-[rgba(123,92,255,0.5)] bg-gradient-to-br from-[#7B5CFF] to-[#4FA3FF] flex items-center justify-center overflow-hidden">
            <Image
              src="/images/nyxia/NyXia-40.png"
              alt="NyXia"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              priority
            />
          </div>

          {/* Title - Bienvenue */}
          <h1
            className="nx-gradient-text text-4xl font-semibold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Bienvenue
          </h1>

          {/* Subtitle */}
          <p
            className="text-[var(--nx-t3)] text-sm"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Connecte-toi pour retrouver NyXia
          </p>
        </div>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--nx-t3)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="nx-input"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--nx-t3)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="nx-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--nx-t3)] p-1 flex items-center justify-center transition-colors hover:text-[var(--nx-p)]"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link
              href="#"
              className="text-xs text-[var(--nx-t3)] hover:text-[var(--nx-p)] transition-colors"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              onClick={(e) => e.preventDefault()}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="nx-btn-primary neon-glow w-full !py-3.5 !rounded-full text-base"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full"
                  style={{ animation: 'nx-spin 0.7s linear infinite' }}
                />
                Connexion…
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* ---- Error message ---- */}
        {error && (
          <div
            className="mt-4 p-3 rounded-xl text-center text-sm"
            style={{
              animation: 'nx-msg-in 0.35s ease both',
              background: 'rgba(255,75,110,0.1)',
              border: '1px solid rgba(255,75,110,0.3)',
              color: 'var(--nx-red)',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {/* ---- Divider ---- */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[rgba(123,92,255,0.15)]" />
          <span className="text-xs text-[var(--nx-t4)]" style={{ fontFamily: "'Outfit', sans-serif" }}>ou</span>
          <div className="flex-1 h-px bg-[rgba(123,92,255,0.15)]" />
        </div>

        {/* ---- Register link ---- */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-[var(--nx-p3)] hover:text-[var(--nx-p)] transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Pas encore membre ? <span className="font-semibold">Découvre NyXia</span>
          </Link>
        </div>

        {/* ---- Footer ---- */}
        <p
          className="text-center mt-6 text-[10px] text-[var(--nx-t4)]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          © 2026 NyXia IA — Publication Web™
        </p>
      </div>
    </div>
  );
}
