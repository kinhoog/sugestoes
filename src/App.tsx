import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicFormPage } from './pages/PublicFormPage';
import { SuccessPage } from './pages/SuccessPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicFormPage />} />
        <Route path="/sucesso" element={<SuccessPage />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}
