'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useNyxiaStore } from '@/lib/nyxia-store';
import StarryBackground from './StarryBackground';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashboardPageProps {
  onLogout: () => void;
  onOpenSuperAdmin: () => void;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  panel: 'chat' | 'generator' | 'medias' | 'wan' | 'wanimg' | 'editor' | 'messages' | 'projects';
  hasSubmenu?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Keyframe Styles (injected once)                                    */
/* ------------------------------------------------------------------ */

const keyframeStyle = `
@keyframes nx-dash-msg-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nx-dash-dot-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}
@keyframes nx-dash-breathe {
  0%, 100% { box-shadow: 0 0 16px rgba(123,92,255,0.4); }
  50% { box-shadow: 0 0 28px rgba(123,92,255,0.7), 0 0 50px rgba(123,92,255,0.2); }
}
@keyframes nx-dash-pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes nx-dash-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes nx-dash-card-in {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes nx-dash-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes nx-dash-slide-in-left {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes nx-dash-slide-in-right {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('nx-dash-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'nx-dash-keyframes';
  styleEl.textContent = keyframeStyle;
  document.head.appendChild(styleEl);
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NAV_ITEMS: NavItem[] = [
  { id: 'chat', icon: '💬', label: 'Chat avec NyXia', panel: 'chat', hasSubmenu: true },
  { id: 'generator', icon: '🏗', label: 'Créer mon site', panel: 'generator' },
  { id: 'medias', icon: '🎬', label: 'Photos & Vidéos', panel: 'medias' },
  { id: 'wan', icon: '✨', label: 'Studio Vidéo IA', panel: 'wan' },
  { id: 'wanimg', icon: '🖼️', label: 'Images IA', panel: 'wanimg' },
  { id: 'editor', icon: '✏️', label: 'Éditeur de pages', panel: 'editor' },
];

const AGENT_BUTTONS = [
  { id: 'nyxia' as const, icon: '💬', label: 'NyXia' },
  { id: 'copywriter' as const, icon: '✍️', label: 'Copywriter' },
  { id: 'formation' as const, icon: '🎓', label: 'Formation' },
  { id: 'seo' as const, icon: '🔍', label: 'SEO' },
];

const SUGGESTIONS = [
  '🌐 Je veux créer un site web',
  '📱 Aide-moi avec mes publications',
  '🚀 Je veux plus de clients',
  '💎 Comment structurer mon offre ?',
];

const PROJECT_TYPES = [
  '📚 Écriture de livre',
  '🎓 Création de formation',
  '🌐 Site web',
  '✍️ Copywriting',
  '🔍 SEO & Contenu',
  '📱 Marketing réseaux sociaux',
  '💼 Autre',
];

const COMING_SOON_PANELS: Record<string, { icon: string; title: string; desc: string }> = {
  generator: { icon: '🏗', title: 'Créer mon site', desc: 'Construis ton site web professionnel en quelques clics avec l\'intelligence artificielle de NyXia.' },
  medias: { icon: '🎬', title: 'Photos & Vidéos', desc: 'Gère et optimise tes contenus photo et vidéo avec l\'aide de NyXia.' },
  wan: { icon: '✨', title: 'Studio Vidéo IA', desc: 'Génère des vidéos professionnelles grâce à l\'intelligence artificielle.' },
  wanimg: { icon: '🖼️', title: 'Images IA', desc: 'Crée des images uniques et captivantes avec la puissance de l\'IA.' },
  editor: { icon: '✏️', title: 'Éditeur de pages', desc: 'Édite et personnalise tes pages web avec un éditeur visuel avancé.' },
};

/* ------------------------------------------------------------------ */
/*  Helper: unique ID                                                  */
/* ------------------------------------------------------------------ */

let _idCounter = 0;
function uid(): string {
  _idCounter += 1;
  return `msg-${Date.now()}-${_idCounter}`;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage({ onLogout, onOpenSuperAdmin }: DashboardPageProps) {
  // ── Zustand store ────────────────────────────────────────────────────
  const {
    user,
    currentPanel,
    setCurrentPanel,
    messages,
    currentAgent,
    setCurrentAgent,
    isChatLoading,
    addMessage,
    clearMessages,
    setIsChatLoading,
    projects,
    addProject,
  } = useNyxiaStore();

  // ── Local state ──────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState('');
  const [sidebarHover, setSidebarHover] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectType, setNewProjectType] = useState(PROJECT_TYPES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────
  const userName = user?.name || 'Utilisateur';
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  // ── Auto-scroll ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading, scrollToBottom]);

  // ── Textarea auto-resize ─────────────────────────────────────────────
  const handleInputChange = useCallback((value: string) => {
    setChatInput(value);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      chatInputRef.current.style.height = `${Math.min(chatInputRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  // ── Send message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) return;

    const userMsg = {
      id: uid(),
      role: 'user' as const,
      content: trimmed,
      agent: currentAgent,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setChatInput('');
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
    }

    setIsChatLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          userName,
          agent: currentAgent,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur réseau');
      }

      const data = await res.json();
      const botMsg = {
        id: uid(),
        role: 'assistant' as const,
        content: data.content || 'Je suis désolée, je n\'ai pas pu traiter ta demande. Réessaie !',
        agent: currentAgent,
        timestamp: Date.now(),
      };
      addMessage(botMsg);
    } catch {
      const errorMsg = {
        id: uid(),
        role: 'assistant' as const,
        content: 'Oups ! Une erreur est survenue. Vérifie ta connexion et réessaie. ✦',
        agent: currentAgent,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, isChatLoading, addMessage, setIsChatLoading, messages, userName, currentAgent]);

  // ── Retry message ────────────────────────────────────────────────────
  const retryLastMessage = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setChatInput(lastUserMsg.content);
    }
  }, [messages]);

  // ── Copy message ─────────────────────────────────────────────────────
  const copyMessage = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // ── Create project ───────────────────────────────────────────────────
  const handleCreateProject = useCallback(() => {
    if (!newProjectName.trim()) return;
    addProject({
      id: uid(),
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      type: newProjectType,
      createdAt: new Date().toISOString(),
    });
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectType(PROJECT_TYPES[0]);
    setShowCreateProject(false);
  }, [newProjectName, newProjectDesc, newProjectType, addProject]);

  // ── Key handlers ─────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  // ── Nav click handler ────────────────────────────────────────────────
  const handleNavClick = useCallback(
    (panel: NavItem['panel']) => {
      setCurrentPanel(panel);
      setMobileSidebarOpen(false);
    },
    [setCurrentPanel],
  );

  // ── Format time ──────────────────────────────────────────────────────
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  /* ================================================================== */
  /*  RENDER                                                             */
  /* ================================================================== */

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Outfit, sans-serif',
        background: '#0A1628',
      }}
    >
      {/* Starry background */}
      <StarryBackground />

      {/* Glow overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background: [
            'radial-gradient(ellipse 60% 50% at 25% 15%, rgba(123,92,255,0.12) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 40% at 75% 85%, rgba(79,163,255,0.06) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  HEADER                                                          */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'relative',
          zIndex: 50,
          height: 56,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(8,15,34,0.95)',
          borderBottom: '1px solid rgba(123,92,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Left - Brand */}
        <div
          style={{
            width: 240,
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen((v) => !v)}
            aria-label="Menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#D6D9F0',
              cursor: 'pointer',
              padding: 4,
              fontSize: 22,
              lineHeight: 1,
            }}
            className="nx-mobile-menu-btn"
          >
            ☰
          </button>

          {/* Logo */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
              animation: 'nx-dash-breathe 3s ease-in-out infinite',
              flexShrink: 0,
            }}
          >
            N
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              NyXia IA
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00E676',
                  animation: 'nx-dash-pulse-green 2s ease-in-out infinite',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#00E676',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                En ligne
              </span>
            </div>
          </div>
        </div>

        {/* Center - Welcome */}
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: 17,
            color: '#D6D9F0',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          className="nx-header-center"
        >
          Bienvenue dans mon univers ✦{' '}
          <span style={{ color: '#F4C842', fontWeight: 600 }}>{userName}</span>
        </div>

        {/* Right - Badge + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(244,200,66,0.2), rgba(244,200,66,0.08))',
              border: '1px solid rgba(244,200,66,0.3)',
              color: '#F4C842',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              whiteSpace: 'nowrap',
            }}
            className="nx-badge"
          >
            ⭐ VISIONNAIRE
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,75,110,0.25)',
              background: 'rgba(255,75,110,0.08)',
              color: '#FF4B6E',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,75,110,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,75,110,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,75,110,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,75,110,0.25)';
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  BODY: Sidebar + Main                                             */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        {/* ────────────────────────────────────────────────────────────── */}
        {/*  SIDEBAR                                                        */}
        {/* ────────────────────────────────────────────────────────────── */}
        <aside
          className={`nx-sidebar${mobileSidebarOpen ? ' nx-sidebar-open' : ''}`}
          style={{
            width: 240,
            minWidth: 240,
            height: '100%',
            background: 'rgba(8,15,34,0.97)',
            borderRight: '1px solid rgba(123,92,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
          }}
        >
          {/* Nav section */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            {/* NAVIGATION label */}
            <div
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#4a5278',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                padding: '6px 12px 10px',
              }}
            >
              NAVIGATION
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleNavClick(item.panel)}
                  onMouseEnter={() => setSidebarHover(item.id)}
                  onMouseLeave={() => setSidebarHover(null)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: currentPanel === item.panel
                      ? '1px solid rgba(123,92,255,0.3)'
                      : '1px solid transparent',
                    background: currentPanel === item.panel
                      ? 'rgba(123,92,255,0.15)'
                      : sidebarHover === item.id
                        ? 'rgba(123,92,255,0.08)'
                        : 'transparent',
                    color: currentPanel === item.panel ? '#FFFFFF' : '#D6D9F0',
                    fontSize: 14,
                    fontWeight: currentPanel === item.panel ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    boxShadow: currentPanel === item.panel
                      ? '0 0 20px rgba(123,92,255,0.1)'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>

                {/* Chat submenu */}
                {item.id === 'chat' && currentPanel === 'chat' && (
                  <div
                    style={{
                      marginTop: 4,
                      paddingLeft: 20,
                      animation: 'nx-dash-fade-in 0.25s ease both',
                    }}
                  >
                    {/* New conversation */}
                    <button
                      onClick={() => clearMessages()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: '1px dashed rgba(123,92,255,0.25)',
                        background: 'rgba(123,92,255,0.04)',
                        color: '#a78bfa',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.15s',
                        width: '100%',
                        textAlign: 'left',
                        marginBottom: 8,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(123,92,255,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(123,92,255,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(123,92,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(123,92,255,0.25)';
                      }}
                    >
                      ✦ Nouvelle conversation
                    </button>

                    {/* Agent mode buttons */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginBottom: 10,
                      }}
                    >
                      {AGENT_BUTTONS.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => setCurrentAgent(agent.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 9px',
                            borderRadius: 6,
                            border: currentAgent === agent.id
                              ? '1px solid rgba(123,92,255,0.4)'
                              : '1px solid rgba(123,92,255,0.12)',
                            background: currentAgent === agent.id
                              ? 'rgba(123,92,255,0.18)'
                              : 'rgba(123,92,255,0.04)',
                            color: currentAgent === agent.id ? '#FFFFFF' : '#8891B8',
                            fontSize: 11,
                            fontWeight: currentAgent === agent.id ? 600 : 400,
                            cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (currentAgent !== agent.id) {
                              e.currentTarget.style.background = 'rgba(123,92,255,0.1)';
                              e.currentTarget.style.color = '#D6D9F0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentAgent !== agent.id) {
                              e.currentTarget.style.background = 'rgba(123,92,255,0.04)';
                              e.currentTarget.style.color = '#8891B8';
                            }
                          }}
                        >
                          <span style={{ fontSize: 12 }}>{agent.icon}</span>
                          {agent.label}
                        </button>
                      ))}
                    </div>

                    {/* Saved projects section */}
                    {projects.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <div
                          style={{
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontSize: 9,
                            fontWeight: 600,
                            color: '#4a5278',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            padding: '4px 0',
                          }}
                        >
                          Projets sauvegardés
                        </div>
                        {projects.slice(0, 4).map((p) => (
                          <button
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: 'none',
                              background: 'transparent',
                              color: '#8891B8',
                              fontSize: 12,
                              cursor: 'pointer',
                              fontFamily: 'Outfit, sans-serif',
                              transition: 'all 0.15s',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(123,92,255,0.08)';
                              e.currentTarget.style.color = '#D6D9F0';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#8891B8';
                            }}
                          >
                            <span style={{ fontSize: 11 }}>📄</span>
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: 'rgba(123,92,255,0.08)',
                margin: '10px 12px',
              }}
            />

            {/* MENU label */}
            <div
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#4a5278',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                padding: '6px 12px 10px',
              }}
            >
              MENU
            </div>

            {/* Messages nav */}
            <button
              onClick={() => handleNavClick('messages')}
              onMouseEnter={() => setSidebarHover('messages')}
              onMouseLeave={() => setSidebarHover(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: currentPanel === 'messages'
                  ? '1px solid rgba(123,92,255,0.3)'
                  : '1px solid transparent',
                background: currentPanel === 'messages'
                  ? 'rgba(123,92,255,0.15)'
                  : sidebarHover === 'messages'
                    ? 'rgba(123,92,255,0.08)'
                    : 'transparent',
                color: currentPanel === 'messages' ? '#FFFFFF' : '#D6D9F0',
                fontSize: 14,
                fontWeight: currentPanel === 'messages' ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.15s',
                textAlign: 'left',
                boxShadow: currentPanel === 'messages'
                  ? '0 0 20px rgba(123,92,255,0.1)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>✉️</span>
              <span>Messagerie</span>
            </button>

            {/* Projects nav */}
            <button
              onClick={() => handleNavClick('projects')}
              onMouseEnter={() => setSidebarHover('projects')}
              onMouseLeave={() => setSidebarHover(null)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: currentPanel === 'projects'
                  ? '1px solid rgba(123,92,255,0.3)'
                  : '1px solid transparent',
                background: currentPanel === 'projects'
                  ? 'rgba(123,92,255,0.15)'
                  : sidebarHover === 'projects'
                    ? 'rgba(123,92,255,0.08)'
                    : 'transparent',
                color: currentPanel === 'projects' ? '#FFFFFF' : '#D6D9F0',
                fontSize: 14,
                fontWeight: currentPanel === 'projects' ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.15s',
                textAlign: 'left',
                boxShadow: currentPanel === 'projects'
                  ? '0 0 20px rgba(123,92,255,0.1)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>📁</span>
              <span>Projets</span>
            </button>

            {/* Super Admin (only for admin/superadmin) */}
            {isAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                onMouseEnter={() => setSidebarHover('admin')}
                onMouseLeave={() => setSidebarHover(null)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid transparent',
                  background: sidebarHover === 'admin'
                    ? 'rgba(123,92,255,0.08)'
                    : 'transparent',
                  color: '#D6D9F0',
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚙️</span>
                <span>Super Admin</span>
              </button>
            )}
          </div>

          {/* Bottom - User card */}
          <div
            style={{
              padding: '12px 12px 14px',
              borderTop: '1px solid rgba(123,92,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#F4C842',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 500,
                }}
              >
                ✦ Plan Visionnaire
              </div>
            </div>
          </div>
        </aside>

        {/* ────────────────────────────────────────────────────────────── */}
        {/*  MAIN CONTENT                                                   */}
        {/* ────────────────────────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* ════════════════════════════════════════════════════════════════ */}
          {/*  CHAT PANEL                                                     */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {currentPanel === 'chat' && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(123,92,255,0.08)',
                  background: 'rgba(8,15,34,0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      animation: 'nx-dash-breathe 3s ease-in-out infinite',
                      flexShrink: 0,
                    }}
                  >
                    N
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.2,
                      }}
                    >
                      NyXia IA
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#8891B8',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Ton agente IA · Marketing &amp; Conversion
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(123,92,255,0.2)',
                    background: 'rgba(123,92,255,0.06)',
                    color: '#a78bfa',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(123,92,255,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(123,92,255,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(123,92,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                  }}
                >
                  🔊 Écouter NyXia
                </button>
              </div>

              {/* Messages area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Welcome message when no messages */}
                {messages.length === 0 && !isChatLoading && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      gap: 16,
                      animation: 'nx-dash-fade-in 0.5s ease both',
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        animation: 'nx-dash-breathe 3s ease-in-out infinite',
                      }}
                    >
                      N
                    </div>
                    <div
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontStyle: 'italic',
                        fontSize: 22,
                        color: '#D6D9F0',
                        textAlign: 'center',
                      }}
                    >
                      Bonjour {userName} ✦
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#8891B8',
                        textAlign: 'center',
                        maxWidth: 400,
                        lineHeight: 1.6,
                      }}
                    >
                      Je suis NyXia, ton agente IA spécialisée en marketing et conversion.
                      Comment puis-je t&apos;aider aujourd&apos;hui ?
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 10,
                      animation: msg.role === 'user'
                        ? 'nx-dash-slide-in-right 0.3s ease both'
                        : 'nx-dash-slide-in-left 0.3s ease both',
                      animationDelay: `${Math.min(idx * 0.03, 0.15)}s`,
                    }}
                  >
                    {/* Avatar */}
                    {msg.role === 'assistant' && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        N
                      </div>
                    )}

                    {/* Bubble */}
                    <div style={{ maxWidth: '70%', minWidth: 80 }}>
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, #7B5CFF, #5A6CFF)'
                            : 'rgba(26,37,84,0.7)',
                          border: msg.role === 'user'
                            ? 'none'
                            : '1px solid rgba(123,92,255,0.12)',
                          color: '#FFFFFF',
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: 'Outfit, sans-serif',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* Message meta + actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginTop: 6,
                          flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: '#4a5278',
                            fontFamily: 'Space Grotesk, sans-serif',
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </span>

                        {msg.role === 'assistant' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              title="Copier"
                              style={{
                                padding: '2px 6px',
                                borderRadius: 4,
                                border: 'none',
                                background: 'transparent',
                                color: copiedId === msg.id ? '#00E676' : '#4a5278',
                                fontSize: 11,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                              }}
                            >
                              {copiedId === msg.id ? '✓ Copié' : '📋 Copier'}
                            </button>
                            <button
                              onClick={retryLastMessage}
                              title="Réessayer"
                              style={{
                                padding: '2px 6px',
                                borderRadius: 4,
                                border: 'none',
                                background: 'transparent',
                                color: '#4a5278',
                                fontSize: 11,
                                cursor: 'pointer',
                                transition: 'color 0.2s',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5278')}
                            >
                              ↺ Réessayer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isChatLoading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      animation: 'nx-dash-slide-in-left 0.3s ease both',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      N
                    </div>
                    <div
                      style={{
                        padding: '14px 20px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'rgba(26,37,84,0.7)',
                        border: '1px solid rgba(123,92,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#7B5CFF',
                            animation: `nx-dash-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                            display: 'inline-block',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions bar */}
              {messages.length === 0 && !isChatLoading && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    padding: '0 20px 10px',
                    animation: 'nx-dash-fade-in 0.4s ease both',
                    animationDelay: '0.2s',
                  }}
                >
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setChatInput(suggestion);
                        setTimeout(() => {
                          const trimmed = suggestion.trim();
                          if (!trimmed || isChatLoading) return;
                          const userMsg = {
                            id: uid(),
                            role: 'user' as const,
                            content: trimmed,
                            agent: currentAgent,
                            timestamp: Date.now(),
                          };
                          addMessage(userMsg);
                          setChatInput('');
                          setIsChatLoading(true);
                          fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              message: trimmed,
                              history: messages.map((m) => ({ role: m.role, content: m.content })),
                              userName,
                              agent: currentAgent,
                            }),
                          })
                            .then((res) => res.json())
                            .then((data) => {
                              addMessage({
                                id: uid(),
                                role: 'assistant',
                                content: data.content || 'Je suis désolée, je n\'ai pas pu traiter ta demande.',
                                agent: currentAgent,
                                timestamp: Date.now(),
                              });
                            })
                            .catch(() => {
                              addMessage({
                                id: uid(),
                                role: 'assistant',
                                content: 'Oups ! Une erreur est survenue. Réessaie ! ✦',
                                agent: currentAgent,
                                timestamp: Date.now(),
                              });
                            })
                            .finally(() => setIsChatLoading(false));
                        }, 50);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: '1px solid rgba(123,92,255,0.25)',
                        background: 'rgba(123,92,255,0.04)',
                        color: '#D6D9F0',
                        fontSize: 12,
                        fontWeight: 400,
                        cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(123,92,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(123,92,255,0.4)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(123,92,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(123,92,255,0.25)';
                        e.currentTarget.style.color = '#D6D9F0';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div
                style={{
                  padding: '12px 20px 16px',
                  borderTop: '1px solid rgba(123,92,255,0.06)',
                  background: 'rgba(8,15,34,0.5)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 10,
                    background: 'rgba(15,28,63,0.7)',
                    border: '1px solid rgba(123,92,255,0.15)',
                    borderRadius: 14,
                    padding: '8px 10px 8px 14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  {/* Attach button */}
                  <button
                    title="Joindre un fichier"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4a5278',
                      fontSize: 18,
                      cursor: 'pointer',
                      padding: 4,
                      lineHeight: 1,
                      transition: 'color 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5278')}
                  >
                    📎
                  </button>

                  {/* Textarea */}
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écris ton message à NyXia…"
                    rows={1}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontFamily: 'Outfit, sans-serif',
                      lineHeight: 1.5,
                      resize: 'none',
                      maxHeight: 120,
                      minHeight: 24,
                    }}
                  />

                  {/* Send button */}
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    title="Envoyer"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: 'none',
                      background: chatInput.trim() && !isChatLoading
                        ? 'linear-gradient(135deg, #7B5CFF, #5A6CFF)'
                        : 'rgba(123,92,255,0.15)',
                      color: chatInput.trim() && !isChatLoading ? '#FFFFFF' : '#4a5278',
                      fontSize: 16,
                      cursor: chatInput.trim() && !isChatLoading ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: chatInput.trim() && !isChatLoading
                        ? '0 0 20px rgba(123,92,255,0.35)'
                        : 'none',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>

                {/* Hint text */}
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 6,
                    fontSize: 10,
                    color: '#4a5278',
                    fontFamily: 'Space Grotesk, sans-serif',
                  }}
                >
                  Entrée pour envoyer · Shift+Entrée pour un retour à la ligne
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/*  PROJECTS PANEL                                                 */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {currentPanel === 'projects' && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px 28px 40px',
              }}
            >
              {/* Header */}
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 28,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 24,
                }}
              >
                📁 Mes Projets
              </h2>

              {/* Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Create new project card */}
                <button
                  onClick={() => setShowCreateProject(true)}
                  style={{
                    padding: 28,
                    borderRadius: 14,
                    border: '2px dashed rgba(123,92,255,0.25)',
                    background: 'rgba(123,92,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    minHeight: 170,
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123,92,255,0.45)';
                    e.currentTarget.style.background = 'rgba(123,92,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(123,92,255,0.25)';
                    e.currentTarget.style.background = 'rgba(123,92,255,0.03)';
                  }}
                >
                  <span style={{ fontSize: 28, color: '#7B5CFF' }}>+</span>
                  <span style={{ fontSize: 14, color: '#a78bfa', fontFamily: 'Outfit, sans-serif' }}>
                    Créer un nouveau projet
                  </span>
                </button>

                {/* Project cards */}
                {projects.map((project, idx) => (
                  <div
                    key={project.id}
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      border: '1px solid rgba(123,92,255,0.12)',
                      background: 'rgba(26,37,84,0.4)',
                      animation: `nx-dash-card-in 0.4s ease both`,
                      animationDelay: `${idx * 0.06}s`,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(123,92,255,0.3)';
                      e.currentTarget.style.boxShadow = '0 0 24px rgba(123,92,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(123,92,255,0.12)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        marginBottom: 6,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {project.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#8891B8',
                        marginBottom: 12,
                        lineHeight: 1.5,
                        fontFamily: 'Outfit, sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.description || 'Aucune description'}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: 'rgba(123,92,255,0.1)',
                          border: '1px solid rgba(123,92,255,0.15)',
                          color: '#a78bfa',
                          fontSize: 11,
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {project.type}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#4a5278',
                          fontFamily: 'Space Grotesk, sans-serif',
                        }}
                      >
                        {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/*  MESSAGES PANEL (Coming Soon)                                    */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {currentPanel === 'messages' && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 40,
                animation: 'nx-dash-fade-in 0.4s ease both',
              }}
            >
              <span style={{ fontSize: 48 }}>✉️</span>
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 26,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                }}
              >
                Messagerie
              </h2>
              <p
                style={{
                  color: '#8891B8',
                  fontSize: 14,
                  textAlign: 'center',
                  maxWidth: 360,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                La messagerie intégrée arrive bientôt ! Tu pourras communiquer directement avec ton équipe et tes clients depuis cet espace. ✦
              </p>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  background: 'rgba(244,200,66,0.1)',
                  border: '1px solid rgba(244,200,66,0.25)',
                  color: '#F4C842',
                  fontSize: 12,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 600,
                }}
              >
                ✦ Bientôt disponible
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/*  COMING SOON PANELS (generator, medias, wan, wanimg, editor)    */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {COMING_SOON_PANELS[currentPanel] && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 40,
                animation: 'nx-dash-fade-in 0.4s ease both',
              }}
            >
              <span style={{ fontSize: 56 }}>
                {COMING_SOON_PANELS[currentPanel].icon}
              </span>
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 28,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                }}
              >
                {COMING_SOON_PANELS[currentPanel].title}
              </h2>
              <p
                style={{
                  color: '#8891B8',
                  fontSize: 14,
                  textAlign: 'center',
                  maxWidth: 380,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {COMING_SOON_PANELS[currentPanel].desc}
              </p>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  background: 'rgba(244,200,66,0.1)',
                  border: '1px solid rgba(244,200,66,0.25)',
                  color: '#F4C842',
                  fontSize: 12,
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 600,
                }}
              >
                ✦ Bientôt disponible
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  MOBILE SIDEBAR OVERLAY                                          */}
      {/* ──────────────────────────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 90,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 56,
              left: 0,
              bottom: 0,
              width: 260,
              background: 'rgba(8,15,34,0.98)',
              borderRight: '1px solid rgba(123,92,255,0.12)',
              zIndex: 95,
              overflowY: 'auto',
              padding: '12px 8px',
              animation: 'nx-dash-fade-in 0.2s ease both',
            }}
          >
            {/* Mobile nav items - simplified */}
            <div
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#4a5278',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                padding: '6px 12px 10px',
              }}
            >
              NAVIGATION
            </div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.panel)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: currentPanel === item.panel
                    ? '1px solid rgba(123,92,255,0.3)'
                    : '1px solid transparent',
                  background: currentPanel === item.panel
                    ? 'rgba(123,92,255,0.15)'
                    : 'transparent',
                  color: currentPanel === item.panel ? '#FFFFFF' : '#D6D9F0',
                  fontSize: 14,
                  fontWeight: currentPanel === item.panel ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  textAlign: 'left',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(123,92,255,0.08)', margin: '10px 12px' }} />
            <button
              onClick={() => handleNavClick('messages')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: currentPanel === 'messages' ? '1px solid rgba(123,92,255,0.3)' : '1px solid transparent',
                background: currentPanel === 'messages' ? 'rgba(123,92,255,0.15)' : 'transparent',
                color: currentPanel === 'messages' ? '#FFFFFF' : '#D6D9F0',
                fontSize: 14,
                fontWeight: currentPanel === 'messages' ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>✉️</span>
              <span>Messagerie</span>
            </button>
            <button
              onClick={() => handleNavClick('projects')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: currentPanel === 'projects' ? '1px solid rgba(123,92,255,0.3)' : '1px solid transparent',
                background: currentPanel === 'projects' ? 'rgba(123,92,255,0.15)' : 'transparent',
                color: currentPanel === 'projects' ? '#FFFFFF' : '#D6D9F0',
                fontSize: 14,
                fontWeight: currentPanel === 'projects' ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>📁</span>
              <span>Projets</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => { onOpenSuperAdmin(); setMobileSidebarOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid transparent',
                  background: 'transparent',
                  color: '#D6D9F0',
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16 }}>⚙️</span>
                <span>Super Admin</span>
              </button>
            )}
          </aside>
        </>
      )}

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  CREATE PROJECT MODAL                                            */}
      {/* ──────────────────────────────────────────────────────────────── */}
      {showCreateProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'nx-dash-fade-in 0.25s ease both',
          }}
          onClick={() => setShowCreateProject(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'rgba(15,28,63,0.95)',
              border: '1px solid rgba(123,92,255,0.2)',
              borderRadius: 18,
              padding: '28px 28px 24px',
              animation: 'nx-dash-card-in 0.3s ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 22,
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 20px',
              }}
            >
              ✦ Nouveau projet
            </h3>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#8891B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 6,
                }}
              >
                Nom du projet
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Mon projet incroyable"
                style={{
                  width: '100%',
                  background: 'rgba(15,28,63,0.7)',
                  border: '1px solid rgba(123,92,255,0.2)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 14,
                  padding: '11px 14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#8891B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 6,
                }}
              >
                Description
              </label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Décris ton projet…"
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(15,28,63,0.7)',
                  border: '1px solid rgba(123,92,255,0.2)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 14,
                  padding: '11px 14px',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
              />
            </div>

            {/* Type */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#8891B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 6,
                }}
              >
                Type de projet
              </label>
              <select
                value={newProjectType}
                onChange={(e) => setNewProjectType(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15,28,63,0.7)',
                  border: '1px solid rgba(123,92,255,0.2)',
                  borderRadius: 10,
                  color: '#FFFFFF',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 14,
                  padding: '11px 14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  appearance: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type} style={{ background: '#0F1C3F', color: '#FFFFFF' }}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateProject(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid rgba(123,92,255,0.15)',
                  background: 'transparent',
                  color: '#8891B8',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(123,92,255,0.3)';
                  e.currentTarget.style.color = '#D6D9F0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(123,92,255,0.15)';
                  e.currentTarget.style.color = '#8891B8';
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: newProjectName.trim()
                    ? 'linear-gradient(135deg, #7B5CFF, #5A6CFF)'
                    : 'rgba(123,92,255,0.2)',
                  color: newProjectName.trim() ? '#FFFFFF' : '#4a5278',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: newProjectName.trim() ? 'pointer' : 'default',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s',
                  boxShadow: newProjectName.trim() ? '0 0 20px rgba(123,92,255,0.3)' : 'none',
                }}
              >
                Créer le projet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────── */}
      {/*  RESPONSIVE STYLES (injected via <style>)                        */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .nx-sidebar {
            display: none !important;
          }
          .nx-mobile-menu-btn {
            display: flex !important;
          }
          .nx-header-center {
            font-size: 14px !important;
          }
          .nx-badge {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .nx-mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
