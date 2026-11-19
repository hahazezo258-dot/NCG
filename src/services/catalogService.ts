import { requireSupabase } from '../lib/supabase';
import type {
  Brand,
  Category,
  PricingTier,
  PricingTierInput,
  Product,
  ProductUpsertInput,
} from '../types/catalog';

interface RawProductRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  brand_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  brand: Brand | Brand[] | null;
  category: Category | Category[] | null;
  pricingTiers: PricingTier[] | null;
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeProduct(row: RawProductRow): Product {
  const tiers = Array.isArray(row.pricingTiers) ? [...row.pricingTiers] : [];
  tiers.sort((a, b) => a.units_per_bundle - b.units_per_bundle);

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    image_url: row.image_url ?? null,
    brand_id: row.brand_id,
    category_id: row.category_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    brand: normalizeRelation(row.brand),
    category: normalizeRelation(row.category),
    pricingTiers: tiers,
  };
}

const PRODUCT_SELECT_QUERY = `
  id,
  name,
  description,
  image_url,
  brand_id,
  category_id,
  created_at,
  updated_at,
  brand:brands (
    id,
    name,
    created_at,
    updated_at
  ),
  category:categories (
    id,
    name,
    created_at,
    updated_at
  ),
  pricingTiers:product_pricing_tiers (
    id,
    product_id,
    units_per_bundle,
    price_fils,
    created_at,
    updated_at
  )
`;

function formatSupabaseError(
  error: { code?: string; message?: string; details?: string },
  fallback: string
): Error {
  const code = error?.code ?? '';
  const msg = error?.message ?? '';
  const lower = msg.toLowerCase();

  if (
    code === '42501' ||
    lower.includes('row-level security') ||
    lower.includes('permission denied')
  ) {
    return new Error(
      'Database permission denied by Supabase RLS policy. Verify anon assessment policies for this table.'
    );
  }

  if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return new Error(
      'Unable to reach Supabase. Check your internet connection and VITE_SUPABASE_URL configuration.'
    );
  }

  if (code === '23505') {
    return new Error('A duplicate record already exists.');
  }

  if (code === '23503') {
    return new Error('This record cannot be modified or deleted because it is referenced by other data.');
  }

  if (msg) {
    return new Error(fallback);
  }

  return new Error(fallback);
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function fetchProducts(): Promise<Product[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT_QUERY)
    .order('created_at', { ascending: true });

  if (error) {
    throw formatSupabaseError(error, 'Failed to load products from Supabase.');
  }

  return ((data ?? []) as unknown as RawProductRow[]).map(normalizeProduct);
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT_QUERY)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    // Invalid UUID / identifier syntax should cleanly resolve as Product Not Found
    if (
      error.code === '22P02' ||
      error.message?.toLowerCase().includes('invalid input syntax')
    ) {
      return null;
    }
    throw formatSupabaseError(error, 'Failed to load product details from Supabase.');
  }

  if (!data) {
    return null;
  }

  return normalizeProduct(data as unknown as RawProductRow);
}

export async function fetchBrands(): Promise<Brand[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('brands')
    .select('id, name, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    throw formatSupabaseError(error, 'Failed to load brands from Supabase.');
  }

  return (data ?? []) as Brand[];
}

export async function fetchCategories(): Promise<Category[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .select('id, name, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    throw formatSupabaseError(error, 'Failed to load categories from Supabase.');
  }

  return (data ?? []) as Category[];
}

// ============================================================================
// BRAND CRUD OPERATIONS
// ============================================================================

export async function createBrand(name: string): Promise<Brand> {
  const client = requireSupabase();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Brand name is required.');
  }

  const { data: existing, error: lookupError } = await client
    .from('brands')
    .select('id, name')
    .ilike('name', trimmed);

  if (lookupError) {
    throw formatSupabaseError(lookupError, 'Failed to validate brand uniqueness.');
  }

  if ((existing ?? []).some((b) => b.name.trim().toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A brand with this name already exists.');
  }

  const { data, error } = await client
    .from('brands')
    .insert({ name: trimmed })
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A brand with this name already exists.');
    }
    throw formatSupabaseError(error, 'Failed to create brand.');
  }

  return data as Brand;
}

export async function updateBrand(id: string, name: string): Promise<Brand> {
  const client = requireSupabase();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Brand name is required.');
  }

  const { data: existing, error: lookupError } = await client
    .from('brands')
    .select('id, name')
    .ilike('name', trimmed);

  if (lookupError) {
    throw formatSupabaseError(lookupError, 'Failed to validate brand uniqueness.');
  }

  if (
    (existing ?? []).some(
      (b) => b.id !== id && b.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    throw new Error('A brand with this name already exists.');
  }

  const { data, error } = await client
    .from('brands')
    .update({ name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A brand with this name already exists.');
    }
    throw formatSupabaseError(error, 'Failed to update brand.');
  }

  return data as Brand;
}

export async function deleteBrand(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('brands').delete().eq('id', id);

  if (error) {
    if (error.code === '23503' || error.message?.toLowerCase().includes('foreign key')) {
      throw new Error('This brand cannot be deleted because it is assigned to one or more products.');
    }
    throw formatSupabaseError(error, 'Failed to delete brand.');
  }
}

// ============================================================================
// CATEGORY CRUD OPERATIONS
// ============================================================================

export async function createCategory(name: string): Promise<Category> {
  const client = requireSupabase();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name is required.');
  }

  const { data: existing, error: lookupError } = await client
    .from('categories')
    .select('id, name')
    .ilike('name', trimmed);

  if (lookupError) {
    throw formatSupabaseError(lookupError, 'Failed to validate category uniqueness.');
  }

  if ((existing ?? []).some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A category with this name already exists.');
  }

  const { data, error } = await client
    .from('categories')
    .insert({ name: trimmed })
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A category with this name already exists.');
    }
    throw formatSupabaseError(error, 'Failed to create category.');
  }

  return data as Category;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const client = requireSupabase();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name is required.');
  }

  const { data: existing, error: lookupError } = await client
    .from('categories')
    .select('id, name')
    .ilike('name', trimmed);

  if (lookupError) {
    throw formatSupabaseError(lookupError, 'Failed to validate category uniqueness.');
  }

  if (
    (existing ?? []).some(
      (c) => c.id !== id && c.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    throw new Error('A category with this name already exists.');
  }

  const { data, error } = await client
    .from('categories')
    .update({ name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A category with this name already exists.');
    }
    throw formatSupabaseError(error, 'Failed to update category.');
  }

  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('categories').delete().eq('id', id);

  if (error) {
    if (error.code === '23503' || error.message?.toLowerCase().includes('foreign key')) {
      throw new Error(
        'This category cannot be deleted because it is assigned to one or more products.'
      );
    }
    throw formatSupabaseError(error, 'Failed to delete category.');
  }
}

// ============================================================================
// PRICING TIER CRUD OPERATIONS
// ============================================================================

export async function createPricingTier(
  productId: string,
  tier: Omit<PricingTierInput, 'id'>
): Promise<PricingTier> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('product_pricing_tiers')
    .insert({
      product_id: productId,
      units_per_bundle: tier.unitsPerBundle,
      price_fils: tier.priceFils,
    })
    .select('id, product_id, units_per_bundle, price_fils, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Duplicate units per bundle are not allowed for the same product.');
    }
    throw formatSupabaseError(error, 'Failed to create pricing tier.');
  }

  return data as PricingTier;
}

export async function updatePricingTier(
  tierId: string,
  tier: Omit<PricingTierInput, 'id'>
): Promise<PricingTier> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('product_pricing_tiers')
    .update({
      units_per_bundle: tier.unitsPerBundle,
      price_fils: tier.priceFils,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tierId)
    .select('id, product_id, units_per_bundle, price_fils, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Duplicate units per bundle are not allowed for the same product.');
    }
    throw formatSupabaseError(error, 'Failed to update pricing tier.');
  }

  return data as PricingTier;
}

export async function deletePricingTier(tierId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('product_pricing_tiers').delete().eq('id', tierId);

  if (error) {
    throw formatSupabaseError(error, 'Failed to delete pricing tier.');
  }
}

// ============================================================================
// PRODUCT CRUD OPERATIONS (WITH DYNAMIC PRICING TIERS)
// ============================================================================

export async function createProductWithTiers(input: ProductUpsertInput): Promise<Product> {
  const client = requireSupabase();

  const { data: createdProduct, error: productError } = await client
    .from('products')
    .insert({
      name: input.name.trim(),
      description: input.description.trim(),
      image_url: input.image_url.trim() || null,
      brand_id: input.brand_id,
      category_id: input.category_id,
    })
    .select('id')
    .single();

  if (productError || !createdProduct) {
    throw formatSupabaseError(productError ?? {}, 'Failed to create product.');
  }

  const tierRows = input.pricingTiers.map((tier) => ({
    product_id: createdProduct.id,
    units_per_bundle: tier.unitsPerBundle,
    price_fils: tier.priceFils,
  }));

  const { error: tiersError } = await client.from('product_pricing_tiers').insert(tierRows);

  if (tiersError) {
    // Rollback created product so we never leave a half-saved record without its tiers
    await client.from('products').delete().eq('id', createdProduct.id);
    if (tiersError.code === '23505') {
      throw new Error('Duplicate units per bundle are not allowed for the same product.');
    }
    throw formatSupabaseError(tiersError, 'Failed to save pricing tiers for the new product.');
  }

  const hydrated = await fetchProductById(createdProduct.id);
  if (!hydrated) {
    throw new Error('Product was created, but could not be reloaded.');
  }
  return hydrated;
}

export async function updateProductWithTiers(
  productId: string,
  input: ProductUpsertInput,
  originalTiers: PricingTier[]
): Promise<Product> {
  const client = requireSupabase();

  const { error: productError } = await client
    .from('products')
    .update({
      name: input.name.trim(),
      description: input.description.trim(),
      image_url: input.image_url.trim() || null,
      brand_id: input.brand_id,
      category_id: input.category_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (productError) {
    throw formatSupabaseError(productError, 'Failed to update product details.');
  }

  const incomingIds = new Set(
    input.pricingTiers.map((t) => t.id).filter((id): id is string => Boolean(id))
  );
  const removedIds = originalTiers.filter((t) => !incomingIds.has(t.id)).map((t) => t.id);

  // 1. Delete removed tiers first so their units_per_bundle values are freed
  if (removedIds.length > 0) {
    const { error: deleteError } = await client
      .from('product_pricing_tiers')
      .delete()
      .in('id', removedIds);

    if (deleteError) {
      throw formatSupabaseError(deleteError, 'Failed to delete removed pricing tiers.');
    }
  }

  // 2. Update existing tiers (ordered safely to avoid transient unique collisions)
  const originalMap = new Map(originalTiers.map((t) => [t.id, t]));
  const tiersToUpdate = input.pricingTiers.filter((t): t is PricingTierInput & { id: string } =>
    Boolean(t.id)
  );

  const activeUnits = new Set(
    originalTiers.filter((t) => incomingIds.has(t.id)).map((t) => t.units_per_bundle)
  );

  const pendingUpdates = [...tiersToUpdate];
  const swappedRows: Array<PricingTierInput & { id: string }> = [];

  while (pendingUpdates.length > 0) {
    let progressed = false;

    for (let i = pendingUpdates.length - 1; i >= 0; i -= 1) {
      const candidate = pendingUpdates[i];
      const orig = originalMap.get(candidate.id);
      const isSameUnits = orig && orig.units_per_bundle === candidate.unitsPerBundle;

      if (isSameUnits || !activeUnits.has(candidate.unitsPerBundle)) {
        await updatePricingTier(candidate.id, {
          unitsPerBundle: candidate.unitsPerBundle,
          priceFils: candidate.priceFils,
        });
        if (orig) {
          activeUnits.delete(orig.units_per_bundle);
        }
        activeUnits.add(candidate.unitsPerBundle);
        pendingUpdates.splice(i, 1);
        progressed = true;
      }
    }

    if (!progressed) {
      // Remaining updates form a permutation cycle (e.g. swapping units between two rows).
      // Delete and re-insert those cycle rows cleanly to avoid unique constraint collision.
      swappedRows.push(...pendingUpdates);
      break;
    }
  }

  if (swappedRows.length > 0) {
    const swapIds = swappedRows.map((r) => r.id);
    const { error: swapDeleteError } = await client
      .from('product_pricing_tiers')
      .delete()
      .in('id', swapIds);

    if (swapDeleteError) {
      throw formatSupabaseError(swapDeleteError, 'Failed to update swapped pricing tiers.');
    }

    const { error: swapInsertError } = await client.from('product_pricing_tiers').insert(
      swappedRows.map((t) => ({
        product_id: productId,
        units_per_bundle: t.unitsPerBundle,
        price_fils: t.priceFils,
      }))
    );

    if (swapInsertError) {
      throw formatSupabaseError(swapInsertError, 'Failed to save swapped pricing tiers.');
    }
  }

  // 3. Insert newly added tiers
  const newTiers = input.pricingTiers.filter((t) => !t.id);
  if (newTiers.length > 0) {
    const { error: insertError } = await client.from('product_pricing_tiers').insert(
      newTiers.map((t) => ({
        product_id: productId,
        units_per_bundle: t.unitsPerBundle,
        price_fils: t.priceFils,
      }))
    );

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('Duplicate units per bundle are not allowed for the same product.');
      }
      throw formatSupabaseError(insertError, 'Failed to insert new pricing tiers.');
    }
  }

  const hydrated = await fetchProductById(productId);
  if (!hydrated) {
    throw new Error('Product was updated, but could not be reloaded.');
  }
  return hydrated;
}

export async function deleteProduct(productId: string): Promise<void> {
  const client = requireSupabase();

  // Delete child pricing tiers explicitly first so deletion succeeds regardless of FK cascade rules
  const { error: tiersError } = await client
    .from('product_pricing_tiers')
    .delete()
    .eq('product_id', productId);

  if (tiersError) {
    throw formatSupabaseError(tiersError, 'Failed to delete product pricing tiers.');
  }

  const { error: productError } = await client.from('products').delete().eq('id', productId);

  if (productError) {
    throw formatSupabaseError(productError, 'Failed to delete product.');
  }
}
