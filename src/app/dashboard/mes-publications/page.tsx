'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function MesPublicationsPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[rgba(79,163,255,0.12)] flex items-center justify-center text-[var(--nx-p3)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Mes publications
          </h1>
          <p className="text-sm text-[var(--nx-t3)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Historique et gestion de tes contenus
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
          La gestion complète de tes publications arrive bientôt. Tu pourras voir, modifier et relancer tous tes contenus.
        </p>
        <Link href="/dashboard" className="nx-btn-secondary">
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
