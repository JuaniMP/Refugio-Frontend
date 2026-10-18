import {
  Box, Button, VStack, HStack, Text, FormControl, FormLabel, Input, FormErrorMessage,
  Stepper, Step, StepIndicator, StepStatus, StepTitle, StepDescription, StepIcon, StepSeparator, useSteps,
} from '@chakra-ui/react';
import EmpleadoFields from './EmpleadoFields';

const PASOS = [
  { titulo: 'Datos Personales', descripcion: 'Información básica' },
  { titulo: 'Datos del Rol', descripcion: 'Info profesional' },
  { titulo: 'Cuenta de Usuario', descripcion: 'Acceso al sistema' },
];

const botonSiguiente = { bg: 'brand.700', color: 'white', _hover: { bg: 'brand.900' } };

/**
 * Asistente de 3 pasos para crear personal del refugio.
 * El paso 2 lo aporta cada rol mediante `camposRol`; los pasos 1 y 3 son comunes.
 */
const PersonalFormWizard = ({ formData, formErrors, handleChange, refugios, camposRol, nombreRol }) => {
  const { activeStep, setActiveStep } = useSteps({ index: 0, count: PASOS.length });
  const atras = () => setActiveStep(prev => prev - 1);
  const siguiente = () => setActiveStep(prev => prev + 1);

  return (
    <VStack spacing={4}>
      <Stepper index={activeStep} mb={6} width="100%">
        {PASOS.map((paso, i) => (
          <Step key={paso.titulo}>
            <StepIndicator><StepStatus complete={<StepIcon />} /></StepIndicator>
            <Box flexShrink="0">
              <StepTitle>{paso.titulo}</StepTitle>
              <StepDescription>{paso.descripcion}</StepDescription>
            </Box>
            {i < PASOS.length - 1 && <StepSeparator />}
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <VStack spacing={4} width="100%">
          <EmpleadoFields formData={formData} formErrors={formErrors} handleChange={handleChange} refugios={refugios} />
          <Button onClick={siguiente} {...botonSiguiente} alignSelf="flex-end">Siguiente</Button>
        </VStack>
      )}

      {activeStep === 1 && (
        <VStack spacing={4} width="100%">
          {camposRol}
          <HStack width="100%" justify="space-between">
            <Button onClick={atras} variant="ghost">Atrás</Button>
            <Button onClick={siguiente} {...botonSiguiente}>Siguiente</Button>
          </HStack>
        </VStack>
      )}

      {activeStep === 2 && (
        <VStack spacing={4} width="100%">
          <FormControl isRequired isInvalid={!!formErrors.login}>
            <FormLabel>Correo Electrónico (Login)</FormLabel>
            <Input type="email" name="login" value={formData.login} onChange={handleChange} />
            <FormErrorMessage>{formErrors.login}</FormErrorMessage>
          </FormControl>
          <Text fontSize="sm" color="gray.500">
            Se creará un usuario con este correo y se enviará una contraseña temporal.
            El {nombreRol} deberá cambiarla en su primer inicio de sesión.
          </Text>
          <HStack width="100%" justify="space-between">
            <Button onClick={atras} variant="ghost">Atrás</Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};

export default PersonalFormWizard;
