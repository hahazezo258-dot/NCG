/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { StorefrontPage } from './pages/StorefrontPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function resolveRouterBasename(): string | undefined {
  const rawBase = import.meta.env.BASE_URL;
  if (!rawBase || rawBase === '/' || rawBase === './') {
    return undefined;
  }
  const normalized = `/${rawBase.replace(/^\/+|\/+$/g, '')}`;
  if (typeof window === 'undefined') {
    return normalized;
  }
  const pathname = window.location.pathname;
  if (pathname.toLowerCase().startsWith(normalized.toLowerCase())) {
    return pathname.slice(0, normalized.length);
  }
  return undefined;
}

export default function App() {
  return (
    <BrowserRouter basename={resolveRouterBasename()}>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
