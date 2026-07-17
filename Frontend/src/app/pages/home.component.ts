import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Sociedade Portuguesa de Oncologia Veterinária</span>
          <h1>Ciência, formação e comunidade para a oncologia veterinária.</h1>
          <p>A SPOV reúne profissionais, investigadores e parceiros para promover a atualização científica, a investigação e as melhores práticas na abordagem ao doente oncológico.</p>
          <div class="hero-actions">
            <a routerLink="/socios" class="button button-primary">Tornar-me sócio</a>
            <a routerLink="/sobre" class="button button-secondary">Conhecer a SPOV</a>
          </div>
        </div>
        <div class="hero-visual" [style.opacity]="heroImageOpacity">
          <img class="hero-animal-img" src="assets/images/hero-cat-dog.jpg" alt="Cão e gato">
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Ser sócio</span><h2>Vantagens de fazer parte da SPOV.</h2></div>
        <div class="benefit-grid">
          <article class="benefit-card">
            <h3>Atualização científica</h3>
            <p>Acesso a conteúdos, webinares, congressos e materiais técnicos pensados para a prática clínica.</p>
          </article>
          <article class="benefit-card">
            <h3>Comunidade profissional</h3>
            <p>Ligação a colegas, equipas e parceiros com interesse em oncologia veterinária e comparada.</p>
          </article>
          <article class="benefit-card">
            <h3>Condições especiais</h3>
            <p>Benefícios progressivos em inscrições em eventos, iniciativas e parcerias selecionadas.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-teal">
      <div class="container spotlight-grid">
        <div class="spotlight-poster">
          <div class="poster-top"><h3>I Congresso SPOV 2025</h3><span class="badge badge-outline">22 NOV 2025</span></div>
          <h2>As várias faces do Mastocitoma</h2>
          <p style="color: rgba(255,255,255,0.85); line-height: 1.6;">Hotel Coimbra Aeminium &mdash; Programas paralelos para médicos veterinários e enfermeiros veterinários. Oradores nacionais e internacionais.</p>
        </div>
        <div class="spotlight-copy">
          <span class="eyebrow eyebrow-light">Evento de lançamento</span>
          <p>O primeiro congresso anual da SPOV marcou o arranque oficial das atividades da associação, com cerca de 150 participantes entre veterinários, enfermeiros e estudantes.</p>
          <a routerLink="/eventos" class="button button-light">Ver eventos</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Atividade</span><h2>O que faz a SPOV.</h2></div>
        <div class="content-grid">
          <article class="content-card">
            <h3>Formação contínua</h3>
            <p>Organização de congressos, webinares e sessões clínicas dedicadas à oncologia veterinária, com conteúdos atualizados e aplicáveis à prática clínica.</p>
          </article>
          <article class="content-card">
            <h3>Guidelines nacionais</h3>
            <p>Criação de orientações adaptadas à realidade portuguesa, como a primeira guideline sobre segurança no armazenamento e administração de citotóxicos.</p>
          </article>
          <article class="content-card">
            <h3>Investigação e prémios</h3>
            <p>Atribuição de bolsas de estudo para as melhores teses de mestrado e doutoramento em oncologia veterinária e enfermagem.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">A SPOV</span><h2>Uma base institucional clara, com foco em rigor e colaboração.</h2></div>
        <div class="split-section">
          <div><p>A SPOV afirma-se como ponto de encontro para profissionais e equipas interessadas em oncologia veterinária e comparada em Portugal. Com cerca de 180 sócios, a associação promove a formação, a investigação e a sensibilização para a oncologia veterinária.</p></div>
          <div><div class="inline-links"><a routerLink="/sobre">Sobre</a><a routerLink="/historia">História</a><a routerLink="/governacao">Governação</a></div></div>
        </div>
      </div>
    </section>

    <section class="section sponsors">
      <div class="container">
        <div class="section-heading"><span class="eyebrow">Parceiros e patrocinadores</span><h2>Entidades que apoiam a SPOV.</h2></div>
        <div class="sponsors-carousel">
          <div class="sponsors-track">
            @for (item of duplicatedSponsors; track item.name) {
              <a class="sponsor-item" [href]="item.url" target="_blank" rel="noopener noreferrer" [title]="item.name">
                <span class="sponsor-name">{{ item.name }}</span>
              </a>
            }
          </div>
          <button type="button" class="sponsors-nav sponsors-prev" aria-label="Anterior" (click)="scrollCarousel(-1)">‹</button>
          <button type="button" class="sponsors-nav sponsors-next" aria-label="Seguinte" (click)="scrollCarousel(1)">›</button>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {
  protected heroImageOpacity = 1;

  @HostListener('window:scroll')
  onScroll() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
    this.heroImageOpacity = Math.max(0, Math.min(1, (progress - 0.15) / 0.55));
  }

  protected readonly sponsors = [
    { name: 'Zoetis', url: 'https://www.zoetis.com/' },
    { name: 'Codivet', url: '' },
    { name: 'Farmodiética', url: '' },
    { name: 'Boehringer Ingelheim', url: 'https://www.boehringer-ingelheim.com/animal-health' },
    { name: 'DNAtech', url: '' }
  ];

  protected readonly duplicatedSponsors = [...this.sponsors, ...this.sponsors, ...this.sponsors];

  private carouselEl?: HTMLDivElement;
  private scrollAmount = 0;

  protected scrollCarousel(dir: number) {
    if (!this.carouselEl) {
      this.carouselEl = document.querySelector('.sponsors-track') as HTMLDivElement;
    }
    const step = 280;
    this.scrollAmount += dir * step;
    this.carouselEl.style.transition = 'transform 400ms ease';
    this.carouselEl.style.transform = `translateX(${this.scrollAmount}px)`;
  }
}
