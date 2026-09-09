import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageIntroComponent } from '../shared.components';
import { DocumentsService, DocumentDto } from '../services/documents.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [RouterLink, PageIntroComponent, DatePipe],
  template: `
    <app-page-intro eyebrow="Documentos" title="Documentos partilhados" text="Aceda aos documentos disponibilizados pela SPOV." />
    <section class="section">
      <div class="container">
        @if (loading()) { <p class="empty-state">A carregar documentos…</p> }
        @if (error()) { <div class="form-error-banner">{{ error() }}</div> }
        @if (documents().length === 0 && !loading()) { <p class="empty-state">Nenhum documento disponível.</p> }
        @for (doc of documents(); track doc.id) {
          <div class="admin-event-row">
            <div class="event-row-content">
              <div class="event-row-info">
                <strong>{{ doc.fileName }}</strong>
                @if (doc.category) { <span class="badge badge-yellow">{{ doc.category }}</span> }
                <span class="event-row-dates">{{ doc.uploadDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
                <a [href]="doc.filePath" target="_blank" class="button button-primary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;">Descarregar</a>
              </div>
            </div>
          </div>
        }
        <div class="profile-actions" style="margin-top:2rem;">
          <a routerLink="/partners/profile" class="button button-secondary">Voltar ao perfil</a>
        </div>
      </div>
    </section>
  `
})
export class DocumentsComponent implements OnInit {
  private readonly documentsService = inject(DocumentsService);
  protected documents = signal<DocumentDto[]>([]);
  protected loading = signal(true);
  protected error = signal('');

  async ngOnInit() {
    try {
      const response = await this.documentsService.getAll({ pageSize: 50 });
      this.documents.set(response.data);
    } catch (e) {
      this.documents.set([]);
      this.error.set('Erro ao carregar documentos.');
    } finally {
      this.loading.set(false);
    }
  }
}
