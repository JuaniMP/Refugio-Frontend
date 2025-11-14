import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, 
  FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  HStack,
  SimpleGrid,
  Heading,
  Image 
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

// ... (formatEdad sin cambios) ...
const formatEdad = (meses) => {
  if (!meses || meses <= 0) return 'N/A';
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  if (mesesRestantes === 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  return `${anios} ${anios === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
};


const AdminMascotas = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  
  const [mascotas, setMascotas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentMascota, setCurrentMascota] = useState(null);
  
  const [selectedEspecieId, setSelectedEspecieId] = useState('');
  const [filteredRazas, setFilteredRazas] = useState([]);

  const [ageUnit, setAgeUnit] = useState('meses');
  const [ageValue, setAgeValue] = useState(0);

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1); 
  const yearOptions = Array.from({ length: 30 }, (_, i) => i + 1); 

  const [formData, setFormData] = useState({
    nombre: '', sexo: '', estado: '',
    img: '', idRaza: '', idRefugio: ''
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [mascotasRes, razasRes, especiesRes, refugiosRes] = await Promise.all([
        fetch('http://localhost:8181/api/mascotas/getAll', { headers }),
        fetch('http://localhost:8181/api/razas/getAll', { headers }),
        fetch('http://localhost:8181/api/especies/getAll', { headers }),
        fetch('http://localhost:8181/api/refugios/getAll', { headers })
      ]);

      if (!razasRes.ok) throw new Error('Error al cargar Razas');
      if (!especiesRes.ok) throw new Error('Error al cargar Especies');
      if (!refugiosRes.ok) throw new Error('Error al cargar Refugios');

      setMascotas(await mascotasRes.json());
      setRazas(await razasRes.json());
      setEspecies(await especiesRes.json());
      setRefugios(await refugiosRes.json());
      
    } catch (error) {
      toast({ title: 'Error al cargar datos', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => { if (token) fetchData(); }, [fetchData, token]);

  // --- Lógica de Filtro de Raza (sin setFormData) ---
  useEffect(() => {
    const selectedEspecie = especies.find(e => e.idEspecie === parseInt(selectedEspecieId));
    const isEspecieActive = selectedEspecie?.estado === 'ACTIVO';
    
    let newFilteredRazas = [];
    if (selectedEspecieId && isEspecieActive) { 
        newFilteredRazas = razas.filter(r => 
            r.especie.idEspecie === parseInt(selectedEspecieId) && r.estado === 'ACTIVO'
        );
    }
    
    setFilteredRazas(newFilteredRazas);
    
    // Validar la raza actual *después* de filtrar
    const isCurrentRaceValid = newFilteredRazas.some(r => r.idRaza === parseInt(formData.idRaza));
    if (!isCurrentRaceValid && formData.idRaza) {
        setFormData(prev => ({ ...prev, idRaza: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEspecieId, razas, especies, formData.idRaza]); // formData.idRaza es necesario aquí

  
  // --- Lógica de Formulario ---
  const resetForm = () => {
    setFormData({
      nombre: '', sexo: '', estado: '',
      img: '', idRaza: '', idRefugio: ''
    });
    setSelectedEspecieId('');
    setFilteredRazas([]);
    setAgeUnit('meses');
    setAgeValue(0);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setCurrentMascota(null);
    onOpen();
  };
  
  const handleOpenEditModal = (mascota) => {
    const { edadMeses } = mascota;
    
    if (edadMeses >= 12 && edadMeses % 12 === 0 && edadMeses / 12 <= 30) {
      setAgeUnit('anios');
      setAgeValue(edadMeses / 12);
    } else {
      setAgeUnit('meses');
      setAgeValue(edadMeses || 0);
    }

    const razaCompleta = razas.find(r => r.idRaza === mascota.raza.idRaza);
    const especieId = razaCompleta ? razaCompleta.especie.idEspecie.toString() : '';
    
    // Filtramos las razas ANTES de setear el estado
    const razasFiltradas = razas.filter(r => r.especie.idEspecie === parseInt(especieId) && r.estado === 'ACTIVO');
    setFilteredRazas(razasFiltradas);
    
    setSelectedEspecieId(especieId);
    
    setFormData({
      idMascota: mascota.idMascota,
      nombre: mascota.nombre,
      sexo: mascota.sexo || '',
      estado: mascota.estado || '',
      img: mascota.img,
      idRaza: mascota.raza.idRaza,
      idRefugio: mascota.refugio.idRefugio
    });
    
    setCurrentMascota(mascota);
    onOpen(); 
  };

  // Se dispara AL CAMBIAR LA ESPECIE en el dropdown
  const handleSpeciesChange = (e) => {
    const newEspecieId = e.target.value;
    setSelectedEspecieId(newEspecieId); 
    setFormData(prev => ({ ...prev, idRaza: '' })); // Resetea la raza seleccionada
    // El useEffect [selectedEspecieId] se encargará de re-filtrar
  };

  // Handlers para los inputs (no causan re-render del useEffect de edad)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e) => {
     const { name, value } = e.target;
     setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleAgeUnitChange = (e) => setAgeUnit(e.target.value);
  const handleAgeValueChange = (e) => setAgeValue(e.target.value);


  // --- CÁLCULO Y VALIDACIÓN DENTRO DE handleSave ---
  const handleSave = async () => {
    
    const numericValue = parseInt(ageValue) || 0;
    const edadMesesCalculada = ageUnit === 'anios' ? numericValue * 12 : numericValue;

    if (!formData.nombre || !formData.sexo || !formData.estado || !formData.idRaza || !formData.idRefugio) {
      toast({ title: 'Faltan campos obligatorios', description: 'Por favor, revisa todos los campos con *', status: 'error' });
      return;
    }
    if (edadMesesCalculada < 0) { 
      toast({ title: 'La edad no es válida', status: 'error' });
      return;
    }

    const payload = {
      idMascota: currentMascota ? currentMascota.idMascota : null, 
      nombre: formData.nombre,
      sexo: formData.sexo,
      edadMeses: edadMesesCalculada, 
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
      
      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = 'Error desconocido del servidor.';
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }
      
      toast({ title: '¡Guardado!', status: 'success' });
      fetchData(); 
      onClose(); // Cerrar el modal

    } catch (error) {
      toast({ title: 'Error al Guardar', description: error.message, status: 'error' });
    }
  };
  

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }
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

  // --- 10. FUNCIONES DEL RENDER DE EDAD (MOVIDAS AFUERA) ---
  // Estas funciones ahora viven dentro del componente principal
  const renderOptions = () => {
    const options = ageUnit === 'anios' ? yearOptions : monthOptions;
    return options.map(val => (
      <option key={val} value={val}>{val}</option>
    ));
  };
  
  const renderOptionsParaEditar = () => {
    const options = ageUnit === 'anios' ? yearOptions : monthOptions;
    if (ageValue && !options.includes(parseInt(ageValue))) {
       options.push(parseInt(ageValue));
       options.sort((a,b) => a-b);
    }
    return options.map(val => (
      <option key={val} value={val}>{val}</option>
    ));
  };


  return (
    <Box>
      <Button 
        leftIcon={<AddIcon />} 
        bg="brand.800"
        color="white"
        _hover={{ bg: 'brand.900' }}
        mb={4} 
        onClick={handleOpenCreateModal} // Abre el modal
      >
        Crear Nueva Mascota
      </Button>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Imagen</Th>
            <Th>Nombre</Th>
            <Th>Raza</Th>
            <Th>Edad</Th>
            <Th>Sexo</Th>
            <Th>Refugio</Th>
            <Th>Estado</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mascotas.length === 0 && (
            <Tr>
              <Td colSpan={9} textAlign="center">
                <Text color="gray.500">No hay mascotas agregadas. ¡Crea la primera!</Text>
              </Td>
            </Tr>
          )}
          {mascotas.map(m => (
            <Tr key={m.idMascota}>
              <Td>{m.idMascota}</Td>
              <Td>
                {m.img ? (
                  <Image src={m.img} alt={m.nombre} boxSize="50px" objectFit="cover" borderRadius="md" />
                ) : (
                  <Text fontSize="xs" color="gray.500">Sin imagen</Text>
                )}
              </Td>
              <Td>{m.nombre}</Td>
              <Td>{m.raza?.nombre || 'N/A'}</Td>
              <Td>{formatEdad(m.edadMeses)}</Td>
              <Td>{m.sexo}</Td>
              <Td>{m.refugio?.nombre || 'N/A'}</Td>
              <Td>{m.estado}</Td>
              <Td>
                <IconButton 
                  icon={<EditIcon />} 
                  aria-label="Editar" 
                  mr={2}
                  colorScheme="teal"
                  onClick={() => handleOpenEditModal(m)} // <-- Abre el modal
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* --- El formulario AHORA VIVE EN EL MODAL --- */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentMascota ? "Editar Mascota" : "Crear Nueva Mascota"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch" p={4}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre</FormLabel>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} bg="white" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Refugio</FormLabel>
                  <Select name="idRefugio" value={formData.idRefugio} onChange={handleSelectChange} bg="white" placeholder="Seleccionar...">
                    {refugios.map(ref => (
                      <option key={ref.idRefugio} value={ref.idRefugio}>{ref.nombre}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Especie</FormLabel>
                  <Select 
                    value={selectedEspecieId} 
                    onChange={handleSpeciesChange} 
                    bg="white" 
                    placeholder="Seleccionar..."
                  >
                    {especies.filter(e => e.estado === 'ACTIVO').map(e => (
                      <option key={e.idEspecie} value={e.idEspecie}>{e.nombre}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Raza</FormLabel>
                  <Select 
                    name="idRaza" 
                    value={formData.idRaza} 
                    onChange={handleSelectChange} 
                    bg="white" 
                    placeholder={selectedEspecieId ? "Seleccionar..." : "Elige una especie primero"}
                    isDisabled={!selectedEspecieId || filteredRazas.length === 0} 
                  >
                    {filteredRazas.map(raza => (
                      <option key={raza.idRaza} value={raza.idRaza}>{raza.nombre}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>URL de Imagen</FormLabel>
                <Input name="img" value={formData.img} onChange={handleChange} placeholder="/images/pets/nombre.png" bg="white" />
              </FormControl>
              
              <SimpleGrid columns={3} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Sexo</FormLabel>
                  <Select name="sexo" value={formData.sexo} onChange={handleSelectChange} bg="white" placeholder="Seleccionar...">
                    <option value="M">Macho</option>
                    <option value="F">Hembra</option>
                    <option value="DESCONOCIDO">Desconocido</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Unidad Edad</FormLabel>
                  <Select 
                    value={ageUnit} 
                    onChange={handleAgeUnitChange} 
                    bg="white"
                  >
                    <option value="meses">Meses</option>
                    <option value="anios">Años</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Edad</FormLabel>
                  <Select 
                    value={ageValue} 
                    onChange={handleAgeValueChange}
                    bg="white"
                    placeholder="Elegir..."
                  >
                    <option key={0} value={0}>0</option> 
                    {/* --- 11. LLAMADA A LAS FUNCIONES CORREGIDAS --- */}
                    {currentMascota ? renderOptionsParaEditar() : renderOptions()}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select name="estado" value={formData.estado} onChange={handleSelectChange} bg="white" placeholder="Seleccionar...">
                  <option value="EN_REFUGIO">En Refugio</option>
                  <option value="EN_PROCESO_ADOPCION">En Proceso</option>
                  <option value="ADOPTADA">Adoptada</option>
                  <option value="OTRO">Otro</option>
                </Select>
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
              {currentMascota ? "Guardar Cambios" : "Guardar Mascota"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default AdminMascotas;