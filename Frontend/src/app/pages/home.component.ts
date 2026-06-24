import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { benefits, futureAreas, posterUrl } from '../content';
import { EventMetaComponent, LogoComponent } from '../shared.components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EventMetaComponent, LogoComponent],
  template: `
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Sociedade Portuguesa de Oncologia Veterinária</span>
          <h1>Ciência, formação e comunidade para a Oncologia Veterinária.</h1>
          <p>A SPOV reúne profissionais, investigadores e parceiros para promover atualização científica, eventos e aprendizagem contínua.</p>
          <div class="hero-actions">
            <a routerLink="/socios" class="button button-primary">Tornar-me sócio</a>
            <a routerLink="/eventos" class="button button-secondary">Ver eventos</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card hero-poster-cut">
            <div class="partner-badge-wrap">
              <span class="partner-dot">AEVPORT</span>
              <div><span class="badge badge-dark">20% desconto</span><span class="badge badge-yellow">Sócios AEVPORT</span></div>
            </div>
            <app-logo />
            <img class="section-image poster-image" [src]="posterUrl" alt="Poster visual da SPOV">
          </div>
        </div>
      </div>
      <div class="container event-strip-wrap">
        <div class="event-strip">
          <div><span class="eyebrow eyebrow-light">Próximo evento</span><h2>Os essenciais de Oncologia para Enfermeiros</h2></div>
          <app-event-meta [invert]="true" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Ser sócio</span><h2>Benefícios pensados para uma comunidade clínica e científica.</h2></div>
        <div class="benefit-grid">
          @for (item of benefits; track item.title) {
            <article class="benefit-card">
              @if (item.badge) { <span class="badge badge-yellow">{{ item.badge }}</span> }
              <h3>{{ item.title }}</h3><p>{{ item.text }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="section section-teal">
      <div class="container spotlight-grid">
        <div class="spotlight-poster">
          <div class="poster-top"><h3>Congresso SPOV 2025</h3><span class="badge badge-outline">Mais informação</span></div>
          <h2>Os essenciais de Oncologia para Enfermeiros</h2>
          <app-event-meta [invert]="true" />
          <img class="section-image section-image-contrast" [src]="posterUrl" alt="Material gráfico do congresso SPOV">
        </div>
        <div class="spotlight-copy">
          <span class="eyebrow eyebrow-light">Evento em destaque</span>
          <p>Um encontro focado em atualização científica, partilha prática e aproximação entre profissionais envolvidos no doente oncológico.</p>
          <a routerLink="/eventos/congresso-spov-2025" class="button button-light">Abrir página do evento</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split-section">
        <div><span class="eyebrow">A SPOV</span><h2>Uma base institucional clara, com foco em rigor e colaboração.</h2></div>
        <div><p>A SPOV afirma-se como ponto de encontro para profissionais e equipas interessadas em oncologia veterinária e comparada em Portugal.</p><div class="inline-links"><a routerLink="/sobre">Sobre</a><a routerLink="/historia">História</a><a routerLink="/governacao">Governação</a></div></div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Parceiros e patrocinadores</span><h2>Uma rede de colaboração visível, limpa e institucional.</h2></div>
        <div class="partner-grid">@for (name of partners; track name) { <div class="partner-card">{{ name }}</div> }</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Áreas em desenvolvimento</span><h2>Uma arquitetura preparada para crescer sem perder clareza.</h2></div>
        <div class="content-grid">
          @for (area of futureAreas; track area.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Identidade visual SPOV" loading="lazy" decoding="async"><h3>{{ area.title }}</h3><p>{{ area.text }}</p></article> }
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {
  protected readonly posterUrl = posterUrl;
  protected readonly benefits = benefits;
  protected readonly futureAreas = futureAreas;
  protected readonly partners = ['AEVPORT', 'Parceiro Clínico', 'Patrocinador Científico', 'Apoio Institucional'];
}
