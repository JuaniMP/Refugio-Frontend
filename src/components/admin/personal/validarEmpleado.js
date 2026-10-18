const SOLO_NUMEROS = /^[0-9]+$/;
const SOLO_LETRAS = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/;

/**
 * Valida los datos comunes de un empleado. Devuelve un objeto { campo: mensaje }
 * al que cada formulario agrega las validaciones propias de su rol.
 */
export function validarEmpleado(formData, esNuevo) {
  const errors = {};

  if (!formData.nombre) errors.nombre = 'El nombre es obligatorio.';
  else if (!SOLO_LETRAS.test(formData.nombre)) errors.nombre = 'El nombre no puede contener números ni símbolos.';
  else if (formData.nombre.trim().indexOf(' ') === -1) errors.nombre = 'Por favor, ingresa nombre y apellido.';

  if (!formData.cedula) errors.cedula = 'La cédula es obligatoria.';
  else if (!SOLO_NUMEROS.test(formData.cedula)) errors.cedula = 'La cédula solo debe contener números.';
  else if (formData.cedula.length < 7 || formData.cedula.length > 10) errors.cedula = 'La cédula debe tener entre 7 y 10 dígitos.';

  if (formData.telefono && (!SOLO_NUMEROS.test(formData.telefono) || formData.telefono.length !== 10)) {
    errors.telefono = 'El teléfono debe ser numérico de 10 dígitos.';
  }
  if (!formData.idRefugio) errors.idRefugio = 'Debes seleccionar un refugio.';

  if (esNuevo && !formData.login) errors.login = 'El correo es obligatorio para crear el usuario.';
  else if (formData.login && !/\S+@\S+\.\S+/.test(formData.login)) errors.login = 'Correo inválido.';

  return errors;
}
