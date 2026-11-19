import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Brand, Category, Product, ProductUpsertInput } from '../types/catalog';
import { formatKwdDecimalFromFils, parseKwdToFils } from '../utils/pricing';
import {
  parsePositiveInt,
  validateProductForm,
  type EditablePricingTierRow,
  type ProductFormValidationResult,
} from '../utils/validation';
import { createEmptyTierRow, PricingTierEditor } from './PricingTierEditor';
import { ProductImage } from './ProductImage';

interface AdminProductFormProps {
  isOpen: boolean;
  editingProduct: Product | null;
  brands: Brand[];
  categories: Category[];
  isSubmitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (input: ProductUpsertInput) => Promise<void>;
}

export function AdminProductForm({
  isOpen,
  editingProduct,
  brands,
  categories,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: AdminProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tiers, setTiers] = useState<EditablePricingTierRow[]>([createEmptyTierRow()]);
  const [validation, setValidation] = useState<ProductFormValidationResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setImageUrl(editingProduct.image_url ?? '');
      setBrandId(editingProduct.brand_id);
      setCategoryId(editingProduct.category_id);
      setTiers(
        editingProduct.pricingTiers.length > 0
          ? editingProduct.pricingTiers.map((tier) => ({
              clientId: tier.id,
              id: tier.id,
              unitsPerBundle: String(tier.units_per_bundle),
              priceKwd: formatKwdDecimalFromFils(tier.price_fils),
            }))
          : [createEmptyTierRow()]
      );
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setBrandId(brands[0]?.id ?? '');
      setCategoryId(categories[0]?.id ?? '');
      setTiers([createEmptyTierRow()]);
    }
    setValidation(null);
  }, [isOpen, editingProduct, brands, categories]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateProductForm({
      name,
      description,
      imageUrl,
      brandId,
      categoryId,
      tiers,
    });
    setValidation(result);

    if (!result.isValid) {
      return;
    }

    const parsedTiers = tiers.map((row) => ({
      id: row.id,
      unitsPerBundle: parsePositiveInt(row.unitsPerBundle)!,
      priceFils: parseKwdToFils(row.priceKwd)!,
    }));

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      brand_id: brandId,
      category_id: categoryId,
      pricingTiers: parsedTiers,
    });
  };

  const errors = validation?.fieldErrors;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:py-8 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h3
              id="product-form-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Updates save directly to Supabase and appear immediately on the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close product form"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="divide-y divide-slate-200">
          {(submitError || brands.length === 0 || categories.length === 0) && (
            <div className="space-y-3 p-5 sm:px-6">
              {submitError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {submitError}
                </div>
              )}

              {(brands.length === 0 || categories.length === 0) && (
                <div
                  role="status"
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  Create at least one Brand and one Category before adding products.
                </div>
              )}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <fieldset className="space-y-4 p-5 sm:p-6">
            <legend className="font-display text-sm font-bold text-slate-900">
              01. Basic information
            </legend>

            <div>
              <label htmlFor="product-name" className="block text-xs font-medium text-slate-700 sm:text-sm">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sterile Nitrile Exam Gloves"
                aria-invalid={Boolean(errors?.name)}
                className={`mt-1.5 ${errors?.name ? 'field-input-error' : 'field-input'}`}
              />
              {errors?.name && <p className="mt-1.5 text-xs text-red-700">{errors.name}</p>}
            </div>

            <div>
              <label
                htmlFor="product-description"
                className="block text-xs font-medium text-slate-700 sm:text-sm"
              >
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="product-description"
                rows={3}
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe clinical usage, specifications, and pack contents..."
                aria-invalid={Boolean(errors?.description)}
                className={`mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                  errors?.description
                    ? 'border-red-400 focus:border-red-600 focus:ring-red-200'
                    : 'border-slate-300 focus:border-teal-700 focus:ring-teal-700/20'
                }`}
              />
              {errors?.description && (
                <p className="mt-1.5 text-xs text-red-700">{errors.description}</p>
              )}
            </div>
          </fieldset>

          {/* Section 2: Classification */}
          <fieldset className="space-y-4 p-5 sm:p-6">
            <legend className="font-display text-sm font-bold text-slate-900">
              02. Classification
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="product-brand"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Brand <span className="text-red-600">*</span>
                </label>
                <select
                  id="product-brand"
                  disabled={isSubmitting || brands.length === 0}
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  aria-invalid={Boolean(errors?.brandId)}
                  className={`mt-1.5 ${errors?.brandId ? 'field-input-error' : 'field-input'}`}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors?.brandId && (
                  <p className="mt-1.5 text-xs text-red-700">{errors.brandId}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="product-category"
                  disabled={isSubmitting || categories.length === 0}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  aria-invalid={Boolean(errors?.categoryId)}
                  className={`mt-1.5 ${errors?.categoryId ? 'field-input-error' : 'field-input'}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors?.categoryId && (
                  <p className="mt-1.5 text-xs text-red-700">{errors.categoryId}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Section 3: Product Image */}
          <fieldset className="space-y-4 p-5 sm:p-6">
            <legend className="font-display text-sm font-bold text-slate-900">
              03. Product image
            </legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-start">
              <div className="sm:col-span-2">
                <label
                  htmlFor="product-image-url"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Image URL
                </label>
                <input
                  id="product-image-url"
                  type="url"
                  disabled={isSubmitting}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/product.jpg"
                  aria-invalid={Boolean(errors?.imageUrl)}
                  className={`mt-1.5 ${errors?.imageUrl ? 'field-input-error' : 'field-input'}`}
                />
                {errors?.imageUrl ? (
                  <p className="mt-1.5 text-xs text-red-700">{errors.imageUrl}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Optional. A clean clinical fallback graphic is displayed if left blank.
                  </p>
                )}
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-700 sm:text-sm">Preview</span>
                <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <ProductImage
                    src={imageUrl}
                    alt={name || 'Product preview'}
                    containerClassName="aspect-[4/3] w-full overflow-hidden bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section 4: Pricing Tiers */}
          <fieldset className="space-y-4 p-5 sm:p-6">
            <legend className="font-display text-sm font-bold text-slate-900">
              04. Pricing tiers <span className="text-red-600">*</span>
            </legend>

            <PricingTierEditor
              tiers={tiers}
              onChange={setTiers}
              generalError={errors?.tiersGeneral}
              rowErrors={errors?.tierRows ?? {}}
              disabled={isSubmitting}
            />
          </fieldset>

          <div className="flex flex-col-reverse gap-3 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || brands.length === 0 || categories.length === 0}
              className="btn-primary px-5"
            >
              {isSubmitting
                ? 'Saving product...'
                : editingProduct
                  ? 'Save changes'
                  : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
