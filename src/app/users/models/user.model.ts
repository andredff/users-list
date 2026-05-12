export type PhoneType = 'CELULAR' | 'RESIDENCIAL' | 'COMERCIAL';

export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  phoneType: PhoneType;
}
