import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// --- 1. Importar la ruta segura y el nuevo panel ---
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas Privadas */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* --- 2. Añadir la Ruta de Administrador --- */}
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