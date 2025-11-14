import { 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Box,
  Heading,
  Text,
  VStack
} from '@chakra-ui/react';
import { FaUserMd, FaUserNurse } from 'react-icons/fa'; // Iconos

// Importamos los nuevos componentes que crearemos
import AdminVeterinarios from './AdminVeterinarios';
import AdminCuidadores from './AdminCuidadores';

const AdminPersonal = () => {
  return (
    <Box>
      <VStack align="start" mb={6}>
        <Heading size="lg" color="brand.900">Gestión de Personal</Heading>
        <Text color="gray.600">Crea y administra los roles y accesos del personal del refugio.</Text>
      </VStack>
      
      {/* Sistema de Pestañas Anidado */}
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList mb={4}>
          <Tab><FaUserMd style={{ marginRight: '8px' }} /> Veterinarios</Tab>
          <Tab><FaUserNurse style={{ marginRight: '8px' }} /> Cuidadores</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            {/* Componente CRUD de Veterinarios (Paso 3) */}
            <AdminVeterinarios />
          </TabPanel>
          <TabPanel p={0}>
            {/* Componente CRUD de Cuidadores (Paso 4) */}
            <AdminCuidadores />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminPersonal;