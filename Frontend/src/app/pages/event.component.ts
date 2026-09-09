import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EventsService, EventDto } from '../services/events.service';

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const date = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (s.toDateString() === e.toDateString()) return `${date(s)} · ${time(s)} – ${time(e)}`;
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${date(s)} – ${date(e)}`;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section event-hero">
      <div class="container event-hero-grid">
        @if (event()?.imageData) {
          <div class="event-hero-image-wrap"><img class="event-hero-image" [src]="event()!.imageData" [alt]="event()!.title" /></div>
        }
        <div>
          <div class="event-hero-badges">
            @if (event()?.isMembersOnly) { <span class="badge badge-yellow">Exclusivo sócios</span> }
          </div>
          <h1>{{ event()?.title ?? 'Evento' }}</h1>
          <p>{{ event()?.description ?? '' }}</p>
          <div class="event-hero-meta">
            <div class="event-meta-item">
              <svg class="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="event-meta-label">Duração</span>
                <strong>{{ event() ? formatDateRange(event()!.startDate, event()!.endDate) : '' }}</strong>
              </div>
            </div>
            @if (event()?.location) {
              <div class="event-meta-item">
                <svg class="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <span class="event-meta-label">Local</span>
                  <strong>{{ event()!.location }}</strong>
                </div>
              </div>
            }
          </div>
          <div class="hero-actions">
            @if (isLoggedIn()) {
              @if (isRegistered()) {
                <span class="badge badge-dark" style="font-size:1rem;">Inscrito</span>
                <button type="button" class="button button-danger" [disabled]="cancelLoading()" (click)="cancel()">{{ cancelLoading() ? 'A cancelar…' : 'Cancelar inscrição' }}</button>
              } @else {
                <button type="button" class="button button-primary" [disabled]="registerLoading()" (click)="register()">{{ registerLoading() ? 'A registar…' : 'Inscrever como sócio' }}</button>
              }
            } @else {
              <a routerLink="/partners/login" class="button button-light">Inscrever-me</a>
            }
          </div>
          @if (registerError()) { <div class="form-error-banner" style="margin-top:1rem;">{{ registerError() }}</div> }
          @if (registerSuccess()) { <div class="success-banner" style="margin-top:1rem;"><strong>Inscrição confirmada!</strong></div> }
        </div>
        <div class="event-panel">
          <h3 class="event-panel-title">Detalhes</h3>
          <div class="event-panel-meta">
            <div class="event-meta-item">
              <svg class="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span class="event-meta-label">Data</span>
                <strong>{{ event() ? formatDateRange(event()!.startDate, event()!.endDate) : '' }}</strong>
              </div>
            </div>
            @if (event()?.location) {
              <div class="event-meta-item">
                <svg class="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <span class="event-meta-label">Local</span>
                  <strong>{{ event()!.location }}</strong>
                </div>
              </div>
            }
            @if (event()?.isMembersOnly) {
              <div class="event-meta-item">
                <svg class="event-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <div>
                  <span class="event-meta-label">Acesso</span>
                  <strong>Exclusivo sócios</strong>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      <div class="container" style="margin-top:2rem;">
        <a routerLink="/events" class="button button-secondary">← Voltar</a>
      </div>
    </section>
  `
})
export class EventComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsService = inject(EventsService);
  private readonly authService = inject(AuthService);
  protected event = signal<EventDto | null>(null);
  protected isRegistered = signal(false);
  protected registerLoading = signal(false);
  protected cancelLoading = signal(false);
  protected registerError = signal('');
  protected registerSuccess = signal(false);
  protected readonly formatDateRange = formatDateRange;
  protected readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      await this.router.navigate(['/events']);
      return;
    }
    try {
      this.event.set(await this.eventsService.getById(id));
    } catch {
      await this.router.navigate(['/events']);
      return;
    }
    if (this.isLoggedIn()) {
      try {
        const registrations = await this.eventsService.getMyRegistrations();
        this.isRegistered.set(registrations.some(r => r.eventId === id));
      } catch {
        this.isRegistered.set(false);
      }
    }
  }

  protected async register() {
    const event = this.event();
    if (!event) return;
    this.registerLoading.set(true);
    this.registerError.set('');
    this.registerSuccess.set(false);
    try {
      await this.eventsService.registerForEvent(event.id);
      this.isRegistered.set(true);
      this.registerSuccess.set(true);
    } catch (e) {
      this.registerError.set(e instanceof Error ? e.message : 'Erro ao registar no evento.');
    } finally {
      this.registerLoading.set(false);
    }
  }

  protected async cancel() {
    const event = this.event();
    if (!event) return;
    this.cancelLoading.set(true);
    this.registerError.set('');
    try {
      await this.eventsService.cancelRegistration(event.id);
      this.isRegistered.set(false);
    } catch (e) {
      this.registerError.set(e instanceof Error ? e.message : 'Erro ao cancelar inscrição.');
    } finally {
      this.cancelLoading.set(false);
    }
  }
}
