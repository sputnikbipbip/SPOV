import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="admin-login">
      <form class="login-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" src="assets/images/SPOV_Logo.png" alt="SPOV">
        </a>
        <h2>Acesso Administrador</h2>
        @if (error) { <div class="form-error-banner">{{ error }}</div> }
        <label>
          Email
          <input type="email" formControlName="email" placeholder="admin@spov.pt" autocomplete="email">
        </label>
        <label>
          Palavra-passe
          <input type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password">
        </label>
        <button type="submit" class="button button-primary" [disabled]="loading">{{ loading ? 'A entrar…' : 'Entrar' }}</button>
      </form>
    </div>
  `
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required })
  });
  protected loading = false;
  protected error = '';

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigate(['/admin/eventos']);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Credenciais inválidas.';
    } finally {
      this.loading = false;
    }
  }
}
