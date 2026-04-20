'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ParametresPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[rgba(244,200,66,0.12)] flex items-center justify-center text-[var(--nx-gold)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Paramètres
          </h1>
          <p className="text-sm text-[var(--nx-t3)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Configure ton espace NyXia
          </p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="nx-glass-static p-8 text-center">
        <Image
          src="/images/nyxia/NyXia-34.png"
          alt="NyXia"
          width={64}
          height={64}
          className="mx-auto mb-4 nx-float rounded-full"
        />
        <h2
          className="text-xl font-semibold text-[var(--nx-t)] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Bientôt disponible
        </h2>
        <p className="text-sm text-[var(--nx-t3)] mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Les paramètres de ton compte arrivent bientôt. Tu pourras gérer ton profil, tes préférences et ta sécurité.
        </p>
        <Link href="/dashboard" className="nx-btn-secondary">
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
