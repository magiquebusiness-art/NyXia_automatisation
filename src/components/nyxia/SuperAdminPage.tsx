'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNyxiaStore } from '@/lib/nyxia-store';
import StarryBackground from './StarryBackground';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SuperAdminPageProps {
  onBack: () => void;
}

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  products: string[];
  status: string;
  role: string;
  createdAt: string;
}

interface EditFormData {
  originalEmail: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  proChecked: boolean;
  flipbookChecked: boolean;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Keyframe styles injected once                                      */
/* ------------------------------------------------------------------ */

const keyframeStyle = `
@keyframes nx-sa-card-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes nx-sa-msg-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes nx-sa-modal-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes nx-sa-spinner {
  to { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('nx-sa-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'nx-sa-keyframes';
  styleEl.textContent = keyframeStyle;
  document.head.appendChild(styleEl);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SuperAdminPage({ onBack }: SuperAdminPageProps) {
  /* ---- Zustand store ---- */
  const user = useNyxiaStore((s) => s.user);
  const token = useNyxiaStore((s) => s.token);
  const adminAccounts = useNyxiaStore((s) => s.adminAccounts);
  const setAdminAccounts = useNyxiaStore((s) => s.setAdminAccounts);
  const adminStats = useNyxiaStore((s) => s.adminStats);
  const setAdminStats = useNyxiaStore((s) => s.setAdminStats);
  const clearAuth = useNyxiaStore((s) => s.clearAuth);

  /* ---- Local state ---- */
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Create form
  const [newFirstname, setNewFirstname] = useState('');
  const [newLastname, setNewLastname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newProChecked, setNewProChecked] = useState(false);
  const [newFlipbookChecked, setNewFlipbookChecked] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<EditFormData>({
    originalEmail: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    proChecked: false,
    flipbookChecked: false,
    status: 'active',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ email: string; name: string }>({ email: '', name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  /* ---- API helper ---- */
  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      };
      const res = await fetch(endpoint, { ...options, headers });
      return res.json();
    },
    [token],
  );

  /* ---- Auto-dismiss messages ---- */
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  /* ---- Load stats ---- */
  const loadStats = useCallback(async () => {
    try {
      const res = await apiCall('/api/admin/stats');
      if (res.success) {
        setAdminStats({
          pro: res.stats.pro || 0,
          sites: res.stats.sites || 0,
          active: res.stats.active || res.stats.accounts || 0,
          flipbooks: res.stats.flipbooks || 0,
        });
      }
    } catch {
      // Silent fail
    }
  }, [apiCall, setAdminStats]);

  /* ---- Load accounts ---- */
  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiCall('/api/admin/accounts');
      if (res.success) {
        setAdminAccounts(res.accounts || []);
      } else {
        setErrorMsg(res.error || 'Impossible de charger les comptes');
      }
    } catch {
      setErrorMsg('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, setAdminAccounts]);

  /* ---- Initial load ---- */
  useEffect(() => {
    loadStats();
    loadAccounts();
  }, []);

  /* ---- Load flipbook stats (derived from accounts) ---- */
  const flipbookAccountCount = (adminAccounts as AdminAccount[]).filter((a) =>
    a.products.includes('flipbook'),
  ).length;

  /* ---- Create account ---- */
  const handleCreate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!newFirstname.trim() || !newLastname.trim() || !newEmail.trim() || !newPassword) {
        setErrorMsg('Tous les champs sont requis');
        return;
      }
      if (!newProChecked && !newFlipbookChecked) {
        setErrorMsg('Sélectionnez au moins un produit');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Le mot de passe doit avoir au moins 6 caractères');
        return;
      }

      setIsCreating(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const products: string[] = [];
      if (newProChecked) products.push('pro');
      if (newFlipbookChecked) products.push('flipbook');

      try {
        const res = await apiCall('/api/admin/accounts/create', {
          method: 'POST',
          body: JSON.stringify({
            name: `${newFirstname.trim()} ${newLastname.trim()}`,
            email: newEmail.trim(),
            password: newPassword,
            products,
          }),
        });

        if (res.success) {
          const productNames = products.map((p) => (p === 'pro' ? 'Pro' : 'Flipbook')).join(' + ');
          setSuccessMsg(`Compte créé avec succès pour ${newFirstname.trim()} ${newLastname.trim()} (${productNames})`);
          // Reset form
          setNewFirstname('');
          setNewLastname('');
          setNewEmail('');
          setNewPassword('');
          setNewProChecked(false);
          setNewFlipbookChecked(false);
          loadAccounts();
          loadStats();
        } else {
          setErrorMsg(res.error || 'Erreur lors de la création');
        }
      } catch {
        setErrorMsg('Erreur de connexion');
      } finally {
        setIsCreating(false);
      }
    },
    [newFirstname, newLastname, newEmail, newPassword, newProChecked, newFlipbookChecked, apiCall, loadAccounts, loadStats],
  );

  /* ---- Open edit modal ---- */
  const openEdit = useCallback((email: string) => {
    const acc = (adminAccounts as AdminAccount[]).find((a) => a.email === email);
    if (!acc) return;

    const nameParts = (acc.name || '').split(' ');
    setEditData({
      originalEmail: acc.email,
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      email: acc.email,
      password: acc.password || '',
      proChecked: acc.products.includes('pro'),
      flipbookChecked: acc.products.includes('flipbook'),
      status: acc.status || 'active',
    });
    setShowEditPassword(false);
    setEditModalOpen(true);
  }, [adminAccounts]);

  /* ---- Save edit ---- */
  const handleSaveEdit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSuccessMsg(null);
      setErrorMsg(null);

      if (!editData.proChecked && !editData.flipbookChecked) {
        setErrorMsg('Sélectionnez au moins un produit');
        return;
      }

      setIsSaving(true);
      const products: string[] = [];
      if (editData.proChecked) products.push('pro');
      if (editData.flipbookChecked) products.push('flipbook');

      const data: Record<string, unknown> = {
        email: editData.originalEmail,
        name: `${editData.firstname.trim()} ${editData.lastname.trim()}`.trim(),
        status: editData.status,
        products,
      };

      if (editData.email !== editData.originalEmail) {
        data.newEmail = editData.email;
      }
      if (editData.password) {
        data.password = editData.password;
      }

      try {
        const res = await apiCall('/api/admin/accounts/update', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        if (res.success) {
          setSuccessMsg('Compte modifié avec succès');
          setEditModalOpen(false);
          loadAccounts();
          loadStats();
        } else {
          setErrorMsg(res.error || 'Erreur lors de la modification');
        }
      } catch {
        setErrorMsg('Erreur de connexion');
      } finally {
        setIsSaving(false);
      }
    },
    [editData, apiCall, loadAccounts, loadStats],
  );

  /* ---- Quick add product ---- */
  const quickAddProduct = useCallback(
    async (email: string, product: string) => {
      const acc = (adminAccounts as AdminAccount[]).find((a) => a.email === email);
      if (!acc) return;

      const products = [...acc.products];
      if (products.includes(product)) return;

      products.push(product);
      const productName = product === 'pro' ? 'Pro' : 'Flipbook';

      if (!confirm(`Ajouter ${productName} au compte de ${acc.name || email} ?`)) return;

      setSuccessMsg(null);
      setErrorMsg(null);

      try {
        const res = await apiCall('/api/admin/accounts/update', {
          method: 'POST',
          body: JSON.stringify({ email, products }),
        });

        if (res.success) {
          setSuccessMsg(`${productName} ajouté avec succès à ${acc.name || email}`);
          loadAccounts();
          loadStats();
        } else {
          setErrorMsg(res.error || "Erreur lors de l'ajout");
        }
      } catch {
        setErrorMsg('Erreur de connexion');
      }
    },
    [adminAccounts, apiCall, loadAccounts, loadStats],
  );

  /* ---- Delete account ---- */
  const openDelete = useCallback((email: string, name: string) => {
    setDeleteTarget({ email, name });
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsDeleting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiCall('/api/admin/accounts/delete', {
        method: 'POST',
        body: JSON.stringify({ email: deleteTarget.email }),
      });

      if (res.success) {
        setSuccessMsg('Compte supprimé avec succès');
        setDeleteModalOpen(false);
        loadAccounts();
        loadStats();
      } else {
        setErrorMsg(res.error || 'Erreur lors de la suppression');
      }
    } catch {
      setErrorMsg('Erreur de connexion');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, apiCall, loadAccounts, loadStats]);

  /* ---- Copy password ---- */
  const copyPassword = useCallback((pwd: string) => {
    navigator.clipboard.writeText(pwd).catch(() => {
      // Fallback: ignore
    });
  }, []);

  /* ---- Format date ---- */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* ---- Logout ---- */
  const handleLogout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  /* ---- Reset create form ---- */
  const resetCreateForm = useCallback(() => {
    setNewFirstname('');
    setNewLastname('');
    setNewEmail('');
    setNewPassword('');
    setNewProChecked(false);
    setNewFlipbookChecked(false);
  }, []);

  /* ================================================================ */
  /*  Styles                                                           */
  /* ================================================================ */

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(123,92,255,0.2)',
    background: 'rgba(15,28,63,0.6)',
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: '#8891B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
    display: 'block',
    fontFamily: 'Space Grotesk, sans-serif',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238891B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <StarryBackground />

      {/* ── HEADER ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(15,28,63,0.9)',
          borderBottom: '1px solid rgba(123,92,255,0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo circle */}
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
              boxShadow: '0 0 10px rgba(123,92,255,0.5)',
            }}
          >
            N
          </div>
          <h1
            style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            NyXia
          </h1>
          <span
            style={{
              color: '#4FA3FF',
              fontSize: 12,
              fontWeight: 600,
              background: 'rgba(123,92,255,0.15)',
              padding: '4px 10px',
              borderRadius: 50,
            }}
          >
            Super Admin
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#D6D9F0', fontFamily: 'Outfit, sans-serif' }}>
            {user?.name || user?.email || 'Admin'}
          </span>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(123,92,255,0.3)',
              background: 'rgba(123,92,255,0.1)',
              color: '#4FA3FF',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.1)')}
          >
            ← Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,82,82,0.3)',
              background: 'rgba(255,82,82,0.1)',
              color: '#ff6b6b',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,82,82,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,82,82,0.1)')}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 24,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── SUCCESS / ERROR MESSAGES ── */}
        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 16,
              background: 'rgba(0,230,118,0.1)',
              border: '1px solid rgba(0,230,118,0.3)',
              color: '#00E676',
              fontFamily: 'Outfit, sans-serif',
              animation: 'nx-sa-msg-in 0.35s ease both',
            }}
          >
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 16,
              background: 'rgba(255,82,82,0.1)',
              border: '1px solid rgba(255,82,82,0.3)',
              color: '#ff6b6b',
              fontFamily: 'Outfit, sans-serif',
              animation: 'nx-sa-msg-in 0.35s ease both',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* ── STATS GRID (3 cards) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
            animation: 'nx-sa-card-in 0.5s ease both',
          }}
        >
          {[
            { value: adminStats.pro, label: 'Clients Pro' },
            { value: adminStats.sites, label: 'Sites générés' },
            { value: adminStats.active, label: 'Comptes actifs' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(26,37,84,0.5)',
                border: '1px solid rgba(123,92,255,0.15)',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#4FA3FF',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8891B8',
                  marginTop: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── CREATE ACCOUNT PANEL ── */}
        <div
          style={{
            background: 'rgba(26,37,84,0.5)',
            border: '1px solid rgba(123,92,255,0.15)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            animation: 'nx-sa-card-in 0.6s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(123,92,255,0.1)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                + Créer un compte client
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8891B8',
                  marginTop: 2,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Créez un nouveau compte avec un ou plusieurs produits
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
              }}
            >
              {/* Prénom */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Prénom *</label>
                <input
                  type="text"
                  value={newFirstname}
                  onChange={(e) => setNewFirstname(e.target.value)}
                  placeholder="Jean"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                />
              </div>

              {/* Nom */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Nom *</label>
                <input
                  type="text"
                  value={newLastname}
                  onChange={(e) => setNewLastname(e.target.value)}
                  placeholder="Tremblay"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                />
              </div>

              {/* Courriel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Courriel *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jean@exemple.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                />
              </div>

              {/* Mot de passe */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={labelStyle}>Mot de passe *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="MotDePasse123"
                    required
                    minLength={6}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#8891B8',
                      cursor: 'pointer',
                      padding: 4,
                      fontSize: 12,
                    }}
                  >
                    {showNewPassword ? '👁️' : '🙈'}
                  </button>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: '#8891B8',
                    marginTop: 2,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Min. 6 caractères — visible pour vous montrer au client
                </span>
              </div>
            </div>

            {/* Products checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
              <label style={labelStyle}>Produits *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    background: 'rgba(123,92,255,0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(123,92,255,0.2)',
                    transition: 'background 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newProChecked}
                    onChange={(e) => setNewProChecked(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#7B5CFF' }}
                  />
                  <span style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: '#D6D9F0' }}>
                    💎 Pro (CA$39/mois) — Générateur de sites + NyXia
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    background: 'rgba(123,92,255,0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(123,92,255,0.2)',
                    transition: 'background 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newFlipbookChecked}
                    onChange={(e) => setNewFlipbookChecked(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#7B5CFF' }}
                  />
                  <span style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: '#D6D9F0' }}>
                    📚 Flipbook (€47) — Créateur de flipbooks
                  </span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid rgba(123,92,255,0.1)',
              }}
            >
              <button
                type="submit"
                disabled={isCreating}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px rgba(123,92,255,0.3)',
                  transition: 'all 0.2s',
                  opacity: isCreating ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) {
                    e.currentTarget.style.boxShadow = '0 0 32px rgba(123,92,255,0.5)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(123,92,255,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isCreating ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'nx-sa-spinner 0.7s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Création…
                  </>
                ) : (
                  'Créer le compte'
                )}
              </button>
              <button
                type="button"
                onClick={resetCreateForm}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: '1px solid rgba(123,92,255,0.3)',
                  background: 'transparent',
                  color: '#D6D9F0',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {/* ── FLIPBOOK STATS (2 cards) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
            animation: 'nx-sa-card-in 0.7s ease both',
          }}
        >
          {[
            { value: flipbookAccountCount, label: 'Comptes Flipbook' },
            { value: `${flipbookAccountCount} comptes`, label: 'Flipbooks créés' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(26,37,84,0.5)',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: 16,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#FFD700',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#FFD700',
                  marginTop: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── ACCOUNTS TABLE ── */}
        <div
          style={{
            background: 'rgba(26,37,84,0.5)',
            border: '1px solid rgba(123,92,255,0.15)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            animation: 'nx-sa-card-in 0.8s ease both',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(123,92,255,0.1)',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                📋 Liste des comptes clients
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#8891B8',
                  marginTop: 2,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Cliquez sur ✏️ pour ajouter des produits à un compte existant
              </div>
            </div>
            <button
              onClick={() => { loadAccounts(); loadStats(); }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid rgba(123,92,255,0.3)',
                background: 'transparent',
                color: '#D6D9F0',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              ↻ Actualiser
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nom', 'Courriel', 'Mot de passe', 'Produits', 'Statut', 'Créé le', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#8891B8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: 'rgba(15,28,63,0.4)',
                          borderBottom: '1px solid rgba(123,92,255,0.1)',
                          fontFamily: 'Space Grotesk, sans-serif',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        padding: 20,
                        color: '#8891B8',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Chargement…
                    </td>
                  </tr>
                ) : (adminAccounts as AdminAccount[]).length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '40px 20px', color: '#8891B8' }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>📭</div>
                      Aucun compte client
                    </td>
                  </tr>
                ) : (
                  (adminAccounts as AdminAccount[]).map((acc) => {
                    const products = acc.products || [];
                    const hasPro = products.includes('pro');
                    const hasFlipbook = products.includes('flipbook');

                    let quickAction = null;
                    if (!hasPro && !hasFlipbook) {
                      quickAction = (
                        <button
                          onClick={() => openEdit(acc.email)}
                          title="Ajouter un produit"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: '1px solid rgba(123,92,255,0.2)',
                            background: 'rgba(123,92,255,0.2)',
                            color: '#8891B8',
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 4,
                          }}
                        >
                          ➕
                        </button>
                      );
                    } else if (!hasPro) {
                      quickAction = (
                        <button
                          onClick={() => quickAddProduct(acc.email, 'pro')}
                          title="Ajouter Pro"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: '1px solid #7B5CFF',
                            background: 'rgba(123,92,255,0.2)',
                            color: '#7B5CFF',
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 4,
                          }}
                        >
                          💎+
                        </button>
                      );
                    } else if (!hasFlipbook) {
                      quickAction = (
                        <button
                          onClick={() => quickAddProduct(acc.email, 'flipbook')}
                          title="Ajouter Flipbook"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: '1px solid #FFD700',
                            background: 'rgba(255,215,0,0.2)',
                            color: '#FFD700',
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 4,
                          }}
                        >
                          📚+
                        </button>
                      );
                    }

                    const pwd = acc.password || '—';
                    const pwdDisplay =
                      pwd !== '—' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <code
                            style={{
                              fontFamily: 'monospace',
                              fontSize: 11,
                              background: 'rgba(0,0,0,0.3)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              color: '#FFD700',
                              maxWidth: 100,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                            }}
                            title={pwd}
                          >
                            {pwd.length > 12 ? pwd.substring(0, 12) + '...' : pwd}
                          </code>
                          <button
                            onClick={() => copyPassword(pwd)}
                            title="Copier"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 12,
                              opacity: 0.7,
                              padding: 2,
                              transition: 'opacity 0.2s',
                              color: '#8891B8',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                          >
                            📋
                          </button>
                        </span>
                      ) : (
                        '—'
                      );

                    return (
                      <tr key={acc.id || acc.email}>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                          }}
                        >
                          <strong>{acc.name || '—'}</strong>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                          }}
                        >
                          {acc.email}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                          }}
                        >
                          {pwdDisplay}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {hasPro && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 50,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: 'rgba(123,92,255,0.15)',
                                color: '#7B5CFF',
                                marginRight: 4,
                              }}
                            >
                              Pro
                            </span>
                          )}
                          {hasFlipbook && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 50,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                color: '#1a1a2e',
                                marginRight: 4,
                              }}
                            >
                              Flipbook
                            </span>
                          )}
                          {!hasPro && !hasFlipbook && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 50,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: 'rgba(79,163,255,0.15)',
                                color: '#4FA3FF',
                                marginRight: 4,
                              }}
                            >
                              Aucun
                            </span>
                          )}
                          {quickAction}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 50,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                acc.status === 'suspended'
                                  ? 'rgba(255,82,82,0.15)'
                                  : 'rgba(0,230,118,0.15)',
                              color: acc.status === 'suspended' ? '#ff6b6b' : '#00E676',
                            }}
                          >
                            {acc.status === 'suspended' ? 'Suspendu' : 'Actif'}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(acc.createdAt)}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: 13,
                            color: '#D6D9F0',
                            borderBottom: '1px solid rgba(123,92,255,0.1)',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => openEdit(acc.email)}
                              title="Modifier"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: '1px solid rgba(123,92,255,0.2)',
                                background: 'rgba(15,28,63,0.4)',
                                color: '#8891B8',
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#4FA3FF';
                                e.currentTarget.style.color = '#4FA3FF';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                                e.currentTarget.style.color = '#8891B8';
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => openDelete(acc.email, acc.name || acc.email)}
                              title="Supprimer"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: '1px solid rgba(123,92,255,0.2)',
                                background: 'rgba(15,28,63,0.4)',
                                color: '#8891B8',
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ff6b6b';
                                e.currentTarget.style.color = '#ff6b6b';
                                e.currentTarget.style.background = 'rgba(255,82,82,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)';
                                e.currentTarget.style.color = '#8891B8';
                                e.currentTarget.style.background = 'rgba(15,28,63,0.4)';
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── EDIT MODAL ── */}
      {editModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#1A2554',
              border: '1px solid rgba(123,92,255,0.2)',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              animation: 'nx-sa-modal-in 0.3s ease both',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                Modifier le compte
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(255,82,82,0.2)',
                  background: 'transparent',
                  color: '#ff6b6b',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Prénom */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Prénom</label>
                  <input
                    type="text"
                    value={editData.firstname}
                    onChange={(e) => setEditData({ ...editData, firstname: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                  />
                </div>

                {/* Nom */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Nom</label>
                  <input
                    type="text"
                    value={editData.lastname}
                    onChange={(e) => setEditData({ ...editData, lastname: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                  />
                </div>

                {/* Courriel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Courriel</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                  />
                </div>

                {/* Nouveau mot de passe */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editData.password}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                      placeholder="Laisser vide pour ne pas changer"
                      style={{ ...inputStyle, paddingRight: 40 }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#8891B8',
                        cursor: 'pointer',
                        padding: 4,
                        fontSize: 12,
                      }}
                    >
                      {showEditPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                {/* Produits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Produits</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: 'rgba(123,92,255,0.1)',
                        borderRadius: 8,
                        border: '1px solid rgba(123,92,255,0.2)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editData.proChecked}
                        onChange={(e) => setEditData({ ...editData, proChecked: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: '#7B5CFF' }}
                      />
                      <span style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: '#D6D9F0' }}>
                        💎 Pro (CA$39/mois)
                      </span>
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: 'rgba(123,92,255,0.1)',
                        borderRadius: 8,
                        border: '1px solid rgba(123,92,255,0.2)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editData.flipbookChecked}
                        onChange={(e) => setEditData({ ...editData, flipbookChecked: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: '#7B5CFF' }}
                      />
                      <span style={{ fontSize: 14, fontFamily: 'Outfit, sans-serif', color: '#D6D9F0' }}>
                        📚 Flipbook (€47)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Statut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={labelStyle}>Statut</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    style={selectStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#7B5CFF')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(123,92,255,0.2)')}
                  >
                    <option value="active" style={{ background: '#1A2554' }}>Actif</option>
                    <option value="suspended" style={{ background: '#1A2554' }}>Suspendu</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(123,92,255,0.1)',
                }}
              >
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #7B5CFF, #5A6CFF)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 20px rgba(123,92,255,0.3)',
                    transition: 'all 0.2s',
                    opacity: isSaving ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.boxShadow = '0 0 32px rgba(123,92,255,0.5)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(123,92,255,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isSaving ? (
                    <>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#FFFFFF',
                          borderRadius: '50%',
                          animation: 'nx-sa-spinner 0.7s linear infinite',
                          display: 'inline-block',
                        }}
                      />
                      Enregistrement…
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 10,
                    border: '1px solid rgba(123,92,255,0.3)',
                    background: 'transparent',
                    color: '#D6D9F0',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'Space Grotesk, sans-serif',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#1A2554',
              border: '1px solid rgba(123,92,255,0.2)',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 480,
              animation: 'nx-sa-modal-in 0.3s ease both',
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                ⚠️ Confirmer la suppression
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(255,82,82,0.2)',
                  background: 'transparent',
                  color: '#ff6b6b',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <p style={{ marginBottom: 20, color: '#D6D9F0', fontFamily: 'Outfit, sans-serif' }}>
              Voulez-vous vraiment supprimer le compte de{' '}
              <strong>{deleteTarget.name}</strong> ?
            </p>
            <p
              style={{
                marginBottom: 20,
                color: '#ff6b6b',
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Cette action est irréversible. Toutes les données du client seront perdues.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                paddingTop: 16,
                borderTop: '1px solid rgba(123,92,255,0.1)',
              }}
            >
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff6b6b, #cc4444)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isDeleting ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isDeleting ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'nx-sa-spinner 0.7s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Suppression…
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: '1px solid rgba(123,92,255,0.3)',
                  background: 'transparent',
                  color: '#D6D9F0',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,92,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESPONSIVE MEDIA QUERIES (via inline detection) ── */}
      <style>{`
        @media (max-width: 768px) {
          header { padding: 12px 16px !important; }
          main { padding: 16px !important; }
          form > div:first-child { grid-template-columns: 1fr !important; }
          table th, table td { padding: 10px 12px !important; font-size: 12px !important; }
        }
      `}</style>
    </div>
  );
}
