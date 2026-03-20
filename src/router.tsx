import React, { Suspense } from 'react';
// TODO (v1.1): Implémenter authentification JWT avec validation serveur
// Actuellement : rôle dans localStorage — NE PAS UTILISER EN PRODUCTION
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { RootErrorBoundary } from './components/ui/RootErrorBoundary';

// Composant de fallback pour le chargement des vues lazy-loaded
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <span
          className="material-symbols-outlined text-primary text-4xl animate-spin"
          aria-hidden="true"
        >
          progress_activity
        </span>
        <p className="mt-4 text-on-surface-variant font-medium">Chargement...</p>
      </div>
    </div>
  );
}

// Lazy load views for code splitting
const LoginView = React.lazy(() => import('./views/Login'));
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout'));
const AdminDashboardView = React.lazy(() => import('./views/Admin/Dashboard'));
const AdminOrdersView = React.lazy(() => import('./views/Admin/Orders'));
const AdminKitchenView = React.lazy(() => import('./views/Admin/Kitchen'));
const AdminMenuView = React.lazy(() => import('./views/Admin/Menu'));
const AdminStaffView = React.lazy(() => import('./views/Admin/Staff'));
const AdminReportsView = React.lazy(() => import('./views/Admin/Reports'));
const KDSView = React.lazy(() => import('./views/KDS'));
const ServeurLayout = React.lazy(() => import('./views/Serveur'));
const FloorPlanView = React.lazy(() => import('./views/Serveur/FloorPlanView'));
const ReservationsView = React.lazy(() => import('./views/Serveur/ReservationsView'));
const ClientView = React.lazy(() => import('./views/Client'));

// Helper pour récupérer le rôle depuis localStorage
function getUserRole(): string | null {
  return localStorage.getItem('atelier_role');
}

// Composant de protection de route
function ProtectedRoute({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: string;
}) {
  const role = getUserRole();
  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LoginView />
          </Suspense>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'admin/*',
        element: (
          <ProtectedRoute allowedRole="admin">
            <Suspense fallback={<LoadingFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboardView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'orders',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminOrdersView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'kitchen',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminKitchenView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'menu',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminMenuView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'staff',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminStaffView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminReportsView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: 'kds',
        element: (
          <ProtectedRoute allowedRole="kds">
            <Suspense fallback={<LoadingFallback />}>
              <KDSView />
            </Suspense>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'serveur/*',
        element: (
          <ProtectedRoute allowedRole="serveur">
            <Suspense fallback={<LoadingFallback />}>
              <ServeurLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <FloorPlanView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
          {
            path: 'reservations',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ReservationsView />
              </Suspense>
            ),
            errorElement: <ErrorBoundary />,
          },
        ],
      },
      {
        path: 'client',
        element: (
          <ProtectedRoute allowedRole="client">
            <Suspense fallback={<LoadingFallback />}>
              <ClientView />
            </Suspense>
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);
