import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import Layout from './components/layout/Layout';
import AdminRoute from './components/auth/AdminRoute';
import CuidadorRoute from './components/auth/CuidadorRoute';
import VeterinarioRoute from './components/auth/VeterinarioRoute';


// Cada página se descarga solo cuando se visita (Chart.js no va en la carga inicial)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const VerifyAccountPage = lazy(() => import('./pages/VerifyAccountPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ForceResetPasswordPage = lazy(() => import('./pages/ForceResetPasswordPage'));
const CuidadorDashboardPage = lazy(() => import('./pages/CuidadorDashboardPage'));
const VeterinarioDashboardPage = lazy(() => import('./pages/VeterinarioDashboardPage'));
const VeterinarioProfilePage = lazy(() => import('./pages/VeterinarioProfilePage'));
const SolicitudPage = lazy(() => import('./pages/SolicitudPage'));
const MisSolicitudesPage = lazy(() => import('./pages/MisSolicitudesPage'));

function App() {
  return (
    <Layout>
      <Suspense fallback={<Center py={20}><Spinner size="xl" /></Center>}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />
        <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
        <Route path="/resetear-contrasena" element={<ResetPasswordPage />} />
        <Route path="/solicitud" element={<SolicitudPage />} />
        
        {/* Rutas Privadas (Adoptante) */}
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/mis-solicitudes" element={<MisSolicitudesPage />} />

        {/* Rutas de Empleados y Admin */}
        <Route path="/force-reset-password" element={<ForceResetPasswordPage />} />
        <Route 
          path="/cuidador" 
          element={
            <CuidadorRoute>
              <CuidadorDashboardPage />
            </CuidadorRoute>
          } 
        />
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
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } 
        />
      </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;