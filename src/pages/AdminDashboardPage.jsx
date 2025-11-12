import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel 
} from '@chakra-ui/react';

// Importa los componentes de cada sección (los crearemos abajo)
import AdminEstadisticas from '../components/admin/AdminEstadisticas';
import AdminMascotas from '../components/admin/AdminMascotas';
import AdminPersonal from '../components/admin/AdminPersonal';
import AdminRefugio from '../components/admin/AdminRefugio';
import AdminAuditoria from '../components/admin/AdminAuditoria';

const AdminDashboardPage = () => {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={6} color="brand.900">
        Panel de Administración
      </Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Estadísticas</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Mascotas</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Personal (Vets/Cuidadores)</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Refugio</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Auditoría</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AdminEstadisticas />
          </TabPanel>
          <TabPanel>
            <AdminMascotas />
          </TabPanel>
          <TabPanel>
            <AdminPersonal />
          </TabPanel>
          <TabPanel>
            <AdminRefugio />
          </TabPanel>
          <TabPanel>
            <AdminAuditoria />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboardPage;