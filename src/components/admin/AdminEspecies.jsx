import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, VStack, Spinner, Text,
  HStack,
  Switch 
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons'; 
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminEspecies = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [especies, setEspecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEspecie, setCurrentEspecie] = useState(null); 
  const [nombre, setNombre] = useState('');

  // --- Cargar Especies (CON SORT POR ID) ---
  const fetchEspecies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8181/api/especies/getAll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar especies');
      let data = await response.json();
      
      // --- CAMBIO AQUÍ: Ordenar por ID ascendente ---
      data.sort((a, b) => a.idEspecie - b.idEspecie);
      
      setEspecies(data);
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEspecies();
    }
  }, [token]);

  // ... (handleOpenModal sin cambios) ...
  const handleOpenModal = (especie = null) => {
    if (especie) {
      setCurrentEspecie(especie);
      setNombre(especie.nombre);
    } else {
      setCurrentEspecie(null);
      setNombre('');
    }
    onOpen();
  };
  
  // ... (handleSave sin cambios) ...
  const handleSave = async () => {
    let payload = {};

    if (currentEspecie) {
      payload = { 
        ...currentEspecie,
        nombre: nombre,
      };
    } else {
      payload = { 
        nombre: nombre,
        estado: 'ACTIVO'
      };
    }

    try {
      const response = await fetch('http://localhost:8181/api/especies/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar la especie.');
      }
      
      toast({ title: '¡Guardado!', status: 'success' });
      onClose();
      fetchEspecies(); 
      
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };

  // ... (handleToggleEstado sin cambios) ...
  const handleToggleEstado = async (especie) => {
    const nuevoEstado = especie.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const payload = {
      ...especie,
      estado: nuevoEstado
    };
    
    try {
      const response = await fetch('http://localhost:8181/api/especies/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      
      toast({ title: `Especie ${nuevoEstado.toLowerCase()}`, status: 'success' });
      fetchEspecies(); 
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };


  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  return (
    <Box>
      <Button 
        leftIcon={<AddIcon />} 
        bg="brand.800" 
        color="white"
        _hover={{ bg: 'brand.900' }} 
        mb={4} 
        onClick={() => handleOpenModal()}
      >
        Crear Nueva Especie
      </Button>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {especies.map(e => (
            <Tr key={e.idEspecie} opacity={e.estado === 'ACTIVO' ? 1 : 0.4}>
              <Td>{e.idEspecie}</Td>
              <Td textDecoration={e.estado === 'ACTIVO' ? 'none' : 'line-through'}>
                {e.nombre}
              </Td>
              <Td>
                <HStack spacing={4}>
                  <IconButton 
                    icon={<EditIcon />} 
                    aria-label="Editar" 
                    // --- CAMBIO AQUÍ: Color de "blue" a "teal" ---
                    colorScheme="teal" 
                    onClick={() => handleOpenModal(e)}
                    isDisabled={e.estado !== 'ACTIVO'} 
                  />
                  <Switch 
                    colorScheme="green" 
                    isChecked={e.estado === 'ACTIVO'}
                    onChange={() => handleToggleEstado(e)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {especies.length === 0 && !isLoading && (
        <Text mt={4}>No hay especies registradas. ¡Crea la primera!</Text>
      )}

      {/* --- Modal (sin cambios) --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentEspecie ? 'Editar Especie' : 'Crear Especie'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button 
              bg="brand.800" 
              color="white"
              _hover={{ bg: 'brand.900' }}
              onClick={handleSave}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminEspecies;