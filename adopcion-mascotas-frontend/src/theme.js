import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    900: '#2F855A', // Dark Green
    800: '#38A169', // Green
    700: '#48BB78', // Light Green
    200: '#F0EFEB', // Beige
    100: '#FFFFFF', // White
  },
};

const theme = extendTheme({ colors });

export default theme;
