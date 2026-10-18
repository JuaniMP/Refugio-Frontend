import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  Heading, FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TURNOS, ZONAS } from '../../constants/refugio';
import EmpleadoFields from './personal/EmpleadoFields';
import PersonalFormWizard from './personal/PersonalFormWizard';
import { validarEmpleado } from './personal/validarEmpleado';
import { API_URL } from '../../config/api';

/** Campos propios del rol cuidador (paso 2 del asistente y edición). */
const CamposCuidador = ({ formData, formErrors, handleChange }) => (
  <>
    <FormControl isRequired isInvalid={!!formErrors.turno}>
      <FormLabel>Turno</FormLabel>
      <Select name="turno" value={formData.turno} onChange={handleChange} placeholder="Seleccionar...">
        {TURNOS.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
      </Select>
      <FormErrorMessage>{formErrors.turno}</FormErrorMessage>
    </FormControl>
    <FormControl isRequired isInvalid={!!formErrors.zonaAsignada}>
      <FormLabel>Zona Asignada</FormLabel>
      <Select name="zonaAsignada" value={formData.zonaAsignada} onChange={handleChange} placeholder="Seleccionar...">
        {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
      </Select>
      <FormErrorMessage>{formErrors.zonaAsignada}</FormErrorMessage>
    </FormControl>
  </>
);

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
        fetch(`${API_URL}/cuidadores/getAll`, { headers }),
        fetch(`${API_URL}/refugios/getAll`, { headers })
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
    const errors = validarEmpleado(formData, currentCuidador === null);
    if (!formData.turno) errors.turno = 'Debes seleccionar un turno.';
    if (!formData.zonaAsignada) errors.zonaAsignada = 'Debes seleccionar una zona.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

      const res = await fetch(`${API_URL}/empleados/create-cuidador`, {
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

        const empRes = await fetch(`${API_URL}/empleados/save`, {
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

        const cuiRes = await fetch(`${API_URL}/cuidadores/save`, {
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
                 <EmpleadoFields formData={formData} formErrors={formErrors} handleChange={handleChange} refugios={refugios} />
                 <Heading size="sm" alignSelf="start" pt={4}>Datos del Rol</Heading>
                 <CamposCuidador formData={formData} formErrors={formErrors} handleChange={handleChange} />
                 <FormControl isInvalid={!!formErrors.login}>
                   <FormLabel>Correo Electrónico (Login)</FormLabel>
                   <Input type="email" name="login" value={formData.login} onChange={handleChange} isDisabled={!!currentCuidador} />
                   {currentCuidador && <Text fontSize="xs" color="gray.500">El correo de un usuario existente no se puede cambiar aquí.</Text>}
                   <FormErrorMessage>{formErrors.login}</FormErrorMessage>
                 </FormControl>
              </VStack>
            ) : (
              <PersonalFormWizard
                formData={formData}
                formErrors={formErrors}
                handleChange={handleChange}
                refugios={refugios}
                nombreRol="cuidador"
                camposRol={<CamposCuidador formData={formData} formErrors={formErrors} handleChange={handleChange} />}
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