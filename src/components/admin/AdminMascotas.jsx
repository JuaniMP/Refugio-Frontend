import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminMascotas = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [mascotas, setMascotas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentMascota, setCurrentMascota] = useState(null); 
  const [formData, setFormData] = useState({
    nombre: '',
    sexo: 'DESCONOCIDO',
    edadMeses: 0,
    estado: 'EN_REFUGIO',
    img: '',
    idRaza: '',
    idRefugio: ''
  });

  // --- 1. Cargar TODOS los datos ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Cargar Mascotas
      const mascotasRes = await fetch('http://localhost:8181/api/mascotas/getAll', { headers });
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData);

      // Cargar Razas
      const razasRes = await fetch('http://localhost:8181/api/razas/getAll', { headers });
      if (!razasRes.ok) throw new Error('Error al cargar Razas (Revisa la DB o el Backend)');
      const razasData = await razasRes.json();
      setRazas(razasData);

      // Cargar Refugios
      const refugiosRes = await fetch('http://localhost:8181/api/refugios/getAll', { headers });
      if (!refugiosRes.ok) throw new Error('Error al cargar Refugios (Revisa la DB o el Backend)');
      const refugiosData = await refugiosRes.json();
      setRefugios(refugiosData);

      // --- CORRECCIÓN DEL BUG ---
      // Asignar valores por defecto para el formulario de 'Crear'
      // solo DESPUÉS de que los datos hayan cargado.
      if (razasData.length > 0) {
        setFormData(prev => ({ ...prev, idRaza: razasData[0].idRaza }));
      }
      if (refugiosData.length > 0) {
        setFormData(prev => ({ ...prev, idRefugio: refugiosData[0].idRefugio }));
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
  }, [token]); // Cargar al inicio

  // --- 2. Abrir el modal ---
  const handleOpenModal = (mascota = null) => {
    if (mascota) {
      // Editando
      setCurrentMascota(mascota);
      setFormData({
        nombre: mascota.nombre,
        sexo: mascota.sexo,
        edadMeses: mascota.edadMeses,
        estado: mascota.estado,
        img: mascota.img,
        idRaza: mascota.raza.idRaza,
        idRefugio: mascota.refugio.idRefugio
      });
    } else {
      // Creando
      setCurrentMascota(null);
      // Aplicar valores por defecto que ya cargamos
      setFormData({
        nombre: '', sexo: 'DESCONOCIDO', edadMeses: 0, estado: 'EN_REFUGIO', img: '',
        idRaza: razas[0]?.idRaza || '', // Usar el primer valor de la lista cargada
        idRefugio: refugios[0]?.idRefugio || '' // Usar el primer valor de la lista cargada
      });
    }
    onOpen();
  };

  // --- 3. Guardar (Crear o Actualizar) ---
  const handleSave = async () => {
    const payload = {
      nombre: formData.nombre,
      sexo: formData.sexo,
      edadMeses: parseInt(formData.edadMeses), // Asegurarse que sea número
      estado: formData.estado,
      img: formData.img,
      raza: { idRaza: parseInt(formData.idRaza) },
      refugio: { idRefugio: parseInt(formData.idRefugio) }
    };

    if (currentMascota) {
      payload.idMascota = currentMascota.idMascota;
    }

    try {
      const response = await fetch('http://localhost:8181/api/mascotas/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la mascota.');
      }
      
      toast({ title: '¡Guardado!', status: 'success' });
      onClose();
      fetchData(); // Recargar la lista
      
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };
  
  // --- 4. Manejar cambios en el formulario ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Mensaje mientras carga
  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }
  
  // Mensaje si no hay datos para los <Select>
  if (razas.length === 0 || refugios.length === 0) {
    return <Text color="red.500">Error: No se pudieron cargar las Razas o Refugios. 
      Asegúrate que el backend esté conectado a la base de datos y que esas tablas no estén vacías.</Text>
  }

  return (
    <Box>
      <Button leftIcon={<AddIcon />} colorScheme="blue" mb={4} onClick={() => handleOpenModal()}>
        Crear Nueva Mascota
      </Button>

      {/* --- Tabla de Mascotas --- */}
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Estado</Th>
            <Th>Raza</Th>
            <Th>Refugio</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mascotas.map(m => (
            <Tr key={m.idMascota}>
              <Td>{m.nombre}</Td>
              <Td>{m.estado}</Td>
              <Td>{m.raza?.nombre || 'N/A'}</Td>
              <Td>{m.refugio?.nombre || 'N/A'}</Td>
              <Td>
                <IconButton 
                  icon={<EditIcon />} 
                  aria-label="Editar" 
                  mr={2}
                  onClick={() => handleOpenModal(m)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* --- Modal para Crear/Editar --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentMascota ? 'Editar Mascota' : 'Crear Mascota'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Refugio</FormLabel>
                <Select name="idRefugio" value={formData.idRefugio} onChange={handleChange}>
                  {refugios.map(ref => (
                    <option key={ref.idRefugio} value={ref.idRefugio}>{ref.nombre}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Raza</FormLabel>
                <Select name="idRaza" value={formData.idRaza} onChange={handleChange}>
                  {razas.map(raza => (
                    <option key={raza.idRaza} value={raza.idRaza}>{raza.nombre}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select name="estado" value={formData.estado} onChange={handleChange}>
                  <option value="EN_REFUGIO">En Refugio</option>
                  <option value="EN_PROCESO_ADOPCION">En Proceso</option>
                  <option value="ADOPTADA">Adoptada</option>
                  <option value="OTRO">Otro</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>URL de Imagen</FormLabel>
                <Input name="img" value={formData.img} onChange={handleChange} placeholder="/images/pets/nombre.png" />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Sexo</FormLabel>
                <Select name="sexo" value={formData.sexo} onChange={handleChange}>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                  <option value="DESCONOCIDO">Desconocido</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Edad (en meses)</FormLabel>
                <Input name="edadMeses" type="number" value={formData.edadMeses} onChange={handleChange} />
              </FormControl>

            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default AdminMascotas;