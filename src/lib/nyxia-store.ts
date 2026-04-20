import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'superadmin' | 'admin';
  products: string[]; // 'pro', 'flipbook'
  status: 'active' | 'suspended';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
}

export type ViewMode = 'login' | 'dashboard' | 'superadmin';
export type PanelMode = 'chat' | 'generator' | 'medias' | 'wan' | 'wanimg' | 'editor' | 'messages' | 'projects';
export type AgentMode = 'nyxia' | 'copywriter' | 'formation' | 'seo';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEY_TOKEN = 'nyxia_token';
const STORAGE_KEY_USER = 'nyxia_user';

function readFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeToStorage<T>(key: string, value: T | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage full or unavailable – fail silently
  }
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface NyXiaStore {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // View
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;

  // Dashboard
  currentPanel: PanelMode;
  setCurrentPanel: (panel: PanelMode) => void;

  // Chat
  messages: ChatMessage[];
  currentAgent: AgentMode;
  isChatLoading: boolean;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setCurrentAgent: (agent: AgentMode) => void;
  setIsChatLoading: (loading: boolean) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;

  // Admin
  adminAccounts: any[];
  setAdminAccounts: (accounts: any[]) => void;
  adminStats: { pro: number; sites: number; active: number; flipbooks: number };
  setAdminStats: (stats: NyXiaStore['adminStats']) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  loginLoading: boolean;
  setLoginLoading: (loading: boolean) => void;

  // Hydration
  hydrate: () => void;
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useNyxiaStore = create<NyXiaStore>((set, get) => ({
  // ── Auth ─────────────────────────────────────────────────────────────────
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    writeToStorage(STORAGE_KEY_USER, user);
    writeToStorage(STORAGE_KEY_TOKEN, token);
    set({
      user,
      token,
      isAuthenticated: true,
      currentView: user.role === 'superadmin' ? 'superadmin' : 'dashboard',
      loginError: null,
      loginLoading: false,
    });
  },

  clearAuth: () => {
    writeToStorage(STORAGE_KEY_USER, null);
    writeToStorage(STORAGE_KEY_TOKEN, null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentView: 'login',
      messages: [],
      projects: [],
      adminAccounts: [],
      adminStats: { pro: 0, sites: 0, active: 0, flipbooks: 0 },
    });
  },

  // ── View ─────────────────────────────────────────────────────────────────
  currentView: 'login',

  setCurrentView: (view) => set({ currentView: view }),

  // ── Dashboard ────────────────────────────────────────────────────────────
  currentPanel: 'chat',

  setCurrentPanel: (panel) => set({ currentPanel: panel }),

  // ── Chat ─────────────────────────────────────────────────────────────────
  messages: [],
  currentAgent: 'nyxia',
  isChatLoading: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  clearMessages: () => set({ messages: [] }),

  setCurrentAgent: (agent) => set({ currentAgent: agent, messages: [] }),

  setIsChatLoading: (loading) => set({ isChatLoading: loading }),

  // ── Projects ─────────────────────────────────────────────────────────────
  projects: [],

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  // ── Admin ────────────────────────────────────────────────────────────────
  adminAccounts: [],

  setAdminAccounts: (accounts) => set({ adminAccounts: accounts }),

  adminStats: { pro: 0, sites: 0, active: 0, flipbooks: 0 },

  setAdminStats: (stats) => set({ adminStats: stats }),

  // ── UI ───────────────────────────────────────────────────────────────────
  sidebarOpen: true,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  loginError: null,

  setLoginError: (error) => set({ loginError: error }),

  loginLoading: false,

  setLoginLoading: (loading) => set({ loginLoading: loading }),

  // ── Hydration ────────────────────────────────────────────────────────────
  hydrate: () => {
    const storedUser = readFromStorage<User>(STORAGE_KEY_USER);
    const storedToken = readFromStorage<string>(STORAGE_KEY_TOKEN);

    if (storedUser && storedToken) {
      set({
        user: storedUser,
        token: storedToken,
        isAuthenticated: true,
        currentView:
          storedUser.role === 'superadmin' ? 'superadmin' : 'dashboard',
      });
    } else {
      // Ensure stale data is cleaned up
      writeToStorage(STORAGE_KEY_USER, null);
      writeToStorage(STORAGE_KEY_TOKEN, null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        currentView: 'login',
      });
    }
  },
}));
