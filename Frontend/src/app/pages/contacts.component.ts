import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { posterUrl } from '../content';
import { FormFieldComponent, FormNotesComponent, TextareaFieldComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';
import { ContactsService } from '../services/contacts.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ReactiveFormsModule, PageIntroComponent, FormFieldComponent, TextareaFieldComponent, FormNotesComponent],
  template: `<app-page-intro eyebrow="Contactos" title="Um ponto de contacto simples, claro e institucional." text="Formulários acessíveis, respostas objetivas e caminhos curtos para adesão ou pedidos de informação.">
    @if (error) { <div class="form-error-banner">{{ error }}</div> }
    <div class="split-section"><div><img class="section-image" [src]="posterUrl" alt="Identidade visual SPOV para contacto" loading="lazy" decoding="async"></div><form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate><app-form-notes /><div class="field-grid"><app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" /><app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." /></div><app-textarea-field label="Mensagem" name="message" [control]="form.controls.message" [rows]="5" placeholder="Escreva a sua mensagem" /><button type="submit" class="button button-primary" [disabled]="loading">{{ loading ? 'A enviar…' : 'Enviar pedido' }}</button></form></div></app-page-intro>`
})
export class ContactsComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  protected readonly posterUrl = posterUrl;
  protected loading = false;
  protected error = '';
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    message: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const { name, email, message } = this.form.getRawValue();
      await this.contactsService.send({ name, email, subject: 'Contacto', message });
      await this.router.navigate(['/obrigado']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
