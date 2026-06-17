import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthGuard } from './components/auth/AuthGuard';
import { AuthProvider } from './hooks/useAuth';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicFormPage } from './pages/PublicFormPage';
import { RegisterPage } from './pages/RegisterPage';
import { SuccessPage } from './pages/SuccessPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';

export default function App() {
  return (
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
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
