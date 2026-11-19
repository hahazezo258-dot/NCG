import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from '../components/CartItem';
import { EmptyState } from '../components/EmptyState';
import { selectCartSummary, useCartStore } from '../store/cartStore';
import { formatBundlePackLabel, formatKwdFromFils } from '../utils/pricing';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const { lineCount, totalBundles, totalPacks, subtotalFils, grandTotalFils } =
    selectCartSummary(items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/"
            className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Continue shopping</span>
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[32px]">
            Shopping Cart
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" aria-hidden="true" />}
          title="Your shopping cart is empty"
          description="Browse the medical supplies catalog and select bundle tiers to add items to your cart."
          action={
            <Link to="/" className="btn-primary">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Cart Line Items */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <CartItem
                key={item.cartKey}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Sticky Summary Panel */}
          <aside
            aria-label="Cart summary"
            className="surface-card p-6 lg:col-span-4 lg:sticky lg:top-24"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">Cart Summary</h2>

            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Distinct tier lines</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{lineCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Total bundles</dt>
                <dd className="font-semibold tabular-nums text-slate-900">{totalBundles}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Total packs</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatBundlePackLabel(totalPacks)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-semibold tabular-nums text-slate-900">
                  {formatKwdFromFils(subtotalFils)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-2 border-t border-slate-200 pt-3.5">
                <dt className="font-display text-base font-bold text-slate-900">Grand total</dt>
                <dd className="font-display text-2xl font-bold tabular-nums text-teal-800">
                  {formatKwdFromFils(grandTotalFils)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <Link to="/" className="btn-secondary w-full">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
