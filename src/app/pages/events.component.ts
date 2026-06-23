import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { posterUrl } from '../content';
import { EventMetaComponent, PageIntroComponent } from '../shared.components';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink, PageIntroComponent, EventMetaComponent],
  template: `<app-page-intro eyebrow="Eventos" title="Eventos organizados para leitura imediata e decisão rápida." text="Data, hora, local e benefícios aparecem logo no primeiro ecrã, mantendo a lógica dos posts da SPOV."><article class="event-list-card"><img class="section-image" [src]="posterUrl" alt="Identidade visual do evento SPOV"><div><span class="badge badge-dark">Congresso SPOV 2025</span><h3>Os essenciais de Oncologia para Enfermeiros</h3><p>Atualização científica, comunidade e partilha prática num formato claro e acessível.</p></div><app-event-meta /><a routerLink="/eventos/congresso-spov-2025" class="button button-primary">Mais informação</a></article></app-page-intro>`
})
export class EventsComponent { protected readonly posterUrl = posterUrl; }
