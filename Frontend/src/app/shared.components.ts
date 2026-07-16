import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { eventMeta, navItems } from './content';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `<div class="spov-logo" aria-label="SPOV"><span>SPOV</span><small>Oncologia Veterinária</small></div>`
})
export class LogoComponent {}

@Component({
  selector: 'app-event-meta',
  standalone: true,
  template: `
    <div class="event-meta" [class.event-meta-invert]="invert">
      @for (item of eventMeta; track item.label) {
        <div><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
      }
    </div>
  `
})
export class EventMetaComponent {
  @Input() invert = false;
  protected readonly eventMeta = eventMeta;
}

@Component({
  selector: 'app-page-intro',
  standalone: true,
  template: `
    <section class="page-intro">
      <div class="container">
        <span class="eyebrow">{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
        <p>{{ text }}</p>
        <ng-content />
      </div>
    </section>
  `
})
export class PageIntroComponent {
  @Input({ required: true }) eyebrow = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) text = '';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand-group" aria-label="Página inicial SPOV">
          <img class="header-logo" src="assets/images/SPOV_Logo.png" alt="SPOV">
          <span class="brand-text">Sociedade Portuguesa de Oncologia Veterinária</span>
        </a>
        <button type="button" class="menu-toggle" [attr.aria-expanded]="menuOpen" (click)="menuOpen = !menuOpen">Menu</button>
        <nav class="site-nav" [class.open]="menuOpen" aria-label="Navegação principal">
          @for (item of navItems; track item.path) {
            <a class="nav-link" [routerLink]="item.path" routerLinkActive="nav-link-active" (click)="menuOpen = false">{{ item.label }}</a>
          }
          <a class="nav-link" href="https://www.instagram.com/sponcovet/" target="_blank" rel="noopener noreferrer" aria-label="Instagram SPOV">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            Instagram
          </a>
        </nav>
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected readonly navItems = navItems;
  protected menuOpen = false;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div><strong>SPOV</strong><p>Sociedade Portuguesa de Oncologia Veterinária.</p><div class="footer-social"><a href="https://www.instagram.com/sponcovet/" target="_blank" rel="noopener noreferrer" aria-label="Instagram SPOV"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>Instagram</a><a href="mailto:geral.spov@gmail.com" aria-label="Email SPOV"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M22 6l-10 7L2 6"/></svg>geral.spov@gmail.com</a></div></div>
        <div class="footer-links">
          <a routerLink="/privacidade">Privacidade</a>
          <a routerLink="/cookies">Cookies</a>
          <a routerLink="/acessibilidade">Acessibilidade</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
