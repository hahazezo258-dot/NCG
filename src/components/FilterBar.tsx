import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { Brand, Category } from '../types/catalog';

interface FilterBarProps {
  brands: Brand[];
  categories: Category[];
  selectedBrandId: string;
  selectedCategoryId: string;
  onBrandChange: (brandId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  brands,
  categories,
  selectedBrandId,
  selectedCategoryId,
  onBrandChange,
  onCategoryChange,
  onClearFilters,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const activeBrand = brands.find((b) => b.id === selectedBrandId) ?? null;
  const activeCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;
  const hasActiveFilters = Boolean(selectedBrandId || selectedCategoryId);

  return (
    <section
      aria-label="Catalog filters"
      className="surface-card p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
          <div>
            <label
              htmlFor="filter-brand"
              className="block text-xs font-medium text-slate-700 sm:text-sm"
            >
              Brand
            </label>
            <select
              id="filter-brand"
              value={selectedBrandId}
              onChange={(e) => onBrandChange(e.target.value)}
              className="field-input mt-1.5"
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-category"
              className="block text-xs font-medium text-slate-700 sm:text-sm"
            >
              Category
            </label>
            <select
              id="filter-category"
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="field-input mt-1.5"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 lg:justify-end">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600 tabular-nums">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span>
              Showing <strong className="font-semibold text-slate-900">{resultCount}</strong> of{' '}
              <strong className="font-semibold text-slate-900">{totalCount}</strong>{' '}
              {totalCount === 1 ? 'product' : 'products'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-3.5 text-xs">
          <span className="font-medium text-slate-500">Active filters:</span>

          {activeBrand && (
            <button
              type="button"
              onClick={() => onBrandChange('')}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 font-medium text-teal-900 transition-colors hover:bg-teal-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <span>Brand: {activeBrand.name}</span>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {activeCategory && (
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 font-medium text-teal-900 transition-colors hover:bg-teal-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <span>Category: {activeCategory.name}</span>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
