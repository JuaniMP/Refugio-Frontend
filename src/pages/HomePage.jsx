import { Box, SimpleGrid, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import PetCard from '../components/pets/PetCard';
import { useAuth } from '../context/AuthContext'; 

// Helper function para formatear la edad (extraído de AdminMascotas)
const formatEdad = (meses) => {
    if (!meses || meses <= 0) return 'Menos de un mes';
    if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    const anios = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
    return `${anios} ${anios === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
};

// Helper function para obtener descripción y color según el estado
const getStatusDetails = (estado) => {
    switch (estado) {
        case 'EN_REFUGIO':
            return { label: '¡Disponible!', color: 'green', description: 'Esperando un nuevo hogar lleno de amor.' };
        case 'EN_PROCESO_ADOPCION':
            return { label: 'Con Solicitud', color: 'orange', description: 'Actualmente está en proceso de conocer a su futura familia.' };
        case 'ADOPTADA':
            return { label: 'Historia de Éxito', color: 'blue', description: '¡Encontró su final feliz!' };
        case 'OTRO':
            return { label: 'En Recuperación', color: 'red', description: 'Mejorando su salud para estar listo pronto.' };
        default:
            return { label: 'Desconocido', color: 'gray', description: '' };
    }
};

const HomePage = () => {
    const { token } = useAuth();
    const [mascotas, setMascotas] = useState({
        EN_REFUGIO: [],
        EN_PROCESO_ADOPCION: [],
        OTRO: [],
        ADOPTADA: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const fetchMascotas = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await fetch('http://localhost:8181/api/mascotas/getAll', { headers });
            
            if (!response.ok) throw new Error('No se pudo cargar la lista de mascotas.');
            
            const data = await response.json();
            
            const classified = { EN_REFUGIO: [], EN_PROCESO_ADOPCION: [], OTRO: [], ADOPTADA: [] };

            data.forEach(m => {
                const estado = m.estado || 'OTRO'; 
                if (classified[estado]) {
                    classified[estado].push(m);
                } else {
                    classified.OTRO.push(m);
                }
            });

            setMascotas(classified);
        } catch (error) {
            console.error('Error fetching data:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMascotas();
    }, [token]);

    const renderSection = (statusKey, title, description) => {
        const pets = mascotas[statusKey];
        if (pets.length === 0) return null;

        if (statusKey === 'ADOPTADA' && pets.length === 0) return null;
        if (statusKey === 'OTRO' && pets.length === 0) return null;


        return (
            <Box mb={10}>
                {/* --- CAMBIO: Título de Sección de xl a lg --- */}
                <Heading as="h2" size="lg" mb={2} color="brand.900" borderBottom="2px solid" borderColor="brand.800" pb={2}>
                    {title}
                </Heading>
                <Text fontSize="lg" mb={6} color="brand.800">{description}</Text>
                
                <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={8}>
                    {pets.map((pet) => (
                        <PetCard 
                            key={pet.idMascota} 
                            pet={pet}
                            getStatusDetails={getStatusDetails} 
                            formatEdad={formatEdad}
                        />
                    ))}
                </SimpleGrid>
            </Box>
        );
    };

    if (isLoading) {
        return <Spinner size="xl" mx="auto" mt={10} />;
    }
    
    if (hasError) {
        return <Text color="red.500" textAlign="center" mt={10}>Hubo un error al cargar las mascotas. Asegúrate que el backend esté corriendo.</Text>
    }

    const hasVisiblePets = mascotas.EN_REFUGIO.length > 0 || mascotas.EN_PROCESO_ADOPCION.length > 0 || mascotas.OTRO.length > 0;
    
    return (
        <Box>
            {/* --- CAMBIO: Título Principal de 2xl a xl --- */}
            <Heading as="h1" size="xl" mb={10} textAlign="center" color="brand.900">
                ¡Encuentra a tu nuevo mejor amigo!
            </Heading>
            
            <VStack spacing={12} align="stretch">
                {renderSection(
                    'EN_REFUGIO', 
                    '✨ Disponibles para Adopción Inmediata',
                    'Estos peluditos ya están listos para ir a casa contigo. ¡Atrévete a dar el paso!'
                )}

                {renderSection(
                    'OTRO', 
                    '🏥 Mejorando su Salud',
                    'Están temporalmente en recuperación o bajo tratamiento. ¡Echa un vistazo y anímales!'
                )}

                {renderSection(
                    'EN_PROCESO_ADOPCION', 
                    '⏳ Esperando a su Familia',
                    'Ya tienen solicitudes activas, pero anímate a solicitar, ¡nunca se sabe!'
                )}

                {renderSection(
                    'ADOPTADA', 
                    '💖 Casos de Éxito',
                    '¡Mira a los afortunados que encontraron su hogar gracias a personas como tú!'
                )}
            </VStack>

             {!hasVisiblePets && mascotas.ADOPTADA.length === 0 && (
                <Text fontSize="xl" color="gray.600" textAlign="center" mt={10}>
                    Actualmente no hay mascotas disponibles. ¡Vuelve pronto!
                </Text>
            )}
        </Box>
    );
};

export default HomePage;