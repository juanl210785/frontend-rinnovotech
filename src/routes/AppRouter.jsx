import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { CatalogPage } from '../modules/catalog/pages/CatalogPage';
import { ProductDetailPage } from '../modules/catalog/pages/ProductDetailPage';
import { CheckoutPage } from '../modules/checkout/pages/CheckoutPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { CustomerAccountPage } from '../modules/customer/pages/CustomerAccountPage';
import { AdminProductsPage } from '../modules/admin/pages/AdminProductsPage';
import { AdminCreateProduct } from '../modules/admin/pages/AdminCreateProduct';
import { AdminEditProduct } from '../modules/admin/pages/AdminEditProduct';
import { AdminOrdersPage } from '../modules/admin/pages/AdminOrdersPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas y de Clientes con Layout de Tienda */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requireAdmin={false}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cuenta"
          element={
            <ProtectedRoute requireAdmin={false}>
              <CustomerAccountPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Autenticación Universal */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Administrativas Protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/productos/crear"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminCreateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/productos/editar/:id"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminEditProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ordenes"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
