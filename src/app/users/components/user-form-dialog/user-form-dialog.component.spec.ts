import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UserFormDialogComponent, UserDialogData } from './user-form-dialog.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

describe('UserFormDialogComponent', () => {
  let fixture: ComponentFixture<UserFormDialogComponent>;
  let component: UserFormDialogComponent;
  let dialogRef: { close: jest.Mock };

  function setup(data: UserDialogData = {}) {
    dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [UserFormDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    fixture = TestBed.createComponent(UserFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  const validValues = {
    email: 'novo@attornatus.com.br',
    name: 'Fulano de Tal',
    cpf: '123.456.789-09',
    phone: '(48) 99999-1111',
    phoneType: 'CELULAR' as const,
  };

  it('inicia como criação com formulário inválido', () => {
    setup();
    expect(component.isEdit).toBe(false);
    expect(component.form.valid).toBe(false);
  });

  it('valida campos obrigatórios', () => {
    setup();
    component.form.markAllAsTouched();
    expect(component.errorOf('email')).toBe('Campo obrigatório');
    expect(component.errorOf('name')).toBe('Campo obrigatório');
    expect(component.errorOf('cpf')).toBe('Campo obrigatório');
    expect(component.errorOf('phone')).toBe('Campo obrigatório');
  });

  it('valida formato de e-mail', () => {
    setup();
    component.form.controls.email.setValue('nao-eh-email');
    component.form.controls.email.markAsTouched();
    expect(component.errorOf('email')).toBe('E-mail inválido');
  });

  it('valida CPF inválido e aceita CPF válido', () => {
    setup();
    const cpf = component.form.controls.cpf;
    cpf.setValue('111.111.111-11');
    cpf.markAsTouched();
    expect(component.errorOf('cpf')).toBe('CPF inválido');
    cpf.setValue('123.456.789-09');
    expect(component.errorOf('cpf')).toBeNull();
  });

  it('valida formato de telefone', () => {
    setup();
    const phone = component.form.controls.phone;
    phone.setValue('123');
    phone.markAsTouched();
    expect(component.errorOf('phone')).toBe('Telefone inválido (10 ou 11 dígitos)');
    phone.setValue('(48) 99999-1111');
    expect(component.errorOf('phone')).toBeNull();
  });

  it('preenche o formulário no modo edição', () => {
    const user: User = { id: 42, ...validValues };
    setup({ user });
    expect(component.isEdit).toBe(true);
    expect(component.form.value).toEqual(validValues);
    expect(component.form.valid).toBe(true);
  });

  it('salva (cria) e fecha o diálogo com o usuário retornado', () => {
    setup();
    component.form.setValue(validValues);
    const service = TestBed.inject(UserService);
    const spy = jest.spyOn(service, 'save');
    component.save();
    expect(spy).toHaveBeenCalledWith(validValues);
    expect(dialogRef.close).toHaveBeenCalled();
    const closedWith = dialogRef.close.mock.calls[0][0];
    expect(closedWith.email).toBe(validValues.email);
  });

  it('atualiza no modo edição', () => {
    const user: User = { id: 7, ...validValues };
    setup({ user });
    const service = TestBed.inject(UserService);
    const spy = jest.spyOn(service, 'update');
    component.save();
    expect(spy).toHaveBeenCalledWith(7, validValues);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('não fecha quando o formulário é inválido', () => {
    setup();
    component.save();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('cancel() fecha o diálogo sem resultado', () => {
    setup();
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
