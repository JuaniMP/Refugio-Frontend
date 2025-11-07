import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import theme from './theme'; // Importar el tema
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}> {/* Aplicar el tema */}
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
