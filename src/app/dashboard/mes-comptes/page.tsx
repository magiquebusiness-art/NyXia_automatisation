'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MesComptesPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[rgba(0,230,118,0.12)] flex items-center justify-center text-[var(--nx-green)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Mes comptes
          </h1>
          <p className="text-sm text-[var(--nx-t3)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Gère tes réseaux sociaux connectés
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
          La gestion de tes comptes sociaux arrive bientôt. Tu pourras connecter et configurer tes plateformes facilement.
        </p>
        <Link href="/dashboard" className="nx-btn-secondary">
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
