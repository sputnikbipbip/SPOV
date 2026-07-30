import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventMetaComponent } from '../shared.components';
import { AuthService } from '../services/auth.service';
import { EventsService, EventDto } from '../services/events.service';

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  if (s.toDateString() === e.toDateString()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [RouterLink, EventMetaComponent],
  template: `
    <section class="section event-hero">
      <div class="container event-hero-grid">
        <div>
          <div class="event-hero-badges">
            @if (event?.ceCredits) { <span class="badge badge-white">{{ event!.ceCredits }} créditos CE</span> }
            @if (event?.isMembersOnly) { <span class="badge badge-yellow">Exclusivo sócios</span> }
          </div>
          <h1>{{ event?.title ?? 'Evento' }}</h1>
          <p>{{ event?.description ?? '' }}</p>
          <div class="event-hero-meta">
            <strong>{{ event ? formatDateRange(event.startDate, event.endDate) : '' }}</strong>
            @if (event?.location) { <span>{{ event!.location }}</span> }
          </div>
          <div class="hero-actions">
            @if (isLoggedIn) {
              @if (isRegistered) {
                <span class="badge badge-dark" style="font-size:1rem;">Inscrito</span>
                <button type="button" class="button button-danger" [disabled]="cancelLoading" (click)="cancel()">{{ cancelLoading ? 'A cancelar…' : 'Cancelar inscrição' }}</button>
              } @else {
                <button type="button" class="button button-primary" [disabled]="registerLoading" (click)="register()">{{ registerLoading ? 'A registar…' : 'Inscrever como sócio' }}</button>
              }
            } @else {
              <a routerLink="/partners/login" class="button button-light">Inscrever-me</a>
            }
          </div>
          @if (registerError) { <div class="form-error-banner" style="margin-top:1rem;">{{ registerError }}</div> }
          @if (registerSuccess) { <div class="success-banner" style="margin-top:1rem;"><strong>Inscrição confirmada!</strong></div> }
        </div>
        <div class="event-panel">
          <span class="eyebrow eyebrow-light">{{ event?.title ?? 'Evento' }}</span>
          <app-event-meta [invert]="true" [eventData]="event" />
        </div>
      </div>
      <div class="container" style="margin-top:2rem;">
        <a routerLink="/events" class="button button-secondary">← Voltar para eventos</a>
      </div>
    </section>
  `
})
export class EventComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  protected event: EventDto | null = null;
  protected isRegistered = false;
  protected registerLoading = false;
  protected cancelLoading = false;
  protected registerError = '';
  protected registerSuccess = false;
  protected readonly formatDateRange = formatDateRange;

  protected get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      await this.router.navigate(['/events']);
      return;
    }
    try {
      this.event = await this.eventsService.getById(id);
      if (this.isLoggedIn) {
        const registrations = await this.eventsService.getMyRegistrations();
        this.isRegistered = registrations.some(r => r.eventId === id);
      }
    } catch {
      await this.router.navigate(['/events']);
    }
  }

  protected async register() {
    if (!this.event) return;
    this.registerLoading = true;
    this.registerError = '';
    this.registerSuccess = false;
    try {
      await this.eventsService.registerForEvent(this.event.id);
      this.isRegistered = true;
      this.registerSuccess = true;
    } catch (e) {
      this.registerError = e instanceof Error ? e.message : 'Erro ao registar no evento.';
    } finally {
      this.registerLoading = false;
    }
  }

  protected async cancel() {
    if (!this.event) return;
    this.cancelLoading = true;
    this.registerError = '';
    try {
      await this.eventsService.cancelRegistration(this.event.id);
      this.isRegistered = false;
    } catch (e) {
      this.registerError = e instanceof Error ? e.message : 'Erro ao cancelar inscrição.';
    } finally {
      this.cancelLoading = false;
    }
  }
}
