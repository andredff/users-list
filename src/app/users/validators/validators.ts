import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const cpfValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = (control.value ?? '').toString().replace(/\D/g, '');
  if (!raw) return null;
  if (raw.length !== 11 || /^(\d)\1{10}$/.test(raw)) return { cpf: true };

  const digits = raw.split('').map(Number);
  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += digits[i] * (slice + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  return calc(9) === digits[9] && calc(10) === digits[10] ? null : { cpf: true };
};

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = (control.value ?? '').toString().replace(/\D/g, '');
  if (!raw) return null;
  return raw.length === 10 || raw.length === 11 ? null : { phone: true };
};
