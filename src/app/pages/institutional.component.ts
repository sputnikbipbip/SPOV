import { Component } from '@angular/core';
import { posterUrl } from '../content';
import { PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PageIntroComponent],
  template: `<app-page-intro eyebrow="A Sociedade" title="Uma sociedade para ligar rigor científico, prática clínica e comunidade." text="A SPOV organiza conhecimento, promove partilha e cria um ponto de referência para profissionais ligados à oncologia veterinária."><div class="content-grid">@for (card of cards; track card.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Identidade visual da SPOV" loading="lazy" decoding="async"><h3>{{ card.title }}</h3><p>{{ card.text }}</p></article> }</div></app-page-intro>`
})
export class AboutComponent {
  protected readonly posterUrl = posterUrl;
  protected readonly cards = [
    { title: 'Sobre', text: 'Missão técnico-científica, espírito colaborativo e foco em aprendizagem contínua.' },
    { title: 'História', text: 'Um arranque institucional pensado para consolidar a oncologia veterinária em Portugal.' },
    { title: 'Governação', text: 'Estrutura clara, documentos essenciais e compromisso com transparência.' }
  ];
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [PageIntroComponent],
  template: `<app-page-intro eyebrow="História" title="Um percurso institucional para afirmar a oncologia veterinária." text="Esta página serve como placeholder controlado do MVP, mantendo o tom e a estrutura pensados para futura expansão editorial."><div class="legal-card"><img class="section-image" [src]="posterUrl" alt="Referência visual da SPOV" loading="lazy" decoding="async"><p>A história da SPOV deve evoluir aqui em formato editorial, com marcos, contexto de arranque e consolidação da associação.</p></div></app-page-intro>`
})
export class HistoryComponent { protected readonly posterUrl = posterUrl; }

@Component({
  selector: 'app-governance',
  standalone: true,
  imports: [PageIntroComponent],
  template: `<app-page-intro eyebrow="Governação" title="Governação clara e legível desde o primeiro lançamento." text="A estrutura institucional deve ser apresentada com transparência, simplicidade e leitura imediata."><div class="content-grid">@for (card of cards; track card.title) { <article class="content-card"><img class="card-image" [src]="posterUrl" alt="Identidade SPOV" loading="lazy" decoding="async"><h3>{{ card.title }}</h3><p>{{ card.text }}</p></article> }</div></app-page-intro>`
})
export class GovernanceComponent {
  protected readonly posterUrl = posterUrl;
  protected readonly cards = [
    { title: 'Órgãos sociais', text: 'Espaço para composição validada da estrutura institucional.' },
    { title: 'Documentação', text: 'Área preparada para estatutos, regulamentos e materiais essenciais.' },
    { title: 'Compromisso', text: 'Clareza, acessibilidade e relação de confiança com sócios e parceiros.' }
  ];
}
