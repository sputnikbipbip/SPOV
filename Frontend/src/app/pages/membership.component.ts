import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { benefits, membershipFaq, posterUrl } from '../content';
import { FormFieldComponent, FormNotesComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [ReactiveFormsModule, PageIntroComponent, FormFieldComponent, FormNotesComponent],
  template: `
    <app-page-intro eyebrow="Sócios" title="Vantagens claras para quem quer participar, aprender e acompanhar a atividade da SPOV." text="A adesão deve ser simples, direta e alinhada com a visibilidade dos benefícios.">
      <div class="content-grid">@for (item of benefits; track item.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Material visual da SPOV">@if (item.badge) { <span class="badge badge-yellow">{{ item.badge }}</span> }<h3>{{ item.title }}</h3><p>{{ item.text }}</p></article> }</div>
      <div class="faq-list">@for (item of membershipFaq; track item[0]) { <article class="faq-item"><h3>{{ item[0] }}</h3><p>{{ item[1] }}</p></article> }</div>
      <form class="contact-form" action="https://formsubmit.co/azevedo.daniel.se@gmail.com" method="POST" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <input type="hidden" name="_subject" value="SPOV - Pedido de adesão"><input type="hidden" name="_template" value="table"><input type="hidden" name="_next" value="/obrigado">
        <app-form-notes />
        <div class="field-grid"><app-form-field label="Nome" name="name" [control]="form.controls.name" placeholder="Nome completo" /><app-form-field label="Email" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." /></div>
        <app-form-field label="Perfil profissional" name="profile" [control]="form.controls.profile" placeholder="Clínico, enfermeiro, investigador..." />
        <button type="submit" class="button button-primary">Pedir informação</button>
      </form>
    </app-page-intro>
  `
})
export class MembershipComponent {
  protected readonly posterUrl = posterUrl;
  protected readonly benefits = benefits;
  protected readonly membershipFaq = membershipFaq;
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    profile: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  protected submit() {
    if (this.form.invalid) this.form.markAllAsTouched();
  }
}
