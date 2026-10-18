import { FormControl, FormLabel, Input, Select, FormErrorMessage } from '@chakra-ui/react';

/** Datos personales comunes a veterinarios y cuidadores. */
const EmpleadoFields = ({ formData, formErrors, handleChange, refugios }) => (
  <>
    <FormControl isRequired isInvalid={!!formErrors.nombre}>
      <FormLabel>Nombre Completo</FormLabel>
      <Input name="nombre" value={formData.nombre} onChange={handleChange} />
      <FormErrorMessage>{formErrors.nombre}</FormErrorMessage>
    </FormControl>
    <FormControl isRequired isInvalid={!!formErrors.cedula}>
      <FormLabel>Cédula</FormLabel>
      <Input name="cedula" value={formData.cedula} onChange={handleChange} inputMode="numeric" />
      <FormErrorMessage>{formErrors.cedula}</FormErrorMessage>
    </FormControl>
    <FormControl isInvalid={!!formErrors.telefono}>
      <FormLabel>Teléfono (10 dígitos)</FormLabel>
      <Input name="telefono" value={formData.telefono} onChange={handleChange} inputMode="numeric" />
      <FormErrorMessage>{formErrors.telefono}</FormErrorMessage>
    </FormControl>
    <FormControl isRequired isInvalid={!!formErrors.idRefugio}>
      <FormLabel>Refugio Asignado</FormLabel>
      <Select name="idRefugio" value={formData.idRefugio} onChange={handleChange} placeholder="Seleccionar...">
        {refugios.map(r => <option key={r.idRefugio} value={r.idRefugio}>{r.nombre}</option>)}
      </Select>
      <FormErrorMessage>{formErrors.idRefugio}</FormErrorMessage>
    </FormControl>
  </>
);

export default EmpleadoFields;
