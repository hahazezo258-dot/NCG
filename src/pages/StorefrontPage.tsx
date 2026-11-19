import { useMemo, useState } from 'react';
import { ArrowDown, SearchX } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBar } from '../components/FilterBar';
import { LoadingState } from '../components/LoadingState';
import { ProductGrid } from '../components/ProductGrid';
import { useCatalog } from '../hooks/useCatalog';

export function StorefrontPage() {
  const { products, brands, categories, loading, error, refetch } = useCatalog();
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedBrandId && product.brand_id !== selectedBrandId) {
        return false;
      }
      if (selectedCategoryId && product.category_id !== selectedCategoryId) {
        return false;
      }
      return true;
    });
  }, [products, selectedBrandId, selectedCategoryId]);

  const handleClearFilters = () => {
    setSelectedBrandId('');
    setSelectedCategoryId('');
  };

  return (
    <div>
      {/* Compact Clinical Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50/70 to-teal-50/35">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-teal-800 uppercase">
              Clinical Procurement Store
            </p>
            <h1 className="mt-2.5 max-w-xl font-display text-[clamp(1.75rem,3vw,2.625rem)] font-bold leading-[1.15] tracking-tight text-slate-900 [text-wrap:balance]">
              Trusted medical supplies with clear bundle pricing.
            </h1>
            <p className="mt-3.5 max-w-lg text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Browse certified clinical consumables, diagnostic devices, and sterile care organized
              by brand and category—with exact pack counts and transparent KWD bundle rates.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href="#catalog" className="btn-primary min-h-[44px] px-5">
                <span>Browse Products</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/80 pt-4 text-xs font-medium text-slate-500">
              <span>Verified KWD bundle rates</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Dynamic pack tiers</span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Real-time catalog inventory</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-xs">
              <img
                src="/src/assets/images/hero_medical_supplies_1795061372913.jpg"
                alt="Sterile medical gloves, digital thermometer, gauze packs, and diagnostic equipment arranged on a clean clinical counter"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover aspect-[4/3] lg:max-h-[340px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filters Section */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            Medical Supply Catalog
          </h2>
          <p className="text-sm text-slate-600 sm:text-[15px]">
            Choose a bundle tier directly on any product card or open product details for pack-level
            calculations.
          </p>
        </div>

        {loading ? (
          <LoadingState variant="grid" label="Loading medical products, brands, and categories..." />
        ) : error ? (
          <ErrorState
            title="Unable to load medical catalog"
            message={error}
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="space-y-6">
            <FilterBar
              brands={brands}
              categories={categories}
              selectedBrandId={selectedBrandId}
              selectedCategoryId={selectedCategoryId}
              onBrandChange={setSelectedBrandId}
              onCategoryChange={setSelectedCategoryId}
              onClearFilters={handleClearFilters}
              resultCount={filteredProducts.length}
              totalCount={products.length}
            />

            {products.length === 0 ? (
              <EmptyState
                title="No products in catalog"
                description="The medical catalog currently has no products. Add products in the Admin Dashboard to display them here."
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
                title="No matching products found"
                description="No medical supplies match the currently selected brand and category filters."
                action={
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="btn-primary"
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
