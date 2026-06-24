import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, HeaderComponent } from './shared.components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="site-shell">
      <a class="skip-link" href="#main-content">Saltar para o conteudo</a>
      <app-header />
      <main id="main-content"><router-outlet /></main>
      <app-footer />
      <button type="button" class="scroll-to-top" [class.visible]="showScrollTop" aria-label="Voltar ao topo" (click)="scrollTop()">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
  `
})
export class AppComponent {
  protected showScrollTop = false;

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  protected scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
