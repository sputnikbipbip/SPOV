import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EventsService, EventDto, CreateEventRequest, UpdateEventRequest } from '../services/events.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="admin-header">
      <h2>Eventos</h2>
      <button type="button" class="button button-primary" (click)="toggleNew()">{{ showNewForm ? 'Cancelar' : 'Novo Evento' }}</button>
    </div>

    @if (error) { <div class="form-error-banner">{{ error }}</div> }
    @if (success) { <div class="success-banner"><strong>{{ success }}</strong></div> }

    @if (showNewForm) {
      <form class="admin-form" [formGroup]="newForm" (ngSubmit)="create()" novalidate>
        <h3>Novo Evento</h3>
        <div class="field-grid">
          <label class="field-full">Título <input formControlName="title" placeholder="Título do evento"></label>
          <label class="field-full">Descrição <textarea formControlName="description" rows="3" placeholder="Descrição do evento"></textarea></label>
          <label>Data Início <input type="datetime-local" formControlName="startDate"></label>
          <label>Data Fim <input type="datetime-local" formControlName="endDate"></label>
          <label>Créditos CE <input type="number" formControlName="ceCredits" placeholder="Ex: 4"></label>
          <label class="checkbox-label"><input type="checkbox" formControlName="isMembersOnly"> Apenas para sócios</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="button button-primary" [disabled]="saving">{{ saving ? 'A criar…' : 'Criar Evento' }}</button>
          <button type="button" class="button button-secondary" (click)="toggleNew()">Cancelar</button>
        </div>
      </form>
    }

    <div class="admin-table-wrap">
      @if (events.length === 0) { <p class="empty-state">Nenhum evento encontrado.</p> }
      @for (event of events; track event.id) {
        <div class="admin-event-row">
          @if (editingId === event.id && editForm) {
            <form class="admin-form" [formGroup]="editForm" (ngSubmit)="update(event.id)" novalidate>
              <h3>Editar: {{ event.title }}</h3>
              <div class="field-grid">
                <label class="field-full">Título <input formControlName="title" placeholder="Título do evento"></label>
                <label class="field-full">Descrição <textarea formControlName="description" rows="3" placeholder="Descrição do evento"></textarea></label>
                <label>Data Início <input type="datetime-local" formControlName="startDate"></label>
                <label>Data Fim <input type="datetime-local" formControlName="endDate"></label>
                <label>Créditos CE <input type="number" formControlName="ceCredits" placeholder="Ex: 4"></label>
                <label class="checkbox-label"><input type="checkbox" formControlName="isMembersOnly"> Apenas para sócios</label>
              </div>
              <div class="form-actions">
                <button type="submit" class="button button-primary" [disabled]="saving">{{ saving ? 'A guardar…' : 'Guardar' }}</button>
                <button type="button" class="button button-secondary" (click)="cancelEdit()">Cancelar</button>
              </div>
            </form>
          } @else {
            <div class="event-row-content">
              <div class="event-row-info">
                <strong>{{ event.title }}</strong>
                <span class="event-row-dates">{{ event.startDate | date:'dd/MM/yyyy' }} — {{ event.endDate | date:'dd/MM/yyyy' }}</span>
                @if (event.isMembersOnly) { <span class="badge badge-yellow">Sócios</span> }
              </div>
              <div class="event-row-actions">
                <button type="button" class="button button-secondary" (click)="startEdit(event)">Editar</button>
                <button type="button" class="button button-secondary button-danger" (click)="confirmDelete(event)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminEventsComponent implements OnInit {
  private readonly eventsService = inject(EventsService);
  protected events: EventDto[] = [];
  protected showNewForm = false;
  protected editingId: number | null = null;
  protected editForm: FormGroup | null = null;
  protected saving = false;
  protected error = '';
  protected success = '';

  protected readonly newForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true, validators: Validators.required }),
    endDate: new FormControl('', { nonNullable: true, validators: Validators.required }),
    ceCredits: new FormControl<number | null>(null),
    isMembersOnly: new FormControl(false, { nonNullable: true })
  });

  async ngOnInit() {
    await this.loadEvents();
  }

  private async loadEvents() {
    try {
      this.events = await this.eventsService.getAll();
    } catch {
      this.error = 'Erro ao carregar eventos.';
    }
  }

  toggleNew() {
    this.showNewForm = !this.showNewForm;
    this.editingId = null;
    this.editForm = null;
    this.error = '';
    this.success = '';
    if (!this.showNewForm) this.newForm.reset();
  }

  private toDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  startEdit(event: EventDto) {
    this.editingId = event.id;
    this.showNewForm = false;
    this.error = '';
    this.success = '';
    this.editForm = new FormGroup({
      title: new FormControl(event.title, { nonNullable: true, validators: Validators.required }),
      description: new FormControl(event.description ?? '', { nonNullable: true }),
      startDate: new FormControl(this.toDatetimeLocal(event.startDate), { nonNullable: true, validators: Validators.required }),
      endDate: new FormControl(this.toDatetimeLocal(event.endDate), { nonNullable: true, validators: Validators.required }),
      ceCredits: new FormControl(event.ceCredits),
      isMembersOnly: new FormControl(event.isMembersOnly, { nonNullable: true })
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm = null;
  }

  private formToRequest(form: FormGroup): CreateEventRequest {
    const raw = form.getRawValue();
    return {
      title: raw.title,
      description: raw.description || null,
      startDate: new Date(raw.startDate).toISOString(),
      endDate: new Date(raw.endDate).toISOString(),
      ceCredits: raw.ceCredits ?? null,
      isMembersOnly: raw.isMembersOnly
    };
  }

  async create() {
    if (this.newForm.invalid) {
      this.newForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    try {
      await this.eventsService.create(this.formToRequest(this.newForm));
      this.success = 'Evento criado com sucesso.';
      this.showNewForm = false;
      this.newForm.reset();
      await this.loadEvents();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Erro ao criar evento.';
    } finally {
      this.saving = false;
    }
  }

  async update(id: number) {
    if (!this.editForm || this.editForm.invalid) {
      this.editForm?.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';
    try {
      await this.eventsService.update(id, this.formToRequest(this.editForm));
      this.success = 'Evento atualizado com sucesso.';
      this.editingId = null;
      this.editForm = null;
      await this.loadEvents();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Erro ao atualizar evento.';
    } finally {
      this.saving = false;
    }
  }

  async confirmDelete(event: EventDto) {
    if (!confirm(`Tem a certeza que deseja eliminar o evento "${event.title}"?`)) return;
    this.error = '';
    this.success = '';
    try {
      await this.eventsService.delete(event.id);
      this.success = 'Evento eliminado com sucesso.';
      await this.loadEvents();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Erro ao eliminar evento.';
    }
  }
}
