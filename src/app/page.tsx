'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Star } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NyxiaChat from '@/components/layout/NyxiaChat';
import StarryBackground from '@/components/StarryBackground';

/* ═══════════════════════════════════════════════════════════════
   NyXia Automation — Landing Page
   Texte du document "Base Agent Automatisation NyXia"
   Images : Automation1, Logo, TravailDureNyxia, automate2, NyXia-26
   Effet glow : filter: drop-shadow() — suit le contour du personnage
   Prix unique : 47$/mois
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

const TESTIMONIALS = [
  {
    initial: 'M',
    name: 'Marie L.',
    role: 'Entrepreneuse',
    text: "Depuis que j'utilise NyXia, j'ai repris 15h par semaine. Mes publications sont plus engageantes que jamais. C'est comme avoir une attach\u00e9e de presse permanente.",
    stars: 5,
  },
  {
    initial: 'D',
    name: 'David R.',
    role: 'Coach en ligne',
    text: "Je d\u00e9testais les r\u00e9seaux sociaux. Maintenant, NyXia publie pour moi et mes clients arrivent tout seuls. Mon business a doubl\u00e9 en 3 mois.",
    stars: 5,
  },
  {
    initial: 'S',
    name: 'Sophie M.',
    role: 'Esth\u00e9ticienne',
    text: "Je ne savais m\u00eame pas comment r\u00e9diger un post. NyXia a tout compris d\u00e8s le premier jour. Mes clientes me disent que mes posts sont incroyables !",
    stars: 5,
  },
] as const;

const FEATURES = [
  {
    emoji: '\u270f\ufe0f',
    title: 'Titres qui stoppent le scroll',
    desc: 'NyXia cr\u00e9e des titres qui captent l\u2019attention en moins d\u2019une seconde. Fini les publications ignor\u00e9es.',
  },
  {
    emoji: '\ud83d\udcac',
    title: 'Textes qui engagent et convertissent',
    desc: 'Des textes persuasifs, authentiques et parfaitement adapt\u00e9s \u00e0 ton audience. Ton style, ta voix.',
  },
  {
    emoji: '\ud83d\udcf1',
    title: 'Publication multi-plateforme',
    desc: 'Facebook, Instagram, TikTok, YouTube \u2014 NyXia publie partout en m\u00eame temps. Un seul point de contr\u00f4le.',
  },
  {
    emoji: '\ud83d\udcc5',
    title: 'Calendrier intelligent',
    desc: 'NyXia sait quand publier pour maximiser la port\u00e9e. Plus besoin de chercher le bon cr\u00e9neau horaire.',
  },
  {
    emoji: '\ud83c\udfa8',
    title: 'Ton style, ta voix',
    desc: "NyXia apprend ton ton, ton vocabulaire, ta personnalit\u00e9. Tes publications te ressemblent. Vraiment.",
  },
  {
    emoji: '\ud83e\udd16',
    title: 'Automatisation 24/7',
    desc: 'Repurposing automatique, d\u00e9tection de tendances, A/B testing des titres, analyse de l\u2019engagement et ajustement auto.',
  },
] as const;

const STEPS = [
  {
    num: '01',
    title: 'Tu dis \u00e0 NyXia ce que tu veux',
    desc: 'Tu lui parles, tu lui envoies une voix, un simple mot \u2014 NyXia comprend. C\u2019est aussi simple que de parler \u00e0 un coll\u00e8gue de confiance.',
    hint: 'Pas besoin d\u2019\u00e9crire quoi que ce soit. Pas besoin de pr\u00e9parer des images. NyXia fait tout \u00e0 ta place.',
    image: '/images/TravailDureNyxia.png',
  },
  {
    num: '02',
    title: 'NyXia fait TOUT le travail',
    desc: 'Elle cr\u00e9e le contenu, trouve les titres accrocheurs, r\u00e9dige les textes, choisit les meilleurs moments et publie automatiquement.',
    hint: "Tu n\u2019as pas besoin d\u2019\u00eatre l\u00e0. Tu n\u2019as pas besoin de valider quoi que ce soit. NyXia g\u00e8re tout de A \u00e0 Z.",
    image: '/images/automate2.png',
  },
  {
    num: '03',
    title: 'Tu r\u00e9coltes les r\u00e9sultats',
    desc: 'Tes publications sont en ligne, ton audience s\u2019engage, les prospects arrivent. Tu regardes les notifications qui d\u00e9filent \u2014 c\u2019est tout.',
    hint: "Ta seule job : regarder les notifications qui d\u00e9filent. Les clients, les likes, les messages \u2014 tout vient \u00e0 toi.",
    image: '/images/nyxia/NyXia-25.png',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Je n'y connais rien en technologie, c'est pour moi ?",
    answer: "Oui, c'est fait exactement pour toi. NyXia a \u00e9t\u00e9 con\u00e7ue pour les entrepreneurs qui ne veulent pas se prendre la t\u00eate avec la technologie. Si tu sais parler, tu sais utiliser NyXia. Point final.",
  },
  {
    question: 'Est-ce que je dois \u00e9crire le contenu moi-m\u00eame ?',
    answer: "Non. Tu dis simplement \u00e0 NyXia ce que tu veux communiquer \u2014 un mot, une phrase, une id\u00e9e \u2014 et elle s'occupe de tout. Elle r\u00e9dige, elle optimise, elle publie. Tu n'as rien \u00e0 \u00e9crire.",
  },
  {
    question: 'Combien de publications est-ce que j\u2019ai par mois ?',
    answer: "Si tu publies en moyenne 2 \u00e0 8 fois par jour, NyXia le fera facilement pour toi ! Il n\u2019y a pas de limite fixe \u2014 NyXia publie aussi souvent que ton entreprise en a besoin. C\u2019est illimit\u00e9.",
  },
  {
    question: 'Quelles plateformes sont incluses ?',
    answer: "Facebook (profil, pages, groupes), Instagram, TikTok et YouTube. NyXia publie sur toutes ces plateformes simultan\u00e9ment. Tu n\u2019as pas besoin de te connecter sur chacune.",
  },
  {
    question: 'Est-ce que je peux annuler \u00e0 tout moment ?',
    answer: "Oui, aucun engagement. Tu peux annuler ton abonnement quand tu veux, en un clic. Pas de frais cach\u00e9s, pas de p\u00e9riode minimum. C\u2019est toi qui d\u00e9cides.",
  },
  {
    question: 'Est-ce que c\u2019est en fran\u00e7ais ?',
    answer: "Bien s\u00fbr ! NyXia parle fran\u00e7ais et anglais. Elle cr\u00e9e du contenu dans la langue de ton choix et s\u2019adapte au ton de ta marque. Que tu sois au Qu\u00e9bec, en France ou en Belgique, elle te comprend.",
  },
  {
    question: 'Combien de temps \u00e7a prend pour que NyXia commence \u00e0 publier ?',
    answer: "D\u00e8s que tu lui donnes ta premi\u00e8re id\u00e9e, c\u2019est parti ! En quelques minutes, NyXia cr\u00e9e ta premi\u00e8re publication et la met en ligne. Pas de temps d\u2019attente, pas de configuration complexe.",
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
            <div className="flex flex-col gap-5 lg:gap-6">
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
                  Automatisation IA \u2014 Disponible maintenant
                </span>
              </div>

              {/* Heading */}
              <h1
                className="nx-fade-up nx-fade-up-delay-1 leading-tight"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Tu as une entreprise \u00e0 faire grandir, pas le temps de publier partout.{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  NyXia
                </em>{' '}
                s&apos;en occupe.
              </h1>

              {/* Subtitle from doc */}
              <p
                className="nx-fade-up nx-fade-up-delay-2 text-lg lg:text-xl leading-relaxed max-w-xl"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#8891B8',
                }}
              >
                NyXia n&apos;est pas un outil \u2014 c&apos;est ta collaboratrice IA. Elle comprend ton audience,
                cr\u00e9e du contenu engageant et publie pour toi sur tous tes r\u00e9seaux sociaux.
                Automatiquement. Intelligemment. Sans que tu aies \u00e0 lever le doigt.
              </p>

              {/* Slogan */}
              <p
                className="nx-fade-up nx-fade-up-delay-2 text-base font-semibold tracking-wide"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: 'linear-gradient(135deg, #F4C842, #FFE082)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NyXia en automatique travail pour toi !
              </p>

              {/* CTA Buttons */}
              <div className="nx-fade-up nx-fade-up-delay-3 flex flex-wrap gap-4 mt-2">
                <Link href="/login" className="nx-btn-primary text-base">
                  \u2726 Engager NyXia aujourd&apos;hui
                </Link>
                <a
                  href="#comment-ca-marche"
                  className="nx-btn-secondary text-base"
                >
                  Comment \u00e7a marche \u2192
                </a>
              </div>
            </div>

            {/* ── Right: Image with proper glow ──────────── */}
            <div className="relative flex items-center justify-center lg:justify-end">
              {/* Breathing glow blob behind image */}
              <div className="nx-glow-blob" />

              {/* Main Image with drop-shadow that follows character shape */}
              <div className="nx-img-glow nx-img-float">
                <Image
                  src="/images/Automation1.png"
                  alt="NyXia IA - Automatisation Intelligence Artificielle"
                  width={480}
                  height={720}
                  className="nx-img-hero object-cover"
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
                    24/7
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#8891B8',
                    }}
                  >
                    Auto-publi\u00e9
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
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            2. DOULEUR SECTION
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          style={{
            background:
              'linear-gradient(180deg, rgba(123,92,255,0.03) 0%, rgba(79,163,255,0.06) 50%, rgba(123,92,255,0.03) 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
              <span className="nx-eyebrow-dot" />
              Tu connais cette fatigue ?
            </div>
            <h2
              className="nx-fade-up nx-fade-up-delay-1 mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                fontWeight: 600,
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              Tu te l\u00e8ves le matin avec une seule id\u00e9e en t\u00eate :{' '}
              <em
                style={{
                  background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontStyle: 'italic',
                }}
              >
                il faut publier.
              </em>{' '}
              Encore. Toujours.
            </h2>
            <div
              className="nx-fade-up nx-fade-up-delay-2 space-y-4 text-lg leading-relaxed"
              style={{ color: '#8891B8', fontFamily: "'Outfit', sans-serif" }}
            >
              <p>
                Sur Facebook, Instagram, TikTok, YouTube\u2026 Tu passes 3 \u00e0 4 heures par jour \u00e0
                essayer de cr\u00e9er du contenu, \u00e0 trouver des id\u00e9es, \u00e0 r\u00e9diger des textes qui ne font
                m\u00eame pas 10 likes.
              </p>
              <p>
                Tu ne sais plus quoi \u00e9crire. L&apos;inspiration est partie en vacances \u2014 et elle ne revient
                pas. Ton t\u00e9l\u00e9phone te stresse. Tes r\u00e9seaux sociaux te donnent l&apos;impression de
                courir apr\u00e8s ton propre succ\u00e8s.
              </p>
              <p style={{ color: '#D6D9F0', fontWeight: 600 }}>
                Pendant ce temps, tes concurrents publient tous les jours. Ils grandissent. Et toi, tu es \u00e9puis\u00e9(e).
              </p>
              <p
                className="text-2xl font-bold mt-8"
                style={{
                  background: 'linear-gradient(135deg, #F4C842, #FFE082)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                }}
              >
                Et si tout \u00e7a\u2026 quelqu&apos;un d&apos;autre le faisait pour toi ?
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            3. NYXIA COLLABORATRICE (avec image Psychologie du Clic)
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image with proper glow */}
            <div className="relative nx-fade-up flex items-center justify-center">
              <div className="nx-glow-blob" />
              <div className="nx-img-glow nx-img-float">
                <Image
                  src="/images/nyxia/NyXia-27gauche.png"
                  alt="NyXia - La Psychologie du Clic"
                  width={440}
                  height={540}
                  className="nx-img-hero object-cover"
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
                    &ldquo;Chaque clic est une d\u00e9cision psychologique.&rdquo;
                  </div>
                  <div
                    className="text-[10px] mt-1 font-semibold"
                    style={{ color: '#F4C842' }}
                  >
                    \u2014 Diane Boyer
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="flex flex-col gap-5">
              <div className="nx-eyebrow nx-fade-up">
                <span className="nx-eyebrow-dot" />
                Ta collaboratrice IA
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
                NyXia, ta collaboratrice IA \u2014{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F4C842, #FFE082)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  La seule qui ne te laisse jamais tomber
                </span>
              </h2>

              <p
                className="nx-fade-up nx-fade-up-delay-2 leading-relaxed"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: '#8891B8',
                  fontSize: '1.05rem',
                }}
              >
                Pas de pauses, pas de journ\u00e9es off, pas de cr\u00e9ativit\u00e9 \u00e0 plat.
                NyXia travaille pour toi 24h/24, 7j/7.
              </p>

              <ul className="nx-fade-up nx-fade-up-delay-3 space-y-3">
                {[
                  'Comprend ton audience et parle sa langue',
                  'Cr\u00e9e des publications engageantes et professionnelles',
                  'Publie au bon moment, sur les bonnes plateformes',
                  'Te lib\u00e8re pour te concentrer sur ce que tu aimes faire',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1 text-sm"
                      style={{ color: '#7B5CFF' }}
                    >
                      \u2726
                    </span>
                    <span
                      className="leading-relaxed"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#D6D9F0',
                        fontSize: '1rem',
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
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
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Ce que NyXia fait concr\u00e8tement
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
                Du titre accrocheur au texte convertissant,{' '}
                <em
                  style={{
                    background:
                      'linear-gradient(135deg, #7B5CFF 0%, #4FA3FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  NyXia g\u00e8re tout
                </em>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((card, i) => (
                <div
                  key={card.title}
                  className={`nx-glass nx-fade-up nx-fade-up-delay-${Math.min(i % 3 + 1, 5)} rounded-2xl p-6 flex flex-col gap-3`}
                >
                  <span className="text-2xl">{card.emoji}</span>
                  <h3
                    className="font-semibold text-lg"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#FFFFFF',
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="leading-relaxed text-sm"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: '#8891B8',
                    }}
                  >
                    {card.desc}
                  </p>
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
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Comment \u00e7a marche
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
                3 \u00e9tapes.{' '}
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #00E676, #69F0AE, #00E676)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  0 effort.
                </span>{' '}
                Tu ne fais quasiment rien \u2014 NyXia fait tout.
              </h2>
            </div>

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

                  {/* Image with proper glow */}
                  <div className="relative">
                    <div className="nx-glow-blob" style={{ width: '70%', height: '70%' }} />
                    <div className="nx-img-glow">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={380}
                        height={570}
                        className="nx-img-hero object-cover w-full"
                      />
                    </div>
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

                  {/* Hint Box */}
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(123,92,255,0.06)',
                      border: '1px solid rgba(123,92,255,0.12)',
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#4FA3FF',
                      }}
                    >
                      💡 {step.hint}
                    </p>
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
            <div className="text-center mb-12 lg:mb-16">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                T\u00e9moignages
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
                Ce qu&apos;ils disent de{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NyXia
                </span>
              </h2>
              <p
                className="nx-fade-up nx-fade-up-delay-2 mt-3"
                style={{ color: '#8891B8', fontFamily: "'Outfit', sans-serif" }}
              >
                Ils ont repris le contr\u00f4le de leur vie gr\u00e2ce \u00e0 NyXia.
              </p>
            </div>

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
                    className="pt-4 flex items-center gap-3"
                    style={{
                      borderTop: '1px solid rgba(123,92,255,0.1)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                        color: '#FFFFFF',
                      }}
                    >
                      {t.initial}
                    </div>
                    <div>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            7. NYXIA-26 IMAGE SECTION (avant tarifs)
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
            <div className="relative w-full max-w-lg">
              <div className="nx-glow-blob" />
              <div className="nx-img-glow nx-img-float">
                <Image
                  src="/images/NyXia-26.png"
                  alt="NyXia Automation - Ta collaboratrice \u00e0 vie"
                  width={480}
                  height={720}
                  className="nx-img-hero object-cover"
                />
              </div>
            </div>
            <div className="text-center">
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
                Ta collaboratrice{' '}
                <em
                  style={{
                    background: 'linear-gradient(135deg, #F4C842, #FFE082)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                  }}
                >
                  \u00e0 vie
                </em>
              </h2>
              <p
                className="nx-fade-up nx-fade-up-delay-1 mt-3"
                style={{
                  color: '#8891B8',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.1rem',
                }}
              >
                Pour le prix d&apos;un caf\u00e9 par jour, NyXia travaille pour toi 24h/24.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            8. PRICING — 47$ SEULEMENT
            ═══════════════════════════════════════════════════════ */}
        <section
          className="nx-section-lg"
          id="tarifs"
          style={{
            background:
              'linear-gradient(180deg, rgba(123,92,255,0.04) 0%, rgba(79,163,255,0.08) 50%, rgba(123,92,255,0.04) 100%)',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
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
                Ta collaboratrice \u00e0 vie
              </h2>
              <p
                className="nx-fade-up nx-fade-up-delay-2 mt-3"
                style={{ color: '#8891B8', fontFamily: "'Outfit', sans-serif" }}
              >
                Seulement
              </p>
            </div>

            {/* Single Pricing Card */}
            <div
              className="nx-fade-up nx-fade-up-delay-3 nx-pricing-card nx-featured rounded-3xl p-8 md:p-10 flex flex-col items-center text-center gap-6"
            >
              {/* Badge */}
              <div
                className="px-5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{
                  background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                  color: '#FFFFFF',
                  boxShadow: '0 0 20px rgba(123,92,255,0.4)',
                }}
              >
                Acc\u00e8s complet
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span
                  className="text-6xl md:text-7xl font-bold"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    background: 'linear-gradient(135deg, #FFFFFF, #D6D9F0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  47
                </span>
                <span
                  className="text-2xl font-semibold"
                  style={{ color: '#8891B8' }}
                >
                  $/mois
                </span>
              </div>

              {/* Divider */}
              <div
                className="w-full h-px"
                style={{ background: 'rgba(123,92,255,0.15)' }}
              />

              {/* Features */}
              <ul className="w-full space-y-3 text-left">
                {[
                  'Publications automatiques illimit\u00e9es',
                  'Toutes les plateformes incluses',
                  'Cr\u00e9ation de contenu par IA',
                  'Calendrier intelligent',
                  'Style personnalis\u00e9 \u00e0 ta voix',
                  'Support prioritaire',
                  'Sans engagement',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#00E676' }}
                    >
                      \u2713
                    </span>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: '#D6D9F0',
                        fontSize: '0.95rem',
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="https://www.publication-web.com/travaildecheztoi/automatisation"
                target="_blank"
                rel="noopener noreferrer"
                className="nx-btn-primary w-full justify-center text-lg py-4 mt-2"
                style={{
                  borderRadius: '50px',
                  boxShadow: '0 0 30px rgba(123,92,255,0.4), 0 0 60px rgba(123,92,255,0.15)',
                }}
              >
                \u2726 Engager NyXia aujourd&apos;hui
              </a>
              <p
                className="text-sm"
                style={{ color: '#4a5278', fontFamily: "'Outfit', sans-serif" }}
              >
                Aucun engagement. Annule quand tu veux.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            9. FAQ
            ═══════════════════════════════════════════════════════ */}
        <section className="nx-section-lg">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="nx-eyebrow nx-fade-up mx-auto mb-6">
                <span className="nx-eyebrow-dot" />
                Questions fr\u00e9quentes
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
                Tu h\u00e9sites encore ?
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div
                  key={faq.question}
                  className={`nx-fade-up nx-fade-up-delay-${Math.min(i % 3 + 1, 5)}`}
                >
                  <FaqItem question={faq.question} answer={faq.answer} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <NyxiaChat />
    </>
  );
}
