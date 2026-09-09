import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgOptimizedImage],
  template: `
    <div class="admin-login">
      <form class="login-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" ngSrc="assets/images/SPOV_Logo.png" width="443" height="285" alt="SPOV">
        </a>
        <h2>Acesso Administrador</h2>
        @if (error()) { <div class="form-error-banner">{{ error() }}</div> }
        <label>
          Email
          <input type="email" formControlName="email" placeholder="admin@spov.pt" autocomplete="email">
        </label>
        <label>
          Palavra-passe
          <input type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password">
        </label>
        <button type="submit" class="button button-primary" [disabled]="loading()">{{ loading() ? 'A entrar…' : 'Entrar' }}</button>
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
  protected loading = signal(false);
  protected error = signal('');

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigate(['/admin/events']);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Credenciais inválidas.');
    } finally {
      this.loading.set(false);
    }
  }
}
