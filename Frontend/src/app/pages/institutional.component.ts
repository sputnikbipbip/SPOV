import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { posterUrl } from '../content';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, PageIntroComponent],
  template: `
<app-page-intro eyebrow="A Sociedade" title="Uma sociedade para ligar rigor científico, prática clínica e comunidade." text="A SPOV organiza conhecimento, promove partilha e cria um ponto de referência para profissionais ligados à oncologia veterinária.">
  <div class="split-section">
    <div>
      <span class="eyebrow">Missão</span>
      <h2>Promover a oncologia veterinária em Portugal.</h2>
      <p>A SPOV tem como missão congregar profissionais, investigadores e parceiros interessados na oncologia veterinária, promovendo a atualização científica, a partilha de conhecimento e o desenvolvimento de boas práticas na abordagem ao doente oncológico. Aberta a médicos veterinários, enfermeiros veterinários, estudantes, médicos de medicina humana, investigadores, biólogos e outros interessados.</p>
    </div>
    <div>
      <img class="section-image" [src]="posterUrl" alt="Identidade visual da SPOV" loading="lazy" decoding="async">
    </div>
  </div>
</app-page-intro>

<section class="section">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Objetivos</span><h2>Eixos fundamentais da atividade da SPOV.</h2></div>
    <div class="content-grid">
      <article class="content-card">
        <h3>Formação contínua</h3>
        <p>Organizar congressos, webinares e sessões clínicas que promovam a atualização de conhecimentos em oncologia veterinária, adaptados à realidade portuguesa.</p>
      </article>
      <article class="content-card">
        <h3>Investigação</h3>
        <p>Fomentar a produção e divulgação de conhecimento científico, apoiando projetos de investigação e atribuindo bolsas às melhores teses na área.</p>
      </article>
      <article class="content-card">
        <h3>Guidelines nacionais</h3>
        <p>Desenvolver orientações nacionais adaptadas à prática clínica em Portugal, abordando áreas como a segurança na administração de citotóxicos e o diagnóstico precoce.</p>
      </article>
    </div>
  </div>
</section>

<section class="section section-soft">
  <div class="container split-section">
    <div>
      <span class="eyebrow">Quem pode participar</span>
      <h2>Uma sociedade aberta a todos os interessados.</h2>
    </div>
    <div>
      <p>A SPOV dirige-se a médicos veterinários, enfermeiros veterinários, investigadores, estudantes e todos os profissionais com interesse na oncologia veterinária. A participação é aberta e a adesão pode ser solicitada através do formulário disponível na página de <a routerLink="/socios">Sócios</a>.</p>
      <div class="inline-links"><a routerLink="/socios">Tornar-me sócio</a><a routerLink="/contactos">Contactar SPOV</a></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Atividade</span><h2>O que faz a SPOV.</h2></div>
    <div class="faq-list">
      <article class="faq-item"><h3>Eventos científicos</h3><p>Organização de congressos, jornadas e sessões clínicas dedicadas à oncologia veterinária, com participação de oradores nacionais e internacionais. O I Congresso Anual SPOV realizou-se a 22 de novembro de 2025, em Coimbra, com o tema "As várias faces do Mastocitoma".</p></article>
      <article class="faq-item"><h3>Formação e webinares</h3><p>Promoção de cursos e webinares práticos dirigidos a profissionais e estudantes, com conteúdos atualizados e aplicáveis à prática clínica, incluindo programas paralelos para médicos veterinários e enfermeiros veterinários.</p></article>
      <article class="faq-item"><h3>Sensibilização e parcerias</h3><p>Colaboração com entidades de oncologia humana, como a Sociedade Portuguesa de Oncologia e a Liga Portuguesa Contra o Cancro, em eventos conjuntos e campanhas de deteção precoce dirigidas ao público em geral.</p></article>
    </div>
  </div>
</section>
  `
})
export class AboutComponent {
  protected readonly posterUrl = posterUrl;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [PageIntroComponent],
  template: `
<app-page-intro eyebrow="História" title="Um percurso institucional para afirmar a oncologia veterinária." text="Fundada em janeiro de 2025, a SPOV nasce da necessidade de congregar profissionais e promover a oncologia veterinária em Portugal.">
  <div class="split-section">
    <div>
      <span class="eyebrow">Fundação</span>
      <h2>8 de janeiro de 2025</h2>
      <p>A Sociedade Portuguesa de Oncologia Veterinária é constituída como associação sem fins lucrativos, com sede em Mafra, distrito de Lisboa. Desde o primeiro momento, a SPOV afirmou-se como um ponto de encontro para médicos veterinários, enfermeiros, investigadores e estudantes interessados em oncologia veterinária e comparada.</p>
    </div>
    <div>
      <img class="section-image" [src]="posterUrl" alt="Referência visual da SPOV" loading="lazy" decoding="async">
    </div>
  </div>
</app-page-intro>

<section class="section section-soft">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Marcos</span><h2>Os primeiros passos da SPOV.</h2></div>
    <div class="content-grid">
      <article class="content-card">
        <h3>Fundação</h3>
        <p><strong>Janeiro 2025</strong> — Constituição oficial da SPOV, com o presidente Joaquim Henriques, médico veterinário e PhD pioneiro da oncologia veterinária em Portugal, à frente da direção.</p>
      </article>
      <article class="content-card">
        <h3>I Congresso Anual</h3>
        <p><strong>22 de novembro de 2025</strong> — Realização do primeiro congresso anual no Hotel Coimbra Aeminium, subordinado ao tema "As várias faces do Mastocitoma", com cerca de 150 participantes.</p>
      </article>
      <article class="content-card">
        <h3>Crescimento</h3>
        <p><strong>Início de 2026</strong> — A SPOV conta com cerca de 180 sócios com quotas ativas, na sua maioria médicos veterinários, seguidos de enfermeiros e estudantes.</p>
      </article>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Atividades</span><h2>Realizações e projetos em curso.</h2></div>
    <div class="faq-list">
      <article class="faq-item"><h3>Formação e webinares</h3><p>Programa regular de webinares sobre oncologia veterinária, com conteúdos dirigidos a médicos veterinários e enfermeiros, abordando desde atualizações científicas a boas práticas clínicas.</p></article>
      <article class="faq-item"><h3>Guidelines nacionais</h3><p>Criação das primeiras orientações nacionais adaptadas à realidade portuguesa, começando pela segurança no armazenamento e administração de citotóxicos, e advocacia junto das faculdades para maior peso da oncologia nos currículos.</p></article>
      <article class="faq-item"><h3>Investigação e prémios</h3><p>Atribuição de bolsas de estudo para as melhores teses de mestrado e doutoramento em oncologia veterinária e enfermagem, financiadas por donativos de tutores e parceiros.</p></article>
    </div>
  </div>
</section>
  `
})
export class HistoryComponent { protected readonly posterUrl = posterUrl; }

@Component({
  selector: 'app-governance',
  standalone: true,
  imports: [PageIntroComponent],
  template: `
<app-page-intro eyebrow="Governação" title="Estrutura clara, documentos essenciais e compromisso com a transparência." text="A SPOV é dirigida por profissionais experientes, com ligações académicas e internacionais, comprometidos com o rigor e a transparência.">
  <div class="split-section">
    <div>
      <span class="eyebrow">Direção</span>
      <h2>Liderança da SPOV.</h2>
      <p>A direção da SPOV é composta por profissionais com vasta experiência na área da oncologia veterinária, garantindo a qualidade científica e a gestão rigorosa da associação.</p>
    </div>
    <div>
      <img class="section-image" [src]="posterUrl" alt="Identidade SPOV" loading="lazy" decoding="async">
    </div>
  </div>
</app-page-intro>

<section class="section section-soft">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Presidente</span><h2>Joaquim Henriques, MV, PhD.</h2></div>
    <div class="split-section">
      <div>
        <p>Médico Veterinário e PhD, é uma figura pioneira da oncologia veterinária em Portugal. Responsável pelo serviço de oncologia no AniCura Atlântico Hospital Veterinário, mantém ligações académicas com a Universidade Lusófona e colaborações internacionais com a ESVONC (European Society of Veterinary Oncology).</p>
      </div>
      <div>
        <p>Lidera a SPOV desde a sua fundação em janeiro de 2025, orientando a associação para a promoção da formação contínua, da investigação e do desenvolvimento de guidelines nacionais adaptadas à realidade portuguesa.</p>
        <div class="inline-links">
          <a href="https://www.instagram.com/sponcovet/" target="_blank" rel="noopener noreferrer">Instagram SPOV</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Conselho Científico</span><h2>Multidisciplinar e consultivo.</h2></div>
    <div class="content-grid">
      <article class="content-card">
        <h3>Andreia Santos</h3>
        <p>Vice-presidente ou diretora em alguns contextos, referenciada na liderança da associação.</p>
      </article>
      <article class="content-card">
        <h3>Avaliação científica</h3>
        <p>O Conselho Científico, em formação, será responsável por avaliar conteúdos, guidelines e prémios da SPOV, garantindo o rigor técnico-científico.</p>
      </article>
      <article class="content-card">
        <h3>Rede internacional</h3>
        <p>A SPOV integra redes como a ESVONC e o World Veterinary Oncology Consortium, promovendo a colaboração internacional e a partilha de conhecimento.</p>
      </article>
    </div>
  </div>
</section>

<section class="section section-soft">
  <div class="container">
    <div class="section-heading"><span class="eyebrow">Documentos</span><h2>Estatutos e informação legal.</h2></div>
    <div class="legal-card">
      <p>A SPOV é uma associação sem fins lucrativos, registada com o NIF 518429571 e sede na Rua Quintino António Gomes, n.º 12, 2640-402 Mafra, Portugal. O CAE é 94120 — Atividades de organizações profissionais. Os estatutos e restantes documentos legais estão disponíveis para consulta pelos associados.</p>
    </div>
  </div>
</section>
  `
})
export class GovernanceComponent {
  protected readonly posterUrl = posterUrl;
}
