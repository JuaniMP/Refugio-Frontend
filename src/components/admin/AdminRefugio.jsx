import {
  Box, Button, useToast, VStack, SimpleGrid, Spinner, Text,
  Heading, FormControl, FormLabel, Input,
  HStack, List, ListItem, IconButton, Alert, AlertIcon,
  Switch // <-- 1. Importar Switch
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminRefugio = () => {
  const { token } = useAuth();
  const toast = useToast();
  
  const [refugio, setRefugio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', direccion: '', responsable: ''
  });
  const [telefonos, setTelefonos] = useState([]);
  const [newTelefono, setNewTelefono] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- Cargar datos (Sin cambios) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const refugioRes = await fetch('http://localhost:8181/api/refugios/getAll', { headers });
      const refugiosData = await refugioRes.json();
      
      if (refugiosData.length > 0) {
        const mainRefugio = refugiosData[0];
        setRefugio(mainRefugio);
        setFormData(mainRefugio);

        const telefonosRes = await fetch('http://localhost:8181/api/telefonos-refugio/getAll', { headers });
        const telefonosData = await telefonosRes.json();
        setTelefonos(telefonosData.filter(t => t.idRefugio === mainRefugio.idRefugio));
        
      } else {
        setRefugio(null);
        setTelefonos([]);
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

  // --- Guardar info del refugio (Sin cambios) ---
  const handleSaveRefugio = async () => {
    const payload = { ...formData };
    if (refugio) {
      payload.idRefugio = refugio.idRefugio;
    }
    try {
      await fetch('http://localhost:8181/api/refugios/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      toast({ 
        title: refugio ? 'Refugio actualizado' : 'Refugio Creado',
        status: 'success' 
      });
      fetchData(); 
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };

  // --- Añadir teléfono (Sin cambios) ---
  const handleAddTelefono = async () => {
    if (!refugio || !newTelefono) return;
    const payload = {
      idRefugio: refugio.idRefugio,
      telefono: newTelefono,
      estado: 'ACTIVO' // Asegurarse de crearlo como ACTIVO
    };
    try {
      await fetch('http://localhost:8181/api/telefonos-refugio/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      toast({ title: 'Teléfono añadido', status: 'success' });
      setNewTelefono("");
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.message, status: 'error' });
    }
  };

  // --- 2. CAMBIO: de "Eliminar" a "Activar/Desactivar" ---
  const handleToggleTelefono = async (telefono) => {
    // Invertir el estado
    const nuevoEstado = telefono.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const payload = {
      ...telefono,
      estado: nuevoEstado
    };
    
    try {
      // Usamos 'save' para actualizar el estado, no 'delete'
      const response = await fetch('http://localhost:8181/api/telefonos-refugio/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No se pudo actualizar el estado.');
      
      toast({ title: `Teléfono ${nuevoEstado.toLowerCase()}`, status: 'success' });
      fetchData(); // Recargar lista
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    }
  };

  const handleRefugioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }
  
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
      
      {/* Columna 1: Info Refugio (Sin cambios) */}
      <VStack spacing={4} align="stretch">
         {/* ... (Todo el VStack de Información General es igual) ... */}
         <Heading size="lg" color="brand.900">
          {refugio ? 'Editar Información General' : 'Crear Refugio'}
        </Heading>
        {!refugio && (
          <Alert status="info">
            <AlertIcon />
            Aún no has creado un refugio. Llena este formulario para empezar.
          </Alert>
        )}
        <FormControl isRequired>
          <FormLabel>Nombre del Refugio</FormLabel>
          <Input name="nombre" value={formData.nombre} onChange={handleRefugioChange} bg="white" />
        </FormControl>
        <FormControl>
          <FormLabel>Dirección</FormLabel>
          <Input name="direccion" value={formData.direccion} onChange={handleRefugioChange} bg="white" />
        </FormControl>
        <FormControl>
          <FormLabel>Responsable</FormLabel>
          <Input name="responsable" value={formData.responsable} onChange={handleRefugioChange} bg="white" />
        </FormControl>
        <Button colorScheme="blue" onClick={handleSaveRefugio}>
          {refugio ? 'Actualizar Información' : 'Crear Refugio'}
        </Button>
      </VStack>

      {/* Columna 2: Teléfonos del Refugio */}
      <VStack spacing={4} align="stretch">
        <Heading size="lg" color="brand.900">Teléfonos de Contacto</Heading>
        
        {!refugio ? (
          <Alert status="warning">
            <AlertIcon />
            Debes crear un refugio antes de añadir teléfonos.
          </Alert>
        ) : (
          <>
            {/* Formulario añadir (Sin cambios) */}
            <HStack>
              <FormControl>
                <FormLabel>Añadir nuevo teléfono</FormLabel>
                <Input 
                  placeholder="Ej: 3001234567"
                  value={newTelefono}
                  onChange={(e) => setNewTelefono(e.target.value)}
                  bg="white"
                />
              </FormControl>
              <IconButton 
                icon={<AddIcon />} 
                colorScheme="green"
                aria-label="Añadir teléfono"
                onClick={handleAddTelefono}
                alignSelf="flex-end"
              />
            </HStack>

            {/* --- 3. CAMBIO: Lista de teléfonos con Switch --- */}
            <Heading size="md" color="brand.800" mt={6}>Gestionar Teléfonos</Heading>
            <List spacing={3} w="100%">
              {telefonos.map((tel) => (
                <ListItem key={tel.telefono} p={3} bg="white" shadow="sm" borderRadius="md" opacity={tel.estado === 'ACTIVO' ? 1 : 0.5}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" color="brand.900" textDecoration={tel.estado === 'ACTIVO' ? 'none' : 'line-through'}>
                      {tel.telefono}
                    </Text>
                    <Switch 
                      colorScheme="green"
                      isChecked={tel.estado === 'ACTIVO'}
                      onChange={() => handleToggleTelefono(tel)}
                    />
                  </HStack>
                </ListItem>
              ))}
              {telefonos.length === 0 && (
                <Text color="gray.500">No hay teléfonos registrados.</Text>
              )}
            </List>
          </>
        )}
      </VStack>
    </SimpleGrid>
  );
};

export default AdminRefugio;