import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../types/catalog';
import {
  calculateInternalUnits,
  calculateLineTotal,
  formatBundlePackLabel,
  formatKwdFromFils,
} from '../utils/pricing';
import { ProductImage } from './ProductImage';
import { QuantitySelector } from './QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (cartKey: string, nextQuantity: number) => void;
  onRemove: (cartKey: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const internalPacks = calculateInternalUnits(item.unitsPerBundle, item.bundleQuantity);
  const lineTotalFils = calculateLineTotal(item.priceFils, item.bundleQuantity);

  return (
    <article className="surface-card flex flex-col gap-5 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start min-w-0 flex-1">
        <Link
          to={`/products/${item.productId}`}
          className="block w-full shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 sm:w-32"
        >
          <ProductImage
            src={item.productImage}
            alt={item.productName}
            containerClassName="aspect-[4/3] w-full overflow-hidden bg-slate-50"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/products/${item.productId}`}
            className="font-display text-lg font-semibold text-slate-900 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {item.productName}
          </Link>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 sm:text-sm">
            <span>
              Selected offer:{' '}
              <strong className="font-semibold text-slate-900">
                {formatBundlePackLabel(item.unitsPerBundle)} per bundle
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span>
              Bundle price:{' '}
              <strong className="font-semibold tabular-nums text-slate-900">
                {formatKwdFromFils(item.priceFils)}
              </strong>
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Bundle quantity
              </span>
              <QuantitySelector
                value={item.bundleQuantity}
                onChange={(nextQty) => onQuantityChange(item.cartKey, nextQty)}
                size="sm"
                label={`Bundle quantity for ${item.productName} (${formatBundlePackLabel(item.unitsPerBundle)})`}
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2">
              <span className="block text-xs font-medium text-slate-500">
                Internal pack quantity
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {formatBundlePackLabel(internalPacks)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-col sm:items-end sm:justify-between sm:self-stretch sm:border-t-0 sm:pt-0">
        <div className="sm:text-right">
          <span className="block text-xs font-medium text-slate-500">Line total</span>
          <span className="font-display text-xl font-bold tabular-nums text-slate-900">
            {formatKwdFromFils(lineTotalFils)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.cartKey)}
          aria-label={`Remove ${item.productName} (${formatBundlePackLabel(item.unitsPerBundle)}) from cart`}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Remove</span>
        </button>
      </div>
    </article>
  );
}
