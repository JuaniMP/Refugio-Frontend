import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom'; // <-- Necesario para useNavigate y Rutas
import App from './App.jsx';
import theme from './theme';
import { AuthProvider } from './context/AuthContext'; // <-- (A) IMPORTAR EL PROVIDER

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 1. BrowserRouter debe envolver a todo */}
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        {/* 2. (B) AuthProvider DEBE ENVOLVER A LA APP */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);