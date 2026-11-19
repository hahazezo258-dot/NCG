import { create } from 'zustand';
import type { CartItem, PricingTier, Product } from '../types/catalog';
import { calculateInternalUnits, calculateLineTotal } from '../utils/pricing';

interface AddToCartPayload {
  product: Product;
  tier: PricingTier;
  quantity: number;
}

export type AddToCartResult =
  | {
      ok: true;
      item: CartItem;
      addedQuantity: number;
      merged: boolean;
    }
  | {
      ok: false;
      error: string;
    };

interface CartState {
  items: CartItem[];
  lastAddedKey: string | null;
  lastAddedAt: number;
  addItem: (payload: AddToCartPayload) => AddToCartResult;
  updateQuantity: (cartKey: string, quantity: number) => void;
  incrementQuantity: (cartKey: string) => void;
  decrementQuantity: (cartKey: string) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
}

export function buildCartKey(productId: string, pricingTierId: string): string {
  return `${productId}_${pricingTierId}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  lastAddedKey: null,
  lastAddedAt: 0,

  addItem: ({ product, tier, quantity }) => {
    if (!product?.id || !tier?.id) {
      return {
        ok: false,
        error: 'Please select a valid pricing tier before adding this item.',
      };
    }

    if (
      !Number.isInteger(tier.units_per_bundle) ||
      tier.units_per_bundle < 1 ||
      !Number.isInteger(tier.price_fils) ||
      tier.price_fils <= 0
    ) {
      return {
        ok: false,
        error: 'This pricing tier is currently unavailable. Please choose another option.',
      };
    }

    const safeQuantity = Math.trunc(quantity);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1 || safeQuantity > 9999) {
      return {
        ok: false,
        error: 'Please choose a valid bundle quantity of at least 1.',
      };
    }

    const cartKey = buildCartKey(product.id, tier.id);

    try {
      const existingItem = get().items.find((item) => item.cartKey === cartKey);
      let resultingItem: CartItem;
      const merged = Boolean(existingItem);

      if (existingItem) {
        resultingItem = {
          ...existingItem,
          productName: product.name,
          productImage: product.image_url,
          unitsPerBundle: tier.units_per_bundle,
          priceFils: tier.price_fils,
          bundleQuantity: existingItem.bundleQuantity + safeQuantity,
        };
      } else {
        resultingItem = {
          cartKey,
          productId: product.id,
          pricingTierId: tier.id,
          productName: product.name,
          productImage: product.image_url,
          unitsPerBundle: tier.units_per_bundle,
          priceFils: tier.price_fils,
          bundleQuantity: safeQuantity,
        };
      }

      const addedAt = Date.now();

      set((state) => {
        const existingIndex = state.items.findIndex((item) => item.cartKey === cartKey);

        if (existingIndex >= 0) {
          const updatedItems = state.items.map((item, idx) =>
            idx === existingIndex ? resultingItem : item
          );
          return { items: updatedItems, lastAddedKey: cartKey, lastAddedAt: addedAt };
        }

        return {
          items: [...state.items, resultingItem],
          lastAddedKey: cartKey,
          lastAddedAt: addedAt,
        };
      });

      return {
        ok: true,
        item: resultingItem,
        addedQuantity: safeQuantity,
        merged,
      };
    } catch {
      return {
        ok: false,
        error: 'Unable to add this item to the cart. Please try again.',
      };
    }
  },

  updateQuantity: (cartKey, quantity) => {
    const safeQuantity = Math.trunc(quantity);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.cartKey === cartKey ? { ...item, bundleQuantity: safeQuantity } : item
      ),
    }));
  },

  incrementQuantity: (cartKey) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartKey === cartKey ? { ...item, bundleQuantity: item.bundleQuantity + 1 } : item
      ),
    }));
  },

  decrementQuantity: (cartKey) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.cartKey === cartKey && item.bundleQuantity > 1
          ? { ...item, bundleQuantity: item.bundleQuantity - 1 }
          : item
      ),
    }));
  },

  removeItem: (cartKey) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartKey !== cartKey),
      lastAddedKey: state.lastAddedKey === cartKey ? null : state.lastAddedKey,
    }));
  },

  clearCart: () => set({ items: [], lastAddedKey: null }),
}));

export function selectCartSummary(items: CartItem[]) {
  let totalBundles = 0;
  let totalPacks = 0;
  let subtotalFils = 0;

  for (const item of items) {
    totalBundles += item.bundleQuantity;
    totalPacks += calculateInternalUnits(item.unitsPerBundle, item.bundleQuantity);
    subtotalFils += calculateLineTotal(item.priceFils, item.bundleQuantity);
  }

  return {
    lineCount: items.length,
    totalBundles,
    totalPacks,
    subtotalFils,
    grandTotalFils: subtotalFils,
  };
}
