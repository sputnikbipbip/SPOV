import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PartnersService, PartnerDto } from '../services/partners.service';

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [DatePipe],
  styles: `
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1.5rem 0; }
    .pagination-info { font-size: 0.9rem; color: var(--spov-muted); }
  `,
  template: `
    <div class="admin-header">
      <h2>Sócios</h2>
      <span class="badge badge-dark" style="font-size:0.85rem;">{{ totalRecords }} total</span>
    </div>

    @if (error) { <div class="form-error-banner">{{ error }}</div> }
    @if (success) { <div class="success-banner"><strong>{{ success }}</strong></div> }

    <div class="admin-table-wrap">
      @if (partners.length === 0) { <p class="empty-state">Nenhum sócio encontrado.</p> }
      @for (partner of partners; track partner.id) {
        <div class="admin-event-row">
          <div class="event-row-content">
            <div class="event-row-info">
              <strong>{{ partner.fullName }}</strong>
              <span class="event-row-dates">Sócio desde {{ partner.joinedAt | date:'dd/MM/yyyy' }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
              <span class="badge" [class.badge-yellow]="partner.membershipStatus === 'Pending'" [class.badge-dark]="partner.membershipStatus === 'Active'" [class.badge-outline]="partner.membershipStatus === 'Expired' || partner.membershipStatus === 'Suspended'" style="background:var(--spov-muted);color:var(--spov-white);">
                {{ statusLabel(partner.membershipStatus) }}
              </span>
              @if (partner.membershipStatus === 'Pending') {
                <button type="button" class="button button-primary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" (click)="approve(partner)">Aprovar</button>
              }
            </div>
          </div>
        </div>
      }

      @if (totalPages > 1) {
        <div class="pagination">
          <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" [disabled]="pageNumber <= 1" (click)="goToPage(pageNumber - 1)">Anterior</button>
          <span class="pagination-info">{{ pageNumber }} / {{ totalPages }}</span>
          <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" [disabled]="pageNumber >= totalPages" (click)="goToPage(pageNumber + 1)">Seguinte</button>
        </div>
      }
    </div>
  `
})
export class AdminPartnersComponent implements OnInit {
  private readonly partnersService = inject(PartnersService);
  protected partners: PartnerDto[] = [];
  protected error = '';
  protected success = '';
  protected pageNumber = 1;
  protected pageSize = 10;
  protected totalPages = 1;
  protected totalRecords = 0;

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    try {
      const response = await this.partnersService.getAll({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
      });
      this.partners = response.data;
      this.totalPages = response.totalPages;
      this.totalRecords = response.totalRecords;
      this.pageNumber = response.pageNumber;
    } catch {
      this.error = 'Erro ao carregar sócios.';
    }
  }

  protected async goToPage(page: number) {
    this.pageNumber = page;
    await this.load();
  }

  protected statusLabel(status: string): string {
    switch (status) {
      case 'Pending': return 'Pendente';
      case 'Active': return 'Ativo';
      case 'Expired': return 'Expirado';
      case 'Suspended': return 'Suspenso';
      default: return status;
    }
  }

  protected async approve(partner: PartnerDto) {
    this.error = '';
    this.success = '';
    try {
      await this.partnersService.approve(partner.id);
      this.success = `${partner.fullName} aprovado com sucesso.`;
      await this.load();
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Erro ao aprovar sócio.';
    }
  }
}
