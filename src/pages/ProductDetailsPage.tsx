import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  PackageSearch,
  ShoppingBag,
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { PricingTierSelector } from '../components/PricingTierSelector';
import { ProductImage } from '../components/ProductImage';
import { QuantitySelector } from '../components/QuantitySelector';
import { useProduct } from '../hooks/useProduct';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import {
  calculateInternalUnits,
  calculateLineTotal,
  formatBundleCountLabel,
  formatBundlePackHyphenLabel,
  formatBundlePackLabel,
  formatKwdFromFils,
} from '../utils/pricing';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, notFound, refetch } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);
  const showCartSuccess = useToastStore((state) => state.showCartSuccess);
  const showError = useToastStore((state) => state.showError);

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [bundleQuantity, setBundleQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [addedBanner, setAddedBanner] = useState(false);
  const [highlightSummary, setHighlightSummary] = useState(false);

  const isAddingRef = useRef(false);
  const processTimerRef = useRef<number | null>(null);
  const buttonTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (processTimerRef.current !== null) window.clearTimeout(processTimerRef.current);
      if (buttonTimerRef.current !== null) window.clearTimeout(buttonTimerRef.current);
      if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!product || product.pricingTiers.length === 0) {
      setSelectedTierId(null);
      return;
    }
    setSelectedTierId((prev) => {
      if (prev && product.pricingTiers.some((t) => t.id === prev)) {
        return prev;
      }
      return product.pricingTiers[0].id;
    });
  }, [product]);

  useEffect(() => {
    setBundleQuantity(1);
    setAddedBanner(false);
    setJustAdded(false);
    setHighlightSummary(false);
  }, [id]);

  const selectedTier =
    product?.pricingTiers.find((t) => t.id === selectedTierId) ??
    product?.pricingTiers[0] ??
    null;

  const internalPackQuantity = selectedTier
    ? calculateInternalUnits(selectedTier.units_per_bundle, bundleQuantity)
    : 0;

  const lineTotalFils = selectedTier
    ? calculateLineTotal(selectedTier.price_fils, bundleQuantity)
    : 0;

  const handleAddToCart = () => {
    if (isAddingRef.current) return;

    if (!product || !selectedTier) {
      showError({
        dedupeKey: 'cart-err:missing-tier',
        title: 'Unable to add item',
        message: 'Please select a valid pricing tier before adding to cart.',
      });
      return;
    }

    if (!Number.isInteger(bundleQuantity) || bundleQuantity < 1) {
      showError({
        dedupeKey: 'cart-err:invalid-qty',
        title: 'Invalid quantity',
        message: 'Please select a bundle quantity of at least 1.',
      });
      return;
    }

    isAddingRef.current = true;
    setIsAdding(true);

    const productSnapshot = product;
    const tierSnapshot = selectedTier;
    const qtySnapshot = bundleQuantity;
    const packsSnapshot = calculateInternalUnits(tierSnapshot.units_per_bundle, qtySnapshot);
    const totalFilsSnapshot = calculateLineTotal(tierSnapshot.price_fils, qtySnapshot);

    processTimerRef.current = window.setTimeout(() => {
      try {
        const result = addItem({
          product: productSnapshot,
          tier: tierSnapshot,
          quantity: qtySnapshot,
        });

        if (!result.ok) {
          setJustAdded(false);
          setAddedBanner(false);
          showError({
            dedupeKey: `cart-err:${productSnapshot.id}`,
            title: 'Unable to add item',
            message: result.error,
          });
          return;
        }

        setJustAdded(true);
        setAddedBanner(true);
        setHighlightSummary(true);

        showCartSuccess({
          dedupeKey: `cart:${productSnapshot.id}:${tierSnapshot.id}`,
          title: result.merged ? 'Cart updated' : 'Added to cart',
          cartDetails: {
            productName: productSnapshot.name,
            productImage: productSnapshot.image_url,
            tierLabel: formatBundlePackHyphenLabel(tierSnapshot.units_per_bundle),
            bundleQuantity: qtySnapshot,
            internalPackLabel: formatBundlePackLabel(packsSnapshot),
            priceKwdLabel: formatKwdFromFils(totalFilsSnapshot),
            mergedNote: result.merged
              ? `Now ${result.item.bundleQuantity} bundles in cart`
              : undefined,
          },
        });

        if (buttonTimerRef.current !== null) window.clearTimeout(buttonTimerRef.current);
        buttonTimerRef.current = window.setTimeout(() => {
          setJustAdded(false);
        }, 1800);

        if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = window.setTimeout(() => {
          setHighlightSummary(false);
        }, 800);
      } catch {
        setJustAdded(false);
        setAddedBanner(false);
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Breadcrumb & Back Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/"
          className="inline-flex min-h-[36px] items-center gap-1.5 font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to store</span>
        </Link>

        {product && (
          <>
            <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <span className="text-slate-500">
              {product.category?.name ?? 'Uncategorized'}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
            <span className="truncate font-medium text-slate-900">{product.name}</span>
          </>
        )}
      </nav>

      {loading ? (
        <LoadingState variant="detail" label="Loading product specifications..." />
      ) : error ? (
        <ErrorState
          title="Unable to load product details"
          message={error}
          onRetry={() => void refetch()}
        />
      ) : notFound || !product ? (
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" aria-hidden="true" />}
          title="Product not found"
          description="The requested medical supply item does not exist or may have been removed from the catalog."
          action={
            <Link to="/" className="btn-primary">
              Return to catalog
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          {/* Left: Product Image */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="surface-card overflow-hidden">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                containerClassName="aspect-[4/3] w-full overflow-hidden bg-slate-50"
              />
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="surface-card p-6 sm:p-8 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
              <span className="text-slate-700">{product.brand?.name ?? 'Unassigned brand'}</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>{product.category?.name ?? 'Uncategorized'}</span>
            </div>

            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[32px] sm:leading-tight">
              {product.name}
            </h1>

            <p className="mt-3.5 text-[15px] leading-relaxed text-slate-600 sm:text-base">
              {product.description}
            </p>

            {/* Pricing Tiers */}
            <div className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-semibold text-slate-900 sm:text-base">
                  Select Bundle Pricing Tier
                </h2>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {product.pricingTiers.length}{' '}
                  {product.pricingTiers.length === 1 ? 'option' : 'options'} available
                </span>
              </div>

              <PricingTierSelector
                tiers={product.pricingTiers}
                selectedTierId={selectedTier?.id ?? null}
                onSelect={(tier) => {
                  setSelectedTierId(tier.id);
                  setAddedBanner(false);
                  setJustAdded(false);
                }}
                variant="detailed"
                groupLabel={`Pricing tiers for ${product.name}`}
              />
            </div>

            {/* Bundle Quantity & Structured Calculation Summary */}
            {selectedTier ? (
              <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">
                      Bundle Quantity
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatBundlePackLabel(selectedTier.units_per_bundle)} per bundle
                    </span>
                  </div>

                  <QuantitySelector
                    value={bundleQuantity}
                    onChange={(nextQty) => {
                      setBundleQuantity(nextQty);
                      setAddedBanner(false);
                      setJustAdded(false);
                    }}
                    label="Bundle quantity"
                  />
                </div>

                {/* Structured Calculation Summary */}
                <div
                  className={`rounded-xl border p-4 transition-colors duration-200 sm:p-5 ${
                    highlightSummary
                      ? 'border-teal-600/50 bg-teal-50/50'
                      : 'border-slate-200 bg-slate-50/90'
                  }`}
                >
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Selected offer</dt>
                      <dd className="font-semibold text-slate-900">
                        {formatBundlePackLabel(selectedTier.units_per_bundle)} per bundle
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Bundle price</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {formatKwdFromFils(selectedTier.price_fils)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Bundle quantity</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {formatBundleCountLabel(bundleQuantity)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-600">Internal pack quantity</dt>
                      <dd className="font-semibold tabular-nums text-slate-900">
                        {formatBundlePackLabel(internalPackQuantity)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 border-t border-slate-200 pt-3">
                      <dt className="font-display text-base font-bold text-slate-900">
                        Line total
                      </dt>
                      <dd className="font-display text-2xl font-bold tabular-nums text-teal-800">
                        {formatKwdFromFils(lineTotalFils)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <button
                  type="button"
                  aria-busy={isAdding}
                  onClick={handleAddToCart}
                  className={`btn-primary min-h-[48px] w-full text-sm transition-[background-color,transform,opacity] duration-200 sm:text-base ${
                    justAdded ? 'bg-teal-800 hover:bg-teal-800' : ''
                  }`}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Adding to cart...</span>
                    </>
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4 animate-check-pop" aria-hidden="true" />
                      <span>Added to cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      <span>
                        Add {formatBundleCountLabel(bundleQuantity)} to cart —{' '}
                        {formatKwdFromFils(lineTotalFils)}
                      </span>
                    </>
                  )}
                </button>

                {addedBanner && (
                  <div
                    role="status"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950"
                  >
                    <span className="inline-flex items-center gap-2 font-medium">
                      <Check className="h-4 w-4 text-teal-700" aria-hidden="true" />
                      <span>
                        Added {formatBundleCountLabel(bundleQuantity)} (
                        {formatBundlePackLabel(internalPackQuantity)}) to cart.
                      </span>
                    </span>
                    <Link
                      to="/cart"
                      className="font-semibold text-teal-800 underline underline-offset-2 hover:text-teal-950"
                    >
                      View cart
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  disabled
                  className="btn-primary min-h-[48px] w-full"
                >
                  Unavailable — no pricing tiers configured
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
