import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AdminAuthProvider } from '../modules/admin/admin-auth.context.jsx';
import CatalogPage from '../modules/catalog/CatalogPage.jsx';
import CategoryPage from '../modules/catalog/CategoryPage.jsx';
import ProductDetailPage from '../modules/catalog/ProductDetailPage.jsx';
import ContactPage from '../modules/contact/ContactPage.jsx';
import FaqPage from '../modules/faq/FaqPage.jsx';
import HomePage from '../modules/home/HomePage.jsx';
import LegalPage from '../modules/legal/LegalPage.jsx';
import QuoteWizardPage from '../modules/quotes/QuoteWizardPage.jsx';
import SystemStatusPage from '../modules/system-status/SystemStatusPage.jsx';
import { LoadingState } from '../shared/components/PageStates.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import PublicLayout from './PublicLayout.jsx';

const AdminActivityPage = lazy(() => import('../modules/admin/AdminActivityPage.jsx'));
const AdminDashboardPage = lazy(() => import('../modules/admin/AdminDashboardPage.jsx'));
const AdminLayout = lazy(() => import('../modules/admin/AdminLayout.jsx'));
const AdminLoginPage = lazy(() => import('../modules/admin/AdminLoginPage.jsx'));
const AdminMediaPage = lazy(() => import('../modules/admin/AdminMediaPage.jsx'));
const AdminProductFormPage = lazy(() => import('../modules/admin/AdminProductFormPage.jsx'));
const AdminProductsPage = lazy(() => import('../modules/admin/AdminProductsPage.jsx'));
const AdminProtectedRoute = lazy(() => import('../modules/admin/AdminProtectedRoute.jsx'));
const AdminQuotesPage = lazy(() => import('../modules/admin/AdminQuotesPage.jsx'));
const AdminReviewsPage = lazy(() => import('../modules/admin/AdminReviewsPage.jsx'));
const AdminSettingsPage = lazy(() => import('../modules/admin/AdminSettingsPage.jsx'));

function AdminFallback() {
  return (
    <div className="admin-gate">
      <LoadingState label="Cargando panel…" />
    </div>
  );
}

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<AdminFallback />}>
        <Outlet />
      </Suspense>
    </AdminAuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="catalogo/:categoria" element={<CategoryPage />} />
        <Route path="productos/:slug" element={<ProductDetailPage />} />
        <Route path="personalizar" element={<QuoteWizardPage />} />
        <Route path="personalizar/:slug" element={<QuoteWizardPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="preguntas-frecuentes" element={<FaqPage />} />
        <Route path="estado" element={<SystemStatusPage />} />
        <Route path="privacidad" element={<LegalPage kind="privacidad" />} />
        <Route path="terminos" element={<LegalPage kind="terminos" />} />
        <Route path="cookies" element={<LegalPage kind="cookies" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="resumen" replace />} />
            <Route path="resumen" element={<AdminDashboardPage />} />
            <Route path="productos" element={<AdminProductsPage />} />
            <Route path="productos/nuevo" element={<AdminProductFormPage />} />
            <Route path="productos/:id" element={<AdminProductFormPage />} />
            <Route path="pedidos" element={<AdminQuotesPage />} />
            <Route path="resenas" element={<AdminReviewsPage />} />
            <Route path="biblioteca" element={<AdminMediaPage />} />
            <Route path="actividad" element={<AdminActivityPage />} />
            <Route path="configuracion" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
