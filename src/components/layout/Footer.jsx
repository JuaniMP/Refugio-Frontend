import { Box, Text, VStack } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box as="footer" bg="brand.200" py={4} mt={8}>
      <VStack>
        <Text fontWeight="bold" color="brand.900">BigotesFelizes</Text>
        <Text color="brand.800">Cra. 58 #152 70, Bogotá</Text>
        <Text color="brand.800">3053354668</Text>
      </VStack>
    </Box>
  );
};

export default Footer;
