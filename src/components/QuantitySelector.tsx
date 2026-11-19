import { useEffect, useState, type ChangeEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { parsePositiveInt } from '../utils/validation';

interface QuantitySelectorProps {
  value: number;
  onChange: (nextQuantity: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 9999,
  label = 'Bundle quantity',
  size = 'md',
}: QuantitySelectorProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const handleDecrement = () => {
    const next = value - 1;
    if (next >= min) {
      onChange(next);
    }
  };

  const handleIncrement = () => {
    const next = value + 1;
    if (next <= max) {
      onChange(next);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (raw === '') {
      setDraft('');
      return;
    }

    if (!/^\d+$/.test(raw)) {
      return;
    }

    const parsed = parsePositiveInt(raw);
    if (parsed === null) {
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    setDraft(String(clamped));
    onChange(clamped);
  };

  const handleBlur = () => {
    const parsed = parsePositiveInt(draft);
    if (parsed === null || parsed < min) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    setDraft(String(clamped));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const heightClass = size === 'sm' ? 'h-10' : 'h-11';
  const btnWidthClass = size === 'sm' ? 'w-10' : 'w-11';

  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={`flex ${heightClass} ${btnWidthClass} items-center justify-center rounded-l-lg border-r border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={label}
        value={draft}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`${heightClass} w-14 bg-white px-2 text-center text-sm font-semibold tabular-nums text-slate-900 focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={`flex ${heightClass} ${btnWidthClass} items-center justify-center rounded-r-lg border-l border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
