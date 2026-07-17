import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <a routerLink="/admin" class="sidebar-brand">SPOV Admin</a>
        <nav class="sidebar-nav">
          <a routerLink="/admin/eventos" routerLinkActive="sidebar-active" class="sidebar-link">Eventos</a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/" class="sidebar-link">Ver Site</a>
          <button type="button" class="sidebar-link sidebar-logout" (click)="logout()">Sair</button>
        </div>
      </aside>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
