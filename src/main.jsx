import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom'; // <-- Necesario para useNavigate y Rutas
import App from './App.jsx';
import theme from './theme';
import { AuthProvider } from './context/AuthContext'; // <-- Importar el cerebro

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 1. BrowserRouter debe envolver a todo */}
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        {/* 2. AuthProvider debe envolver a la App */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);