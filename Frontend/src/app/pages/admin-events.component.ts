import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EventsService, EventDto, CreateEventRequest, UpdateEventRequest, EventRegistrationDto } from '../services/events.service';

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
          <label>Local <input formControlName="location" placeholder="Ex: Hotel Coimbra Aeminium"></label>
          <label class="checkbox-label"><input type="checkbox" formControlName="isMembersOnly"> Apenas para sócios</label>
          <label class="field-full">Imagem
            <input type="file" accept="image/*" (change)="onImageSelected($event, newForm)">
            @if (newForm.controls['imageData'].value) {
              <div class="event-form-image-preview">
                <img [src]="newForm.controls['imageData'].value" alt="Pré-visualização da imagem do evento">
                <button type="button" class="button button-secondary" (click)="clearImage(newForm)">Remover</button>
              </div>
            }
          </label>
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
                <label>Local <input formControlName="location" placeholder="Ex: Hotel Coimbra Aeminium"></label>
                <label class="checkbox-label"><input type="checkbox" formControlName="isMembersOnly"> Apenas para sócios</label>
                <label class="field-full">Imagem
                  <input type="file" accept="image/*" (change)="onImageSelected($event, editForm)">
                  @if (editForm.controls['imageData'].value) {
                    <div class="event-form-image-preview">
                      <img [src]="editForm.controls['imageData'].value" alt="Pré-visualização da imagem do evento">
                      <button type="button" class="button button-secondary" (click)="clearImage(editForm)">Remover</button>
                    </div>
                  }
                </label>
              </div>
              <div class="form-actions">
                <button type="submit" class="button button-primary" [disabled]="saving">{{ saving ? 'A guardar…' : 'Guardar' }}</button>
                <button type="button" class="button button-secondary" (click)="cancelEdit()">Cancelar</button>
              </div>
            </form>
          } @else {
            <div class="event-row-content">
              @if (event.imageData) {
                <div class="admin-event-thumb"><img [src]="event.imageData" alt=""></div>
              }
              <div class="event-row-info">
                <strong>{{ event.title }}</strong>
                <span class="event-row-dates">{{ event.startDate | date:'dd/MM/yyyy' }} — {{ event.endDate | date:'dd/MM/yyyy' }}</span>
                @if (event.isMembersOnly) { <span class="badge badge-yellow">Sócios</span> }
              </div>
              <div class="event-row-actions">
                <button type="button" class="button button-secondary" (click)="openRegistrations(event)">Inscrições</button>
                <button type="button" class="button button-secondary" (click)="startEdit(event)">Editar</button>
                <button type="button" class="button button-secondary button-danger" (click)="confirmDelete(event)">Eliminar</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (registrationsEvent) {
      <div class="modal-overlay">
        <div class="modal">
          <button type="button" class="modal-close" (click)="closeRegistrations()" aria-label="Fechar">×</button>
          <h3>Inscrições — {{ registrationsEvent.title }}</h3>
          @if (registrationsError) { <div class="form-error-banner">{{ registrationsError }}</div> }
          @if (registrationsLoading) { <p class="empty-state">A carregar inscrições…</p> }
          @else if (registrations.length === 0) { <p class="empty-state">Sem inscrições registadas.</p> }
          @else {
            <div class="registration-list">
              @for (r of registrations; track r.id) {
                <div class="registration-row">
                  <div>
                    <strong>{{ r.partnerFullName || 'Sócio #' + r.partnerId }}</strong>
                    <span class="event-row-dates">{{ r.partnerEmail }}</span>
                  </div>
                  <span class="event-row-dates">{{ r.registeredAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
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
  protected registrations: EventRegistrationDto[] = [];
  protected registrationsEvent: EventDto | null = null;
  protected registrationsLoading = false;
  protected registrationsError = '';

  protected readonly newForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true, validators: Validators.required }),
    endDate: new FormControl('', { nonNullable: true, validators: Validators.required }),
    location: new FormControl('', { nonNullable: true }),
    isMembersOnly: new FormControl(false, { nonNullable: true }),
    imageData: new FormControl<string | null>(null)
  });

  async ngOnInit() {
    await this.loadEvents();
  }

  private async loadEvents() {
    try {
      const response = await this.eventsService.getAll({ pageSize: 50 });
      this.events = response.data;
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
      location: new FormControl(event.location ?? '', { nonNullable: true }),
      isMembersOnly: new FormControl(event.isMembersOnly, { nonNullable: true }),
      imageData: new FormControl<string | null>(event.imageData)
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
      location: raw.location || null,
      isMembersOnly: raw.isMembersOnly,
      imageData: raw.imageData || null
    };
  }

  onImageSelected(event: Event, form: FormGroup) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.downscaleImage(dataUrl).then(result => form.controls['imageData'].setValue(result));
    };
    reader.readAsDataURL(file);
  }

  clearImage(form: FormGroup) {
    form.controls['imageData'].setValue(null);
  }

  private downscaleImage(dataUrl: string, maxDimension = 1200, quality = 0.85): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
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

  async openRegistrations(event: EventDto) {
    this.registrationsEvent = event;
    this.registrations = [];
    this.registrationsLoading = true;
    this.registrationsError = '';
    try {
      this.registrations = await this.eventsService.getRegistrations(event.id);
    } catch (e) {
      this.registrationsError = e instanceof Error ? e.message : 'Erro ao carregar inscrições.';
    } finally {
      this.registrationsLoading = false;
    }
  }

  closeRegistrations() {
    this.registrationsEvent = null;
    this.registrations = [];
    this.registrationsError = '';
  }
}
