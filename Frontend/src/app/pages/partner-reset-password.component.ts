import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PartnersService } from '../services/partners.service';

@Component({
  selector: 'app-partner-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage],
  template: `
    <div class="admin-login">
      <div class="login-form">
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" ngSrc="assets/images/SPOV_Logo.png" width="443" height="285" alt="SPOV">
        </a>

        @if (reset()) {
          <div class="success-banner">
            <strong>Palavra-passe atualizada com sucesso.</strong>
            <p>Já pode iniciar sessão com a sua nova palavra-passe.</p>
          </div>
          <p style="text-align:center;margin-top:1rem;">
            <a routerLink="/partners/login" class="button button-primary" style="text-decoration:none;">Iniciar Sessão</a>
          </p>
        } @else {
          <h2>Definir nova palavra-passe</h2>
          <p style="text-align:center;color:var(--spov-muted);font-size:0.9rem;margin:0 0 0.5rem;">
            Escolha uma nova palavra-passe para a sua conta.
          </p>

          @if (error()) { <div class="form-error-banner">{{ error() }}</div> }
          @if (missingParams()) {
            <div class="form-error-banner">Link inválido ou expirado. Solicite uma nova recuperação de palavra-passe.</div>
            <p style="text-align:center;margin-top:1rem;">
              <a routerLink="/partners/forgot-password" class="button button-primary" style="text-decoration:none;">Recuperar palavra-passe</a>
            </p>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <label>
                Nova palavra-passe
                <input type="password" formControlName="newPassword" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
              </label>
              <label>
                Confirmar palavra-passe
                <input type="password" formControlName="confirmPassword" placeholder="Repita a nova palavra-passe" autocomplete="new-password" />
              </label>

              <button type="submit" class="button button-primary" [disabled]="loading()" style="width:100%;justify-content:center;">
                {{ loading() ? 'A guardar…' : 'Redefinir palavra-passe' }}
              </button>
            </form>
          }
        }
      </div>
    </div>
  `
})
export class PartnerResetPasswordComponent {
  private readonly partnersService = inject(PartnersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected loading = signal(false);
  protected error = signal('');
  protected reset = signal(false);
  protected missingParams = signal(false);

  private readonly email: string | null = null;
  private readonly code: string | null = null;

  protected readonly form = new FormGroup({
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.code = this.route.snapshot.queryParamMap.get('code');
    if (!this.email || !this.code) {
      this.missingParams.set(true);
    }
  }

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.error.set('As palavras-passe não coincidem.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.partnersService.resetPassword(this.email!, this.code!, newPassword);
      this.reset.set(true);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
