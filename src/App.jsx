import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- 1. Importar la nueva página ---
import ForceResetPasswordPage from './pages/ForceResetPasswordPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />
        <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/resetear-contrasena" element={<ResetPasswordPage />} />
        
        {/* --- 2. AÑADIR LA NUEVA RUTA (Es privada pero no requiere rol) --- */}
        <Route path="/force-reset-password" element={<ForceResetPasswordPage />} />
        
        {/* Rutas Privadas */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Ruta de Administrador */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}

export default App;