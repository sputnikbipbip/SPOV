import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { posterUrl } from '../content';
import { FormFieldComponent, FormNotesComponent, TextareaFieldComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, PageIntroComponent, FormFieldComponent, TextareaFieldComponent, FormNotesComponent],
  template: `<app-page-intro eyebrow="Contactos" title="Um ponto de contacto simples, claro e institucional." text="Formulários acessíveis, respostas objetivas e caminhos curtos para adesão ou pedidos de informação."><div class="split-section"><div><img class="section-image" [src]="posterUrl" alt="Identidade visual SPOV para contacto" loading="lazy" decoding="async"></div><form class="contact-form" action="https://formsubmit.co/azevedo.daniel.se@gmail.com" method="POST" [formGroup]="form" (ngSubmit)="submit()" novalidate><input type="hidden" name="_subject" value="SPOV - Pedido de contacto"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="/obrigado"><app-form-notes /><div class="field-grid"><app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" /><app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." /></div><app-textarea-field label="Mensagem" name="message" [control]="form.controls.message" [rows]="5" placeholder="Escreva a sua mensagem" /><button type="submit" class="button button-primary">Enviar pedido</button></form></div></app-page-intro>`
})
export class ContactsComponent {
  protected readonly posterUrl = posterUrl;
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    message: new FormControl('', { nonNullable: true, validators: Validators.required })
  });
  protected submit() { if (this.form.invalid) this.form.markAllAsTouched(); }
}
