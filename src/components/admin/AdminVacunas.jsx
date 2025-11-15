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

// --- ESTE ES EL NUEVO COMPONENTE ---
const AdminVacunas = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [vacunas, setVacunas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVacuna, setCurrentVacuna] = useState(null); 
  const [nombre, setNombre] = useState('');

  // --- Cargar Vacunas (con sort por ID) ---
  const fetchVacunas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8181/api/vacunas/getAll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar vacunas');
      let data = await response.json();
      
      data.sort((a, b) => a.idVacuna - b.idVacuna);
      
      setVacunas(data);
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVacunas();
    }
  }, [token, toast]); // <-- Se corrigió la dependencia de fetchEspecies a fetchVacunas y toast

  const handleOpenModal = (vacuna = null) => {
    if (vacuna) {
      setCurrentVacuna(vacuna);
      setNombre(vacuna.nombre);
    } else {
      setCurrentVacuna(null);
      setNombre('');
    }
    onOpen();
  };
  
  const handleSave = async () => {
    let payload = {};

    if (currentVacuna) {
      payload = { 
        ...currentVacuna,
        nombre: nombre,
      };
    } else {
      payload = { 
        nombre: nombre,
        estado: 'ACTIVO' // Por defecto se crea ACTIVO
      };
    }

    try {
      const response = await fetch('http://localhost:8181/api/vacunas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar la vacuna.');
      }
      
      toast({ title: '¡Guardado!', status: 'success' });
      onClose();
      fetchVacunas(); 
      
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };

  const handleToggleEstado = async (vacuna) => {
    const nuevoEstado = vacuna.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const payload = {
      ...vacuna,
      estado: nuevoEstado
    };
    
    try {
      const response = await fetch('http://localhost:8181/api/vacunas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      
      toast({ title: `Vacuna ${nuevoEstado.toLowerCase()}`, status: 'success' });
      fetchVacunas(); 
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
        Crear Nueva Vacuna
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
          {vacunas.map(v => (
            <Tr key={v.idVacuna} opacity={v.estado === 'ACTIVO' ? 1 : 0.4}>
              <Td>{v.idVacuna}</Td>
              <Td textDecoration={v.estado === 'ACTIVO' ? 'none' : 'line-through'}>
                {v.nombre}
              </Td>
              <Td>
                <HStack spacing={4}>
                  <IconButton 
                    icon={<EditIcon />} 
                    aria-label="Editar" 
                    colorScheme="teal" 
                    onClick={() => handleOpenModal(v)}
                    isDisabled={v.estado !== 'ACTIVO'} 
                  />
                  <Switch 
                    colorScheme="green" 
                    isChecked={v.estado === 'ACTIVO'}
                    onChange={() => handleToggleEstado(v)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {vacunas.length === 0 && !isLoading && (
        <Text mt={4}>No hay vacunas registradas. ¡Crea la primera!</Text>
      )}

      {/* --- Modal --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentVacuna ? 'Editar Vacuna' : 'Crear Vacuna'}</ModalHeader>
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

export default AdminVacunas;