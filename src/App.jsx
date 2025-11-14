import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Importar la ruta segura y el panel de admin
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';

// --- 1. IMPORTAR LAS NUEVAS PÁGINAS ---
import VerifyAccountPage from './pages/VerifyAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* --- 2. AÑADIR LAS NUEVAS RUTAS PÚBLICAS --- */}
        <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />
        <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/resetear-contrasena" element={<ResetPasswordPage />} />
        
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