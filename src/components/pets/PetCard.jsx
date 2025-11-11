import { Box, Image, Badge, Text, Button, VStack, useToast, Flex } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext'; // <-- 1. Importar

const PetCard = ({ pet }) => {
  const toast = useToast();
  const { isAuthenticated, userRol } = useAuth(); // <-- 2. Usar contexto

  const handleAdoptClick = () => {
    // 3. Comprobar si es un adoptante logueado
    if (isAuthenticated && userRol === 'AP') {
      
      // TODO: Implementar la lógica de adopción
      // Por ahora, solo mostramos un toast de éxito
      toast({
        title: '¡Genial!',
        description: `Estás iniciando el proceso para adoptar a ${pet.name}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // (Opcional) Redirigir a un formulario de solicitud
      // navigate(`/solicitud/${pet.id}`);

    } else {
      // Comportamiento antiguo
      toast({
        title: 'Función requiere inicio de sesión',
        description: 'Por favor, regístrate o inicia sesión como adoptante.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
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
        <Button 
          bg="brand.800" 
          color="white" 
          mt={4} 
          onClick={handleAdoptClick} 
          _hover={{ bg: 'brand.900' }}
        >
          Adoptar
        </Button>
      </VStack>
    </Box>
  );
};

export default PetCard;