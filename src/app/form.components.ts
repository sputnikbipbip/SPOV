import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label class="form-field">
      <span>{{ label }}</span>
      <input [type]="type" [name]="name" [placeholder]="placeholder" [formControl]="control">
      @if (control.invalid && control.touched) { <small class="field-error">{{ error }}</small> }
    </label>
  `
})
export class FormFieldComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) name = '';
  @Input({ required: true }) control = new FormControl('', { nonNullable: true });
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() error = 'Campo obrigatório.';
}

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <label class="form-field">
      <span>{{ label }}</span>
      <textarea [name]="name" [rows]="rows" [placeholder]="placeholder" [formControl]="control"></textarea>
      @if (control.invalid && control.touched) { <small class="field-error">{{ error }}</small> }
    </label>
  `
})
export class TextareaFieldComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) name = '';
  @Input({ required: true }) control = new FormControl('', { nonNullable: true });
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() error = 'Campo obrigatório.';
}

@Component({
  selector: 'app-form-notes',
  standalone: true,
  template: `
    <p class="prototype-note">Protótipo funcional: o formulário valida campos no cliente e mantém o envio externo configurado no website original.</p>
    <p class="form-privacy-note">Ao enviar, aceita ser contactado no âmbito do pedido submetido.</p>
  `
})
export class FormNotesComponent {}
