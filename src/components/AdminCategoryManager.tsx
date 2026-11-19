import { useState, type FormEvent } from 'react';
import { Check, FolderTree, Pencil, Plus, Trash2, X } from 'lucide-react';
import { createCategory, deleteCategory, updateCategory } from '../services/catalogService';
import type { Category, Product } from '../types/catalog';
import { validateNamedEntity } from '../utils/validation';
import { AdminTable } from './AdminTable';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';

interface AdminCategoryManagerProps {
  categories: Category[];
  products: Product[];
  onRefresh: () => Promise<void>;
  onFeedback: (feedback: { type: 'success' | 'error'; message: string }) => void;
}

export function AdminCategoryManager({
  categories,
  products,
  onRefresh,
  onFeedback,
}: AdminCategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const productCountByCategory = new Map<string, number>();
  for (const product of products) {
    productCountByCategory.set(
      product.category_id,
      (productCountByCategory.get(product.category_id) ?? 0) + 1
    );
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateNamedEntity(newName, 'Category');
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreateError(null);
    setIsCreating(true);
    try {
      const created = await createCategory(newName);
      setNewName('');
      await onRefresh();
      onFeedback({ type: 'success', message: `Category "${created.name}" created.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create category.';
      setCreateError(msg);
      onFeedback({ type: 'error', message: msg });
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditError(null);
  };

  const handleUpdate = async (id: string) => {
    const validationError = validateNamedEntity(editingName, 'Category');
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditError(null);
    setIsUpdating(true);
    try {
      const updated = await updateCategory(id, editingName);
      setEditingId(null);
      await onRefresh();
      onFeedback({ type: 'success', message: `Category renamed to "${updated.name}".` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update category.';
      setEditError(msg);
      onFeedback({ type: 'error', message: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteCategory(deletingCategory.id);
      const removedName = deletingCategory.name;
      setDeletingCategory(null);
      await onRefresh();
      onFeedback({ type: 'success', message: `Category "${removedName}" deleted.` });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'This category cannot be deleted because it is assigned to one or more products.';
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
        <h3 className="font-display text-base font-bold text-slate-900">Add Category</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-category-name" className="block text-xs font-medium text-slate-700">
              Category name <span className="text-red-600">*</span>
            </label>
            <input
              id="new-category-name"
              type="text"
              disabled={isCreating}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (createError) setCreateError(null);
              }}
              placeholder="Enter new medical supply category..."
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
            <span>{isCreating ? 'Adding...' : 'Add category'}</span>
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-6 w-6" aria-hidden="true" />}
          title="No categories configured"
          description="Create your first supply category above before adding products to the catalog."
        />
      ) : (
        <AdminTable
          items={categories}
          getRowKey={(c) => c.id}
          caption="Categories list"
          columns={[
            {
              key: 'name',
              header: 'Category Name',
              render: (category) =>
                editingId === category.id ? (
                  <div className="space-y-1">
                    <label htmlFor={`edit-category-${category.id}`} className="sr-only">
                      Edit category name
                    </label>
                    <input
                      id={`edit-category-${category.id}`}
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
                  <span className="font-medium text-slate-900">{category.name}</span>
                ),
            },
            {
              key: 'products',
              header: 'Assigned Products',
              align: 'right',
              render: (category) => (
                <span className="text-sm font-medium tabular-nums text-slate-600">
                  {productCountByCategory.get(category.id) ?? 0}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (category) =>
                editingId === category.id ? (
                  <div className="inline-flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(category.id)}
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
                      onClick={() => startEdit(category)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeletingCategory(category);
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
        isOpen={Boolean(deletingCategory)}
        title="Delete Category"
        description={
          deletingCategory
            ? `Are you sure you want to delete "${deletingCategory.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete category"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingCategory(null);
            setDeleteError(null);
          }
        }}
      />
    </div>
  );
}
