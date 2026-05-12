import { Directive, ElementRef, HostListener, Input, OnInit, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

export type MaskType = 'cpf' | 'phone';

@Directive({
  selector: '[appMask]',
  standalone: true,
})
export class MaskDirective implements OnInit {
  @Input('appMask') type: MaskType = 'cpf';

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  ngOnInit(): void {
    queueMicrotask(() => this.apply(this.el.nativeElement.value));
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.apply(value);
  }

  private apply(raw: string): void {
    const formatted = this.type === 'cpf' ? formatCpf(raw) : formatPhone(raw);
    if (formatted === this.el.nativeElement.value) return;
    this.el.nativeElement.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: false });
  }
}

export function formatCpf(value: string): string {
  const d = (value ?? '').replace(/\D/g, '').slice(0, 11);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)];
  let out = parts[0];
  if (parts[1]) out += '.' + parts[1];
  if (parts[2]) out += '.' + parts[2];
  if (parts[3]) out += '-' + parts[3];
  return out;
}

export function formatPhone(value: string): string {
  const d = (value ?? '').replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}
