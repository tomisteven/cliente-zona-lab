import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AdminAuthProvider } from '../modules/admin/admin-auth.context.jsx';
import AdminLayout from '../modules/admin/AdminLayout.jsx';
import AdminLoginPage from '../modules/admin/AdminLoginPage.jsx';
import AdminProductFormPage from '../modules/admin/AdminProductFormPage.jsx';
import AdminProductsPage from '../modules/admin/AdminProductsPage.jsx';
import AdminProtectedRoute from '../modules/admin/AdminProtectedRoute.jsx';
import AdminQuotesPage from '../modules/admin/AdminQuotesPage.jsx';
import AdminSettingsPage from '../modules/admin/AdminSettingsPage.jsx';
import CatalogPage from '../modules/catalog/CatalogPage.jsx';
import ProductDetailPage from '../modules/catalog/ProductDetailPage.jsx';
import HomePage from '../modules/home/HomePage.jsx';
import QuoteWizardPage from '../modules/quotes/QuoteWizardPage.jsx';
import PublicLayout from '../shared/components/PublicLayout.jsx';
import NotFoundPage from './NotFoundPage.jsx';

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="productos/:slug" element={<ProductDetailPage />} />
        <Route path="personalizar" element={<QuoteWizardPage />} />
        <Route path="personalizar/:slug" element={<QuoteWizardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="productos" replace />} />
            <Route path="productos" element={<AdminProductsPage />} />
            <Route path="productos/nuevo" element={<AdminProductFormPage />} />
            <Route path="productos/:id" element={<AdminProductFormPage />} />
            <Route path="pedidos" element={<AdminQuotesPage />} />
            <Route path="configuracion" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
