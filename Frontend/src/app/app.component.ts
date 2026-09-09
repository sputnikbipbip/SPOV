import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs';
import { FooterComponent, HeaderComponent } from './shared.components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  host: {
    '(window:scroll)': 'onScroll()'
  },
  template: `
    <div class="site-shell">
      <a class="skip-link" href="#main-content">Saltar para o conteudo</a>
      @if (!isAdminRoute()) {
        <app-header />
      }
      <main id="main-content"><router-outlet /></main>
      @if (!isAdminRoute()) {
        <app-footer />
      }
      <button type="button" class="scroll-to-top" [class.visible]="showScrollTop()" aria-label="Voltar ao topo" (click)="scrollTop()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
  `
})
export class AppComponent {
  private readonly router = inject(Router);

  protected readonly isAdminRoute = toSignal(
    this.router.events.pipe(
      startWith(null),
      map(() => this.router.url.startsWith('/admin'))
    )
  );

  protected showScrollTop = signal(false);

  onScroll() {
    this.showScrollTop.set(window.scrollY > 400);
  }

  protected scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
