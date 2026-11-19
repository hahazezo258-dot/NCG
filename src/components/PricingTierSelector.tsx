import { Check } from 'lucide-react';
import type { PricingTier } from '../types/catalog';
import {
  formatBundlePackHyphenLabel,
  formatBundlePackLabel,
  formatKwdFromFils,
} from '../utils/pricing';

interface PricingTierSelectorProps {
  tiers: PricingTier[];
  selectedTierId: string | null;
  onSelect: (tier: PricingTier) => void;
  variant?: 'compact' | 'detailed';
  groupLabel?: string;
}

export function PricingTierSelector({
  tiers,
  selectedTierId,
  onSelect,
  variant = 'compact',
  groupLabel = 'Available bundle pricing tiers',
}: PricingTierSelectorProps) {
  if (tiers.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-3.5 py-3 text-xs font-medium text-amber-950">
        Pricing unavailable — no bundle tiers configured for this item.
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label={groupLabel} className="space-y-2">
      {tiers.map((tier) => {
        const isSelected = tier.id === selectedTierId;

        if (variant === 'compact') {
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(tier)}
              className={`flex min-h-[46px] w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                isSelected
                  ? 'border-teal-700 bg-teal-50/70 text-slate-900 ring-1 ring-teal-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isSelected
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {formatBundlePackLabel(tier.units_per_bundle)}
                  </span>
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-sm font-bold tabular-nums text-teal-800">
                  {formatKwdFromFils(tier.price_fils)}
                </span>
                <span className="block text-[11px] font-medium text-slate-500">per bundle</span>
              </span>
            </button>
          );
        }

        return (
          <button
            key={tier.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(tier)}
            className={`flex min-h-[66px] w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              isSelected
                ? 'border-teal-700 bg-teal-50/70 text-slate-900 ring-1 ring-teal-700'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold text-slate-900 sm:text-base">
                    {formatBundlePackHyphenLabel(tier.units_per_bundle)}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-semibold text-teal-800">Selected</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {formatBundlePackLabel(tier.units_per_bundle)} per bundle
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                {formatKwdFromFils(tier.price_fils)}
              </div>
              <div className="text-xs font-medium text-slate-500">per bundle</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
