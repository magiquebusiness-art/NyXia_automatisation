'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Fonctionnalites', href: '#fonctionnalites' },
  { label: 'Comment ca marche', href: '#comment-ca-marche' },
  { label: 'Tarifs', href: '#tarifs' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A1628]/80 backdrop-blur-xl border-b border-[rgba(123,92,255,0.12)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ── Left: Logo ─────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-[rgba(123,92,255,0.3)] group-hover:ring-[rgba(123,92,255,0.6)] transition-all duration-300">
              <Image
                src="/images/Logo.png"
                alt="NyXia IA"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-lg md:text-xl font-semibold tracking-wide"
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
                className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase mt-0.5"
                style={{ color: '#8891B8', fontFamily: "'Outfit', sans-serif" }}
              >
                Automatisation
              </span>
            </div>
          </Link>

          {/* ── Center: Nav Links (desktop) ────────────── */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[rgba(123,92,255,0.1)] hover:text-white"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#a0a0b0',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ── Right: CTA + Hamburger ─────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'linear-gradient(135deg, #7B5CFF 0%, #5A6CFF 50%, #4FA3FF 100%)',
                boxShadow: '0 0 20px rgba(123,92,255,0.4), 0 0 40px rgba(123,92,255,0.15)',
              }}
            >
              Commencer
              <span className="text-base leading-none">&rarr;</span>
            </Link>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-[rgba(123,92,255,0.1)] transition-colors"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{
          background: 'rgba(10,22,40,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(123,92,255,0.1)',
        }}
      >
        <div className="px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[rgba(123,92,255,0.1)] hover:text-white"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: '#a0a0b0',
              }}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: 'linear-gradient(135deg, #7B5CFF 0%, #5A6CFF 50%, #4FA3FF 100%)',
                boxShadow: '0 0 20px rgba(123,92,255,0.4)',
              }}
            >
              Commencer
              <span className="text-base leading-none">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
