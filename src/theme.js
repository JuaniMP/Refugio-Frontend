import { extendTheme } from '@chakra-ui/react';

// Paleta de colores actualizada SIN NARANJA
const colors = {
  brand: {
    900: '#5B3A29', // Café oscuro (textos, hovers)
    800: '#97cec5', // Azul claro (header, botones principales)
    700: '#5A9A9E', // Azul/Verde Oscuro (NUEVO color para botones de acento)
    200: '#FDF6E9', // Crema claro (footer)
    100: '#FFFFFF', // Blanco (fondos de tarjetas)
  },
};

const theme = extendTheme({ colors });

export default theme;