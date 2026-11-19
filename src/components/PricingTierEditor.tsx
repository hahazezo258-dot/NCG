import { Plus, Trash2 } from 'lucide-react';
import { parseKwdToFils } from '../utils/pricing';
import type { EditablePricingTierRow, TierValidationErrors } from '../utils/validation';

interface PricingTierEditorProps {
  tiers: EditablePricingTierRow[];
  onChange: (nextTiers: EditablePricingTierRow[]) => void;
  generalError?: string;
  rowErrors: Record<string, TierValidationErrors>;
  disabled?: boolean;
}

export function createEmptyTierRow(): EditablePricingTierRow {
  const randomSuffix = Math.random().toString(36).slice(2, 9);
  return {
    clientId: `tier_${Date.now()}_${randomSuffix}`,
    unitsPerBundle: '',
    priceKwd: '',
  };
}

export function PricingTierEditor({
  tiers,
  onChange,
  generalError,
  rowErrors,
  disabled = false,
}: PricingTierEditorProps) {
  const handleAddTier = () => {
    onChange([...tiers, createEmptyTierRow()]);
  };

  const handleUpdateTier = (
    clientId: string,
    field: 'unitsPerBundle' | 'priceKwd',
    value: string
  ) => {
    onChange(
      tiers.map((row) => (row.clientId === clientId ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteTier = (clientId: string) => {
    onChange(tiers.filter((row) => row.clientId !== clientId));
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs leading-relaxed text-slate-600">
            Configure one or more bundle sizes. Prices entered in KWD are stored in integer fils
            (1 KWD = 1000 fils).
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTier}
          disabled={disabled}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-teal-700 bg-teal-50/80 px-3.5 py-1.5 text-xs font-semibold text-teal-900 whitespace-nowrap transition-colors hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add tier</span>
        </button>
      </div>

      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
        >
          {generalError}
        </div>
      )}

      {tiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm text-slate-600">No pricing tiers added yet.</p>
          <button
            type="button"
            onClick={handleAddTier}
            disabled={disabled}
            className="btn-primary mt-3 min-h-[38px] px-3.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add first pricing tier</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, index) => {
            const errors = rowErrors[tier.clientId] ?? {};
            const previewFils = parseKwdToFils(tier.priceKwd);
            const unitsInputId = `tier-units-${tier.clientId}`;
            const priceInputId = `tier-price-${tier.clientId}`;

            return (
              <div
                key={tier.clientId}
                className="rounded-xl border border-slate-200 bg-slate-50/75 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Tier {index + 1}
                    {tier.id ? '' : ' · New'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.clientId)}
                    disabled={disabled}
                    aria-label={`Delete pricing tier ${index + 1}`}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={unitsInputId}
                      className="block text-xs font-medium text-slate-700"
                    >
                      Units per bundle (packs) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={unitsInputId}
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      disabled={disabled}
                      placeholder="e.g. 4"
                      value={tier.unitsPerBundle}
                      onChange={(e) =>
                        handleUpdateTier(tier.clientId, 'unitsPerBundle', e.target.value)
                      }
                      aria-invalid={Boolean(errors.unitsPerBundle)}
                      className={`mt-1.5 tabular-nums ${
                        errors.unitsPerBundle ? 'field-input-error' : 'field-input'
                      }`}
                    />
                    {errors.unitsPerBundle && (
                      <p className="mt-1.5 text-xs text-red-700">{errors.unitsPerBundle}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={priceInputId}
                        className="block text-xs font-medium text-slate-700"
                      >
                        Bundle price (KWD) <span className="text-red-600">*</span>
                      </label>
                      {previewFils !== null && (
                        <span className="text-xs font-medium tabular-nums text-slate-500">
                          = {previewFils.toLocaleString()} fils
                        </span>
                      )}
                    </div>
                    <input
                      id={priceInputId}
                      type="number"
                      min="0.001"
                      step="0.001"
                      inputMode="decimal"
                      disabled={disabled}
                      placeholder="e.g. 19.500"
                      value={tier.priceKwd}
                      onChange={(e) =>
                        handleUpdateTier(tier.clientId, 'priceKwd', e.target.value)
                      }
                      aria-invalid={Boolean(errors.priceKwd)}
                      className={`mt-1.5 tabular-nums ${
                        errors.priceKwd ? 'field-input-error' : 'field-input'
                      }`}
                    />
                    {errors.priceKwd && (
                      <p className="mt-1.5 text-xs text-red-700">{errors.priceKwd}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
