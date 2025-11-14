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
  FaClipboardList 
} from 'react-icons/fa';

// Importa los componentes de cada sección (sin cambios)
import AdminEstadisticas from '../components/admin/AdminEstadisticas';
import AdminMascotas from '../components/admin/AdminMascotas';
import AdminPersonal from '../components/admin/AdminPersonal';
import AdminRefugio from '../components/admin/AdminRefugio';
import AdminAuditoria from '../components/admin/AdminAuditoria';
import AdminEspecies from '../components/admin/AdminEspecies';
import AdminRazas from '../components/admin/AdminRazas';

// --- 3. Componente auxiliar para la pestaña animada (LÓGICA INVERTIDA) ---
const AnimatedTab = ({ icon, children }) => {
  return (
    <Tab 
      // --- ESTILOS DE LA PESTAÑA (TAB) ---
      minWidth="50px" // Ancho mínimo (solo para el icono)
      paddingX="12px"
      justifyContent="center" // Centrar el icono por defecto
      transition="all 0.3s ease-out" // Animar el tamaño de la pestaña
      
      // Estilos de la pestaña seleccionada
      _selected={{ 
        color: 'white', 
        bg: 'brand.800',
        minWidth: '160px', // Ancho expandido
        justifyContent: 'flex-start', // Alinear a la izquierda
        // Mostrar el texto
        '.tab-text': {
          maxWidth: '100px',
          opacity: 1,
          marginLeft: '0.5rem'
        }
      }}
      // Estilos al pasar el mouse (hover)
      _hover={{
        minWidth: '160px', // Ancho expandido
        justifyContent: 'flex-start', // Alinear a la izquierda
        // Mostrar el texto
        '.tab-text': {
          maxWidth: '100px',
          opacity: 1,
          marginLeft: '0.5rem'
        }
      }}
    >
      <HStack>
        {/* --- ICONO (Siempre visible) --- */}
        <Icon as={icon} boxSize="1.2em" /> 
        
        {/* --- TEXTO (Animado) --- */}
        <Text
          as="span"
          className="tab-text"
          maxWidth="0" // Oculto por defecto
          opacity={0} // Oculto por defecto
          marginLeft="0" // Sin margen por defecto
          overflow="hidden"
          whiteSpace="nowrap" // Evita que el texto se parta
          transition="all 0.2s ease-out" // La animación del texto
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
      
      {/* Ajustamos Tabs para que el fondo combine */}
      <Tabs variant="enclosed" colorScheme="blue">
        {/* Usamos flex-start para que las pestañas se peguen a la izquierda */}
        <TabList justifyContent="flex-start">
          {/* --- 4. Usar el nuevo componente animado --- */}
          <AnimatedTab icon={FaChartPie}>Estadísticas</AnimatedTab>
          <AnimatedTab icon={FaHome}>Refugio</AnimatedTab>
          <AnimatedTab icon={FaPaw}>Especies</AnimatedTab>
          <AnimatedTab icon={FaTag}>Razas</AnimatedTab>
          <AnimatedTab icon={FaDog}>Mascotas</AnimatedTab>
          <AnimatedTab icon={FaUsers}>Personal</AnimatedTab>
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
          <TabPanel>
            <AdminAuditoria />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminDashboardPage;