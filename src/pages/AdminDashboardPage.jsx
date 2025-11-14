import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel 
} from '@chakra-ui/react';

// Importa los componentes de cada sección
import AdminEstadisticas from '../components/admin/AdminEstadisticas';
import AdminMascotas from '../components/admin/AdminMascotas';
import AdminPersonal from '../components/admin/AdminPersonal';
import AdminRefugio from '../components/admin/AdminRefugio';
import AdminAuditoria from '../components/admin/AdminAuditoria';

// --- 1. Importar los NUEVOS componentes ---
import AdminEspecies from '../components/admin/AdminEspecies';
import AdminRazas from '../components/admin/AdminRazas';

const AdminDashboardPage = () => {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={6} color="brand.900">
        Panel de Administración
      </Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          {/* --- 2. Reorganizar y añadir pestañas --- */}
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Estadísticas</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Refugio</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Especies</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Razas</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Mascotas</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Personal</Tab>
          <Tab _selected={{ color: 'white', bg: 'brand.800' }}>Auditoría</Tab>
        </TabList>

        <TabPanels>
          {/* --- 3. Añadir los paneles correspondientes --- */}
          <TabPanel>
            <AdminEstadisticas />
          </TabPanel>
          <TabPanel>
            <AdminRefugio />
          </TabPanel>
          <TabPanel>
            <AdminEspecies />
          </TabPanel>
          <TabPanel>
            <AdminRazas />
          </TabPanel>
          <TabPanel>
            <AdminMascotas />
          </TabPanel>
          <TabPanel>
            <AdminPersonal />
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