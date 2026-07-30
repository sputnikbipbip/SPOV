import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-partner-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="admin-login">
      <form class="login-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" src="assets/images/SPOV_Logo.png" alt="SPOV">
        </a>
        <h2>Área Reservada</h2>
        <p style="text-align:center;color:var(--spov-muted);font-size:0.9rem;margin:0 0 0.5rem;">Aceda ao seu perfil de sócio</p>

        @if (error) { <div class="form-error-banner">{{ error }}</div> }

        <label>
          E-mail
          <input type="email" formControlName="email" placeholder="nome@exemplo.pt" autocomplete="email" />
        </label>

        <label>
          Palavra-passe
          <input type="password" formControlName="password" placeholder="A sua palavra-passe" autocomplete="current-password" />
        </label>

        <button type="submit" class="button button-primary" [disabled]="loading" style="width:100%;justify-content:center;">
          {{ loading ? 'A iniciar sessão…' : 'Iniciar Sessão' }}
        </button>

        <p style="text-align:center;font-size:0.9rem;color:var(--spov-muted);margin:0;">
          Ainda não é sócio?
          <a routerLink="/partners/join" style="color:var(--spov-teal);font-weight:600;text-decoration:underline;">Aderir à SPOV</a>
        </p>
      </form>
    </div>
  `
})
export class PartnerLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected loading = false;
  protected error = '';

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.login(email, password);
      await this.router.navigate(['/partners/profile']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Credenciais inválidas. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}