import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { PhoneType, User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { cpfValidator, phoneValidator } from '../../validators/validators';
import { MaskDirective } from '../../directives/mask.directive';

export interface UserDialogData {
  user?: User;
}

export type UserDialogResult = User | undefined;

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MaskDirective,
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css'],
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserService);
  private readonly dialogRef = inject<MatDialogRef<UserFormDialogComponent, UserDialogResult>>(MatDialogRef);

  readonly phoneTypes: PhoneType[] = this.service.phoneTypes;
  readonly isEdit: boolean;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    cpf: ['', [Validators.required, cpfValidator]],
    phone: ['', [Validators.required, phoneValidator]],
    phoneType: ['CELULAR' as PhoneType, Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserDialogData) {
    this.isEdit = !!data?.user;
    if (data?.user) {
      const { email, name, cpf, phone, phoneType } = data.user;
      this.form.patchValue({ email, name, cpf, phone, phoneType });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const saved = this.isEdit && this.data.user
      ? this.service.update(this.data.user.id, value)
      : this.service.save(value);
    this.dialogRef.close(saved);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  errorOf(control: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[control];
    if (!(c.touched || c.dirty) || !c.errors) return null;
    if (c.errors['required']) return 'Campo obrigatório';
    if (c.errors['email']) return 'E-mail inválido';
    if (c.errors['minlength']) return 'Mínimo de 2 caracteres';
    if (c.errors['cpf']) return 'CPF inválido';
    if (c.errors['phone']) return 'Telefone inválido (10 ou 11 dígitos)';
    return 'Valor inválido';
  }
}
