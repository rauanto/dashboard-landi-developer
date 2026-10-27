import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores para formularios en México. Devuelven { clave: { message } }, por lo que
 * app-form-field muestra el mensaje automáticamente (o puedes sobrescribirlo con [errors]).
 * Todos ignoran valores vacíos: combínalos con Validators.required.
 */

const empty = (v: unknown) => v === null || v === undefined || v === '';
const err = (key: string, message: string): ValidationErrors => ({ [key]: { message } });
const norm = (v: unknown) => String(v).trim().toUpperCase();

// ---------- CURP ----------
const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;
const CURP_DICT = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

export function isValidCurp(curp: string, checkDigit = true): boolean {
  const c = norm(curp);
  if (!CURP_REGEX.test(c)) return false;
  if (!checkDigit) return true;
  const sum = [...c.slice(0, 17)].reduce((acc, ch, i) => acc + CURP_DICT.indexOf(ch) * (18 - i), 0);
  return (10 - (sum % 10)) % 10 === Number(c[17]);
}

/** @param checkDigit valida también el dígito verificador (default true) */
export function curpValidator(checkDigit = true): ValidatorFn {
  return (c: AbstractControl) =>
    empty(c.value) || isValidCurp(String(c.value), checkDigit) ? null : err('curp', 'CURP inválida');
}

// ---------- RFC ----------
const RFC_FISICA = /^[A-ZÑ&]{4}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;
const RFC_MORAL = /^[A-ZÑ&]{3}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z\d]{3}$/;
const RFC_GENERICOS = ['XAXX010101000', 'XEXX010101000'];

export type RfcTipo = 'fisica' | 'moral' | 'any';

export function isValidRfc(rfc: string, tipo: RfcTipo = 'any'): boolean {
  const r = norm(rfc);
  if (RFC_GENERICOS.includes(r)) return true;
  if (tipo === 'fisica') return RFC_FISICA.test(r);
  if (tipo === 'moral') return RFC_MORAL.test(r);
  return RFC_FISICA.test(r) || RFC_MORAL.test(r);
}

export function rfcValidator(tipo: RfcTipo = 'any'): ValidatorFn {
  return (c: AbstractControl) =>
    empty(c.value) || isValidRfc(String(c.value), tipo) ? null : err('rfc', 'RFC inválido');
}

// ---------- CLABE ----------
export function isValidClabe(clabe: string): boolean {
  const c = String(clabe).replace(/\s|-/g, '');
  if (!/^\d{18}$/.test(c)) return false;
  const weights = [3, 7, 1];
  const sum = [...c.slice(0, 17)].reduce((acc, d, i) => acc + ((Number(d) * weights[i % 3]) % 10), 0);
  return (10 - (sum % 10)) % 10 === Number(c[17]);
}

export function clabeValidator(): ValidatorFn {
  return (c: AbstractControl) =>
    empty(c.value) || isValidClabe(String(c.value)) ? null : err('clabe', 'CLABE inválida (18 dígitos)');
}

// ---------- Teléfono / CP ----------
export function telefonoMxValidator(): ValidatorFn {
  return (c: AbstractControl) =>
    empty(c.value) || String(c.value).replace(/\D/g, '').length === 10
      ? null
      : err('telefono', 'El teléfono debe tener 10 dígitos');
}

export function codigoPostalValidator(): ValidatorFn {
  return (c: AbstractControl) =>
    empty(c.value) || /^\d{5}$/.test(String(c.value).trim())
      ? null
      : err('codigoPostal', 'El código postal debe tener 5 dígitos');
}

// ---------- Fechas ----------
function asDate(v: unknown): Date | null {
  if (empty(v)) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Edad mínima (por defecto 18) a partir de una fecha de nacimiento. */
export function mayorDeEdadValidator(edad = 18): ValidatorFn {
  return (c: AbstractControl) => {
    const born = asDate(c.value);
    if (!born) return null;
    const limit = new Date(born.getFullYear() + edad, born.getMonth(), born.getDate());
    return limit <= new Date() ? null : err('mayorDeEdad', `Debes tener al menos ${edad} años`);
  };
}

/** Validador de grupo: la fecha `end` no puede ser anterior a `start`. */
export function rangoFechasValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl) => {
    const s = asDate(group.get(startKey)?.value);
    const e = asDate(group.get(endKey)?.value);
    return s && e && e < s ? err('rangoFechas', 'La fecha final no puede ser anterior a la inicial') : null;
  };
}

// ---------- Entre campos ----------
/** Validador de grupo: dos campos iguales (contraseña / confirmación). El error se marca también en `confirmKey`. */
export function matchFieldsValidator(key: string, confirmKey: string, message = 'Los campos no coinciden'): ValidatorFn {
  return (group: AbstractControl) => {
    const a = group.get(key);
    const b = group.get(confirmKey);
    if (!a || !b || empty(b.value)) return null;
    const mismatch = a.value !== b.value;
    const current = b.errors ?? {};
    if (mismatch && !current['match']) {
      b.setErrors({ ...current, match: { message } });
    } else if (!mismatch && current['match']) {
      const { match, ...rest } = current;
      b.setErrors(Object.keys(rest).length ? rest : null);
    }
    return mismatch ? err('match', message) : null;
  };
}

/** Contraseña segura: 8+ caracteres, mayúscula, minúscula, número y símbolo. */
export function passwordFuerteValidator(): ValidatorFn {
  return (c: AbstractControl) => {
    if (empty(c.value)) return null;
    const v = String(c.value);
    const ok = v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
    return ok ? null : err('passwordFuerte', 'Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo');
  };
}

/** Validador de grupo: al menos uno de los campos debe tener valor. */
export function algunoRequeridoValidator(keys: string[], message = 'Completa al menos uno de los campos'): ValidatorFn {
  return (group: AbstractControl) =>
    keys.some((k) => !empty(group.get(k)?.value)) ? null : err('algunoRequerido', message);
}
