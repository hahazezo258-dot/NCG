# Medical E-Commerce – Multi-Tier Bundle Pricing

A React, TypeScript, Tailwind CSS, and Supabase medical supplies storefront and catalog administration application featuring dynamic multi-tier bundle pricing in Kuwaiti Dinars (KWD / integer fils).

## Overview

This application combines two complete experiences inside one responsive web app:

1. **Customer Storefront (`/`, `/products/:id`, `/cart`)**: Browse clinical supplies loaded live from Supabase, filter by brand and category, inspect dynamic bundle tiers, calculate internal pack quantities, and manage a tier-aware shopping cart.
2. **Admin Dashboard (`/admin`)**: Create, edit, and delete products, dynamic pricing tiers, brands, and categories directly in Supabase with immediate catalog refresh and persistence.

## Features

- **Live Supabase Catalog**: All products, brands, categories, and `product_pricing_tiers` are queried from and persisted to Supabase (no mock catalog data or localStorage fallback).
- **Dynamic Multi-Tier Pricing**: Supports 1, 2, 3, or any number of bundle tiers per product without hardcoded tier slots.
- **Integer-Fils Monetary Accuracy**: All prices are stored and calculated in integer fils (`1 KWD = 1000 fils`) and formatted to exactly 3 decimal places (e.g., `5.500 KWD`, `19.500 KWD`, `39.000 KWD`).
- **Tier-Keyed Shopping Cart**: Powered by Zustand (`cartKey = product_id + pricing_tier_id`). Adding the same product and tier increments quantity; adding the same product with a different tier creates a separate cart line.
- **Full Admin CRUD**:
  - Product creation, editing, and deletion with dynamic tier add/edit/delete.
  - Brand and Category CRUD with duplicate validation and foreign-key deletion protection messages.
- **Complete UI States**: Skeleton loading states, retryable error states, empty catalog/filter/cart states, and accessible confirmation dialogs.

## Routes

- `/` — Customer Storefront (hero, dynamic brand & category filters, multi-tier product grid)
- `/products/:id` — Product Details Page (tier selection, positive-integer bundle quantity selector, live internal pack & line total calculation)
- `/cart` — Shopping Cart (line-level quantity controls, internal pack counts, subtotal & grand total)
- `/admin` — Admin Dashboard (Products, Brands, and Categories management)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router (`react-router-dom`)
- Zustand (`zustand`)
- Supabase JavaScript Client (`@supabase/supabase-js`)
- Lucide Icons (`lucide-react`)

## Supabase Schema

The application expects the following existing Supabase tables and columns:

- `brands`: `id`, `name`, `created_at`, `updated_at`
- `categories`: `id`, `name`, `created_at`, `updated_at`
- `products`: `id`, `name`, `description`, `image_url`, `brand_id` (FK → `brands.id`), `category_id` (FK → `categories.id`), `created_at`, `updated_at`
- `product_pricing_tiers`: `id`, `product_id` (FK → `products.id`), `units_per_bundle`, `price_fils`, `created_at`, `updated_at`

## Environment Variables

Configure these public client environment variables in `.env` (see `.env.example`):

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
```

> **Security**: Never expose or configure a Supabase `service_role` key in frontend code or `VITE_*` variables.

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Type-check:
   ```bash
   npm run lint
   ```

## Bundle Pricing Model & Calculations

- **Units per bundle (`units_per_bundle`)**: How many individual packs are contained inside one purchasable bundle (e.g., `4` packs per bundle).
- **Bundle price (`price_fils`)**: The total price for one complete bundle in integer fils (e.g., `19500` fils = `19.500 KWD`), **not** the price per individual pack.
- **Bundle quantity (`bundleQuantity`)**: How many bundles the customer is purchasing (positive integer `>= 1`).
- **Internal pack quantity**:
  ```text
  internal_pack_quantity = units_per_bundle × bundle_quantity
  ```
- **Line total**:
  ```text
  line_total_fils = price_fils × bundle_quantity
  ```

### Example
- Selected tier: `4 packs` at `19.500 KWD` (`19500` fils)
- Bundle quantity: `2`
- Internal pack quantity: `4 × 2 = 8 packs`
- Line total: `19500 × 2 = 39000` fils → `39.000 KWD`

## Testing Checklist

- [ ] Storefront loads products, brands, and categories from Supabase
- [ ] Products with 1, 2, and 3+ pricing tiers render all tiers dynamically
- [ ] Brand and category filters narrow results and Clear Filters resets them
- [ ] Product Details Page calculates `internal_pack_quantity` and `line_total` accurately
- [ ] Quantity selector rejects `0`, negative numbers, decimals, and `NaN`
- [ ] Cart combines identical `product_id + pricing_tier_id` and separates different tiers for the same product
- [ ] Admin can create, edit, and delete products and dynamic pricing tiers
- [ ] Admin can create, edit, and delete brands and categories, showing friendly messages on duplicate names or assigned-product FK conflicts
- [ ] Admin mutations persist across full browser refresh and update storefront immediately

## Known Limitations & Authentication Note

- **Authentication Limitation**: Authentication is intentionally disabled for this technical assessment so `/admin` can be evaluated directly without login flows. **Admin access (`/admin`) and Supabase Row Level Security (RLS) write policies must be protected with proper authentication and role-based authorization before production use.**
- Checkout, payment processing, delivery tracking, order history, and stock/inventory tracking are out of scope for this assessment.
