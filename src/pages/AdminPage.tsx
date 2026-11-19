import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FolderTree,
  Package,
  Pencil,
  Plus,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react';
import { AdminBrandManager } from '../components/AdminBrandManager';
import { AdminCategoryManager } from '../components/AdminCategoryManager';
import { AdminProductForm } from '../components/AdminProductForm';
import { AdminTable } from '../components/AdminTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { ProductImage } from '../components/ProductImage';
import { useCatalog } from '../hooks/useCatalog';
import {
  createProductWithTiers,
  deleteProduct,
  updateProductWithTiers,
} from '../services/catalogService';
import type { Product, ProductUpsertInput } from '../types/catalog';
import { formatBundlePackLabel, formatKwdFromFils } from '../utils/pricing';

type AdminTab = 'products' | 'brands' | 'categories';

interface FeedbackBanner {
  type: 'success' | 'error';
  message: string;
}

export function AdminPage() {
  const { products, brands, categories, loading, error, refetch } = useCatalog();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteProductError, setDeleteProductError] = useState<string | null>(null);

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductFormError(null);
    setIsProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormError(null);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (input: ProductUpsertInput) => {
    setProductFormError(null);
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        const updated = await updateProductWithTiers(
          editingProduct.id,
          input,
          editingProduct.pricingTiers
        );
        setIsProductFormOpen(false);
        setEditingProduct(null);
        await refetch();
        setFeedback({
          type: 'success',
          message: `Product "${updated.name}" and its pricing tiers were updated.`,
        });
      } else {
        const created = await createProductWithTiers(input);
        setIsProductFormOpen(false);
        await refetch();
        setFeedback({
          type: 'success',
          message: `Product "${created.name}" was created with ${created.pricingTiers.length} pricing ${
            created.pricingTiers.length === 1 ? 'tier' : 'tiers'
          }.`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product.';
      setProductFormError(message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleteProductError(null);
    setIsDeletingProduct(true);
    try {
      await deleteProduct(deletingProduct.id);
      const removedName = deletingProduct.name;
      setDeletingProduct(null);
      await refetch();
      setFeedback({
        type: 'success',
        message: `Product "${removedName}" was deleted.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product.';
      setDeleteProductError(message);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[32px]">
            Catalog Administration
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-[15px]">
            Manage medical products, dynamic multi-tier bundle pricing, brands, and categories in
            Supabase.
          </p>
        </div>

        {activeTab === 'products' && !loading && !error && (
          <button
            type="button"
            onClick={openCreateProduct}
            className="btn-primary shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add product</span>
          </button>
        )}
      </div>

      {/* Required Assessment Auth Notice */}
      <div
        role="note"
        className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 text-sm text-amber-950"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="font-medium leading-relaxed">
          Authentication is disabled for this assessment. Admin access must be protected before
          production use.
        </p>
      </div>

      {/* Operation Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-teal-200 bg-teal-50 text-teal-950'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
            )}
            <span>{feedback.message}</span>
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="surface-card mt-6 grid w-full grid-cols-3 p-1 sm:inline-flex sm:w-auto"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
          className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
            activeTab === 'products'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Package className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Products</span>
          <span
            className={`text-xs tabular-nums ${
              activeTab === 'products' ? 'text-teal-100' : 'text-slate-400'
            }`}
          >
            ({products.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'brands'}
          onClick={() => setActiveTab('brands')}
          className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
            activeTab === 'brands'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Tag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Brands</span>
          <span
            className={`text-xs tabular-nums ${
              activeTab === 'brands' ? 'text-teal-100' : 'text-slate-400'
            }`}
          >
            ({brands.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:gap-2 sm:px-4 sm:text-sm ${
            activeTab === 'categories'
              ? 'bg-teal-700 text-white'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FolderTree className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Categories</span>
          <span
            className={`text-xs tabular-nums ${
              activeTab === 'categories' ? 'text-teal-100' : 'text-slate-400'
            }`}
          >
            ({categories.length})
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <LoadingState variant="table" label="Loading admin catalog data..." />
        ) : error ? (
          <ErrorState
            title="Unable to load admin catalog data"
            message={error}
            onRetry={() => void refetch()}
          />
        ) : activeTab === 'products' ? (
          products.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" aria-hidden="true" />}
              title="No products in catalog"
              description="Add your first medical product with dynamic bundle pricing tiers."
              action={
                <button
                  type="button"
                  onClick={openCreateProduct}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add product</span>
                </button>
              }
            />
          ) : (
            <AdminTable
              items={products}
              getRowKey={(p) => p.id}
              caption="Products management table"
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (product) => (
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        <ProductImage
                          src={product.image_url}
                          alt={product.name}
                          containerClassName="h-full w-full overflow-hidden"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="line-clamp-1 max-w-xs text-xs text-slate-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'brand',
                  header: 'Brand',
                  render: (product) => (
                    <span className="text-sm font-medium text-slate-700">
                      {product.brand?.name ?? 'Unassigned'}
                    </span>
                  ),
                },
                {
                  key: 'category',
                  header: 'Category',
                  render: (product) => (
                    <span className="text-sm text-slate-600">
                      {product.category?.name ?? 'Uncategorized'}
                    </span>
                  ),
                },
                {
                  key: 'tiers',
                  header: 'Pricing Tiers',
                  render: (product) => (
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold tabular-nums text-slate-900">
                        {product.pricingTiers.length}{' '}
                        {product.pricingTiers.length === 1 ? 'tier' : 'tiers'}
                      </div>
                      {product.pricingTiers.length > 0 && (
                        <div className="text-xs tabular-nums text-slate-500">
                          {product.pricingTiers
                            .map(
                              (t) =>
                                `${formatBundlePackLabel(t.units_per_bundle)}: ${formatKwdFromFils(
                                  t.price_fils
                                )}`
                            )
                            .join(' · ')}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (product) => (
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProduct(product)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteProductError(null);
                          setDeletingProduct(product);
                        }}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          )
        ) : activeTab === 'brands' ? (
          <AdminBrandManager
            brands={brands}
            products={products}
            onRefresh={refetch}
            onFeedback={setFeedback}
          />
        ) : (
          <AdminCategoryManager
            categories={categories}
            products={products}
            onRefresh={refetch}
            onFeedback={setFeedback}
          />
        )}
      </div>

      {/* Create / Edit Product Modal */}
      <AdminProductForm
        isOpen={isProductFormOpen}
        editingProduct={editingProduct}
        brands={brands}
        categories={categories}
        isSubmitting={isSavingProduct}
        submitError={productFormError}
        onClose={() => {
          if (!isSavingProduct) {
            setIsProductFormOpen(false);
            setEditingProduct(null);
            setProductFormError(null);
          }
        }}
        onSubmit={handleSaveProduct}
      />

      {/* Delete Product Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title="Delete Product"
        description={
          deletingProduct
            ? `Are you sure you want to delete "${deletingProduct.name}" and all of its pricing tiers? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete product"
        isLoading={isDeletingProduct}
        error={deleteProductError}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => {
          if (!isDeletingProduct) {
            setDeletingProduct(null);
            setDeleteProductError(null);
          }
        }}
      />
    </div>
  );
}
