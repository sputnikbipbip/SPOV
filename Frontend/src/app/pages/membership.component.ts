import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { benefits, membershipFaq } from '../content';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [RouterLink, PageIntroComponent],
  styles: [`
    .membership-hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; margin-top: 1.75rem; }
    .membership-join-cta { min-height: 60px; padding: 1rem 2rem; font-size: 1.05rem; box-shadow: 0 12px 28px rgba(15, 143, 151, 0.22); }
    .membership-join-cta span { margin-left: 0.35rem; font-size: 1.2em; }
    .membership-hero-note { margin: 0; color: var(--spov-muted); font-size: 0.9rem; }
    .membership-content { padding-block: clamp(2.5rem, 6vw, 4.5rem); }
    .membership-inner { width: min(100%, 1120px); margin-inline: auto; }
    .membership-section-heading { max-width: 680px; margin-bottom: 1.5rem; }
    .membership-section-heading h2 { margin: 0.4rem 0 0.5rem; font-size: clamp(1.5rem, 3vw, 2.15rem); }
    .membership-section-heading p { margin: 0; color: var(--spov-muted); }
    .membership-benefits-grid { align-items: stretch; }
    .membership-benefit-card { display: flex; min-height: 245px; flex-direction: column; align-items: flex-start; padding: 1.75rem; }
    .membership-benefit-index { display: grid; width: 2.6rem; height: 2.6rem; place-items: center; margin-bottom: 1.25rem; border-radius: 50%; background: rgba(15, 143, 151, 0.1); color: var(--spov-teal); font-weight: 800; }
    .membership-benefit-card h3 { margin: 0.75rem 0 0.45rem; }
    .membership-benefit-card p { margin: 0; color: var(--spov-muted); }
    .membership-benefit-highlight { margin-top: auto; padding-top: 0.9rem; }
    .membership-faq { margin-top: clamp(2.5rem, 5vw, 4rem); }
    .membership-faq-list { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 1.25rem 0 0; }
    .membership-faq-card { padding: 1.35rem 1.5rem; }
    .membership-contact-card { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-top: 2rem; padding: clamp(1.35rem, 4vw, 2rem); border: 1px solid var(--spov-line); border-radius: 18px; background: var(--spov-white); box-shadow: var(--shadow-soft); }
    .membership-contact-card h2 { margin: 0.35rem 0; font-size: clamp(1.25rem, 2.6vw, 1.8rem); }
    .membership-contact-card p { margin: 0; color: var(--spov-muted); }
    .membership-information-cta { flex: 0 0 auto; }

    @media (max-width: 900px) {
      .membership-benefits-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 620px) {
      .membership-content { padding-block: 2.25rem 3rem; }
      .membership-hero-actions { align-items: stretch; flex-direction: column; }
      .membership-join-cta { width: 100%; }
      .membership-benefits-grid, .membership-faq-list { grid-template-columns: 1fr; }
      .membership-section-heading { margin-bottom: 1rem; }
      .membership-section-heading h2 { font-size: 1.55rem; }
      .membership-benefit-card { min-height: 0; padding: 1.25rem; }
      .membership-benefit-index { margin-bottom: 0.75rem; }
      .membership-benefit-card h3 { font-size: 1.08rem; }
      .membership-faq { margin-top: 2.25rem; }
      .membership-faq-card { padding: 1.1rem 1.2rem; }
      .membership-contact-card { align-items: stretch; flex-direction: column; gap: 1rem; margin-top: 1.5rem; padding: 1.25rem; }
      .membership-information-cta { width: 100%; }
    }
  `],
  template: `
    <app-page-intro eyebrow="Sócios" title="Faça parte da comunidade SPOV." text="Aprenda, partilhe conhecimento e acompanhe a oncologia veterinária em Portugal.">
      <div class="membership-hero-actions" aria-label="Ações de adesão">
        <a routerLink="/partners/join" class="button button-primary membership-join-cta">Aderir à SPOV <span aria-hidden="true">→</span></a>
        <p class="membership-hero-note">Inscrição online em poucos passos.</p>
      </div>
    </app-page-intro>

    <section class="section section-soft membership-content">
      <div class="container membership-inner">
        <div class="membership-section-heading">
          <span class="eyebrow">Vantagens</span>
          <h2>Uma comunidade para aprender e crescer.</h2>
          <p>Conhecimento científico, ligação profissional e condições especiais para quem acompanha a atividade da SPOV.</p>
        </div>

        <div class="content-grid membership-benefits-grid">
          @for (item of benefits; track item.title; let index = $index) {
            <article class="content-card membership-benefit-card">
              <span class="membership-benefit-index" aria-hidden="true">0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
              @if (item.badge) { <span class="badge badge-yellow membership-benefit-highlight">{{ item.badge }}</span> }
            </article>
          }
        </div>

        <section class="membership-faq" aria-labelledby="membership-faq-heading">
          <div class="membership-section-heading">
            <span class="eyebrow">Adesão</span>
            <h2 id="membership-faq-heading">Respostas antes de começar.</h2>
          </div>
          <div class="faq-list membership-faq-list">
            @for (item of membershipFaq; track item[0]) {
              <article class="faq-item membership-faq-card">
                <h3>{{ item[0] }}</h3>
                <p>{{ item[1] }}</p>
              </article>
            }
          </div>
        </section>

        <aside class="membership-contact-card" aria-labelledby="membership-contact-heading">
          <div>
            <span class="eyebrow">Precisa de ajuda?</span>
            <h2 id="membership-contact-heading">Estamos disponíveis para esclarecer dúvidas.</h2>
            <p>Envie-nos uma mensagem e a equipa SPOV entrará em contacto.</p>
          </div>
          <a routerLink="/contacts" class="button button-secondary membership-information-cta">Pedir informação</a>
        </aside>
      </div>
    </section>
  `
})
export class MembershipComponent {
  protected readonly benefits = benefits;
  protected readonly membershipFaq = membershipFaq;
}
