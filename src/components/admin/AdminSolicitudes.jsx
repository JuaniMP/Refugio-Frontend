import {
  Box, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, IconButton,
  Heading, Spinner, Text, Badge, VStack, HStack, Alert, AlertIcon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure,
  Textarea // <-- ¡CORRECCIÓN: Textarea AÑADIDO!
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ViewIcon, MinusIcon } from '@chakra-ui/icons'; 
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminSolicitudes = () => {
  const { token } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRequest, setCurrentRequest] = useState(null); 
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8181/api/solicitudes/getAll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar solicitudes');
      
      let data = await response.json();
      
      // Filtramos y ordenamos: Pendientes primero, luego por fecha
      data.sort((a, b) => {
        if (a.estado === 'PENDIENTE' && b.estado !== 'PENDIENTE') return -1;
        if (a.estado !== 'PENDIENTE' && b.estado === 'PENDIENTE') return 1;
        return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
      });
      
      setSolicitudes(data);
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (token) fetchSolicitudes();
  }, [token, fetchSolicitudes]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'orange';
      case 'APROBADA': return 'green';
      case 'RECHAZADA': return 'red';
      case 'CANCELADA': return 'gray'; 
      default: return 'gray';
    }
  };
  
  const formatFecha = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO');
  };

  const handleAction = async (id, action) => {
    setIsProcessing(true);
    let endpoint = '';
    let method = 'POST';
    let statusUpdate = ''; 

    if (action === 'APROBAR') {
      endpoint = `/api/solicitudes/${id}/aprobar`;
    } else if (action === 'RECHAZAR') {
      endpoint = `/api/solicitudes/save`;
      statusUpdate = 'RECHAZADA';
    } else if (action === 'CANCELAR') {
      endpoint = `/api/solicitudes/save`;
      statusUpdate = 'CANCELADA';
    } else {
        setIsProcessing(false);
        return;
    }

    let payload = {};
    if (action !== 'APROBAR') {
        const requestToUpdate = solicitudes.find(s => s.idSolicitud === id);
        if (!requestToUpdate) return;
        payload = {
            ...requestToUpdate,
            estado: statusUpdate 
        };
    }

    try {
      const response = await fetch(`http://localhost:8181${endpoint}`, {
        method: method,
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: action !== 'APROBAR' ? JSON.stringify(payload) : undefined 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${action.toLowerCase()}.`);
      }

      toast({ 
        title: action === 'APROBAR' ? 'Solicitud Aprobada' : action === 'RECHAZAR' ? 'Solicitud Rechazada' : 'Solicitud Cancelada', 
        status: 'success' 
      });
      fetchSolicitudes(); 
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (request) => {
      setCurrentRequest(request);
      onOpen();
  };

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Gestión de Solicitudes de Adopción</Heading>
      
      {solicitudes.length === 0 && (
         <Alert status='info'>
            <AlertIcon />
            No hay solicitudes de adopción registradas en el sistema.
         </Alert>
      )}

      {solicitudes.length > 0 && (
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Mascota (ID)</Th>
              <Th>Adoptante (ID)</Th>
              <Th>Fecha</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {solicitudes.map(s => (
              <Tr key={s.idSolicitud}>
                <Td>{s.idSolicitud}</Td>
                <Td>{s.mascota.nombre} ({s.mascota.idMascota})</Td>
                <Td>{s.adoptante.nombre} ({s.adoptante.idAdoptante})</Td>
                <Td>{formatFecha(s.fechaSolicitud)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(s.estado)}>{s.estado}</Badge>
                </Td>
                <Td>
                  <HStack>
                    <IconButton 
                        icon={<ViewIcon />} 
                        aria-label="Ver Detalles"
                        size="sm"
                        mr={2}
                        onClick={() => handleViewDetails(s)}
                    />
                    {s.estado === 'PENDIENTE' && (
                        <>
                            <IconButton 
                                icon={<CheckIcon />} 
                                aria-label="Aprobar"
                                colorScheme="green"
                                size="sm"
                                isLoading={isProcessing}
                                onClick={() => handleAction(s.idSolicitud, 'APROBAR')}
                            />
                            <IconButton 
                                icon={<CloseIcon />} 
                                aria-label="Rechazar"
                                colorScheme="red"
                                size="sm"
                                isLoading={isProcessing}
                                onClick={() => handleAction(s.idSolicitud, 'RECHAZAR')}
                            />
                            <IconButton 
                                icon={<MinusIcon />} 
                                aria-label="Cancelar"
                                colorScheme="gray"
                                size="sm"
                                isLoading={isProcessing}
                                onClick={() => handleAction(s.idSolicitud, 'CANCELAR')}
                            />
                        </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Modal de Detalles de Solicitud AUMENTADO Y CON COLORES DE MARCA */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="brand.900">
            Detalles de Solicitud #{currentRequest?.idSolicitud}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
                <Text><b>Mascota:</b> {currentRequest?.mascota.nombre}</Text>
                <Text><b>Adoptante:</b> {currentRequest?.adoptante.nombre}</Text>
                <Text><b>Estado:</b> <Badge colorScheme={getStatusColor(currentRequest?.estado)}>{currentRequest?.estado}</Badge></Text>
                <Box>
                    <Text fontWeight="bold" color="brand.800">
                        Observaciones del Adoptante:
                    </Text>
                    <Textarea 
                        value={currentRequest?.observaciones || 'N/A'} 
                        isReadOnly 
                        rows={10} 
                        bg="gray.50" 
                        borderColor="brand.200" 
                        _hover={{ borderColor: 'brand.300' }}
                        resize="vertical"
                    />
                </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
                variant="outline" 
                color="brand.900" 
                borderColor="brand.900" 
                _hover={{ bg: 'brand.200', borderColor: 'brand.700' }}
                mr={3} 
                onClick={onClose}
            >
              Cerrar
            </Button>
            {currentRequest?.estado === 'PENDIENTE' && (
                <>
                    <Button 
                        bg="red.500" 
                        color="white"
                        _hover={{ bg: 'red.600' }}
                        mr={3}
                        onClick={() => { 
                            handleAction(currentRequest.idSolicitud, 'RECHAZAR');
                            onClose();
                        }}
                        isLoading={isProcessing}
                    >
                        Rechazar
                    </Button>
                    <Button 
                        variant="outline"
                        color="brand.700" 
                        borderColor="brand.700" 
                        _hover={{ bg: 'brand.200', borderColor: 'brand.900' }}
                        onClick={() => { 
                            handleAction(currentRequest.idSolicitud, 'CANCELAR');
                            onClose();
                        }}
                        isLoading={isProcessing}
                    >
                        Cancelar
                    </Button>
                </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminSolicitudes;