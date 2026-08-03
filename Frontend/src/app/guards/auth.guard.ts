import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (!this.auth.isAuthenticated()) return this.router.parseUrl('/admin/login');
    const user = await this.auth.getCurrentUser();
    if (user && user.roles.includes('Administrator')) return true;
    return this.router.parseUrl('/admin/login');
  }
}
