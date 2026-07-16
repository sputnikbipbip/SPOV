import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { benefits, membershipFaq, posterUrl } from '../content';
import { FormFieldComponent, FormNotesComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';
import { ContactsService } from '../services/contacts.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [ReactiveFormsModule, PageIntroComponent, FormFieldComponent, FormNotesComponent],
  template: `
    <app-page-intro eyebrow="Sócios" title="Vantagens claras para quem quer participar, aprender e acompanhar a atividade da SPOV." text="A adesão deve ser simples, direta e alinhada com a visibilidade dos benefícios.">
      @if (error) { <div class="form-error-banner">{{ error }}</div> }
      <div class="content-grid">@for (item of benefits; track item.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Material visual da SPOV">@if (item.badge) { <span class="badge badge-yellow">{{ item.badge }}</span> }<h3>{{ item.title }}</h3><p>{{ item.text }}</p></article> }</div>
      <div class="faq-list">@for (item of membershipFaq; track item[0]) { <article class="faq-item"><h3>{{ item[0] }}</h3><p>{{ item[1] }}</p></article> }</div>
      <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-form-notes />
        <div class="field-grid"><app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" /><app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." /></div>
        <app-form-field label="Perfil profissional" name="profile" [control]="form.controls.profile" placeholder="Clínico, enfermeiro, investigador..." />
        <button type="submit" class="button button-primary" [disabled]="loading">{{ loading ? 'A enviar…' : 'Pedir informação' }}</button>
      </form>
    </app-page-intro>
  `
})
export class MembershipComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);
  protected readonly posterUrl = posterUrl;
  protected readonly benefits = benefits;
  protected readonly membershipFaq = membershipFaq;
  protected loading = false;
  protected error = '';
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    profile: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const { name, email, profile } = this.form.getRawValue();
      await this.contactsService.send({ name, email, subject: 'Pedido de adesão', message: profile });
      await this.router.navigate(['/obrigado']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
