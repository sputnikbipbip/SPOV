import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PartnersService } from '../services/partners.service';

@Component({
  selector: 'app-partner-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="admin-login">
      <div class="login-form">
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" ngSrc="assets/images/SPOV_Logo.png" width="443" height="285" alt="SPOV">
        </a>

        @if (sent()) {
          <div class="success-banner">
            <strong>Email enviado.</strong>
            <p>Se o email existir na nossa base de dados, receberá instruções para redefinir a palavra-passe.</p>
          </div>
          <p style="text-align:center;margin-top:1rem;">
            <a routerLink="/partners/login" style="color:var(--spov-teal);font-weight:600;">Voltar para o login</a>
          </p>
        } @else {
          <h2>Recuperar palavra-passe</h2>
          <p style="text-align:center;color:var(--spov-muted);font-size:0.9rem;margin:0 0 0.5rem;">
            Receberá um link para redefinir a sua palavra-passe.
          </p>

          @if (error()) { <div class="form-error-banner">{{ error() }}</div> }

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <label>
              E-mail
              <input type="email" formControlName="email" placeholder="nome@exemplo.pt" autocomplete="email" />
            </label>

            <button type="submit" class="button button-primary" [disabled]="loading()" style="width:100%;justify-content:center;">
              {{ loading() ? 'A enviar…' : 'Enviar instruções' }}
            </button>
          </form>

          <p style="text-align:center;font-size:0.9rem;color:var(--spov-muted);margin:0;margin-top:0.5rem;">
            <a routerLink="/partners/login" style="color:var(--spov-teal);font-weight:600;text-decoration:underline;">Voltar para o login</a>
          </p>
        }
      </div>
    </div>
  `
})
export class PartnerForgotPasswordComponent {
  private readonly partnersService = inject(PartnersService);

  protected loading = signal(false);
  protected error = signal('');
  protected sent = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const { email } = this.form.getRawValue();
      await this.partnersService.forgotPassword(email);
      this.sent.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
