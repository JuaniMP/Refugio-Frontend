import { Box, Image, Badge, Text, Button, VStack, useToast, Flex } from '@chakra-ui/react';

const PetCard = ({ pet }) => {
  const toast = useToast();

  const handleAdoptClick = () => {
    toast({
      title: 'Función requiere inicio de sesión',
      description: 'Por favor, regístrate o inicia sesión para adoptar una mascota.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box bg="brand.100" borderWidth="1px" borderColor="brand.200" borderRadius="lg" overflow="hidden" p={4}>
      <Image src={pet.imageUrl} alt={`Foto de ${pet.name}`} borderRadius="md" />
      <VStack align="start" mt={4}>
        <Flex align="center" justify="space-between" w="100%">
            <Text fontWeight="bold" fontSize="xl" color="brand.900">{pet.name}</Text>
            <Badge colorScheme={pet.status === 'libre' ? 'green' : 'orange'}>
                {pet.status}
            </Badge>
        </Flex>
        <Text fontSize="sm" color="gray.500">{pet.breed}</Text>
        <Text mt={2} color="brand.800">{pet.description}</Text>
        <Button bg="brand.800" color="white" mt={4} onClick={handleAdoptClick} _hover={{ bg: 'brand.900' }}>
          Adoptar
        </Button>
      </VStack>
    </Box>
  );
};

export default PetCard;
