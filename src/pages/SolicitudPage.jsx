import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Textarea,
  useToast, Spinner, Text, List, ListItem, ListIcon, Divider, HStack, Image
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon } from '@chakra-ui/icons';

// --- PREGUNTAS GUÍA DESAFIANTES ---
const GUIDING_QUESTIONS = [
  "Describa su experiencia previa con mascotas (especialmente de esta especie o tamaño). ¿Qué incidentes o retos enfrentó y cómo los resolvió?",
  "Detalle su ambiente de vivienda (apartamento, casa, jardín cercado). ¿Dónde dormirá la mascota y cuántas horas al día pasará sola?",
  "Estime el tiempo y costo (minutos y presupuesto mensual) que dedicará al ejercicio, el aseo y la alimentación de la mascota.",
  "¿Cómo planea cubrir gastos médicos inesperados o emergencias que superen los $500 USD?",
  "Si la mascota desarrolla problemas de comportamiento (ansiedad por separación, ladridos excesivos), ¿qué recursos o profesionales consultaría antes de considerar devolverla?",
  "¿Quién será el cuidador principal y cómo está preparado el resto de su familia (niños, otras mascotas) para la integración de este nuevo miembro?"
];


const SolicitudPage = () => {
  const { token, isAuthenticated, userRol } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { idMascota } = location.state || {};
  
  const [adoptanteId, setAdoptanteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [currentPet, setCurrentPet] = useState(null);

  // 1. Verificar autenticación, obtener ID Adoptante y detalles de Mascota
  useEffect(() => {
    if (!isAuthenticated || userRol !== 'AP') {
      toast({ title: 'Debes iniciar sesión como Adoptante para continuar.', status: 'warning' });
      navigate('/login');
      return;
    }
    
    if (!idMascota) {
        toast({ title: 'Mascota no seleccionada.', status: 'error' });
        navigate('/');
        return;
    }

    const fetchRequiredData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch 1: Obtener ID del Adoptante logueado
        const adoptanteRes = await fetch('http://localhost:8181/api/adoptantes/me', { headers });
        const adoptanteData = await adoptanteRes.json();
        if (!adoptanteRes.ok) throw new Error(adoptanteData.message || 'Error al cargar perfil de adoptante.');
        setAdoptanteId(adoptanteData.idAdoptante);

        // Fetch 2: Obtener detalles de la mascota
        const petRes = await fetch(`http://localhost:8181/api/mascotas/${idMascota}`, { headers });
        const petData = await petRes.json();
        if (!petRes.ok) throw new Error(petData.message || 'Error al cargar detalles de la mascota.');
        setCurrentPet(petData);
        
        // --- PRE-RELLENAR TEXTAREA CON PREGUNTAS ---
        const initialText = "Por favor, responda las siguientes preguntas numeradas:\n\n" + 
                            GUIDING_QUESTIONS.map((q, i) => `${i + 1}. ${q}`).join('\n\n') +
                            "\n\nRespuesta:\n1. \n2. \n3. \n4. \n5. \n6. ";
        setObservaciones(initialText);

      } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error' });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequiredData();
  }, [token, isAuthenticated, userRol, navigate, toast, idMascota]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adoptanteId || !currentPet) return;

    setIsLoading(true);

    // Validar que el adoptante haya editado el formulario (al menos un poco)
    if (observaciones.length < 100) {
        toast({ title: 'Respuesta demasiado corta.', description: 'Por favor, tómese su tiempo para responder las preguntas guía.', status: 'warning' });
        setIsLoading(false);
        return;
    }

    const payload = {
        mascota: { idMascota: currentPet.idMascota },
        adoptante: { idAdoptante: adoptanteId },
        observaciones: observaciones,
    };
    
    try {
      const response = await fetch('http://localhost:8181/api/solicitudes/save', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la solicitud.');
      }

      toast({
        title: '¡Solicitud Enviada!',
        description: 'Hemos recibido tu solicitud. El administrador la revisará pronto.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/'); // Redirige a la página principal después de enviar

    } catch (error) {
      toast({
        title: 'Error de Solicitud',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  return (
    <Box bg="brand.100" p={8} borderRadius="md" maxW="3xl" mx="auto" mt={10}>
      <Heading as="h2" size="xl" mb={4} textAlign="center" color="brand.900">
        Solicitud de Adopción
      </Heading>

      {/* --- DETALLES DE LA MASCOTA --- */}
      {currentPet && (
        <Box bg="white" p={4} borderRadius="md" shadow="md" mb={6} borderWidth="1px" borderColor="brand.800">
            <HStack spacing={4} align="flex-start">
                <Image 
                    src={currentPet.img || '/images/pets/default.png'}
                    alt={currentPet.nombre}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="lg"
                />
                <VStack align="flex-start" spacing={1}>
                    <Heading size="md" color="brand.900">{currentPet.nombre}</Heading>
                    <Text fontSize="md">
                        Raza: <b>{currentPet.raza?.nombre || 'Mestizo'}</b>
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        ID: {currentPet.idMascota} | Estado: {currentPet.estado}
                    </Text>
                </VStack>
            </HStack>
        </Box>
      )}
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          
          <Heading size="md" color="brand.800" mb={2}>
            Cuestionario de Compromiso
          </Heading>
          <Text fontSize="sm" color="gray.700">
            **Instrucciones:** Responda el cuestionario directamente en el área de texto numerando sus respuestas.
          </Text>
          
          <FormControl isRequired>
            <FormLabel>Sus Respuestas:</FormLabel>
            <Textarea 
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)} 
              rows={20}
              placeholder="1. Mi experiencia previa es..."
              fontFamily="monospace"
              fontSize="sm"
            />
          </FormControl>
          
          <HStack spacing={4}>
            {/* 1. BOTÓN DE CONFIRMAR (Color Primario) */}
            <Button 
              type="submit" 
              bg="brand.800" // Azul claro
              color="white" 
              size="lg" 
              width="full" 
              _hover={{ bg: 'brand.900' }} // Hover Café
              isLoading={isLoading}
              isDisabled={!adoptanteId || !idMascota}
            >
              Confirmar Solicitud de Adopción
            </Button>
            
            {/* 2. BOTÓN DE CANCELAR Y VOLVER (Color Secundario, con estilo Outline) */}
            <Button 
              type="button" 
              variant="outline"
              color="brand.900" // Texto Café
              borderColor="brand.900" // Borde Café
              size="lg" 
              width="full"
              onClick={() => navigate('/')} 
              isDisabled={isLoading}
              _hover={{ bg: 'brand.200', borderColor: 'brand.700' }} // Hover Crema
            >
              Cancelar y Volver
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default SolicitudPage;