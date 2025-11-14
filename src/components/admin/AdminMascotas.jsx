import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  HStack,
  SimpleGrid,
  Heading
} from '@chakra-ui/react';
import { AddIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminMascotas = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  
  const [mascotas, setMascotas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  
  // --- CAMBIO 1: Añadir estado para Especies ---
  const [especies, setEspecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [currentMascota, setCurrentMascota] = useState(null); 
  
  // --- CAMBIO 2: Añadir estados para el filtro ---
  const [selectedEspecieId, setSelectedEspecieId] = useState('');
  const [filteredRazas, setFilteredRazas] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    sexo: '',
    edadMeses: 0,
    estado: '',
    img: '',
    idRaza: '',
    idRefugio: ''
  });

  // --- CAMBIO 3: Cargar Especies además de lo demás ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const mascotasRes = await fetch('http://localhost:8181/api/mascotas/getAll', { headers });
      const mascotasData = await mascotasRes.json();
      setMascotas(mascotasData);

      // Cargar todas las razas (las usaremos para filtrar)
      const razasRes = await fetch('http://localhost:8181/api/razas/getAll', { headers });
      if (!razasRes.ok) throw new Error('Error al cargar Razas');
      const razasData = await razasRes.json();
      setRazas(razasData); // <-- Lista maestra de razas

      // Cargar todas las especies
      const especiesRes = await fetch('http://localhost:8181/api/especies/getAll', { headers });
      if (!especiesRes.ok) throw new Error('Error al cargar Especies');
      const especiesData = await especiesRes.json();
      setEspecies(especiesData); // <-- Lista de especies para el nuevo <Select>

      const refugiosRes = await fetch('http://localhost:8181/api/refugios/getAll', { headers });
      if (!refugiosRes.ok) throw new Error('Error al cargar Refugios');
      const refugiosData = await refugiosRes.json();
      setRefugios(refugiosData);
      
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

  // --- CAMBIO 4: useEffect para filtrar razas cuando cambia la especie ---
  useEffect(() => {
    if (selectedEspecieId) {
      // Filtra la lista maestra de razas
      const newFilteredRazas = razas.filter(
        r => r.especie.idEspecie === parseInt(selectedEspecieId)
      );
      setFilteredRazas(newFilteredRazas);
    } else {
      setFilteredRazas([]); // Si no hay especie, no hay razas
    }
  }, [selectedEspecieId, razas]); // Se ejecuta si cambia la especie o la lista de razas


  // --- CAMBIO 5: Lógica de formulario actualizada ---
  
  const resetForm = () => {
    setFormData({
      nombre: '', sexo: '', edadMeses: 0, estado: '',
      img: '', idRaza: '', idRefugio: ''
    });
    setSelectedEspecieId(''); // <-- Resetear especie
  };

  const handleShowCreateRow = () => {
    resetForm();
    setCurrentMascota(null);
    setIsCreating(true);
    onClose(); 
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    resetForm();
  };

  // Actualizado para setear la especie al abrir el modal de edición
  const handleOpenEditModal = (mascota) => {
    // Encontrar la raza completa para saber su especie
    const razaCompleta = razas.find(r => r.idRaza === mascota.raza.idRaza);
    const especieId = razaCompleta ? razaCompleta.especie.idEspecie.toString() : '';
    
    // 1. Setear la especie (esto dispara el useEffect y filtra las razas)
    setSelectedEspecieId(especieId);
    
    // 2. Setear los datos del formulario (incluyendo la raza correcta)
    setCurrentMascota(mascota);
    setFormData({
      idMascota: mascota.idMascota, 
      nombre: mascota.nombre,
      sexo: mascota.sexo,
      edadMeses: mascota.edadMeses,
      estado: mascota.estado,
      img: mascota.img,
      idRaza: mascota.raza.idRaza,
      idRefugio: mascota.refugio.idRefugio
    });
    setIsCreating(false); 
    onOpen(); 
  };

  // --- CAMBIO 6: Handler para el cambio de Especie (resetea la raza) ---
  const handleSpeciesChange = (e) => {
    const newEspecieId = e.target.value;
    setSelectedEspecieId(newEspecieId);
    // Forzar al usuario a re-elegir una raza
    setFormData(prev => ({ ...prev, idRaza: '' })); 
  };

  // (handleSave y handleChange sin cambios)
  const handleSave = async () => {
    const payload = {
      idMascota: formData.idMascota || null, 
      nombre: formData.nombre,
      sexo: formData.sexo,
      edadMeses: parseInt(formData.edadMeses),
      estado: formData.estado,
      img: formData.img,
      raza: { idRaza: parseInt(formData.idRaza) },
      refugio: { idRefugio: parseInt(formData.idRefugio) }
    };

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
      fetchData(); 
      onClose();
      handleCancelCreate(); 
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ... (isLoading y chequeo de razas/refugios sin cambios) ...
  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }
  // Añadimos 'especies.length === 0' a la validación
  if (razas.length === 0 || refugios.length === 0 || especies.length === 0) {
    return (
       <VStack spacing={4} align="start">
        <Text color="red.500" fontWeight="bold" fontSize="lg">
          No se pueden crear mascotas todavía.
        </Text>
        <Text>Para registrar una mascota, primero debes asegurarte de que exista al menos:</Text>
        <Box pl={4}>
          <Text as="li">Un **Refugio** (en la pestaña 'Refugio').</Text>
          <Text as="li">Una **Especie** (en la pestaña 'Especies').</Text>
          <Text as="li">Una **Raza** (en la pestaña 'Razas').</Text>
        </Box>
      </VStack>
    )
  }

  // --- CAMBIO 7: Añadir el <Select> de Especie al formulario inline ---
  const InlineFormRow = () => (
    <Tr bg="gray.50">
      <Td colSpan={5}>
        <VStack spacing={4} align="stretch" p={4}>
          <Heading size="md" textAlign="center">Crear Nueva Mascota</Heading>
          
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input name="nombre" value={formData.nombre} onChange={handleChange} bg="white" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Refugio</FormLabel>
              <Select 
                name="idRefugio" 
                value={formData.idRefugio} 
                onChange={handleChange} 
                bg="white" 
                placeholder="Seleccionar..."
              >
                {refugios.map(ref => (
                  <option key={ref.idRefugio} value={ref.idRefugio}>{ref.nombre}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} spacing={4}>
            {/* --- NUEVO CAMPO ESPECIAS --- */}
            <FormControl isRequired>
              <FormLabel>Especie</FormLabel>
              <Select 
                value={selectedEspecieId} 
                onChange={handleSpeciesChange} // <-- Usa el handler especial
                bg="white" 
                placeholder="Seleccionar..."
              >
                {/* Filtramos solo las activas */}
                {especies.filter(e => e.estado === 'ACTIVO').map(e => (
                  <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>
                ))}
              </Select>
            </FormControl>
            
            {/* --- CAMPO RAZA MODIFICADO --- */}
            <FormControl isRequired>
              <FormLabel>Raza</FormLabel>
              <Select 
                name="idRaza" 
                value={formData.idRaza} 
                onChange={handleChange} 
                bg="white" 
                placeholder={selectedEspecieId ? "Seleccionar..." : "Elige una especie primero"}
                isDisabled={!selectedEspecieId} // <-- Deshabilitado si no hay especie
              >
                {/* Mapea las razas FILTRADAS y activas */}
                {filteredRazas.filter(r => r.estado === 'ACTIVO').map(raza => (
                  <option key={raza.idRaza} value={raza.idRaza}>{raza.nombre}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired>
            <FormLabel>Estado</FormLabel>
            <Select 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
              bg="white" 
              placeholder="Seleccionar..."
            >
              <option value="EN_REFUGIO">En Refugio</option>
              <option value="EN_PROCESO_ADOPCION">En Proceso</option>
              <option value="ADOPTADA">Adoptada</option>
              <option value="OTRO">Otro</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>URL de Imagen</FormLabel>
            <Input name="img" value={formData.img} onChange={handleChange} placeholder="/images/pets/nombre.png" bg="white" />
          </FormControl>
          
          <SimpleGrid columns={2} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Sexo</FormLabel>
              <Select 
                name="sexo" 
                value={formData.sexo} 
                onChange={handleChange} 
                bg="white" 
                placeholder="Seleccionar..."
              >
                <option value="M">Macho</option>
                <option value="F">Hembra</option>
                <option value="DESCONOCIDO">Desconocido</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Edad (en meses)</FormLabel>
              <Input name="edadMeses" type="number" value={formData.edadMeses} onChange={handleChange} bg="white" />
            </FormControl>
          </SimpleGrid>

          <HStack justify="flex-end" mt={4}>
            <Button variant="ghost" onClick={handleCancelCreate} leftIcon={<CloseIcon />}>Cancelar</Button>
            <Button 
              bg="brand.800"
              color="white"
              _hover={{ bg: 'brand.900' }}
              onClick={handleSave} 
              leftIcon={<CheckIcon />}
            >
              Guardar Mascota
            </Button>
          </HStack>
        </VStack>
      </Td>
    </Tr>
  );

  // ... (El return de la tabla principal sin cambios) ...
  return (
    <Box>
      <Button 
        leftIcon={<AddIcon />} 
        bg="brand.800"
        color="white"
        _hover={{ bg: 'brand.900' }}
        mb={4} 
        onClick={handleShowCreateRow}
        isDisabled={isCreating} 
      >
        Crear Nueva Mascota
      </Button>

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
          {isCreating && <InlineFormRow />}

          {mascotas.length === 0 && !isCreating && (
            <Tr>
              <Td colSpan={5} textAlign="center">
                <Text color="gray.500">No hay mascotas agregadas. ¡Crea la primera!</Text>
              </Td>
            </Tr>
          )}

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
                  colorScheme="teal"
                  onClick={() => handleOpenEditModal(m)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* --- CAMBIO 8: Añadir el <Select> de Especie al MODAL DE EDICIÓN --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Mascota: {currentMascota?.nombre}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} bg="white" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Refugio</FormLabel>
                  <Select 
                    name="idRefugio" 
                    value={formData.idRefugio} 
                    onChange={handleChange} 
                    bg="white" 
                    placeholder="Seleccionar..."
                  >
                    {refugios.map(ref => (
                      <option key={ref.idRefugio} value={ref.idRefugio}>{ref.nombre}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                {/* --- NUEVO CAMPO ESPECIAS (Modal) --- */}
                <FormControl isRequired>
                  <FormLabel>Especie</FormLabel>
                  <Select 
                    value={selectedEspecieId} 
                    onChange={handleSpeciesChange} // <-- Usa el handler especial
                    bg="white" 
                    placeholder="Seleccionar..."
                  >
                    {especies.filter(e => e.estado === 'ACTIVO').map(e => (
                      <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>
                    ))}
                  </Select>
                </FormControl>

                {/* --- CAMPO RAZA MODIFICADO (Modal) --- */}
                <FormControl isRequired>
                  <FormLabel>Raza</FormLabel>
                  <Select 
                    name="idRaza" 
                    value={formData.idRaza} 
                    onChange={handleChange} 
                    bg="white" 
                    placeholder={selectedEspecieId ? "Seleccionar..." : "Elige una especie primero"}
                    isDisabled={!selectedEspecieId} // <-- Deshabilitado
                  >
                    {/* Mapea las razas FILTRADAS y activas */}
                    {filteredRazas.filter(r => r.estado === 'ACTIVO').map(raza => (
                      <option key={raza.idRaza} value={raza.idRaza}>{raza.nombre}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select 
                  name="estado" 
                  value={formData.estado} 
                  onChange={handleChange} 
                  bg="white" 
                  placeholder="Seleccionar..."
                >
                  <option value="EN_REFUGIO">En Refugio</option>
                  <option value="EN_PROCESO_ADOPCION">En Proceso</option>
                  <option value="ADOPTADA">Adoptada</option>
                  <option value="OTRO">Otro</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>URL de Imagen</FormLabel>
                <Input name="img" value={formData.img} onChange={handleChange} placeholder="/images/pets/nombre.png" bg="white" />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Sexo</FormLabel>
                  <Select 
                    name="sexo" 
                    value={formData.sexo} 
                    onChange={handleChange} 
                    bg="white" 
                    placeholder="Seleccionar..."
                  >
                    <option value="M">Macho</option>
                    <option value="F">Hembra</option>
                    <option value="DESCONOCIDO">Desconocido</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Edad (en meses)</FormLabel>
                  <Input name="edadMeses" type="number" value={formData.edadMeses} onChange={handleChange} bg="white" />
                </FormControl>
              </SimpleGrid>
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
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminMascotas;