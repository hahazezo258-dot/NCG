export interface Brand {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: string;
  product_id: string;
  units_per_bundle: number;
  price_fils: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  brand_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  brand?: Brand | null;
  category?: Category | null;
  pricingTiers: PricingTier[];
}

export interface CartItem {
  cartKey: string;
  productId: string;
  pricingTierId: string;
  productName: string;
  productImage: string | null;
  unitsPerBundle: number;
  priceFils: number;
  bundleQuantity: number;
}

export interface PricingTierInput {
  id?: string;
  unitsPerBundle: number;
  priceFils: number;
}

export interface ProductUpsertInput {
  name: string;
  description: string;
  image_url: string;
  brand_id: string;
  category_id: string;
  pricingTiers: PricingTierInput[];
}
