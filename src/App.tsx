import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminGuard } from './components/auth/AdminGuard';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ROTAS } from './lib/constants';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminSolicitacaoDetalhePage } from './pages/AdminSolicitacaoDetalhePage';
import { AdminSolicitacoesPage } from './pages/AdminSolicitacoesPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicFormPage } from './pages/PublicFormPage';
import { RegisterPage } from './pages/RegisterPage';
import { SuccessPage } from './pages/SuccessPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard requireVerifiedEmail>
                  <PublicFormPage />
                </AuthGuard>
              }
            />
            <Route
              path="/sucesso"
              element={
                <AuthGuard requireVerifiedEmail>
                  <SuccessPage />
                </AuthGuard>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route
              path="/verificar-email"
              element={
                <AuthGuard>
                  <VerifyEmailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Navigate to={ROTAS.adminDashboard} replace />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/login"
              element={
                <AdminGuard>
                  <Navigate to={ROTAS.adminDashboard} replace />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminGuard>
                  <AdminDashboardPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/solicitacoes"
              element={
                <AdminGuard>
                  <AdminSolicitacoesPage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/solicitacoes/:id"
              element={
                <AdminGuard>
                  <AdminSolicitacaoDetalhePage />
                </AdminGuard>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminGuard>
                  <Navigate to={ROTAS.adminDashboard} replace />
                </AdminGuard>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
