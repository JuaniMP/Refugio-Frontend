import {
  Box, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Spinner, Text, Badge,
  // --- IMPORTS ELIMINADOS: Button, HStack, FiRefreshCw ---
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
// La librería de iconos para el botón ya no es necesaria aquí.

const AdminAuditoria = () => {
  const { token } = useAuth();
  const toast = useToast();
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Cargar logs de auditoría (fetchLogs ya existe) ---
  const fetchLogs = async () => {
    // Usamos 'false' solo después del primer fetch para evitar el spinner infinito
    // en la recarga continua. El primer fetch del useEffect lo maneja.
    if (!token) return; 

    try {
      const response = await fetch('http://localhost:8181/api/auditorias/getAll', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar la auditoría');
      
      let data = await response.json();
      
      // Ordenar los logs: los más nuevos primero
      data.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
      
      setLogs(data);
    } catch (error) {
      toast({ title: error.message, status: 'error' });
    } finally {
      // Solo desactivamos el spinner en el primer load
      if (isLoading) {
          setIsLoading(false);
      }
    }
  };

  // --- 2. IMPLEMENTACIÓN DEL POLLING AUTOMÁTICO ---
  useEffect(() => {
    if (token) {
      // 2a. Realiza la primera carga inmediatamente
      fetchLogs(); 

      // 2b. Configura el intervalo para recargar cada 10 segundos
      // Usamos 10 segundos (10000ms) ya que los logs no requieren actualización inmediata.
      const intervalId = setInterval(fetchLogs, 10000); 

      // 2c. FUNCIÓN DE LIMPIEZA: Detener el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  // ... (getActionColor y formatFecha helpers sin cambios) ...
  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'green';
      case 'UPDATE': return 'yellow';
      case 'DELETE': return 'red';
      case 'LOGIN': return 'blue';
      default: return 'gray';
    }
  };

  const formatFecha = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return <Spinner size="xl" mx="auto" mt={10} />;
  }

  return (
    <Box>
      <Heading size="lg" color="brand.900" mb={4}>Registros de Auditoría</Heading>
      {/* Indicamos que se actualiza automáticamente */}
      <Text mb={4}>Mostrando las acciones más recientes en el sistema (Actualización automática cada 10s).</Text>
      
      <Box overflowX="auto">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Fecha y Hora</Th>
              <Th>Usuario</Th>
              <Th>Acción</Th>
              <Th>Tabla Afectada</Th>
              <Th>ID Registro</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map(log => (
              <Tr key={log.idAuditoria}>
                <Td>{formatFecha(log.creadoEn)}</Td>
                <Td>{log.usuario?.login || 'N/A'}</Td>
                <Td>
                  <Badge colorScheme={getActionColor(log.accion)}>
                    {log.accion}
                  </Badge>
                </Td>
                <Td>{log.tablaAfectada}</Td>
                <Td>{log.idRegistro}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {logs.length === 0 && (
        <Text mt={4}>No hay registros de auditoría todavía.</Text>
      )}
    </Box>
  );
};

export default AdminAuditoria;