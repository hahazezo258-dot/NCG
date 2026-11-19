import { useCallback, useEffect, useState } from 'react';
import { fetchBrands, fetchCategories, fetchProducts } from '../services/catalogService';
import type { Brand, Category, Product } from '../types/catalog';

interface UseCatalogResult {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCatalog(): UseCatalogResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, brandsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load catalog data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return {
    products,
    brands,
    categories,
    loading,
    error,
    refetch: loadCatalog,
  };
}
