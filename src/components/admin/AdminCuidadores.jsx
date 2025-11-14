import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  HStack, Heading, FormErrorMessage, Stepper, Step, StepIndicator,
  StepStatus, StepTitle, StepDescription, StepIcon, StepSeparator, useSteps
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- Listas predefinidas ---
const zonasOptions = [
  'Patio Perros Grandes', 'Patio Perros Pequeños', 'Área de Gatos (Adultos)', 
  'Área de Gatos (Gatitos)', 'Sala de Cuarentena', 'Recepción', 'Área Post-Operatoria'
];
const turnoOptions = ['MAÑANA', 'TARDE', 'NOCHE'];
// --- Fin Listas ---

// --- Componente de Formulario (Wizard) ---
const CuidadorFormWizard = ({ formData, formErrors, handleChange, refugios }) => {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: 3 });

  const handleNextStep1 = () => setActiveStep(1);
  const handleNextStep2 = () => setActiveStep(2);
  const handleBackStep = () => setActiveStep(prev => prev - 1);

  return (
    <VStack spacing={4}>
      <Stepper index={activeStep} mb={6} width="100%">
        <Step>
          <StepIndicator><StepStatus complete={<StepIcon />} /></StepIndicator>
          <Box flexShrink='0'>
            <StepTitle>Datos Personales</StepTitle>
            <StepDescription>Información básica</StepDescription>
          </Box>
          <StepSeparator />
        </Step>
        <Step>
          <StepIndicator><StepStatus complete={<StepIcon />} /></StepIndicator>
          <Box flexShrink='0'>
            <StepTitle>Datos del Rol</StepTitle>
            <StepDescription>Turno y Zona</StepDescription>
          </Box>
          <StepSeparator />
        </Step>
        <Step>
          <StepIndicator><StepStatus complete={<StepIcon />} /></StepIndicator>
          <Box flexShrink='0'>
            <StepTitle>Cuenta de Usuario</StepTitle>
            <StepDescription>Acceso al sistema</StepDescription>
          </Box>
        </Step>
      </Stepper>

      {/* --- PASO 1: DATOS PERSONALES (EMPLEADO) --- */}
      {activeStep === 0 && (
        <VStack spacing={4} width="100%">
          <FormControl isRequired isInvalid={!!formErrors.nombre}>
            <FormLabel>Nombre Completo</FormLabel>
            <Input name="nombre" value={formData.nombre} onChange={handleChange} />
            <FormErrorMessage>{formErrors.nombre}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!formErrors.cedula}>
            <FormLabel>Cédula</FormLabel>
            <Input name="cedula" value={formData.cedula} onChange={handleChange} inputMode="numeric" />
            <FormErrorMessage>{formErrors.cedula}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!formErrors.telefono}>
            <FormLabel>Teléfono (10 dígitos)</FormLabel>
            <Input name="telefono" value={formData.telefono} onChange={handleChange} inputMode="numeric" />
            <FormErrorMessage>{formErrors.telefono}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!formErrors.idRefugio}>
            <FormLabel>Refugio Asignado</FormLabel>
            <Select name="idRefugio" value={formData.idRefugio} onChange={handleChange} placeholder="Seleccionar...">
              {refugios.map(r => <option key={r.idRefugio} value={r.idRefugio}>{r.nombre}</option>)}
            </Select>
            <FormErrorMessage>{formErrors.idRefugio}</FormErrorMessage>
          </FormControl>
          <Button onClick={handleNextStep1} bg="brand.700" color="white" _hover={{ bg: 'brand.900' }} alignSelf="flex-end">Siguiente</Button>
        </VStack>
      )}

      {/* --- PASO 2: DATOS DEL ROL (CUIDADOR) --- */}
      {activeStep === 1 && (
        <VStack spacing={4} width="100%">
          <FormControl isRequired isInvalid={!!formErrors.turno}>
            <FormLabel>Turno</FormLabel>
            <Select name="turno" value={formData.turno} onChange={handleChange} placeholder="Seleccionar...">
              {turnoOptions.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </Select>
            <FormErrorMessage>{formErrors.turno}</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!formErrors.zonaAsignada}>
            <FormLabel>Zona Asignada</FormLabel>
            <Select name="zonaAsignada" value={formData.zonaAsignada} onChange={handleChange} placeholder="Seleccionar...">
              {zonasOptions.map(z => <option key={z} value={z}>{z}</option>)}
            </Select>
            <FormErrorMessage>{formErrors.zonaAsignada}</FormErrorMessage>
          </FormControl>
          <HStack width="100%" justify="space-between">
            <Button onClick={handleBackStep} variant="ghost">Atrás</Button>
            <Button onClick={handleNextStep2} bg="brand.700" color="white" _hover={{ bg: 'brand.900' }}>Siguiente</Button>
          </HStack>
        </VStack>
      )}
      
      {/* --- PASO 3: DATOS DE USUARIO --- */}
      {activeStep === 2 && (
        <VStack spacing={4} width="100%">
          <FormControl isRequired isInvalid={!!formErrors.login}>
            <FormLabel>Correo Electrónico (Login)</FormLabel>
            <Input type="email" name="login" value={formData.login} onChange={handleChange} />
            <FormErrorMessage>{formErrors.login}</FormErrorMessage>
          </FormControl>
          <Text fontSize="sm" color="gray.500">
            Se creará un usuario con este correo y se enviará una contraseña temporal. 
            El cuidador deberá cambiarla en su primer inicio de sesión.
          </Text>
          <HStack width="100%" justify="space-between">
            <Button onClick={handleBackStep} variant="ghost">Atrás</Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};


// --- Componente Principal ---
const AdminCuidadores = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [cuidadores, setCuidadores] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCuidador, setCurrentCuidador] = useState(null);
  
  const initialFormData = {
    nombre: '', cedula: '', telefono: '', idRefugio: '',
    turno: '', zonaAsignada: '',
    login: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [cuidadoresRes, refugiosRes] = await Promise.all([
        fetch('http://localhost:8181/api/cuidadores/getAll', { headers }),
        fetch('http://localhost:8181/api/refugios/getAll', { headers })
      ]);
      
      if (!cuidadoresRes.ok || !refugiosRes.ok) throw new Error('Error al cargar datos');
      
      setCuidadores(await cuidadoresRes.json());
      setRefugios(await refugiosRes.json());
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchData();
  }, [fetchData, token]);

  const handleOpenModal = (cuidador = null) => {
    setFormErrors({});
    if (cuidador) {
      setCurrentCuidador(cuidador);
      setFormData({
        nombre: cuidador.empleado.nombre,
        cedula: cuidador.empleado.cedula,
        telefono: cuidador.empleado.telefono || '',
        idRefugio: cuidador.empleado.refugio.idRefugio,
        turno: cuidador.turno || 'MAÑANA',
        zonaAsignada: cuidador.zonaAsignada || '',
        login: cuidador.empleado.usuario ? cuidador.empleado.usuario.login : ''
      });
    } else {
      setCurrentCuidador(null);
      setFormData({
        ...initialFormData,
        idRefugio: refugios[0]?.idRefugio || ''
      });
    }
    onOpen();
  };

  const validateForm = () => {
    const errors = {};
    const cedulaRegex = /^[0-9]+$/;
    const nombreRegex = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/;
    
    if (!formData.nombre) errors.nombre = 'El nombre es obligatorio.';
    else if (!nombreRegex.test(formData.nombre)) errors.nombre = 'El nombre no puede contener números ni símbolos.';
    else if (formData.nombre.trim().indexOf(' ') === -1) errors.nombre = 'Por favor, ingresa nombre y apellido.';
    
    if (!formData.cedula) errors.cedula = 'La cédula es obligatoria.';
    else if (!cedulaRegex.test(formData.cedula)) errors.cedula = 'La cédula solo debe contener números.';
    else if (formData.cedula.length < 7 || formData.cedula.length > 10) errors.cedula = 'La cédula debe tener entre 7 y 10 dígitos.';
    
    if (formData.telefono && (!cedulaRegex.test(formData.telefono) || formData.telefono.length !== 10)) {
      errors.telefono = 'El teléfono debe ser numérico de 10 dígitos.';
    }
    if (!formData.idRefugio) errors.idRefugio = 'Debes seleccionar un refugio.';
    if (!formData.turno) errors.turno = 'Debes seleccionar un turno.';
    if (!formData.zonaAsignada) errors.zonaAsignada = 'Debes seleccionar una zona.';
    
    if (currentCuidador === null && !formData.login) {
       errors.login = 'El correo es obligatorio para crear el usuario.';
    } else if (formData.login && !/\S+@\S+\.\S+/.test(formData.login)) {
       errors.login = 'Correo inválido.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- LÓGICA DE GUARDADO (dividida en 3 funciones) ---
  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: 'Datos incompletos', description: 'Por favor, corrige los errores en el formulario.', status: 'error' });
      return;
    }

    if (currentCuidador) {
        await updateCuidador();
    } else {
        await createCuidador();
    }
  };

  const createCuidador = async () => {
    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono,
        idRefugio: parseInt(formData.idRefugio),
        login: formData.login,
        turno: formData.turno,
        zonaAsignada: formData.zonaAsignada,
      };

      const res = await fetch('http://localhost:8181/api/empleados/create-cuidador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el cuidador');
      }

      toast({ title: '¡Guardado!', description: 'Cuidador creado y correo enviado.', status: 'success' });
      onClose();
      fetchData();

    } catch (error) {
      toast({ title: 'Error al guardar', description: error.message, status: 'error' });
    }
  };

  const updateCuidador = async () => {
     try {
        const empleadoPayload = {
          idEmpleado: currentCuidador.idEmpleado,
          nombre: formData.nombre,
          cedula: formData.cedula,
          telefono: formData.telefono,
          refugio: { idRefugio: parseInt(formData.idRefugio) },
          usuario: currentCuidador.empleado.usuario
        };

        const empRes = await fetch('http://localhost:8181/api/empleados/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(empleadoPayload)
        });
        if (!empRes.ok) {
           const errorData = await empRes.json();
           throw new Error(`Error Empleado: ${errorData.message || 'Error (Cédula duplicada)'}`);
        }
        const savedEmpleado = await empRes.json();
        
        const cuidadorPayload = {
          idEmpleado: savedEmpleado.idEmpleado,
          turno: formData.turno,
          zonaAsignada: formData.zonaAsignada,
          empleado: { idEmpleado: savedEmpleado.idEmpleado }
        };

        const cuiRes = await fetch('http://localhost:8181/api/cuidadores/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(cuidadorPayload)
        });
        if (!cuiRes.ok) {
           const errorData = await cuiRes.json();
           throw new Error(`Error Rol: ${errorData.message || 'Error desconocido'}`);
        }

        toast({ title: '¡Actualizado!', description: 'Cuidador actualizado.', status: 'success' });
        onClose();
        fetchData(); 

     } catch (error) {
        toast({ title: 'Error al actualizar', description: error.message, status: 'error' });
     }
  };
  // --- FIN LÓGICA DE GUARDADO ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <Box>
      <Heading size="md" mb={4}>Lista de Cuidadores</Heading>
      <Button leftIcon={<AddIcon />} bg="brand.800" color="white" _hover={{ bg: 'brand.900' }} mb={4} onClick={() => handleOpenModal()}>
        Añadir Cuidador
      </Button>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Cédula</Th>
            <Th>Teléfono</Th>
            <Th>Refugio</Th>
            <Th>Turno</Th>
            <Th>Zona</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {cuidadores.map(cuidador => (
            <Tr key={cuidador.idEmpleado}>
              <Td>{cuidador.empleado.nombre}</Td>
              <Td>{cuidador.empleado.cedula}</Td>
              <Td>{cuidador.empleado.telefono || '-'}</Td>
              <Td>{cuidador.empleado.refugio.nombre}</Td>
              <Td>{cuidador.turno}</Td>
              <Td>{cuidador.zonaAsignada}</Td>
              <Td>
                <IconButton icon={<EditIcon />} onClick={() => handleOpenModal(cuidador)} mr={2} />
                <IconButton icon={<DeleteIcon />} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentCuidador ? 'Editar Cuidador' : 'Crear Cuidador'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentCuidador ? (
              <VStack spacing={4}>
                 <Heading size="sm" alignSelf="start">Datos Personales</Heading>
                 <FormControl isRequired isInvalid={!!formErrors.nombre}>
                   <FormLabel>Nombre Completo</FormLabel>
                   <Input name="nombre" value={formData.nombre} onChange={handleChange} />
                   <FormErrorMessage>{formErrors.nombre}</FormErrorMessage>
                 </FormControl>
                 <FormControl isRequired isInvalid={!!formErrors.cedula}>
                   <FormLabel>Cédula</FormLabel>
                   <Input name="cedula" value={formData.cedula} onChange={handleChange} inputMode="numeric" />
                   <FormErrorMessage>{formErrors.cedula}</FormErrorMessage>
                 </FormControl>
                 <FormControl isInvalid={!!formErrors.telefono}>
                   <FormLabel>Teléfono</FormLabel>
                   <Input name="telefono" value={formData.telefono} onChange={handleChange} inputMode="numeric" />
                   <FormErrorMessage>{formErrors.telefono}</FormErrorMessage>
                 </FormControl>
                 <FormControl isRequired isInvalid={!!formErrors.idRefugio}>
                   <FormLabel>Refugio Asignado</FormLabel>
                   <Select name="idRefugio" value={formData.idRefugio} onChange={handleChange} placeholder="Seleccionar...">
                     {refugios.map(r => <option key={r.idRefugio} value={r.idRefugio}>{r.nombre}</option>)}
                   </Select>
                   <FormErrorMessage>{formErrors.idRefugio}</FormErrorMessage>
                 </FormControl>
                 
                 <Heading size="sm" alignSelf="start" pt={4}>Datos del Rol</Heading>
                 <FormControl isRequired isInvalid={!!formErrors.turno}>
                   <FormLabel>Turno</FormLabel>
                   <Select name="turno" value={formData.turno} onChange={handleChange} placeholder="Seleccionar...">
                     {turnoOptions.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                   </Select>
                   <FormErrorMessage>{formErrors.turno}</FormErrorMessage>
                 </FormControl>
                 <FormControl isRequired isInvalid={!!formErrors.zonaAsignada}>
                   <FormLabel>Zona Asignada</FormLabel>
                   <Select name="zonaAsignada" value={formData.zonaAsignada} onChange={handleChange} placeholder="Seleccionar...">
                     {zonasOptions.map(z => <option key={z} value={z}>{z}</option>)}
                   </Select>
                   <FormErrorMessage>{formErrors.zonaAsignada}</FormErrorMessage>
                 </FormControl>
                 <FormControl isInvalid={!!formErrors.login}>
                   <FormLabel>Correo Electrónico (Login)</FormLabel>
                   <Input type="email" name="login" value={formData.login} onChange={handleChange} isDisabled={!!currentCuidador} />
                   {currentCuidador && <Text fontSize="xs" color="gray.500">El correo de un usuario existente no se puede cambiar aquí.</Text>}
                   <FormErrorMessage>{formErrors.login}</FormErrorMessage>
                 </FormControl>
              </VStack>
            ) : (
              <CuidadorFormWizard 
                formData={formData} 
                setFormData={setFormData} 
                formErrors={formErrors} 
                handleChange={handleChange} 
                refugios={refugios}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button bg="brand.800" color="white" _hover={{ bg: 'brand.900' }} onClick={handleSave}>
              {currentCuidador ? "Guardar Cambios" : "Crear Empleado"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminCuidadores;