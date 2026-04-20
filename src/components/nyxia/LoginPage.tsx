'use client';

import { useState, useCallback, FormEvent } from 'react';
import StarryBackground from './StarryBackground';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LoginPageProps {
  onLogin: (email: string, password: string, firstname: string) => void;
  isLoading: boolean;
  error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Keyframe styles injected once                                      */
/* ------------------------------------------------------------------ */

const keyframeStyle = `
@keyframes nx-login-avatar-glow {
  0%, 100% {
    box-shadow: 0 0 16px rgba(123,92,255,0.45), 0 0 32px rgba(123,92,255,0.15);
  }
  50% {
    box-shadow: 0 0 24px rgba(123,92,255,0.7), 0 0 48px rgba(123,92,255,0.25);
  }
}

@keyframes nx-login-card-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes nx-login-msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes nx-login-spinner {
  to {
    transform: rotate(360deg);
  }
}
`;

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('nx-login-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'nx-login-keyframes';
  styleEl.textContent = keyframeStyle;
  document.head.appendChild(styleEl);
}

/* ------------------------------------------------------------------ */
/*  Static sub-components (must be outside render)                     */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LoginPage({ onLogin, isLoading, error }: LoginPageProps) {
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* ---- handlers ---- */
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) return;
      setSuccessMsg(null);
      onLogin(email.trim(), password.trim(), firstname.trim());
    },
    [email, password, firstname, onLogin],
  );

  /* ---- styles ---- */
  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'rgba(15,28,63,0.7)',
    border: '1px solid rgba(123,92,255,0.2)',
    borderRadius: 12,
    color: '#FFFFFF',
    fontFamily: 'Outfit, sans-serif',
    fontSize: 15,
    padding: '13px 16px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocus: React.CSSProperties = {
    borderColor: 'rgba(123,92,255,0.55)',
    boxShadow: '0 0 0 3px rgba(123,92,255,0.1)',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: '#8891B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'hidden',
      }}
    >
      {/* Starry background */}
      <StarryBackground />

      {/* Glow overlays */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background: [
            'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(123,92,255,0.15) 0%, transparent 65%)',
            'radial-gradient(ellipse 50% 40% at 70% 80%, rgba(79,163,255,0.08) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* ---- Card ---- */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 420,
          background: 'rgba(26,37,84,0.55)',
          border: '1px solid rgba(123,92,255,0.2)',
          borderRadius: 24,
          padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: [
            '0 24px 80px rgba(0,0,0,0.4)',
            '0 0 60px rgba(123,92,255,0.08)',
          ].join(', '),
          animation: 'nx-login-card-in 0.65s cubic-bezier(0.23,1,0.32,1) both',
        }}
      >
        {/* ---- Header ---- */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Avatar */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid rgba(123,92,255,0.5)',
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #7B5CFF, #4FA3FF)',
              animation: 'nx-login-avatar-glow 3s ease-in-out infinite',
              fontSize: 36,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk, sans-serif',
              userSelect: 'none',
            }}
          >
            N
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 26,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #a78bfa, #4FA3FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NyXia IA
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: '#8891B8',
              fontSize: 13,
              fontFamily: 'Outfit, sans-serif',
              marginTop: 8,
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            Connecte-toi pour accéder à ton espace
          </p>
        </div>

        {/* ---- Form ---- */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Firstname */}
          <div>
            <label style={labelStyle}>Ton prénom</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="Optionnel…"
              style={{
                ...inputBase,
                fontFamily: 'Outfit, sans-serif',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocus)}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Adresse email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={{
                ...inputBase,
                fontFamily: 'Outfit, sans-serif',
              }}
              onFocus={(e) => Object.assign(e.currentTarget.style, inputFocus)}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...inputBase,
                  paddingRight: 44,
                }}
                onFocus={(e) => Object.assign(e.currentTarget.style, inputFocus, { paddingRight: 44 })}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8891B8',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8891B8')}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* ---- Submit button ---- */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            style={{
              width: '100%',
              padding: 15,
              borderRadius: 50,
              border: 'none',
              background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
              color: '#FFFFFF',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              cursor: isLoading || !email.trim() || !password.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 28px rgba(123,92,255,0.45)',
              transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
              opacity: isLoading || !email.trim() || !password.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              if (!isLoading && email.trim() && password.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(123,92,255,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 28px rgba(123,92,255,0.45)';
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'nx-login-spinner 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Connexion…
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* ---- Error / Success messages ---- */}
        <div style={{ marginTop: 16, minHeight: 24 }}>
          {error && (
            <div
              style={{
                animation: 'nx-login-msg-in 0.35s ease both',
                background: 'rgba(255,75,110,0.1)',
                border: '1px solid rgba(255,75,110,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#FF4B6E',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
          {successMsg && !error && (
            <div
              style={{
                animation: 'nx-login-msg-in 0.35s ease both',
                background: 'rgba(0,230,118,0.1)',
                border: '1px solid rgba(0,230,118,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#00E676',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              {successMsg}
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              color: '#a78bfa',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13,
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4FA3FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#a78bfa')}
          >
            Pas encore client ? Découvrir NyXia IA
          </a>

          <p
            style={{
              color: '#4a5278',
              fontSize: 11,
              fontFamily: 'Outfit, sans-serif',
              marginTop: 14,
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            © 2026 NyXia IA — Publication Web™ visionnaire depuis 1997
          </p>
        </div>
      </div>
    </div>
  );
}
