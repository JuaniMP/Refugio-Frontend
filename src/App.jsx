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
import ForceResetPasswordPage from './pages/ForceResetPasswordPage';

// --- 1. IMPORTAR LO NUEVO ---
import CuidadorRoute from './components/auth/CuidadorRoute';
import CuidadorDashboardPage from './pages/CuidadorDashboardPage';


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
        
        {/* Rutas Privadas (para empleados) */}
        <Route path="/force-reset-password" element={<ForceResetPasswordPage />} />
        
        {/* Rutas Privadas (para adoptantes) */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* --- 2. AÑADIR LA NUEVA RUTA DE CUIDADOR --- */}
        <Route 
          path="/cuidador" 
          element={
            <CuidadorRoute>
              <CuidadorDashboardPage />
            </CuidadorRoute>
          } 
        />
        {/* (Aquí podrías añadir una /veterinario en el futuro) */}
        
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