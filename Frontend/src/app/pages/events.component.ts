import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventMetaComponent } from '../shared.components';
import { EventsService, EventDto } from '../services/events.service';

function eventStatus(start: string, end: string): { label: string; cls: string } {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now > e) return { label: 'Passado', cls: 'event-status-past' };
  if (now >= s && now <= e) return { label: 'A decorrer', cls: 'event-status-now' };
  return { label: 'Próximo', cls: 'event-status-upcoming' };
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.getDate().toString();
}

function formatMonth(iso: string): string {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return months[new Date(iso).getMonth()];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink, EventMetaComponent],
  template: `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Eventos</span>
          <h1>Eventos SPOV</h1>
        </div>
        @if (events.length === 0) { <p class="empty-state">Ainda não há eventos agendados.</p> }
        <div class="events-grid">
        @for (event of events; track event.id) {
          <article class="event-card" [class.event-card-past]="eventStatus(event.startDate, event.endDate).cls === 'event-status-past'">
            @if (event.imageData) {
              <img class="event-card-image" [src]="event.imageData" [alt]="event.title" loading="lazy" decoding="async">
            }
            <div class="event-card-top">
              <div class="event-date-badge">
                <span class="event-date-day">{{ formatDay(event.startDate) }}</span>
                <span class="event-date-month">{{ formatMonth(event.startDate) }}</span>
              </div>
              <span class="event-status {{ eventStatus(event.startDate, event.endDate).cls }}">{{ eventStatus(event.startDate, event.endDate).label }}</span>
            </div>
            <div class="event-card-body">
              <h3>{{ event.title }}</h3>
              <p>{{ event.description }}</p>
              <app-event-meta [eventData]="event" />
              <div class="event-card-badges">
                @if (event.isMembersOnly) { <span class="badge badge-yellow-inline">Sócios</span> }
              </div>
            </div>
            <a [routerLink]="'/events/' + event.id" class="event-card-cta">Mais informação →</a>
          </article>
        }
        </div>
      </div>
    </section>
  `
})
export class EventsComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  protected events: EventDto[] = [];
  protected readonly eventStatus = eventStatus;
  protected readonly formatDay = formatDay;
  protected readonly formatMonth = formatMonth;

  async ngOnInit() {
    try {
      const response = await this.eventsService.getAll({ pageSize: 50 });
      this.events = response.data;
    } catch {
      this.events = [];
    }
  }
}
