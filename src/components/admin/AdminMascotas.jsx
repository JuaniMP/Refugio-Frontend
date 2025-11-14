import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  HStack,
  SimpleGrid,
  Heading,
  Image 
} from '@chakra-ui/react';
import { AddIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// Función: Formateador de Edad
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
  
  const [mascotas, setMascotas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [selectedEspecieId, setSelectedEspecieId] = useState('');
  const [filteredRazas, setFilteredRazas] = useState([]);

  const [ageUnit, setAgeUnit] = useState('meses');
  const [ageValue, setAgeValue] = useState(0);

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1); 
  const yearOptions = Array.from({ length: 30 }, (_, i) => i + 1); 

  const [formData, setFormData] = useState({
    nombre: '', sexo: '', edadMeses: 0, estado: '',
    img: '', idRaza: '', idRefugio: ''
  });

  // --- LÓGICA DE CARGA DE DATOS ---
  const fetchData = async () => {
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
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  // --- CORRECCIÓN CRUCIAL: FILTRO DE RAZAS POR ESTADO DE ESPECIE ---
  // Este useEffect filtra las razas disponibles y maneja la lógica de desactivación
  useEffect(() => {
    // 1. Encuentra el objeto especie completo
    const selectedEspecie = especies.find(e => e.idEspecie === parseInt(selectedEspecieId));
    const isEspecieActive = selectedEspecie?.estado === 'ACTIVO';
    
    // Si no hay especie seleccionada O la especie seleccionada está INACTIVO
    if (!selectedEspecieId || !isEspecieActive) { 
        setFilteredRazas([]); 
        // Si el campo de raza tiene un valor, lo reseteamos para forzar la validación
        if (formData.idRaza) {
            setFormData(prev => ({ ...prev, idRaza: '' }));
        }
    } else {
        // Si la especie está ACTIVO, filtramos las razas
        const newFilteredRazas = razas.filter(r => r.especie.idEspecie === parseInt(selectedEspecieId));
        setFilteredRazas(newFilteredRazas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEspecieId, razas, especies, setFormData]); 

  // Hook para calcular Edad en Meses
  useEffect(() => {
    const numericValue = parseInt(ageValue) || 0;
    if (ageUnit === 'anios') {
      setFormData(prev => ({ ...prev, edadMeses: numericValue * 12 }));
    } else {
      setFormData(prev => ({ ...prev, edadMeses: numericValue }));
    }
  }, [ageUnit, ageValue]);

  
  // --- LÓGICA DEL FORMULARIO Y HANDLERS ---
  const resetForm = () => {
    setFormData({
      nombre: '', sexo: '', edadMeses: 0, estado: '',
      img: '', idRaza: '', idRefugio: ''
    });
    setSelectedEspecieId('');
    setAgeUnit('meses');
    setAgeValue(0);
  };

  const handleShowCreateRow = () => {
    resetForm();
    setIsCreating(true);
    setEditingId(null); 
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    resetForm();
  };

  const handleStartEdit = (mascota) => {
    const { edadMeses } = mascota;
    
    if (edadMeses > 12 && edadMeses % 12 === 0 && edadMeses / 12 <= 30) {
      setAgeUnit('anios');
      setAgeValue(edadMeses / 12);
    } else {
      setAgeUnit('meses');
      setAgeValue(edadMeses || 0);
    }

    const razaCompleta = razas.find(r => r.idRaza === mascota.raza.idRaza);
    const especieId = razaCompleta ? razaCompleta.especie.idEspecie.toString() : '';
    setSelectedEspecieId(especieId);
    
    setFormData({
      ...mascota,
      idMascota: mascota.idMascota,
      sexo: mascota.sexo || '',
      estado: mascota.estado || '',
      idRaza: mascota.raza.idRaza,
      idRefugio: mascota.refugio.idRefugio
    });

    setEditingId(mascota.idMascota);
    setIsCreating(false); 
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

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

    if (!payload.sexo || !payload.estado || !payload.idRaza || !payload.idRefugio) {
      toast({ title: 'Faltan campos obligatorios', description: 'Por favor, revisa los campos con *', status: 'error' });
      return;
    }
    if (payload.edadMeses === 0) {
      toast({ title: 'La edad no puede ser 0', status: 'error' });
      return;
    }

    try {
      // Nota: Aquí necesitarías pasar el token de autorización, ya que el backend lo espera.
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
      handleCancelCreate(); 
      handleCancelEdit();
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // --- Componente de Fila de Formulario ---
  const MascotaFormRow = ({ isEditing }) => {
    
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
      <Tr bg="gray.50">
        <Td colSpan={9}>
          <VStack spacing={4} align="stretch" p={4}>
            <Heading size="md" textAlign="center">
              {isEditing ? `Editando Mascota: ${formData.nombre}` : "Crear Nueva Mascota"}
            </Heading>
            
            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} bg="white" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Refugio</FormLabel>
                <Select name="idRefugio" value={formData.idRefugio} onChange={handleChange} bg="white" placeholder="Seleccionar...">
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
                  onChange={(e) => { handleSpeciesChange(e); setAgeValue(0); }}
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
                  onChange={handleChange} 
                  bg="white" 
                  placeholder={selectedEspecieId ? "Seleccionar..." : "Elige una especie primero"}
                  isDisabled={!selectedEspecieId} 
                >
                  {filteredRazas.filter(r => r.estado === 'ACTIVO').map(raza => (
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
                <Select name="sexo" value={formData.sexo} onChange={handleChange} bg="white" placeholder="Seleccionar...">
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                  <option value="DESCONOCIDO">Desconocido</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Unidad Edad</FormLabel>
                <Select 
                  value={ageUnit} 
                  onChange={(e) => { setAgeUnit(e.target.value); setAgeValue(0); }} 
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
                  onChange={(e) => setAgeValue(e.target.value)} 
                  bg="white"
                  placeholder="Elegir..."
                >
                  {isEditing ? renderOptionsParaEditar() : renderOptions()}
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>Estado</FormLabel>
              <Select name="estado" value={formData.estado} onChange={handleChange} bg="white" placeholder="Seleccionar...">
                <option value="EN_REFUGIO">En Refugio</option>
                <option value="EN_PROCESO_ADOPCION">En Proceso</option>
                <option value="ADOPTADA">Adoptada</option>
                <option value="OTRO">Otro</option>
              </Select>
            </FormControl>

            <HStack justify="flex-end" mt={4}>
              <Button 
                variant="ghost" 
                onClick={isEditing ? handleCancelEdit : handleCancelCreate} 
                leftIcon={<CloseIcon />}
              >
                Cancelar
              </Button>
              <Button 
                bg="brand.800"
                color="white"
                _hover={{ bg: 'brand.900' }}
                onClick={handleSave} 
                leftIcon={<CheckIcon />}
              >
                {isEditing ? "Guardar Cambios" : "Guardar Mascota"}
              </Button>
            </HStack>
          </VStack>
        </Td>
      </Tr>
    );
  };
  
  // --- Componente de Fila de Mascota ---
  const MascotaRow = ({ mascota }) => (
    <Tr key={mascota.idMascota}>
      <Td>{mascota.idMascota}</Td>
      <Td>
        {mascota.img ? (
          <Image src={mascota.img} alt={mascota.nombre} boxSize="50px" objectFit="cover" borderRadius="md" />
        ) : (
          <Text fontSize="xs" color="gray.500">Sin imagen</Text>
        )}
      </Td>
      <Td>{mascota.nombre}</Td>
      <Td>{mascota.raza?.nombre || 'N/A'}</Td>
      <Td>{formatEdad(mascota.edadMeses)}</Td>
      <Td>{mascota.sexo}</Td>
      <Td>{mascota.refugio?.nombre || 'N/A'}</Td>
      <Td>{mascota.estado}</Td>
      <Td>
        <IconButton 
          icon={<EditIcon />} 
          aria-label="Editar" 
          mr={2}
          colorScheme="teal"
          onClick={() => handleStartEdit(mascota)}
        />
      </Td>
    </Tr>
  );

  return (
    <Box>
      <Button 
        leftIcon={<AddIcon />} 
        bg="brand.800"
        color="white"
        _hover={{ bg: 'brand.900' }}
        mb={4} 
        onClick={handleShowCreateRow}
        isDisabled={isCreating || editingId} 
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
          {isCreating && <MascotaFormRow isEditing={false} />}

          {mascotas.length === 0 && !isCreating && (
            <Tr>
              <Td colSpan={9} textAlign="center">
                <Text color="gray.500">No hay mascotas agregadas. ¡Crea la primera!</Text>
              </Td>
            </Tr>
          )}

          {mascotas.map(m => (
            editingId === m.idMascota
              ? <MascotaFormRow key={m.idMascota} isEditing={true} />
              : <MascotaRow key={m.idMascota} mascota={m} />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AdminMascotas;