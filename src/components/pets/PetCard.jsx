import { 
    Box, Image, Badge, Text, Button, VStack, useToast, Flex 
} from '@chakra-ui/react';
import { motion } from 'framer-motion'; // <-- Importar motion
import { useAuth } from '../../context/AuthContext'; 
import { Link } from 'react-router-dom';

const PetCard = ({ pet, getStatusDetails, formatEdad }) => {
  const toast = useToast();
  const { isAuthenticated, userRol } = useAuth(); 
  
  const details = getStatusDetails(pet.estado);
  const ageString = formatEdad(pet.edadMeses);
  const isAvailableForAdoption = pet.estado === 'EN_REFUGIO';

  const handleAdoptClick = () => {
    if (!isAvailableForAdoption) {
        toast({
            title: `Estado: ${details.label}`,
            description: details.description,
            status: 'info',
            duration: 5000,
            isClosable: true,
        });
        return;
    }
    
    if (isAuthenticated && userRol === 'AP') {
      toast({
        title: `¡Genial! Iniciando solicitud para ${pet.nombre}`,
        description: 'Serás redirigido al formulario de solicitud en breve. (Lógica pendiente)',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Función requiere inicio de sesión',
        description: 'Por favor, regístrate o inicia sesión como Adoptante para adoptar una mascota.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
        as={motion.div} // <-- Usar motion.div para la animación de hover
        whileHover={{ scale: 1.03, boxShadow: "lg" }} // Animación al pasar el ratón
        transition={{ duration: 0.2 }} // Duración de la transición
        bg="white" // Cambiado a blanco para mejor contraste y sensación "limpia"
        borderWidth="1px" 
        borderColor={details.color ? `${details.color}.200` : 'gray.200'} 
        borderRadius="lg" 
        overflow="hidden" 
        p={4}
        boxShadow="md"
    >
      <Image 
          src={pet.img || '/images/pets/default.png'} 
          alt={`Foto de ${pet.nombre}`} 
          borderRadius="md" 
          objectFit="cover"
          height="200px" 
          width="100%"
      />
      <VStack align="start" mt={4} spacing={1}>
        <Flex align="center" justify="space-between" w="100%">
            <Text fontWeight="bold" fontSize="lg" color="brand.900">{pet.nombre}</Text>
            <Badge 
                colorScheme={details.color} 
                variant="solid" 
                py={1} 
                px={2}
            >
                {details.label}
            </Badge>
        </Flex>
        
        <Text fontSize="md" color="brand.800" fontWeight="semibold"> {/* Color ajustado */}
            Raza: {pet.raza?.nombre || 'Mestizo'}
        </Text>
        <Text fontSize="sm" color="brand.700"> {/* Color ajustado */}
            {details.description}
        </Text>
        <Text fontSize="sm" color="brand.600"> {/* Color ajustado */}
            Edad: {ageString} | Sexo: {pet.sexo === 'M' ? 'Macho' : pet.sexo === 'F' ? 'Hembra' : 'Desconocido'}
        </Text>
        <Text fontSize="sm" color="brand.600"> {/* Color ajustado */}
            Refugio: {pet.refugio?.nombre || 'N/A'}
        </Text>
        
        <Button 
          bg={isAvailableForAdoption ? 'brand.800' : 'gray.400'} 
          color="white" 
          mt={4} 
          onClick={handleAdoptClick} 
          _hover={{ bg: isAvailableForAdoption ? 'brand.900' : 'gray.500' }}
          isDisabled={!isAvailableForAdoption && pet.estado !== 'OTRO'}
          width="full"
        >
          {details.label === 'Historia de Éxito' ? 'Ver su Historia' : 'Adoptar'}
        </Button>
      </VStack>
    </Box>
  );
};

export default PetCard;