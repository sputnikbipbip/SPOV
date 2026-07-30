import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormFieldComponent, FormNotesComponent, TextareaFieldComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';
import { ContactsService } from '../services/contacts.service';

@Component({
  selector: 'app-contacts',
  imports: [ReactiveFormsModule, PageIntroComponent, FormFieldComponent, TextareaFieldComponent, FormNotesComponent],
  template: `
<app-page-intro eyebrow="Contactos" title="Estamos aqui para ajudar." text="Envie-nos a sua mensagem através do formulário ou contacte-nos diretamente.">
  @if (error()) { <div class="form-error-banner">{{ error() }}</div> }
  <div class="split-section">
    <div>
      <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-form-notes />
        <div class="field-grid">
          <app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" />
          <app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." />
        </div>
        <label class="form-field">
          <span>Assunto</span>
          <select [formControl]="form.controls.subject">
            <option value="Contacto">Contacto geral</option>
            <option value="Informação">Pedido de informação</option>
            <option value="Adesão">Adesão a sócio</option>
            <option value="Parceria">Parceria</option>
            <option value="Outro">Outro</option>
          </select>
        </label>
        <app-textarea-field label="Mensagem" name="message" [control]="form.controls.message" [rows]="5" placeholder="Escreva a sua mensagem" />
        <button type="submit" class="button button-primary" [disabled]="loading()">{{ loading() ? 'A enviar…' : 'Enviar pedido' }}</button>
      </form>
    </div>
    <div>
      <div class="legal-card contact-info">
        <span class="eyebrow">Contactos SPOV</span>
        <div class="contact-details">
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M22 6l-10 7L2 6"/></svg>
            <div><strong>Email</strong><a href="mailto:geral.spov@gmail.com">geral.spov@gmail.com</a></div>
          </div>
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <div><strong>Instagram</strong><a href="https://www.instagram.com/sponcovet/" target="_blank" rel="noopener noreferrer">@sponcovet</a></div>
          </div>
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div><strong>Morada</strong><span>Rua Quintino António Gomes, n.º 12<br>2640-402 Mafra, Portugal</span></div>
          </div>
          <div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2"/><path d="M12 2v12"/><path d="M9 9l3-3 3 3"/></svg>
            <div><strong>NIF</strong><span>518 429 571</span></div>
          </div>
        </div>
        <p class="contact-response-note">A SPOV compromete-se a responder a todos os pedidos no prazo máximo de 2 dias úteis.</p>
      </div>
    </div>
  </div>
</app-page-intro>

<section class="section section-soft">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Localização</span><h2>Onde estamos.</h2></div>
    <div class="map-wrap">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-9.3350%2C38.9310%2C-9.3198%2C38.9450&amp;layer=mapnik&amp;marker=38.9380%2C-9.3274" width="100%" height="400" style="border:0;border-radius:20px" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa da localização da SPOV em Mafra"></iframe>
    </div>
  </div>
</section>
  `
})
export class ContactsComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  protected loading = signal(false);
  protected error = signal('');
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    subject: new FormControl('Contacto', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const { name, email, subject, message } = this.form.getRawValue();
      await this.contactsService.send({ name, email, subject, message });
      await this.router.navigate(['/thank-you']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
