import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { createBrand, deleteBrand, updateBrand } from '../services/catalogService';
import type { Brand, Product } from '../types/catalog';
import { validateNamedEntity } from '../utils/validation';
import { AdminTable } from './AdminTable';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

interface AdminBrandManagerProps {
  brands: Brand[];
  products: Product[];
  onRefresh: () => Promise<void>;
  onFeedback: (feedback: { type: 'success' | 'error'; message: string }) => void;
}

export function AdminBrandManager({
  brands,
  products,
  onRefresh,
  onFeedback,
}: AdminBrandManagerProps) {
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const productCountByBrand = new Map<string, number>();
  for (const product of products) {
    productCountByBrand.set(product.brand_id, (productCountByBrand.get(product.brand_id) ?? 0) + 1);
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateNamedEntity(newName, 'Brand');
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setIsCreating(true);
    try {
      const created = await createBrand(newName);
      setNewName('');
      await onRefresh();
      onFeedback({ type: 'success', message: `Brand "${created.name}" created.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create brand.';
      setCreateError(msg);
      onFeedback({ type: 'error', message: msg });
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditError(null);
  };

  const handleUpdate = async (id: string) => {
    const validationError = validateNamedEntity(editingName, 'Brand');
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setIsUpdating(true);
    try {
      const updated = await updateBrand(id, editingName);
      setEditingId(null);
      await onRefresh();
      onFeedback({ type: 'success', message: `Brand renamed to "${updated.name}".` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update brand.';
      setEditError(msg);
      onFeedback({ type: 'error', message: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBrand) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteBrand(deletingBrand.id);
      const removedName = deletingBrand.name;
      setDeletingBrand(null);
      await onRefresh();
      onFeedback({ type: 'success', message: `Brand "${removedName}" deleted.` });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'This brand cannot be deleted because it is assigned to one or more products.';
      setDeleteError(msg);
      onFeedback({ type: 'error', message: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        noValidate
        className="surface-card p-5"
      >
        <h3 className="font-display text-base font-bold text-slate-900">Add Brand</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-brand-name" className="block text-xs font-medium text-slate-700">
              Brand name <span className="text-red-600">*</span>
            </label>
            <input
              id="new-brand-name"
              type="text"
              disabled={isCreating}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (createError) setCreateError(null);
              }}
              placeholder="Enter new medical brand name..."
              aria-invalid={Boolean(createError)}
              className={`mt-1.5 ${createError ? 'field-input-error' : 'field-input'}`}
            />
            {createError && <p className="mt-1.5 text-xs text-red-700">{createError}</p>}
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="btn-primary shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{isCreating ? 'Adding...' : 'Add brand'}</span>
          </button>
        </div>
      </form>

      {brands.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-6 w-6" aria-hidden="true" />}
          title="No brands configured"
          description="Create your first medical brand above before adding products to the catalog."
        />
      ) : (
        <AdminTable
          items={brands}
          getRowKey={(b) => b.id}
          caption="Brands list"
          columns={[
            {
              key: 'name',
              header: 'Brand Name',
              render: (brand) =>
                editingId === brand.id ? (
                  <div className="space-y-1">
                    <label htmlFor={`edit-brand-${brand.id}`} className="sr-only">
                      Edit brand name
                    </label>
                    <input
                      id={`edit-brand-${brand.id}`}
                      type="text"
                      value={editingName}
                      disabled={isUpdating}
                      onChange={(e) => setEditingName(e.target.value)}
                      aria-invalid={Boolean(editError)}
                      className="min-h-[38px] w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                    />
                    {editError && <p className="text-xs text-red-700">{editError}</p>}
                  </div>
                ) : (
                  <span className="font-medium text-slate-900">{brand.name}</span>
                ),
            },
            {
              key: 'products',
              header: 'Assigned Products',
              align: 'right',
              render: (brand) => (
                <span className="text-sm font-medium tabular-nums text-slate-600">
                  {productCountByBrand.get(brand.id) ?? 0}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (brand) =>
                editingId === brand.id ? (
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(brand.id)}
                      disabled={isUpdating}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(brand)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeletingBrand(brand);
                      }}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                ),
            },
          ]}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingBrand)}
        title="Delete Brand"
        description={
          deletingBrand
            ? `Are you sure you want to delete "${deletingBrand.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete brand"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingBrand(null);
            setDeleteError(null);
          }
        }}
      />
    </div>
  );
}
