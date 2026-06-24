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
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand" aria-label="Página inicial SPOV"><app-logo /></a>
        <button type="button" class="menu-toggle" [attr.aria-expanded]="menuOpen" (click)="menuOpen = !menuOpen">Menu</button>
        <nav class="site-nav" [class.open]="menuOpen" aria-label="Navegação principal">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" (click)="menuOpen = false">{{ item.label }}</a>
          }
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
        <div><strong>SPOV</strong><p>Sociedade Portuguesa de Oncologia Veterinária.</p></div>
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
