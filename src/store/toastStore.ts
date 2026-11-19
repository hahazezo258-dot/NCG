import { create } from 'zustand';

export type ToastVariant = 'success' | 'error';

export interface CartToastDetails {
  productName: string;
  productImage?: string | null;
  tierLabel: string;
  bundleQuantity: number;
  internalPackLabel: string;
  priceKwdLabel: string;
  mergedNote?: string;
}

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  cartDetails?: CartToastDetails;
  dedupeKey?: string;
  durationMs: number;
  createdAt: number;
  updatedAt: number;
  isClosing: boolean;
}

export interface ShowSuccessCartToastInput {
  dedupeKey?: string;
  title?: string;
  cartDetails: CartToastDetails;
  durationMs?: number;
}

export interface ShowErrorToastInput {
  dedupeKey?: string;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  showCartSuccess: (input: ShowSuccessCartToastInput) => string;
  showError: (input: ShowErrorToastInput) => string;
  startDismiss: (id: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const MAX_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION_MS = 4000;
const EXIT_ANIMATION_MS = 220;

const exitTimers = new Map<string, number>();

function generateToastId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clearExitTimer(id: string) {
  const existing = exitTimers.get(id);
  if (existing !== undefined) {
    window.clearTimeout(existing);
    exitTimers.delete(id);
  }
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showCartSuccess: ({
    dedupeKey,
    title = 'Added to cart',
    cartDetails,
    durationMs = DEFAULT_DURATION_MS,
  }) => {
    const now = Date.now();
    const existing = dedupeKey
      ? get().toasts.find((t) => t.dedupeKey === dedupeKey && !t.isClosing)
      : undefined;

    if (existing) {
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === existing.id
            ? {
                ...t,
                title,
                cartDetails,
                durationMs,
                updatedAt: now,
                isClosing: false,
              }
            : t
        ),
      }));
      return existing.id;
    }

    const id = generateToastId();
    const nextToast: ToastItem = {
      id,
      variant: 'success',
      title,
      cartDetails,
      dedupeKey,
      durationMs,
      createdAt: now,
      updatedAt: now,
      isClosing: false,
    };

    set((state) => {
      const combined = [...state.toasts, nextToast];
      const trimmed =
        combined.length > MAX_VISIBLE_TOASTS
          ? combined.slice(combined.length - MAX_VISIBLE_TOASTS)
          : combined;
      return { toasts: trimmed };
    });

    return id;
  },

  showError: ({
    dedupeKey,
    title = 'Unable to add item',
    message,
    durationMs = DEFAULT_DURATION_MS,
  }) => {
    const now = Date.now();
    const existing = dedupeKey
      ? get().toasts.find((t) => t.dedupeKey === dedupeKey && !t.isClosing)
      : undefined;

    if (existing) {
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === existing.id
            ? {
                ...t,
                title,
                message,
                durationMs,
                updatedAt: now,
                isClosing: false,
              }
            : t
        ),
      }));
      return existing.id;
    }

    const id = generateToastId();
    const nextToast: ToastItem = {
      id,
      variant: 'error',
      title,
      message,
      dedupeKey,
      durationMs,
      createdAt: now,
      updatedAt: now,
      isClosing: false,
    };

    set((state) => {
      const combined = [...state.toasts, nextToast];
      const trimmed =
        combined.length > MAX_VISIBLE_TOASTS
          ? combined.slice(combined.length - MAX_VISIBLE_TOASTS)
          : combined;
      return { toasts: trimmed };
    });

    return id;
  },

  startDismiss: (id) => {
    const target = get().toasts.find((t) => t.id === id);
    if (!target || target.isClosing) return;

    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, isClosing: true } : t)),
    }));

    clearExitTimer(id);
    const timer = window.setTimeout(() => {
      exitTimers.delete(id);
      get().removeToast(id);
    }, EXIT_ANIMATION_MS);
    exitTimers.set(id, timer);
  },

  removeToast: (id) => {
    clearExitTimer(id);
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    for (const id of exitTimers.keys()) {
      clearExitTimer(id);
    }
    set({ toasts: [] });
  },
}));
