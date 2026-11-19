import { useCallback, useEffect, useState } from 'react';
import { fetchProductById } from '../services/catalogService';
import type { Product } from '../types/catalog';

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => Promise<void>;
}

export function useProduct(productId: string | undefined): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await fetchProductById(productId);
      if (!data) {
        setProduct(null);
        setNotFound(true);
      } else {
        setProduct(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load product details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    notFound,
    refetch: loadProduct,
  };
}
