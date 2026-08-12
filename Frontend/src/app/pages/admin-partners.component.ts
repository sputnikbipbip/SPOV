import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartnersService, PartnerDto, PartnerProfileDto } from '../services/partners.service';

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [DatePipe, FormsModule],
  styles: `
    .admin-filters { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; padding: 1rem 0; }
    .admin-filters input[type="search"] {
      flex: 1 1 220px; min-height: 40px; padding: 0.4rem 0.75rem; font-size: 0.9rem;
      border: 1px solid var(--spov-line); border-radius: 8px; background: var(--spov-white); color: var(--spov-ink);
    }
    .admin-filters select {
      min-height: 40px; padding: 0.4rem 0.75rem; font-size: 0.9rem;
      border: 1px solid var(--spov-line); border-radius: 8px; background: var(--spov-white); color: var(--spov-ink);
    }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1.5rem 0; }
    .pagination-info { font-size: 0.9rem; color: var(--spov-muted); }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal {
      background: var(--spov-white); border-radius: 12px; max-width: 720px; width: 100%;
      max-height: 85vh; overflow: auto; padding: 1.5rem; position: relative;
    }
    .modal-close {
      position: absolute; top: 0.5rem; right: 0.75rem; background: none; border: none;
      font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--spov-muted);
    }
  `,
  template: `
    <div class="admin-header">
      <h2>Sócios</h2>
      <span class="badge badge-dark" style="font-size:0.85rem;">{{ totalRecords }} total</span>
    </div>

    @if (error) { <div class="form-error-banner">{{ error }}</div> }
    @if (success) { <div class="success-banner"><strong>{{ success }}</strong></div> }

    <div class="admin-filters">
      <input type="search" [(ngModel)]="searchTerm" placeholder="Pesquisar nome, email, NIF…" (keydown.enter)="applyFilters()" />
      <button type="button" class="button button-primary" style="min-height:40px;padding:0.4rem 1.2rem;font-size:0.9rem;" (click)="applyFilters()">Pesquisar</button>
      <select [(ngModel)]="statusFilter" (change)="applyFilters()">
        <option value="">Todos os estados</option>
        <option value="Pending">Pendente</option>
        <option value="Active">Ativo</option>
        <option value="Expired">Expirado</option>
        <option value="Suspended">Suspenso</option>
      </select>
    </div>

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
              <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" (click)="openDetails(partner)">Ver detalhes</button>
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

    @if (selectedPartner || detailLoading || detailError) {
      <div class="modal-overlay" (click)="closeDetails()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button type="button" class="modal-close" (click)="closeDetails()" aria-label="Fechar">×</button>
          @if (detailLoading) { <p class="empty-state">A carregar detalhes…</p> }
          @if (detailError) { <div class="form-error-banner">{{ detailError }}</div> }
          @if (selectedPartner) {
            <div class="profile-card">
              <div class="profile-header">
                <h2>{{ selectedPartner.fullName }}</h2>
                <span class="badge" [class.badge-yellow]="selectedPartner.membershipStatus === 'Pending'" [class.badge-dark]="selectedPartner.membershipStatus === 'Active'">{{ statusLabel(selectedPartner.membershipStatus) }}</span>
              </div>

              <div class="profile-section">
                <h3>Informação Pessoal</h3>
                <dl class="profile-dl">
                  <dt>Email</dt><dd>{{ selectedPartner.email }}</dd>
                  <dt>Telefone</dt><dd>{{ selectedPartner.phone }}</dd>
                  @if (selectedPartner.taxId) { <dt>NIF</dt><dd>{{ selectedPartner.taxId }}</dd> }
                  @if (selectedPartner.birthDate) { <dt>Data de Nascimento</dt><dd>{{ selectedPartner.birthDate | date:'dd/MM/yyyy' }}</dd> }
                  @if (selectedPartner.address || selectedPartner.city) {
                    <dt>Morada</dt><dd>{{ selectedPartner.address }}{{ selectedPartner.city ? ', ' + selectedPartner.city : '' }}{{ selectedPartner.zipCode ? ' - ' + selectedPartner.zipCode : '' }}</dd>
                  }
                </dl>
              </div>

              <div class="profile-section">
                <h3>Informação Profissional</h3>
                <dl class="profile-dl">
                  <dt>Tipo de Sócio</dt><dd>{{ selectedPartner.partnerType === 'Student' ? 'Estudante' : 'Profissional' }}</dd>
                  @if (selectedPartner.profession) { <dt>Profissão</dt><dd>{{ selectedPartner.profession }}</dd> }
                  @if (selectedPartner.companyName) { <dt>Empresa</dt><dd>{{ selectedPartner.companyName }}</dd> }
                  @if (selectedPartner.companyPhone) { <dt>Telefone da Empresa</dt><dd>{{ selectedPartner.companyPhone }}</dd> }
                  @if (selectedPartner.professionalCardNumber) { <dt>Cédula Profissional</dt><dd>{{ selectedPartner.professionalCardNumber }}</dd> }
                  @if (selectedPartner.academicQualifications) { <dt>Habilitações</dt><dd>{{ selectedPartner.academicQualifications }}</dd> }
                </dl>
              </div>

              <div class="profile-section">
                <h3>Subscrição</h3>
                <dl class="profile-dl">
                  <dt>Estado</dt><dd>{{ statusLabel(selectedPartner.membershipStatus) }}</dd>
                  <dt>Membro desde</dt><dd>{{ selectedPartner.joinedAt | date:'dd/MM/yyyy' }}</dd>
                  @if (selectedPartner.membershipExpiresAt) {
                    <dt>Válido até</dt><dd>{{ selectedPartner.membershipExpiresAt | date:'dd/MM/yyyy' }}</dd>
                  }
                  @if (selectedPartner.membershipTierName) {
                    <dt>Plano</dt><dd>{{ selectedPartner.membershipTierName }}</dd>
                  }
                </dl>

                @if (selectedPartner.payments.length > 0) {
                  <h4>Histórico de Pagamentos</h4>
                  <div class="payment-list">
                    @for (p of selectedPartner.payments; track p.id) {
                      <div class="payment-row">
                        <span class="payment-date">{{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                        <span class="payment-amount">€{{ p.amount.toFixed(2) }}</span>
                        <span class="badge" [class.badge-yellow]="p.status === 'Pending'" [class.badge-dark]="p.status === 'Completed'">{{ p.status }}</span>
                      </div>
                    }
                  </div>
                }
              </div>

              @if (selectedPartner.observations) {
                <div class="profile-section"><h3>Observações</h3><p>{{ selectedPartner.observations }}</p></div>
              }

              @if (selectedPartner.paymentProofUrl) {
                <div class="profile-section">
                  <h3>Comprovativo</h3>
                  <p>Comprovativo enviado: <a [href]="selectedPartner.paymentProofUrl" target="_blank">Ver ficheiro</a></p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
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
  protected searchTerm = '';
  protected statusFilter = '';
  protected selectedPartner: PartnerProfileDto | null = null;
  protected detailLoading = false;
  protected detailError = '';

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    try {
      const search = this.searchTerm.trim();
      const response = await this.partnersService.getAll({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        search: search || undefined,
        membershipStatus: this.statusFilter || undefined,
      });
      this.partners = response.data;
      this.totalPages = response.totalPages;
      this.totalRecords = response.totalRecords;
      this.pageNumber = response.pageNumber;
    } catch {
      this.error = 'Erro ao carregar sócios.';
    }
  }

  protected async applyFilters() {
    this.pageNumber = 1;
    this.error = '';
    await this.load();
  }

  protected async goToPage(page: number) {
    this.pageNumber = page;
    await this.load();
  }

  protected async openDetails(partner: PartnerDto) {
    this.detailError = '';
    this.detailLoading = true;
    this.selectedPartner = null;
    try {
      this.selectedPartner = await this.partnersService.getById(partner.id);
    } catch (e) {
      this.detailError = e instanceof Error ? e.message : 'Erro ao carregar detalhes do sócio.';
    } finally {
      this.detailLoading = false;
    }
  }

  protected closeDetails() {
    this.selectedPartner = null;
    this.detailError = '';
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