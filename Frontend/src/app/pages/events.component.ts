import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { posterUrl } from '../content';
import { EventMetaComponent, PageIntroComponent } from '../shared.components';
import { EventsService, EventDto } from '../services/events.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink, PageIntroComponent, EventMetaComponent],
  template: `<app-page-intro eyebrow="Eventos" title="Eventos organizados para leitura imediata e decisão rápida." text="Data, hora, local e benefícios aparecem logo no primeiro ecrã, mantendo a lógica dos posts da SPOV.">
    @if (events.length === 0) { <p class="empty-state">Ainda não há eventos agendados.</p> }
    @for (event of events; track event.id) {
      <article class="event-list-card"><img class="section-image" [src]="posterUrl" alt="Identidade visual do evento SPOV"><div><span class="badge badge-dark">{{ event.title }}</span><h3>{{ event.title }}</h3><p>{{ event.description }}</p></div><app-event-meta /><a [routerLink]="'/eventos/' + event.id" class="button button-primary">Mais informação</a></article>
    }
  </app-page-intro>`
})
export class EventsComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  protected readonly posterUrl = posterUrl;
  protected events: EventDto[] = [];

  async ngOnInit() {
    try {
      this.events = await this.eventsService.getAll();
    } catch {
      this.events = [];
    }
  }
}
