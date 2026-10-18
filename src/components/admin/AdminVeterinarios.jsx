import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Input, Select, VStack, Spinner, Text,
  Heading, FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../../context/AuthContext';
import { ESPECIALIDADES } from '../../constants/refugio';
import EmpleadoFields from './personal/EmpleadoFields';
import PersonalFormWizard from './personal/PersonalFormWizard';
import { validarEmpleado } from './personal/validarEmpleado';
import { API_URL } from '../../config/api';

/** Campos propios del rol veterinario (paso 2 del asistente y edición). */
const CamposVeterinario = ({ formData, formErrors, handleChange }) => (
  <>
    <FormControl isRequired isInvalid={!!formErrors.especialidad}>
      <FormLabel>Especialidad</FormLabel>
      <Select name="especialidad" value={formData.especialidad} onChange={handleChange} placeholder="Seleccionar...">
        {ESPECIALIDADES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
      </Select>
      <FormErrorMessage>{formErrors.especialidad}</FormErrorMessage>
    </FormControl>
    <FormControl>
      <FormLabel>Registro Profesional</FormLabel>
      <Input name="registroProfesional" value={formData.registroProfesional} onChange={handleChange} />
    </FormControl>
  </>
);

// --- Componente Principal ---
const AdminVeterinarios = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [vets, setVets] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVet, setCurrentVet] = useState(null);
  
  const initialFormData = {
    nombre: '', cedula: '', telefono: '', idRefugio: '',
    especialidad: '', registroProfesional: '',
    login: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [vetsRes, refugiosRes] = await Promise.all([
        fetch(`${API_URL}/veterinarios/getAll`, { headers }),
        fetch(`${API_URL}/refugios/getAll`, { headers })
      ]);
      
      if (!vetsRes.ok || !refugiosRes.ok) throw new Error('Error al cargar datos');
      
      setVets(await vetsRes.json());
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

  const handleOpenModal = (vet = null) => {
    setFormErrors({});
    if (vet) {
      setCurrentVet(vet);
      setFormData({
        nombre: vet.empleado.nombre,
        cedula: vet.empleado.cedula,
        telefono: vet.empleado.telefono || '',
        idRefugio: vet.empleado.refugio.idRefugio,
        especialidad: vet.especialidad || '',
        registroProfesional: vet.registroProfesional || '',
        login: vet.empleado.usuario ? vet.empleado.usuario.login : ''
      });
    } else {
      setCurrentVet(null);
      setFormData({
        ...initialFormData,
        idRefugio: refugios[0]?.idRefugio || ''
      });
    }
    onOpen();
  };

  const validateForm = () => {
    const errors = validarEmpleado(formData, currentVet === null);
    if (!formData.especialidad) errors.especialidad = 'Debes seleccionar una especialidad.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({ title: 'Datos incompletos', description: 'Por favor, corrige los errores en el formulario.', status: 'error' });
      return;
    }

    if (currentVet) {
        await updateVet();
    } else {
        await createVet();
    }
  };

  const createVet = async () => {
    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono,
        idRefugio: parseInt(formData.idRefugio),
        login: formData.login,
        especialidad: formData.especialidad,
        registroProfesional: formData.registroProfesional,
      };

      const res = await fetch(`${API_URL}/empleados/create-vet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear el veterinario');
      }

      toast({ title: '¡Guardado!', description: 'Veterinario creado y correo enviado.', status: 'success' });
      onClose();
      fetchData();

    } catch (error) {
      toast({ title: 'Error al guardar', description: error.message, status: 'error' });
    }
  };

  const updateVet = async () => {
     try {
        const empleadoPayload = {
          idEmpleado: currentVet.idEmpleado,
          nombre: formData.nombre,
          cedula: formData.cedula,
          telefono: formData.telefono,
          refugio: { idRefugio: parseInt(formData.idRefugio) },
          usuario: currentVet.empleado.usuario
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
        
        const vetPayload = {
          idEmpleado: savedEmpleado.idEmpleado,
          especialidad: formData.especialidad,
          registroProfesional: formData.registroProfesional,
          empleado: { idEmpleado: savedEmpleado.idEmpleado }
        };

        const vetRes = await fetch(`${API_URL}/veterinarios/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(vetPayload)
        });
        if (!vetRes.ok) {
           const errorData = await vetRes.json();
           throw new Error(`Error Rol: ${errorData.message || 'Error desconocido'}`);
        }

        toast({ title: '¡Actualizado!', description: 'Veterinario actualizado.', status: 'success' });
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
      <Heading size="md" mb={4}>Lista de Veterinarios</Heading>
      <Button leftIcon={<AddIcon />} bg="brand.800" color="white" _hover={{ bg: 'brand.900' }} mb={4} onClick={() => handleOpenModal()}>
        Añadir Veterinario
      </Button>

      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Cédula</Th>
            <Th>Teléfono</Th>
            <Th>Especialidad</Th>
            <Th>Refugio</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vets.map(vet => (
            <Tr key={vet.idEmpleado}>
              <Td>{vet.empleado.nombre}</Td>
              <Td>{vet.empleado.cedula}</Td>
              <Td>{vet.empleado.telefono || '-'}</Td>
              <Td>{vet.especialidad || '-'}</Td>
              <Td>{vet.empleado.refugio.nombre}</Td>
              <Td>
                <IconButton icon={<EditIcon />} size="sm" mr={2} onClick={() => handleOpenModal(vet)} />
                <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentVet ? 'Editar Veterinario' : 'Crear Veterinario'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {currentVet ? (
              <VStack spacing={4}>
                 <Heading size="sm" alignSelf="start">Datos Personales</Heading>
                 <EmpleadoFields formData={formData} formErrors={formErrors} handleChange={handleChange} refugios={refugios} />
                 <Heading size="sm" alignSelf="start" pt={4}>Datos del Rol</Heading>
                 <CamposVeterinario formData={formData} formErrors={formErrors} handleChange={handleChange} />
                 <FormControl isInvalid={!!formErrors.login}>
                   <FormLabel>Correo Electrónico (Login)</FormLabel>
                   <Input type="email" name="login" value={formData.login} onChange={handleChange} isDisabled={!!currentVet} />
                   {currentVet && <Text fontSize="xs" color="gray.500">El correo de un usuario existente no se puede cambiar aquí.</Text>}
                   <FormErrorMessage>{formErrors.login}</FormErrorMessage>
                 </FormControl>
              </VStack>
            ) : (
              <PersonalFormWizard
                formData={formData}
                formErrors={formErrors}
                handleChange={handleChange}
                refugios={refugios}
                nombreRol="veterinario"
                camposRol={<CamposVeterinario formData={formData} formErrors={formErrors} handleChange={handleChange} />}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button bg="brand.800" color="white" _hover={{ bg: 'brand.900' }} onClick={handleSave}>
              {currentVet ? "Guardar Cambios" : "Crear Empleado"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminVeterinarios;