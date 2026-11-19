import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Loader2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import type { PricingTier, Product } from '../types/catalog';
import {
  formatBundlePackHyphenLabel,
  formatBundlePackLabel,
  formatKwdFromFils,
} from '../utils/pricing';
import { PricingTierSelector } from './PricingTierSelector';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const showCartSuccess = useToastStore((state) => state.showCartSuccess);
  const showError = useToastStore((state) => state.showError);

  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    product.pricingTiers[0]?.id ?? null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [highlightActionArea, setHighlightActionArea] = useState(false);

  const processTimerRef = useRef<number | null>(null);
  const addedTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const isAddingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (processTimerRef.current !== null) window.clearTimeout(processTimerRef.current);
      if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
      if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (product.pricingTiers.length === 0) {
      setSelectedTierId(null);
      return;
    }
    const stillExists = product.pricingTiers.some((t) => t.id === selectedTierId);
    if (!stillExists) {
      setSelectedTierId(product.pricingTiers[0].id);
    }
  }, [product.pricingTiers, selectedTierId]);

  const selectedTier: PricingTier | null =
    product.pricingTiers.find((t) => t.id === selectedTierId) ?? product.pricingTiers[0] ?? null;

  const hasTiers = product.pricingTiers.length > 0;

  const handleAddToCart = () => {
    if (isAddingRef.current) return;

    if (!selectedTier) {
      showError({
        dedupeKey: `cart-err:${product.id}`,
        title: 'Unable to add item',
        message: 'No bundle pricing tier is selected for this product.',
      });
      return;
    }

    isAddingRef.current = true;
    setIsAdding(true);

    const tierSnapshot = selectedTier;
    const productSnapshot = product;

    processTimerRef.current = window.setTimeout(() => {
      try {
        const result = addItem({
          product: productSnapshot,
          tier: tierSnapshot,
          quantity: 1,
        });

        if (!result.ok) {
          setJustAdded(false);
          showError({
            dedupeKey: `cart-err:${productSnapshot.id}`,
            title: 'Unable to add item',
            message: result.error,
          });
          return;
        }

        setJustAdded(true);
        setHighlightActionArea(true);

        showCartSuccess({
          dedupeKey: `cart:${productSnapshot.id}:${tierSnapshot.id}`,
          title: result.merged ? 'Cart updated' : 'Added to cart',
          cartDetails: {
            productName: productSnapshot.name,
            productImage: productSnapshot.image_url,
            tierLabel: formatBundlePackHyphenLabel(tierSnapshot.units_per_bundle),
            bundleQuantity: result.addedQuantity,
            internalPackLabel: formatBundlePackLabel(
              tierSnapshot.units_per_bundle * result.addedQuantity
            ),
            priceKwdLabel: formatKwdFromFils(tierSnapshot.price_fils * result.addedQuantity),
            mergedNote: result.merged
              ? `Now ${result.item.bundleQuantity} bundles in cart`
              : undefined,
          },
        });

        if (addedTimerRef.current !== null) window.clearTimeout(addedTimerRef.current);
        addedTimerRef.current = window.setTimeout(() => {
          setJustAdded(false);
        }, 1800);

        if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = window.setTimeout(() => {
          setHighlightActionArea(false);
        }, 800);
      } catch {
        setJustAdded(false);
        showError({
          dedupeKey: `cart-err:${productSnapshot.id}`,
          title: 'Unable to add item',
          message: 'Unable to add this item to the cart. Please try again.',
        });
      } finally {
        isAddingRef.current = false;
        setIsAdding(false);
      }
    }, 100);
  };

  return (
    <article
      className={`surface-card flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        highlightActionArea ? 'border-teal-600/60' : 'hover:border-slate-300'
      }`}
    >
      <Link
        to={`/products/${product.id}`}
        className="block overflow-hidden border-b border-slate-100 bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700"
      >
        <ProductImage
          src={product.image_url}
          alt={product.name}
          containerClassName="aspect-[4/3] w-full overflow-hidden bg-slate-50"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Clean unboxed clinical metadata */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="text-slate-700">{product.brand?.name ?? 'Unassigned brand'}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span>{product.category?.name ?? 'Uncategorized'}</span>
        </div>

        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-slate-900 sm:text-[19px]">
          <Link
            to={`/products/${product.id}`}
            className="hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 min-h-[2.75rem] line-clamp-2 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>

        {/* Dynamic Pricing Tiers */}
        <div className="mt-4 flex-1">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Select bundle offer</span>
            <span className="tabular-nums">
              {product.pricingTiers.length}{' '}
              {product.pricingTiers.length === 1 ? 'tier' : 'tiers'}
            </span>
          </div>

          <PricingTierSelector
            tiers={product.pricingTiers}
            selectedTierId={selectedTier?.id ?? null}
            onSelect={(tier) => {
              setSelectedTierId(tier.id);
              setJustAdded(false);
            }}
            variant="compact"
            groupLabel={`Select bundle tier for ${product.name}`}
          />
        </div>

        {/* Selected Tier Price Summary & Actions */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          {selectedTier ? (
            <div
              className={`mb-3.5 flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 -mx-2 transition-colors duration-200 ${
                highlightActionArea ? 'bg-teal-50/75' : ''
              }`}
            >
              <div className="text-xs text-slate-600">
                Selected:{' '}
                <strong className="font-semibold text-slate-900">
                  {formatBundlePackLabel(selectedTier.units_per_bundle)}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {formatKwdFromFils(selectedTier.price_fils)}
                </span>
                <span className="ml-1 text-xs text-slate-500">/ bundle</span>
              </div>
            </div>
          ) : (
            <p className="mb-3.5 text-xs font-medium text-amber-800">
              Currently unavailable for purchase
            </p>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link to={`/products/${product.id}`} className="btn-secondary flex-1">
              <span>View details</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              disabled={!hasTiers || !selectedTier}
              aria-busy={isAdding}
              onClick={handleAddToCart}
              className={`btn-primary flex-1 transition-[background-color,transform,opacity] duration-200 ${
                justAdded ? 'bg-teal-800 hover:bg-teal-800' : ''
              }`}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Adding...</span>
                </>
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4 animate-check-pop" aria-hidden="true" />
                  <span>Added to cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span>Add to cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
