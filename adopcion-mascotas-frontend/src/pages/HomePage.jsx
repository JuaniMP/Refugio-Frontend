import { Box, SimpleGrid, Heading } from '@chakra-ui/react';
import PetCard from '../components/pets/PetCard';
import { pets } from '../data/pets';

const HomePage = () => {
  return (
    <Box>
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="brand.900">
        Mascotas en Adopción
      </Heading>
      <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={8}>
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default HomePage;
