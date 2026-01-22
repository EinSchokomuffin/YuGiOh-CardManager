import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, Printing, CollectionItem, Deck, PortfolioType } from "./types";

// Auth Store - User authentication state
interface User {
  id: string;
  email: string;
  username: string;
  tier: string;
  searchLanguage: 'DE' | 'EN' | 'FR' | 'IT' | 'PT';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setSearchLanguage: (language: User['searchLanguage']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updates } : null 
      })),
      setSearchLanguage: (language) => set((state) => ({
        user: state.user ? { ...state.user, searchLanguage: language } : null
      })),
    }),
    {
      name: "duelvault-auth-store",
    }
  )
);

// App Store - Global UI State
interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  currency: "EUR" | "USD" | "GBP";
  setCurrency: (currency: "EUR" | "USD" | "GBP") => void;
  language: "de" | "en" | "fr";
  setLanguage: (language: "de" | "en" | "fr") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      currency: "EUR",
      setCurrency: (currency) => set({ currency }),
      language: "de",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "duelvault-app-store",
    }
  )
);

// Collection Store - Local collection state for optimistic updates
interface CollectionState {
  items: CollectionItem[];
  setItems: (items: CollectionItem[]) => void;
  addItem: (item: CollectionItem) => void;
  updateItem: (id: string, updates: Partial<CollectionItem>) => void;
  removeItem: (id: string) => void;
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  selectAllItems: (ids: string[]) => void;
  clearSelection: () => void;
  filterPortfolio: PortfolioType | "ALL";
  setFilterPortfolio: (portfolio: PortfolioType | "ALL") => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  selectedItems: [],
  toggleSelectItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((i) => i !== id)
        : [...state.selectedItems, id],
    })),
  selectAllItems: (ids) => set({ selectedItems: ids }),
  clearSelection: () => set({ selectedItems: [] }),
  filterPortfolio: "ALL",
  setFilterPortfolio: (portfolio) => set({ filterPortfolio: portfolio }),
}));

// Deck Builder Store
interface DeckBuilderState {
  currentDeck: Deck | null;
  setCurrentDeck: (deck: Deck | null) => void;
  mainDeck: (Printing & { card: Card; quantity: number })[];
  extraDeck: (Printing & { card: Card; quantity: number })[];
  sideDeck: (Printing & { card: Card; quantity: number })[];
  addToMainDeck: (printing: Printing & { card: Card }) => void;
  addToExtraDeck: (printing: Printing & { card: Card }) => void;
  addToSideDeck: (printing: Printing & { card: Card }) => void;
  removeFromMainDeck: (printingId: string) => void;
  removeFromExtraDeck: (printingId: string) => void;
  removeFromSideDeck: (printingId: string) => void;
  clearDeck: () => void;
  mainDeckCount: () => number;
  extraDeckCount: () => number;
  sideDeckCount: () => number;
}

const addCardToDeckZone = (
  deck: (Printing & { card: Card; quantity: number })[],
  printing: Printing & { card: Card },
  maxQuantity = 3
): (Printing & { card: Card; quantity: number })[] => {
  const existing = deck.find((c) => c.id === printing.id);
  if (existing) {
    if (existing.quantity >= maxQuantity) return deck;
    return deck.map((c) => (c.id === printing.id ? { ...c, quantity: c.quantity + 1 } : c));
  }
  return [...deck, { ...printing, quantity: 1 }];
};

const removeCardFromDeckZone = (
  deck: (Printing & { card: Card; quantity: number })[],
  printingId: string
): (Printing & { card: Card; quantity: number })[] => {
  const existing = deck.find((c) => c.id === printingId);
  if (!existing) return deck;
  if (existing.quantity > 1) {
    return deck.map((c) => (c.id === printingId ? { ...c, quantity: c.quantity - 1 } : c));
  }
  return deck.filter((c) => c.id !== printingId);
};

export const useDeckBuilderStore = create<DeckBuilderState>((set, get) => ({
  currentDeck: null,
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
  mainDeck: [],
  extraDeck: [],
  sideDeck: [],
  addToMainDeck: (printing) =>
    set((state) => ({ mainDeck: addCardToDeckZone(state.mainDeck, printing) })),
  addToExtraDeck: (printing) =>
    set((state) => ({ extraDeck: addCardToDeckZone(state.extraDeck, printing) })),
  addToSideDeck: (printing) =>
    set((state) => ({ sideDeck: addCardToDeckZone(state.sideDeck, printing) })),
  removeFromMainDeck: (printingId) =>
    set((state) => ({ mainDeck: removeCardFromDeckZone(state.mainDeck, printingId) })),
  removeFromExtraDeck: (printingId) =>
    set((state) => ({ extraDeck: removeCardFromDeckZone(state.extraDeck, printingId) })),
  removeFromSideDeck: (printingId) =>
    set((state) => ({ sideDeck: removeCardFromDeckZone(state.sideDeck, printingId) })),
  clearDeck: () => set({ mainDeck: [], extraDeck: [], sideDeck: [], currentDeck: null }),
  mainDeckCount: () => get().mainDeck.reduce((sum, c) => sum + c.quantity, 0),
  extraDeckCount: () => get().extraDeck.reduce((sum, c) => sum + c.quantity, 0),
  sideDeckCount: () => get().sideDeck.reduce((sum, c) => sum + c.quantity, 0),
}));

// Card Search Store
interface CardSearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  selectedPrinting: Printing | null;
  setSelectedPrinting: (printing: Printing | null) => void;
  filters: {
    type?: string;
    attribute?: string;
    archetype?: string;
  };
  setFilters: (filters: Partial<CardSearchState["filters"]>) => void;
  clearFilters: () => void;
}

export const useCardSearchStore = create<CardSearchState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),
  selectedPrinting: null,
  setSelectedPrinting: (printing) => set({ selectedPrinting: printing }),
  filters: {},
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
}));

// Toast/Notification Store
interface Toast {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
