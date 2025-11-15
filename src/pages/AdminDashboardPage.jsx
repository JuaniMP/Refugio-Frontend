import { 
  Box, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  HStack,
  Text,
  Icon 
} from '@chakra-ui/react';
import { 
  FaChartPie, 
  FaHome, 
  FaPaw, 
  FaTag, 
  FaDog, 
  FaUsers, 
  FaClipboardList,
  FaBookMedical // <-- 1. AÑADIR ÍCONO
} from 'react-icons/fa';

// Importa los componentes
import AdminEstadisticas from '../components/admin/AdminEstadisticas';
import AdminMascotas from '../components/admin/AdminMascotas';
import AdminPersonal from '../components/admin/AdminPersonal';
import AdminRefugio from '../components/admin/AdminRefugio';
import AdminAuditoria from '../components/admin/AdminAuditoria';
import AdminEspecies from '../components/admin/AdminEspecies';
import AdminRazas from '../components/admin/AdminRazas';
import AdminVacunas from '../components/admin/AdminVacunas'; // <-- 2. IMPORTAR NUEVO COMPONENTE

// ... (El componente 'AnimatedTab' no cambia) ...
const AnimatedTab = ({ icon, children }) => {
  return (
    <Tab 
      minWidth="50px"
      paddingX="12px"
      justifyContent="center"
      transition="all 0.3s ease-out"
      _selected={{ 
        color: 'white', 
        bg: 'brand.800',
        minWidth: '160px',
        justifyContent: 'flex-start',
        '.tab-text': {
          maxWidth: '100px',
          opacity: 1,
          marginLeft: '0.5rem'
        }
      }}
      _hover={{
        minWidth: '160px',
        justifyContent: 'flex-start',
        '.tab-text': {
          maxWidth: '100px',
          opacity: 1,
          marginLeft: '0.5rem'
        }
      }}
    >
      <HStack>
        <Icon as={icon} boxSize="1.2em" /> 
        <Text
          as="span"
          className="tab-text"
          maxWidth="0"
          opacity={0}
          marginLeft="0"
          overflow="hidden"
          whiteSpace="nowrap"
          transition="all 0.2s ease-out"
        >
          {children}
        </Text>
      </HStack>
    </Tab>
  );
};


const AdminDashboardPage = () => {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={6} color="brand.900">
        Panel de Administración
      </Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList justifyContent="flex-start">
          <AnimatedTab icon={FaChartPie}>Estadísticas</AnimatedTab>
          <AnimatedTab icon={FaHome}>Refugio</AnimatedTab>
          <AnimatedTab icon={FaPaw}>Especies</AnimatedTab>
          <AnimatedTab icon={FaTag}>Razas</AnimatedTab>
          <AnimatedTab icon={FaDog}>Mascotas</AnimatedTab>
          <AnimatedTab icon={FaUsers}>Personal</AnimatedTab>
          {/* --- 3. AÑADIR NUEVA PESTAÑA --- */}
          <AnimatedTab icon={FaBookMedical}>Vacunas</AnimatedTab>
          <AnimatedTab icon={FaClipboardList}>Auditoría</AnimatedTab>
        </TabList>

        <TabPanels>
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
          {/* --- 4. AÑADIR NUEVO PANEL --- */}
          <TabPanel>
            <AdminVacunas />
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