import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  HStack,
  Switch // <-- 1. Importar Switch
} from '@chakra-ui/react';
// <-- 2. Quitar DeleteIcon
import { AddIcon, EditIcon } from '@chakra-ui/icons'; 
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminRazas = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [razas, setRazas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRaza, setCurrentRaza] = useState(null); 
  const [formData, setFormData] = useState({
    nombre: '',
    idEspecie: ''
  });

  // --- 3. Cargar datos (CON SORT POR ID) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const razasRes = await fetch('http://localhost:8181/api/razas/getAll', { headers });
      let razasData = await razasRes.json();
      
      // --- ORDENAR: Por ID ascendente ---
      razasData.sort((a, b) => a.idRaza - b.idRaza);
      setRazas(razasData);

      const especiesRes = await fetch('http://localhost:8181/api/especies/getAll', { headers });
      if (!especiesRes.ok) throw new Error('Error al cargar Especies');
      const especiesData = await especiesRes.json();
      setEspecies(especiesData);

      if (especiesData.length > 0) {
         setFormData(prev => ({ ...prev, idEspecie: especiesData[0].idEspecie }));
      }
      
    } catch (error) {
      toast({ title: 'Error al cargar datos', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // ... (handleOpenModal sin cambios) ...
  const handleOpenModal = (raza = null) => {
    if (raza) {
      setCurrentRaza(raza);
      setFormData({
        nombre: raza.nombre,
        idEspecie: raza.especie.idEspecie
      });
    } else {
      setCurrentRaza(null);
      setFormData({
        nombre: '',
        idEspecie: especies[0]?.idEspecie || ''
      });
    }
    onOpen();
  };

  // --- 4. Guardar (Actualizado para 'estado') ---
  const handleSave = async () => {
    let payload = {};

    if (currentRaza) {
      // Editando: preservar estado, solo cambiar datos del form
      payload = {
        ...currentRaza, // Preserva idRaza y estado
        nombre: formData.nombre,
        especie: { idEspecie: parseInt(formData.idEspecie) } 
      };
    } else {
      // Creando: se asigna 'ACTIVO'
      payload = {
        nombre: formData.nombre,
        especie: { idEspecie: parseInt(formData.idEspecie) },
        estado: 'ACTIVO' // Aseguramos que se cree como ACTIVO
      };
    }

    try {
      const response = await fetch('http://localhost:8181/api/razas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo guardar la raza.');
      }
      
      toast({ title: '¡Guardado!', status: 'success' });
      onClose();
      fetchData(); // Recargar la lista
      
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };
  
  // --- 5. AÑADIR 'handleToggleEstado' ---
  const handleToggleEstado = async (raza) => {
    const nuevoEstado = raza.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const payload = {
      ...raza, // Enviar el objeto completo (incluye idRaza, nombre, especie)
      estado: nuevoEstado
    };
    
    try {
      const response = await fetch('http://localhost:8181/api/razas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      
      toast({ title: `Raza ${nuevoEstado.toLowerCase()}`, status: 'success' });
      fetchData(); // Recargar lista
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };

  // ... (handleChange sin cambios) ...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // ... (isLoading y especies.length === 0 sin cambios) ...
  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }
  if (especies.length === 0) {
    return <Text color="red.500">Error: No se pueden cargar razas si no hay especies creadas. 
      Por favor, ve a la pestaña 'Especies' y crea una primero.</Text>
  }

  return (
    <Box>
      {/* --- 6. Cambiar estilo del Botón --- */}
      <Button 
        leftIcon={<AddIcon />} 
        bg="brand.800" // Color menta
        color="white"
        _hover={{ bg: 'brand.900' }} // Color café
        mb={4} 
        onClick={() => handleOpenModal()}
      >
        Crear Nueva Raza
      </Button>

      {/* --- 7. Modificar Tabla --- */}
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Nombre</Th>
            <Th>Especie</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {razas.map(r => (
            <Tr key={r.idRaza} opacity={r.estado === 'ACTIVO' ? 1 : 0.4}>
              <Td>{r.idRaza}</Td>
              <Td textDecoration={r.estado === 'ACTIVO' ? 'none' : 'line-through'}>
                {r.nombre}
              </Td>
              <Td>{r.especie?.nombre || 'N/A'}</Td>
              <Td>
                <HStack spacing={4}>
                  <IconButton 
                    icon={<EditIcon />} 
                    aria-label="Editar"
                    colorScheme="teal" // Color azul-verde suave
                    onClick={() => handleOpenModal(r)}
                    isDisabled={r.estado !== 'ACTIVO'}
                  />
                  <Switch 
                    colorScheme="green"
                    isChecked={r.estado === 'ACTIVO'}
                    onChange={() => handleToggleEstado(r)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
       {razas.length === 0 && !isLoading && (
        <Text mt={4}>No hay razas registradas.</Text>
      )}

      {/* --- Modal (con botones de color) --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentRaza ? 'Editar Raza' : 'Crear Raza'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre de la Raza</FormLabel>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Especie</FormLabel>
                <Select name="idEspecie" value={formData.idEspecie} onChange={handleChange}>
                  {/* Filtramos especies inactivas para no asignarlas */}
                  {especies.filter(e => e.estado === 'ACTIVO').map(e => (
                    <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button 
              bg="brand.800" // Estilo de botón Guardar
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

export default AdminRazas;