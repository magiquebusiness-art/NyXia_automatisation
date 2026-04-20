'use client';

import Image from 'next/image';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Recent publications data                                           */
/* ------------------------------------------------------------------ */

const recentPublications = [
  {
    id: 1,
    title: 'Lancement de notre nouvelle collection été',
    platform: 'Instagram',
    platformColor: '#E1306C',
    date: 'Il y a 2h',
    status: 'published' as const,
  },
  {
    id: 2,
    title: '5 astuces pour booster ton engagement',
    platform: 'Facebook',
    platformColor: '#1877F2',
    date: 'Programmé – 14h30',
    status: 'scheduled' as const,
  },
  {
    id: 3,
    title: 'Behind the scenes : création de contenu',
    platform: 'TikTok',
    platformColor: '#000000',
    date: 'Brouillon',
    status: 'draft' as const,
  },
  {
    id: 4,
    title: 'Témoignage client – Marie D.',
    platform: 'Instagram',
    platformColor: '#E1306C',
    date: 'Il y a 1j',
    status: 'published' as const,
  },
];

const statusLabels: Record<string, string> = {
  published: 'Publié',
  scheduled: 'Programmé',
  draft: 'Brouillon',
};

/* ------------------------------------------------------------------ */
/*  Dashboard Page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* ---- Top bar ---- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Bonjour ! 👋
          </h1>
          <p className="text-sm text-[var(--nx-t3)] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            NyXia est prête à travailler pour toi
          </p>
        </div>
        <div className="nx-float hidden sm:block">
          <Image
            src="/images/nyxia/NyXia-34.png"
            alt="NyXia"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
      </div>

      {/* ---- Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="nx-stat-card">
          <span className="nx-stat-card-label">Publications ce mois</span>
          <span className="nx-stat-card-value">147</span>
          <span className="nx-stat-card-change positive">+12% ↑</span>
        </div>
        <div className="nx-stat-card">
          <span className="nx-stat-card-label">Comptes connectés</span>
          <span className="nx-stat-card-value">4</span>
          <span className="nx-stat-card-change text-[var(--nx-t3)]">Instagram, Facebook, TikTok, LinkedIn</span>
        </div>
        <div className="nx-stat-card">
          <span className="nx-stat-card-label">Engagement moyen</span>
          <span className="nx-stat-card-value">8.3%</span>
          <span className="nx-stat-card-change positive">+2.1% ↑</span>
        </div>
      </div>

      {/* ---- Action card + NyXia info ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Action card */}
        <div className="nx-glass-static p-6 flex flex-col gap-4">
          <h2
            className="text-xl font-semibold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Prêt à publier ?
          </h2>
          <p className="text-sm text-[var(--nx-t3)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Crée une nouvelle publication et laisse NyXia optimiser ton contenu pour un maximum d&apos;impact.
          </p>
          <Link href="/dashboard/nouvelle-publication" className="nx-btn-primary neon-glow self-start !mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle publication
          </Link>
        </div>

        {/* NyXia info card */}
        <div className="nx-glass-static p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/nyxia/NyXia-34.png"
              alt="NyXia"
              width={40}
              height={40}
              className="nx-breathe rounded-full"
            />
            <div>
              <h2
                className="text-lg font-semibold text-[var(--nx-t)]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                NyXia IA
              </h2>
              <span className="flex items-center gap-1.5 text-xs text-[var(--nx-green)]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="w-2 h-2 rounded-full bg-[var(--nx-green)]" style={{ animation: 'nx-pulse-green 2s ease-in-out infinite' }} />
                En ligne
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--nx-t3)] leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Je suis ton assistante IA pour l&apos;automatisation sociale. Je peux créer du contenu, planifier tes publications et optimiser ton engagement. Dis-moi ce dont tu as besoin !
          </p>
        </div>
      </div>

      {/* ---- Recent publications ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold text-[var(--nx-t)]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Publications récentes
          </h2>
          <Link
            href="/dashboard/mes-publications"
            className="text-sm text-[var(--nx-p3)] hover:text-[var(--nx-p)] transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Voir tout →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {recentPublications.map((pub) => (
            <div key={pub.id} className="nx-pub-card !flex-row !items-center !justify-between">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="nx-pub-card-title truncate">{pub.title}</span>
                <div className="nx-pub-card-meta">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pub.platformColor }}
                  />
                  {pub.platform}
                  <span className="text-[var(--nx-t4)]">•</span>
                  {pub.date}
                </div>
              </div>
              <span className={`nx-pub-card-status ${pub.status}`}>
                {statusLabels[pub.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
