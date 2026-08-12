import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section section-soft">
      <div class="container">
        <span class="eyebrow">404</span>
        <h1>Página não encontrada</h1>
        <p>A página que procura não existe ou foi movida.</p>
        <a routerLink="/" class="button button-primary">Voltar ao início</a>
      </div>
    </section>
  `
})
export class NotFoundComponent {}
