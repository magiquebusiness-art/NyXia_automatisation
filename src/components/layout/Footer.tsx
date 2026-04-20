'use client';

import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Fonctionnalites', href: '#fonctionnalites' },
  { label: 'Comment ca marche', href: '#comment-ca-marche' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'Connexion', href: '/login' },
] as const;

export default function Footer() {
  return (
    <footer
      className="relative w-full"
      style={{
        background: '#06101f',
        borderTop: '1px solid rgba(123,92,255,0.1)',
      }}
    >
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* ── Left: Logo + Tagline ────────────────── */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span
              className="text-2xl font-semibold tracking-wide"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                background: 'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 50%, #F4C842 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NyXia IA
            </span>
            <span
              className="mt-2 text-xs tracking-wide"
              style={{ color: '#8891B8', fontFamily: "'Outfit', sans-serif" }}
            >
              Automatisation — Propulse par La Psychologie du Clic
            </span>
          </div>

          {/* ── Center: Navigation Links ────────────── */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#a0a0b0',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right: Copyright ────────────────────── */}
          <div className="text-center md:text-right">
            <p
              className="text-xs leading-relaxed"
              style={{ color: '#4a5278', fontFamily: "'Outfit', sans-serif" }}
            >
              &copy; 2026 NyXia IA — Publication Web&trade;
            </p>
            <p
              className="text-xs leading-relaxed mt-0.5"
              style={{ color: '#4a5278', fontFamily: "'Outfit', sans-serif" }}
            >
              Tous droits reserves
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t border-[rgba(123,92,255,0.08)]"
        style={{ background: 'rgba(6,16,31,0.6)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          <p
            className="text-xs text-center"
            style={{ color: '#4a5278', fontFamily: "'Outfit', sans-serif" }}
          >
            Propulse par{' '}
            <span
              className="font-medium"
              style={{
                background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              La Psychologie du Clic
            </span>{' '}
            de Diane Boyer
          </p>
        </div>
      </div>
    </footer>
  );
}
