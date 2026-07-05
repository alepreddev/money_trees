/**
 * validators.js — Motor centralizado de validación y sanitización para Money Trees.
 * 
 * Previene inyección de datos maliciosos, errores de coma flotante, desbordamientos numéricos
 * y condiciones lógicas inválidas antes de enviar peticiones a Supabase.
 */

/**
 * Sanitiza y valida cadenas de texto (nombres, descripciones, títulos).
 * @param {string} value - Texto a sanitizar.
 * @param {Object} options - Opciones de validación.
 * @param {number} [options.maxLen=150] - Longitud máxima permitida.
 * @param {number} [options.minLen=1] - Longitud mínima permitida.
 * @param {string} [options.fieldName='El campo'] - Nombre del campo para mensajes de error.
 * @returns {{ isValid: boolean, value: string, error: string|null }}
 */
export function sanitizeText(value, { maxLen = 150, minLen = 1, fieldName = 'El campo' } = {}) {
  if (value === null || value === undefined) {
    return { isValid: false, value: '', error: `${fieldName} es requerido.` };
  }

  // Convertir a texto, eliminar caracteres de control no imprimibles y espacios en extremos
  const cleaned = String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

  if (cleaned.length < minLen) {
    return {
      isValid: false,
      value: cleaned,
      error: `${fieldName} debe tener al menos ${minLen} carácter(es).`
    };
  }

  if (cleaned.length > maxLen) {
    return {
      isValid: false,
      value: cleaned.slice(0, maxLen),
      error: `${fieldName} no puede exceder los ${maxLen} caracteres.`
    };
  }

  return { isValid: true, value: cleaned, error: null };
}

/**
 * Valida y normaliza montos numéricos (ingresos, gastos, saldos, metas).
 * @param {number|string} value - Monto a validar.
 * @param {Object} options - Opciones de validación.
 * @param {number} [options.min=0.01] - Monto mínimo permitido.
 * @param {number} [options.max=999999999.99] - Techo financiero (999 millones).
 * @param {boolean} [options.allowZero=false] - Si se permite el valor exactamente 0.
 * @param {boolean} [options.allowNegative=false] - Si se permiten números negativos (e.g. ajustes o saldos iniciales de deuda).
 * @param {string} [options.fieldName='El monto'] - Nombre del campo para mensajes de error.
 * @returns {{ isValid: boolean, value: number, error: string|null }}
 */
export function validateAmount(value, { min = 0.01, max = 999999999.99, allowZero = false, allowNegative = false, fieldName = 'El monto' } = {}) {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, value: 0, error: `${fieldName} es requerido.` };
  }

  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, value: 0, error: `${fieldName} debe ser un número válido.` };
  }

  // Truncar a máximo 2 decimales para evitar problemas de coma flotante en JS
  const normalized = Math.round(num * 100) / 100;

  if (!allowNegative && normalized < 0) {
    return { isValid: false, value: normalized, error: `${fieldName} no puede ser un valor negativo.` };
  }

  if (!allowZero && normalized === 0) {
    return { isValid: false, value: 0, error: `${fieldName} debe ser mayor a 0.` };
  }

  if (!allowNegative && !allowZero && normalized < min) {
    return { isValid: false, value: normalized, error: `${fieldName} debe ser de al menos $${min.toLocaleString('es-ES')}.` };
  }

  if (Math.abs(normalized) > max) {
    return { isValid: false, value: normalized, error: `${fieldName} supera el límite máximo permitido ($${max.toLocaleString('es-ES')}).` };
  }

  return { isValid: true, value: normalized, error: null };
}

/**
 * Valida fechas en formato ISO YYYY-MM-DD y rangos cronológicos razonables.
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD.
 * @param {Object} options - Opciones de validación.
 * @param {number} [options.minYear=1970] - Año mínimo permitido.
 * @param {number} [options.maxYear=2035] - Año máximo permitido.
 * @param {string} [options.fieldName='La fecha'] - Nombre del campo.
 * @returns {{ isValid: boolean, value: string, error: string|null }}
 */
export function validateDate(dateStr, { minYear = 1970, maxYear = 2035, fieldName = 'La fecha' } = {}) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, value: '', error: `${fieldName} es requerida.` };
  }

  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateStr.trim())) {
    return { isValid: false, value: dateStr, error: `${fieldName} no tiene un formato válido (YYYY-MM-DD).` };
  }

  const dateObj = new Date(`${dateStr.trim()}T00:00:00`);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, value: dateStr, error: `${fieldName} es una fecha inválida en el calendario.` };
  }

  const year = dateObj.getFullYear();
  if (year < minYear || year > maxYear) {
    return { isValid: false, value: dateStr, error: `${fieldName} debe estar entre el año ${minYear} y ${maxYear}.` };
  }

  return { isValid: true, value: dateStr.trim(), error: null };
}

/**
 * Valida lógica relacional de transferencias entre cuentas.
 * @param {string} fromAccountId - ID cuenta origen.
 * @param {string} toAccountId - ID cuenta destino.
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateTransfer(fromAccountId, toAccountId) {
  if (!fromAccountId || !toAccountId) {
    return { isValid: false, error: 'Debes seleccionar tanto la cuenta de origen como la de destino.' };
  }

  if (fromAccountId === toAccountId) {
    return { isValid: false, error: 'La cuenta de origen y la cuenta de destino no pueden ser la misma.' };
  }

  return { isValid: true, error: null };
}

/**
 * Valida formato básico de correo electrónico.
 * @param {string} email - Correo electrónico a validar.
 * @returns {{ isValid: boolean, value: string, error: string|null }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, value: '', error: 'El correo electrónico es requerido.' };
  }

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleaned)) {
    return { isValid: false, value: cleaned, error: 'Por favor, ingresa un correo electrónico válido.' };
  }

  return { isValid: true, value: cleaned, error: null };
}
