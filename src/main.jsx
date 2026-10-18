import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

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