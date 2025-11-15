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
import CuidadorRoute from './components/auth/CuidadorRoute';
import CuidadorDashboardPage from './pages/CuidadorDashboardPage';

// --- ⬇️ IMPORTAR LO NUEVO ⬇️ ---
import VeterinarioRoute from './components/auth/VeterinarioRoute';
import VeterinarioDashboardPage from './pages/VeterinarioDashboardPage';
import VeterinarioProfilePage from './pages/VeterinarioProfilePage';


function App() {
  return (
    <Layout>
      <Routes>
        {/* ... (Rutas Públicas, /perfil, /force-reset, /cuidador sin cambios) ... */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />
        <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/resetear-contrasena" element={<ResetPasswordPage />} />
        <Route path="/force-reset-password" element={<ForceResetPasswordPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route 
          path="/cuidador" 
          element={
            <CuidadorRoute>
              <CuidadorDashboardPage />
            </CuidadorRoute>
          } 
        />
        
        {/* --- ⬇️ AÑADIR NUEVAS RUTAS DE VETERINARIO ⬇️ --- */}
        <Route 
          path="/veterinario" 
          element={
            <VeterinarioRoute>
              <VeterinarioDashboardPage />
            </VeterinarioRoute>
          } 
        />
        <Route 
          path="/veterinario/perfil" 
          element={
            <VeterinarioRoute>
              <VeterinarioProfilePage />
            </VeterinarioRoute>
          } 
        />
        
        {/* ... (Rutas de Admin sin cambios) ... */}
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