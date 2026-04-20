'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Check, X, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NyxiaChat from '@/components/layout/NyxiaChat';
import StarryBackground from '@/components/StarryBackground';

/* ═══════════════════════════════════════════════════════════════
   NyXia Automatisation — Landing Page
   Complete landing page with 10 sections + footer + chat widget
   ═══════════════════════════════════════════════════════════════ */

/* ── IntersectionObserver for Scroll Reveal ──────────────────── */

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('nx-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    const elements = document.querySelectorAll('.nx-fade-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

/* ── FAQ Accordion Item ──────────────────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="nx-faq">
      <button
        className="nx-faq-trigger"
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown size={18} className="nx-faq-trigger-icon" />
      </button>
      {open && (
        <div className="nx-faq-content" data-state="open">
          <div className="nx-faq-body">{answer}</div>
        </div>
      )}
    </div>
  );
}

/* ── Star Rating Component ───────────────────────────────────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="nx-star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={`nx-star ${i < count ? 'nx-star-filled' : ''}`}
          fill={i < count ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────── */

const LEXIQUE_PILLS = [
  { label: 'Curiosity Gap', color: 'purple' },
  { label: 'Open Loop', color: 'blue' },
  { label: 'Pattern Interrupt', color: 'green' },
  { label: 'Future Pacing', color: 'gold' },
  { label: 'Story-Selling', color: 'purple' },
  { label: 'FOMO', color: 'red' },
  { label: 'Anchrage', color: 'blue' },
  { label: 'Preuves Sociales', color: 'green' },
  { label: 'Scarcité', color: 'gold' },
  { label: 'Réciprocité', color: 'purple' },
] as const;

const AUDIENCE_CARDS = [
  { emoji: '📚', title: 'Auteurs', desc: 'Publiez vos livres et construisez votre audience en automatisant votre marketing.', stat: '+340% engagement', color: 'purple' },
  { emoji: '🎯', title: 'Coachs', desc: 'Attirez vos clients idéaux avec du contenu psychologique optimisé.', stat: '+280% leads', color: 'blue' },
  { emoji: '🧠', title: 'Thérapeutes', desc: 'Créez une présence en ligne authentique sans passer des heures sur les réseaux.', stat: '+5h/sem gagnées', color: 'green' },
  { emoji: '✨', title: 'Entrepreneurs Spirituels', desc: 'Partagez votre message avec une âme, propulsé par l\'intelligence artificielle.', stat: '+420% visibilité', color: 'purple' },
  { emoji: '🎓', title: 'Créateurs de Formations', desc: 'Remplissez vos cohortes automatiquement avec un contenu qui convertit.', stat: '+350% inscriptions', color: 'blue' },
  { emoji: '🎬', title: 'Créateurs de Contenu', desc: 'Multipliez votre production sans sacrifier la qualité ni votre temps.', stat: '+600% contenu', color: 'green' },
  { emoji: '🚀', title: 'Entrepreneurs', desc: 'Automatisez votre marketing et concentrez-vous sur ce qui compte.', stat: '+450% ROI', color: 'purple' },
  { emoji: '💡', title: 'Startups', desc: 'Scalez votre présence sociale sans agrandir votre équipe marketing.', stat: '-70% coûts', color: 'blue' },
] as const;

const FEATURE_CARDS = [
  { emoji: '🖼️', title: 'Générateur de contenu IA', desc: 'Créez des posts, articles et captions optimisés en quelques secondes grâce à l\'IA avancée de NyXia.', color: 'purple' },
  { emoji: '✍️', title: 'Copywriter IA Premium', desc: 'Du copywriting qui convertit, propulsé par La Psychologie du Clic. Chaque mot est stratégique.', color: 'blue' },
  { emoji: '📱', title: 'Publication multi-plateforme', desc: 'Publiez automatiquement sur Instagram, Facebook, LinkedIn, TikTok et plus — en un clic.', color: 'green' },
  { emoji: '🔍', title: 'Calendrier intelligent SEO', desc: 'Planifiez vos publications au moment optimal pour maximiser la portée et l\'engagement.', color: 'gold' },
  { emoji: '📸', title: 'Optimisation visuelle automatique', desc: 'Générez et optimisez visuels, thumbnails et stories pour chaque plateforme.', color: 'purple' },
  { emoji: '💬', title: 'Engagement automatique', desc: 'Répondez aux commentaires et DM automatiquement avec un ton humain et empathique.', color: 'blue' },
] as const;

const STEPS = [
  {
    num: '01',
    title: 'Tu dis à NyXia ce que tu veux',
    desc: 'Décris ton objectif, ta niche, ton style — NyXia comprend et s\'adapte instantanément à ton univers.',
    image: '/images/nyxia/NyXia-23.png',
    info: 'Interface conversationnelle naturelle',
  },
  {
    num: '02',
    title: 'NyXia fait TOUT le travail',
    desc: 'Création de contenu, copywriting, visuels, planification — NyXia génère tout automatiquement.',
    image: '/images/nyxia/NyXia-24.png',
    info: 'Automatisation complète 24/7',
  },
  {
    num: '03',
    title: 'Tu récoltes les résultats',
    desc: 'Plus de visibilité, plus de leads, plus de ventes — pendant que tu dors, NyXia travaille.',
    image: '/images/nyxia/NyXia-25.png',
    info: 'Résultats mesurables en temps réel',
  },
] as const;

const TESTIMONIALS = [
  {
    name: 'Marie-Claire D.',
    role: 'Auteure & Coach',
    text: 'NyXia a transformé ma présence en ligne. En 2 semaines, j\'ai doublé mon engagement sur Instagram sans passer plus de 10 minutes par jour.',
    stars: 5,
  },
  {
    name: 'Thomas R.',
    role: 'Entrepreneur Spirituel',
    text: 'Le copywriting IA est incroyable. Mes posts n\'ont jamais eu autant d\'impact. On dirait que NyXia lit dans l\'esprit de mon audience.',
    stars: 5,
  },
  {
    name: 'Sophie L.',
    role: 'Thérapeute & Formatrice',
    text: 'Je recommande NyXia à tous les thérapeutes. Je publie du contenu authentique sans y passer des heures. Ma visibilité a explosé.',
    stars: 5,
  },
] as const;

const PRICING_TIERS = [
  {
    tier: 'Starter',
    price: '0',
    currency: '',
    period: '/mois',
    desc: 'Parfait pour découvrir NyXia et commencer à automatiser.',
    featured: false,
    features: [
      { text: '3 publications / semaine', included: true },
      { text: '1 réseau social', included: true },
      { text: 'Générateur de contenu basique', included: true },
      { text: 'Copywriter IA (5 requêtes/jour)', included: true },
      { text: 'Calendrier manuel', included: true },
      { text: 'Engagement automatique', included: false },
      { text: 'Analytics avancés', included: false },
      { text: 'Support prioritaire', included: false },
    ],
  },
  {
    tier: 'Pro',
    price: '47',
    currency: '$',
    period: '/mois',
    desc: 'L\'automatisation complète pour les entrepreneurs sérieux.',
    featured: true,
    features: [
      { text: 'Publications illimitées', included: true },
      { text: '4+ réseaux sociaux', included: true },
      { text: 'Générateur de contenu IA avancé', included: true },
      { text: 'Copywriter IA Premium (illimité)', included: true },
      { text: 'Calendrier intelligent SEO', included: true },
      { text: 'Engagement automatique', included: true },
      { text: 'Analytics avancés', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
  {
    tier: 'Business',
    price: '97',
    currency: '$',
    period: '/mois',
    desc: 'Pour les équipes et les businesses qui veulent dominer.',
    featured: false,
    features: [
      { text: 'Tout du plan Pro', included: true },
      { text: 'Multi-comptes (5 profils)', included: true },
      { text: 'Optimisation visuelle automatique', included: true },
      { text: 'API & intégrations custom', included: true },
      { text: 'White-label', included: true },
      { text: 'Account manager dédié', included: true },
      { text: 'Formation personnalisée', included: true },
      { text: 'SLA 99.9% uptime', included: true },
    ],
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Qu\'est-ce que NyXia Automatisation exactement ?',
    answer: 'NyXia est une plateforme d\'automatisation IA qui gère entièrement votre présence sur les réseaux sociaux. Elle crée du contenu, le publie, engage votre audience et optimise votre stratégie — tout automatiquement, propulsé par La Psychologie du Clic.',
  },
  {
    question: 'Ai-je besoin de compétences techniques ?',
    answer: 'Absolument pas. NyXia est conçue pour être utilisée par des entrepreneurs, auteurs, coachs et créateurs — pas des développeurs. L\'interface est intuitive et conversationnelle. Vous dites ce que vous voulez, NyXia fait le reste.',
  },
  {
    question: 'Comment La Psychologie du Clic améliore-t-elle mon contenu ?',
    answer: 'La méthodologie de Diane Boyer intègre des principes de neurosciences et de psychologie comportementale directement dans l\'IA de NyXia. Chaque post, chaque caption, chaque séquence est optimisée pour capter l\'attention, créer de l\'engagement et convertir — de façon éthique et authentique.',
  },
  {
    question: 'Quels réseaux sociaux sont supportés ?',
    answer: 'NyXia supporte Instagram, Facebook, LinkedIn, TikTok, X (Twitter) et Pinterest. De nouvelles plateformes sont ajoutées régulièrement. Le plan Pro inclut 4+ réseaux, et le plan Business permet de gérer jusqu\'à 5 profils différents.',
  },
  {
    question: 'Puis-je essayer NyXia gratuitement ?',
    answer: 'Oui ! Le plan Starter est entièrement gratuit et vous permet de découvrir les fonctionnalités de base de NyXia. Vous pouvez upgrader vers Pro ou Business à tout moment pour débloquer l\'automatisation complète.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons un chiffrement de niveau bancaire (AES-256), des serveurs sécurisés au Canada, et nous ne partageons jamais vos données avec des tiers. Votre contenu et vos stratégies restent 100% privés.',
  },
  {
    question: 'Combien de temps faut-il pour voir des résultats ?',
    answer: 'La plupart de nos utilisateurs voient une augmentation significative de leur engagement dès la première semaine. En moyenne, nos clients constatent +280% de leads et +340% d\'engagement dans les 30 premiers jours.',
  },
] as const;

/* ═══════════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  useScrollReveal();

  return (
    <>
      <StarryBackground />
      <Navbar />

      <main className="relative z-10">
        {/* ═══════════════════════════════════════════════════════
            1. HERO SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="min-h-screen flex items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(123,92,255,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 70%, rgba(79,163,255,0.04) 0%, transparent 50%)',
          }}
        >
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── Left: Text Content ─────────────────────── */}
            <div className="flex flex-col gap-6 lg:gap-8">
              {/* Badge */}
              <div
                className="nx-fade-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full w-fit"
                style={{
                  background: 'rgba(0,230,118,0.08)',
                  border: '1px solid rgba(0,230,118,0.2)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#00E676',
                    boxShadow: '0 0 8px rgba(0,230,118,0.6)',
                    animation: 'nx-pulse-green 2s ease-in-out infinite',
                  }}
                />
                <span
                  className="text-sm font-semibold tracking-wide"
                  style={{
                    color: '#00E676',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Automatisation IA — Disponible maintenant
                </span>
              </div>

              {/* Heading */}
              <h1
                className="nx-fade-up nx-fade-up-delay-1 leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Ton automatisation{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  IA
                </em>{' '}
                par{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #F4C842, #FFE082, #F4C842)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NyXia
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="nx-fade-up nx-fade-up-delay-2 text-lg lg:text-xl leading-relaxed max-w-xl"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#8891B8',
                }}
              >
                NyXia automatise tes réseaux sociaux avec une IA propulsée par
                La Psychologie du Clic. Plus de contenu, plus d&apos;engagement,
                zéro effort.
              </p>

              {/* Sub-line */}
              <p
                className="nx-fade-up nx-fade-up-delay-2 text-sm font-medium tracking-wider uppercase"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#4a5278',
                  letterSpacing: '0.12em',
                }}
              >
                Publication Web™ — Visionnaire depuis 1997
              </p>

              {/* CTA Buttons */}
              <div className="nx-fade-up nx-fade-up-delay-3 flex flex-wrap gap-4 mt-2">
                <Link href="/login" className="nx-btn-primary text-base">
                  ✦ Commencer l&apos;automatisation
                </Link>
                <a
                  href="#comment-ca-marche"
                  className="nx-btn-secondary text-base"
                >
                  Voir comment ça marche →
                </a>
              </div>

              {/* Stats Row */}
              <div className="nx-fade-up nx-fade-up-delay-4 flex flex-wrap gap-6 mt-4">
                {[
                  { value: '24/7', label: 'Auto-publication' },
                  { value: '4+', label: 'Réseaux sociaux' },
                  { value: 'IA', label: 'Psychologie du Clic' },
                ].map((stat) => (
                  <div key={stat.value} className="flex items-center gap-3">
                    <span
                      className="text-2xl lg:text-3xl font-bold"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        background:
                          'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#8891B8',
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Image + Floating Cards ──────────── */}
            <div className="relative flex items-center justify-center lg:justify-end">
              {/* Glow behind image */}
              <div
                className="absolute w-[80%] h-[80%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(123,92,255,0.2) 0%, rgba(79,163,255,0.08) 40%, transparent 70%)',
                  filter: 'blur(40px)',
                  top: '10%',
                  left: '10%',
                }}
              />

              {/* Main Image */}
              <div className="relative nx-img-glow">
                <Image
                  src="/images/nyxia/NyXia.png"
                  alt="NyXia IA - Automatisation Intelligence Artificielle"
                  width={520}
                  height={520}
                  className="nx-img-hero rounded-3xl object-cover"
                  priority
                />
              </div>

              {/* Floating Card 1 */}
              <div className="nx-hero-card nx-hero-card-1">
                <div className="nx-hero-card-icon purple">🚀</div>
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#FFFFFF',
                    }}
                  >
                    +340%
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#8891B8',
                    }}
                  >
                    Engagement
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="nx-hero-card nx-hero-card-2">
                <div className="nx-hero-card-icon green">✓</div>
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#FFFFFF',
                    }}
                  >
                    24/7
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#8891B8',
                    }}
                  >
                    Auto-publié
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. PSYCHO DU CLIC SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          style={{
            background:
              'linear-gradient(180deg, rgba(123,92,255,0.03) 0%, rgba(79,163,255,0.06) 50%, rgba(123,92,255,0.03) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image + Quote Card */}
            <div className="relative nx-fade-up flex items-center justify-center">
              {/* Glow */}
              <div
                className="absolute w-[70%] h-[70%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(123,92,255,0.15) 0%, transparent 60%)',
                  filter: 'blur(30px)',
                  top: '15%',
                  left: '15%',
                }}
              />
              <div className="relative nx-img-glow">
                <Image
                  src="/images/nyxia/NyXia-27gauche.png"
                  alt="NyXia - La Psychologie du Clic"
                  width={480}
                  height={540}
                  className="nx-img-hero rounded-3xl object-cover"
                />
              </div>

              {/* Floating Quote Card */}
              <div
                className="nx-hero-card nx-hero-card-2"
                style={{
                  maxWidth: '240px',
                  whiteSpace: 'normal',
                }}
              >
                <div className="nx-hero-card-icon gold">💡</div>
                <div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#D6D9F0',
                    }}
                  >
                    &ldquo;Chaque clic est une décision psychologique.&rdquo;
                  </div>
                  <div
                    className="text-[10px] mt-1 font-semibold"
                    style={{ color: '#F4C842' }}
                  >
                    — Diane Boyer
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="flex flex-col gap-6">
              {/* Eyebrow */}
              <div className="nx-eyebrow nx-fade-up">
                <span className="nx-eyebrow-dot" />
                Le cerveau de NyXia
              </div>

              {/* Heading */}
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Propulsée par{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  La Psychologie du Clic
                </em>
              </h2>

              {/* Description */}
              <p
                className="nx-fade-up nx-fade-up-delay-2 leading-relaxed"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#8891B8',
                  fontSize: '1.05rem',
                }}
              >
                NyXia n&apos;est pas qu&apos;un outil d&apos;automatisation. C&apos;est une
                IA formée sur la méthodologie de{' '}
                <span style={{ color: '#F4C842', fontWeight: 600 }}>
                  Diane Boyer
                </span>
                , fondatrice de La Psychologie du Clic. Chaque contenu généré
                utilise des principes de neuroscience comportementale pour capter
                l&apos;attention, créer l&apos;engagement et convertir — de façon
                éthique et authentique.
              </p>

              {/* Lexique Pills */}
              <div className="nx-fade-up nx-fade-up-delay-3 flex flex-wrap gap-2.5 mt-2">
                {LEXIQUE_PILLS.map((pill, i) => (
                  <span
                    key={pill.label}
                    className={`nx-lexique-pill ${pill.color}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. AUDIENCE SECTION ("Pour qui")
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg" id="pour-qui">
          <div className="max-w-7xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Pour qui
              </div>
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Conçu pour les{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  entrepreneurs
                </em>{' '}
                qui ont une mission
              </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {AUDIENCE_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className={`nx-audience-card nx-fade-up nx-fade-up-delay-${Math.min(i % 4 + 1, 5)}`}
                >
                  <div className={`nx-audience-card-icon ${card.color}`}>
                    {card.emoji}
                  </div>
                  <h3 className="nx-audience-card-title">{card.title}</h3>
                  <p className="nx-audience-card-desc">{card.desc}</p>
                  <div className="nx-audience-card-stat">
                    <span className="nx-audience-card-stat-value">
                      {card.stat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. FEATURES SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          id="fonctionnalites"
          style={{
            background:
              'linear-gradient(180deg, rgba(123,92,255,0.04) 0%, rgba(79,163,255,0.06) 50%, rgba(123,92,255,0.04) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12 lg:mb-16">
              <h2
                className="nx-fade-up"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Une{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  Automatisation IA
                </em>{' '}
                complète
              </h2>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURE_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className={`nx-feature-card nx-fade-up nx-fade-up-delay-${Math.min(i % 3 + 1, 5)}`}
                >
                  <div className={`nx-feature-card-icon ${card.color}`}>
                    {card.emoji}
                  </div>
                  <h3 className="nx-feature-card-title">{card.title}</h3>
                  <p className="nx-feature-card-desc">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            5. COMMENT CA MARCHE (3 Steps)
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg" id="comment-ca-marche">
          <div className="max-w-7xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Comment ça marche
              </div>
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                3 étapes.{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #00E676, #69F0AE, #00E676)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  0 effort.
                </span>
              </h2>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className={`nx-fade-up nx-fade-up-delay-${i + 1} flex flex-col gap-5`}
                >
                  {/* Step Number */}
                  <span
                    className="text-5xl font-bold"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      background:
                        'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      opacity: 0.7,
                    }}
                  >
                    {step.num}
                  </span>

                  {/* Image */}
                  <div className="relative nx-img-glow">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={380}
                      height={280}
                      className="nx-img-hero rounded-2xl object-cover w-full"
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-semibold"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#FFFFFF',
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="leading-relaxed"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#8891B8',
                      fontSize: '0.95rem',
                    }}
                  >
                    {step.desc}
                  </p>

                  {/* Info Box */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{
                      background: 'rgba(123,92,255,0.06)',
                      border: '1px solid rgba(123,92,255,0.12)',
                    }}
                  >
                    <span
                      className="text-lg"
                      role="img"
                      aria-label="info"
                    >
                      ℹ️
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#4FA3FF',
                      }}
                    >
                      {step.info}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            6. TÉMOIGNAGES
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          style={{
            background:
              'linear-gradient(180deg, rgba(79,163,255,0.03) 0%, rgba(123,92,255,0.06) 50%, rgba(79,163,255,0.03) 100%)',
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Témoignages
              </div>
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Ils ont automatisé avec{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NyXia
                </span>
              </h2>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`nx-glass nx-fade-up nx-fade-up-delay-${i + 1} rounded-2xl p-6 flex flex-col gap-4`}
                >
                  <StarRating count={t.stars} />
                  <p
                    className="leading-relaxed flex-1"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#D6D9F0',
                      fontSize: '0.95rem',
                    }}
                  >
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div
                    className="pt-4"
                    style={{
                      borderTop: '1px solid rgba(123,92,255,0.1)',
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-sm mt-0.5"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#8891B8',
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            7. PRICING
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg" id="tarifs">
          <div className="max-w-7xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Tarifs
              </div>
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Un plan pour chaque{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  ambition
                </em>
              </h2>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {PRICING_TIERS.map((tier, i) => (
                <div
                  key={tier.tier}
                  className={`nx-pricing-card nx-fade-up nx-fade-up-delay-${i + 1} ${
                    tier.featured ? 'nx-featured' : ''
                  }`}
                >
                  {/* Featured Badge */}
                  {tier.featured && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                      style={{
                        background: 'rgba(123,92,255,0.15)',
                        border: '1px solid rgba(123,92,255,0.3)',
                        color: '#7B5CFF',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      ✦ Le plus populaire
                    </span>
                  )}

                  {/* Tier Name */}
                  <span className="nx-pricing-tier">{tier.tier}</span>

                  {/* Price */}
                  <div className="nx-pricing-price">
                    {tier.currency && (
                      <span className="nx-pricing-currency">
                        {tier.currency}
                      </span>
                    )}
                    {tier.price}
                    <span className="nx-pricing-period">{tier.period}</span>
                  </div>

                  {/* Description */}
                  <p className="nx-pricing-desc">{tier.desc}</p>

                  {/* Features */}
                  <ul className="nx-pricing-features">
                    {tier.features.map((f) => (
                      <li key={f.text}>
                        {f.included ? (
                          <span className="nx-check">
                            <Check size={16} />
                          </span>
                        ) : (
                          <span className="nx-cross">
                            <X size={16} />
                          </span>
                        )}
                        <span
                          style={{
                            color: f.included ? '#D6D9F0' : '#4a5278',
                          }}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href="/login"
                    className={`w-full mt-4 ${
                      tier.featured ? 'nx-btn-primary' : 'nx-btn-secondary'
                    }`}
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                    }}
                  >
                    {tier.price === '0'
                      ? 'Commencer gratuitement'
                      : `Choisir ${tier.tier}`}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            8. FAQ
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          style={{
            background:
              'linear-gradient(180deg, rgba(123,92,255,0.03) 0%, transparent 100%)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Center Heading */}
            <div className="text-center mb-12">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                FAQ
              </div>
              <h2
                className="nx-fade-up nx-fade-up-delay-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                }}
              >
                Questions{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  fréquentes
                </em>
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="flex flex-col gap-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="nx-fade-up">
                  <FaqItem question={faq.question} answer={faq.answer} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            9. CTA FINAL SECTION
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-cta-section">
          {/* Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(123,92,255,0.12) 0%, rgba(79,163,255,0.06) 30%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2
              className="nx-fade-up"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '20px',
              }}
            >
              Ton automatisation{' '}
              <em
                style={{
                  background:
                    'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontStyle: 'italic',
                }}
              >
                t&apos;attend
              </em>
            </h2>

            <p
              className="nx-fade-up nx-fade-up-delay-1 leading-relaxed mb-8"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: '#8891B8',
                fontSize: '1.1rem',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Rejoins les entrepreneurs qui ont déjà automatisé leur marketing
              avec NyXia. Commence gratuitement, sans carte bancaire.
            </p>

            <div className="nx-fade-up nx-fade-up-delay-2 nx-cta-buttons">
              <Link href="/login" className="nx-btn-primary text-base">
                ✦ Commencer l&apos;automatisation
              </Link>
              <a href="#tarifs" className="nx-btn-secondary text-base">
                Voir les tarifs →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════
          10. FOOTER
          ═══════════════════════════════════════════════════════ */}
      <Footer />

      {/* ═══════════════════════════════════════════════════════
          11. NYXIA CHAT WIDGET
          ═══════════════════════════════════════════════════════ */}
      <NyxiaChat />
    </>
  );
}
