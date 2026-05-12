import { formatCpf, formatPhone } from './mask.directive';

describe('formatCpf', () => {
  it('formata progressivamente', () => {
    expect(formatCpf('')).toBe('');
    expect(formatCpf('123')).toBe('123');
    expect(formatCpf('1234')).toBe('123.4');
    expect(formatCpf('1234567')).toBe('123.456.7');
    expect(formatCpf('12345678909')).toBe('123.456.789-09');
  });

  it('ignora caracteres não numéricos e limita a 11 dígitos', () => {
    expect(formatCpf('abc123.456.789-0999999')).toBe('123.456.789-09');
  });
});

describe('formatPhone', () => {
  it('formata fixo (10 dígitos)', () => {
    expect(formatPhone('1133445566')).toBe('(11) 3344-5566');
  });

  it('formata celular (11 dígitos)', () => {
    expect(formatPhone('48999991111')).toBe('(48) 99999-1111');
  });

  it('formata progressivamente', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('4')).toBe('(4');
    expect(formatPhone('48')).toBe('(48');
    expect(formatPhone('4899')).toBe('(48) 99');
    expect(formatPhone('489999')).toBe('(48) 9999');
    expect(formatPhone('4899999')).toBe('(48) 9999-9');
  });
});
