import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { PartnersService, PartnerDto, PartnerProfileDto, PaymentDto, CreatePartnerRequest } from '../services/partners.service';

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
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
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem 0; position: sticky; bottom: 0; background: #f5f7f7; z-index: 5; margin-top: 1rem; }
    .pagination-info { font-size: 0.9rem; color: var(--spov-muted); }
    .text-danger { color: #b42318; font-weight: 600; }
    .text-warning { color: #b45309; font-weight: 600; }
  `,
  template: `
    <div class="admin-header">
      <h2>Sócios</h2>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span class="badge badge-dark" style="font-size:0.85rem;">{{ totalRecords() }} total</span>
        <button type="button" class="button button-primary" (click)="openCreate()">Novo Sócio</button>
      </div>
    </div>

    @if (error()) { <div class="form-error-banner">{{ error() }}</div> }
    @if (success()) { <div class="success-banner"><strong>{{ success() }}</strong></div> }

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
      @if (partners().length === 0) { <p class="empty-state">Nenhum sócio encontrado.</p> }
      @for (partner of partners(); track partner.id) {
        <div class="admin-event-row">
          <div class="event-row-content">
            <div class="event-row-info">
              <strong>{{ partner.fullName }}</strong>
              <span class="event-row-dates">
                Sócio desde {{ partner.joinedAt | date:'dd/MM/yyyy' }}
                · <span [class.text-danger]="expiryClass(partner) === 'expired'" [class.text-warning]="expiryClass(partner) === 'expiring'">Expira em {{ partner.membershipExpiresAt ? (partner.membershipExpiresAt | date:'dd/MM/yyyy') : '—' }}</span>
              </span>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
              <span class="badge" [class.badge-yellow]="partner.membershipStatus === 'Pending'" [class.badge-dark]="partner.membershipStatus === 'Active'" [class.badge-outline]="partner.membershipStatus === 'Expired' || partner.membershipStatus === 'Suspended'" style="background:var(--spov-muted);color:var(--spov-white);">
                {{ statusLabel(partner.membershipStatus) }}
              </span>
              <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" (click)="openDetails(partner)">Ver detalhes</button>
            </div>
          </div>
        </div>
      }

      @if (totalPages() > 1) {
        <div class="pagination">
          <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" [disabled]="pageNumber() <= 1" (click)="goToPage(pageNumber() - 1)">Anterior</button>
          <span class="pagination-info">{{ pageNumber() }} / {{ totalPages() }}</span>
          <button type="button" class="button button-secondary" style="min-height:36px;padding:0.4rem 1rem;font-size:0.85rem;" [disabled]="pageNumber() >= totalPages()" (click)="goToPage(pageNumber() + 1)">Seguinte</button>
        </div>
      }
    </div>

    @if (selectedPartner() || detailLoading() || detailError()) {
      <div class="modal-overlay" (click)="closeDetails()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button type="button" class="modal-close" (click)="closeDetails()" aria-label="Fechar">×</button>
          @if (detailLoading()) { <p class="empty-state">A carregar detalhes…</p> }
          @if (detailError()) { <div class="form-error-banner">{{ detailError() }}</div> }
          @if (selectedPartner()) {
            <div class="profile-card">
              <div class="profile-header">
                <h2>{{ selectedPartner()!.fullName }}</h2>
                <span class="badge" [class.badge-yellow]="selectedPartner()!.membershipStatus === 'Pending'" [class.badge-dark]="selectedPartner()!.membershipStatus === 'Active'">{{ statusLabel(selectedPartner()!.membershipStatus) }}</span>
              </div>

              <div class="profile-section">
                <h3>Informação Pessoal</h3>
                <dl class="profile-dl">
                  <dt>Email</dt><dd>{{ selectedPartner()!.email }}</dd>
                  <dt>Telefone</dt><dd>{{ selectedPartner()!.phone }}</dd>
                  @if (selectedPartner()!.taxId) { <dt>NIF</dt><dd>{{ selectedPartner()!.taxId }}</dd> }
                  @if (selectedPartner()!.birthDate) { <dt>Data de Nascimento</dt><dd>{{ selectedPartner()!.birthDate | date:'dd/MM/yyyy' }}</dd> }
                  @if (selectedPartner()!.address || selectedPartner()!.city) {
                    <dt>Morada</dt><dd>{{ selectedPartner()!.address }}{{ selectedPartner()!.city ? ', ' + selectedPartner()!.city : '' }}{{ selectedPartner()!.zipCode ? ' - ' + selectedPartner()!.zipCode : '' }}</dd>
                  }
                </dl>
              </div>

              <div class="profile-section">
                <h3>Informação Profissional</h3>
                <dl class="profile-dl">
                  <dt>Tipo de Sócio</dt><dd>{{ selectedPartner()!.partnerType === 'Student' ? 'Estudante' : 'Profissional' }}</dd>
                  @if (selectedPartner()!.profession) { <dt>Profissão</dt><dd>{{ selectedPartner()!.profession }}</dd> }
                  @if (selectedPartner()!.companyName) { <dt>Empresa</dt><dd>{{ selectedPartner()!.companyName }}</dd> }
                  @if (selectedPartner()!.companyPhone) { <dt>Telefone da Empresa</dt><dd>{{ selectedPartner()!.companyPhone }}</dd> }
                  @if (selectedPartner()!.professionalCardNumber) { <dt>Cédula Profissional</dt><dd>{{ selectedPartner()!.professionalCardNumber }}</dd> }
                  @if (selectedPartner()!.academicQualifications) { <dt>Habilitações</dt><dd>{{ selectedPartner()!.academicQualifications }}</dd> }
                </dl>
              </div>

              <div class="profile-section">
                <h3>Subscrição</h3>
                <dl class="profile-dl">
                  <dt>Estado</dt><dd>{{ statusLabel(selectedPartner()!.membershipStatus) }}</dd>
                  <dt>Membro desde</dt><dd>{{ selectedPartner()!.joinedAt | date:'dd/MM/yyyy' }}</dd>
                  @if (selectedPartner()!.membershipExpiresAt) {
                    <dt>Válido até</dt><dd>{{ selectedPartner()!.membershipExpiresAt | date:'dd/MM/yyyy' }}</dd>
                  }
                  @if (selectedPartner()!.membershipTierName) {
                    <dt>Plano</dt><dd>{{ selectedPartner()!.membershipTierName }}</dd>
                  }
                </dl>

                @if (selectedPartner()!.payments.length > 0) {
                  <h4>Histórico de Pagamentos</h4>
                  <div class="payment-list">
                    @for (p of selectedPartner()!.payments; track p.id) {
                      <div class="payment-row">
                        <span class="payment-date">{{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                        <span class="payment-amount">€{{ p.amount.toFixed(2) }}</span>
                        <span class="badge" [class.badge-yellow]="p.status === 'Pending' || p.status === 'Submitted'" [class.badge-dark]="p.status === 'Verified' || p.status === 'Completed'" [class.badge-outline]="p.status === 'Rejected'">{{ paymentStatusLabel(p.status) }}</span>
                        @if (p.proofFileName) {
                          <button type="button" class="button button-secondary" style="min-height:30px;padding:0.25rem 0.6rem;font-size:0.8rem;" (click)="downloadProof(selectedPartner()!.id, p)">Ver comprovativo</button>
                        }
                        @if (p.status === 'Submitted') {
                          <button type="button" class="button button-primary" style="min-height:30px;padding:0.25rem 0.6rem;font-size:0.8rem;" [disabled]="reviewingPaymentId() === p.id" (click)="verifyPayment(p)">Validar</button>
                          <button type="button" class="button button-danger" style="min-height:30px;padding:0.25rem 0.6rem;font-size:0.8rem;" [disabled]="reviewingPaymentId() === p.id" (click)="rejectPayment(p)">Rejeitar</button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              @if (selectedPartner()!.observations) {
                <div class="profile-section"><h3>Observações</h3><p>{{ selectedPartner()!.observations }}</p></div>
              }

            </div>
          }
        </div>
      </div>
    }

    @if (showCreate()) {
      <div class="modal-overlay">
        <div class="modal">
          <button type="button" class="modal-close" (click)="closeCreate()" aria-label="Fechar">×</button>

          @if (createdTemporaryPassword()) {
            <h3>Sócio criado com sucesso</h3>
            <p>Palavra-passe temporária para <strong>{{ createdPartnerName() }}</strong>:</p>
            <div class="temp-password-box">
              <code>{{ createdTemporaryPassword() }}</code>
              <button type="button" class="button button-secondary" (click)="copyPassword()">{{ copyMessage() || 'Copiar' }}</button>
            </div>
            <p class="form-privacy-note">Entregue esta palavra-passe ao sócio. Pode ser alterada após o primeiro acesso à área reservada.</p>
            <div class="form-actions">
              <button type="button" class="button button-primary" (click)="closeCreate()">Concluir</button>
            </div>
          } @else {
            <h3>Novo Sócio</h3>
            @if (createError()) { <div class="form-error-banner">{{ createError() }}</div> }
            <form class="admin-form" [formGroup]="newPartner" (ngSubmit)="createPartner()" novalidate>
              <div class="field-grid">
                <label class="field-full">Nome Completo* <input formControlName="fullName" placeholder="Nome completo"></label>
                <label>Email* <input formControlName="email" type="email" placeholder="nome@exemplo.pt"></label>
                <label>Telefone* <input formControlName="phone" type="tel" placeholder="+351 900 000 000"></label>
                <div class="field-full">
                  <span class="field-label">Tipo de Sócio*</span>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" formControlName="partnerType" value="Professional" (change)="updateFees()">
                      <span>Profissional</span>
                    </label>
                    <label class="radio-label">
                      <input type="radio" formControlName="partnerType" value="Student" (change)="updateFees()">
                      <span>Estudante</span>
                    </label>
                  </div>
                </div>
                <label>Sócio desde* <input formControlName="joinedAt" type="date"></label>
                <label>Válido até <input formControlName="membershipExpiresAt" type="date"></label>
                <label>NIF <input formControlName="taxId" placeholder="Número de Identificação Fiscal"></label>
                <label>Profissão <input formControlName="profession" placeholder="Ex: Médico Veterinário"></label>
                <label>Empresa <input formControlName="companyName" placeholder="Nome da empresa ou instituição"></label>
                <label>Cidade <input formControlName="city" placeholder="Cidade"></label>
                <label class="field-full">Observações <textarea formControlName="observations" rows="2" placeholder="Informação adicional"></textarea></label>
              </div>
              <p class="form-privacy-note">Jóia €30,00 · Quota €{{ quotaValue().toFixed(2) }} · Total €{{ totalAmount().toFixed(2) }}</p>
              <div class="form-actions">
                <button type="submit" class="button button-primary" [disabled]="creating()">{{ creating() ? 'A criar…' : 'Criar Sócio' }}</button>
                <button type="button" class="button button-secondary" (click)="closeCreate()">Cancelar</button>
              </div>
            </form>
          }
        </div>
      </div>
    }
  `
})
export class AdminPartnersComponent implements OnInit {
  private readonly partnersService = inject(PartnersService);
  protected partners = signal<PartnerDto[]>([]);
  protected error = signal('');
  protected success = signal('');
  protected pageNumber = signal(1);
  protected readonly pageSize = 9;
  protected totalPages = signal(1);
  protected totalRecords = signal(0);
  protected searchTerm = '';
  protected statusFilter = '';
  protected selectedPartner = signal<PartnerProfileDto | null>(null);
  protected detailLoading = signal(false);
  protected detailError = signal('');
  protected showCreate = signal(false);
  protected creating = signal(false);
  protected createError = signal('');
  protected createdTemporaryPassword = signal('');
  protected createdPartnerName = signal('');
  protected copyMessage = signal('');
  protected reviewingPaymentId = signal<number | null>(null);
  protected quotaValue = signal(50);
  protected totalAmount = signal(80);

  protected readonly newPartner = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    partnerType: new FormControl('Professional', { nonNullable: true }),
    joinedAt: new FormControl('', { nonNullable: true, validators: Validators.required }),
    membershipExpiresAt: new FormControl('', { nonNullable: true }),
    taxId: new FormControl('', { nonNullable: true }),
    profession: new FormControl('', { nonNullable: true }),
    companyName: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    observations: new FormControl('', { nonNullable: true })
  });

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    try {
      const search = this.searchTerm.trim();
      const response = await this.partnersService.getAll({
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize,
        search: search || undefined,
        membershipStatus: this.statusFilter || undefined,
      });
      this.partners.set(response.data);
      this.totalPages.set(response.totalPages);
      this.totalRecords.set(response.totalRecords);
      this.pageNumber.set(response.pageNumber);
    } catch {
      this.error.set('Erro ao carregar sócios.');
    }
  }

  protected async applyFilters() {
    this.pageNumber.set(1);
    this.error.set('');
    await this.load();
  }

  protected async goToPage(page: number) {
    this.pageNumber.set(page);
    await this.load();
  }

  protected async openDetails(partner: PartnerDto) {
    this.detailError.set('');
    this.detailLoading.set(true);
    this.selectedPartner.set(null);
    try {
      this.selectedPartner.set(await this.partnersService.getById(partner.id));
    } catch (e) {
      this.detailError.set(e instanceof Error ? e.message : 'Erro ao carregar detalhes do sócio.');
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetails() {
    this.selectedPartner.set(null);
    this.detailError.set('');
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

  protected paymentStatusLabel(status: string): string {
    switch (status) {
      case 'Pending': return 'Pagamento pendente';
      case 'Submitted': return 'Em validação';
      case 'Verified':
      case 'Completed': return 'Validado';
      case 'Rejected': return 'Rejeitado';
      default: return status;
    }
  }

  protected expiryClass(partner: PartnerDto): 'expired' | 'expiring' | '' {
    if (!partner.membershipExpiresAt) return '';
    const expires = new Date(partner.membershipExpiresAt);
    if (expires < new Date()) return 'expired';
    const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 ? 'expiring' : '';
  }

  protected async verifyPayment(payment: PaymentDto) {
    const partner = this.selectedPartner();
    if (!partner) return;

    this.reviewingPaymentId.set(payment.id);
    this.detailError.set('');
    try {
      await this.partnersService.verifyPayment(partner.id, payment.id);
      this.success.set('Pagamento validado e sócio ativado.');
      try {
        this.selectedPartner.set(await this.partnersService.getById(partner.id));
        await this.load();
      } catch {
        this.detailError.set('Pagamento validado, mas não foi possível atualizar os detalhes.');
      }
    } catch (e) {
      this.detailError.set(e instanceof Error ? e.message : 'Erro ao validar pagamento.');
    } finally {
      this.reviewingPaymentId.set(null);
    }
  }

  protected async rejectPayment(payment: PaymentDto) {
    const partner = this.selectedPartner();
    if (!partner) return;

    const note = window.prompt('Indique o motivo da rejeição:', 'Comprovativo inválido ou ilegível.');
    if (note === null) return;

    this.reviewingPaymentId.set(payment.id);
    this.detailError.set('');
    try {
      await this.partnersService.rejectPayment(partner.id, payment.id, note);
      this.success.set('Pagamento rejeitado.');
      try {
        this.selectedPartner.set(await this.partnersService.getById(partner.id));
      } catch {
        this.detailError.set('Pagamento rejeitado, mas não foi possível atualizar os detalhes.');
      }
    } catch (e) {
      this.detailError.set(e instanceof Error ? e.message : 'Erro ao rejeitar pagamento.');
    } finally {
      this.reviewingPaymentId.set(null);
    }
  }

  protected async downloadProof(partnerId: number, payment: PaymentDto) {
    try {
      const blob = await this.partnersService.downloadPaymentProof(partnerId, payment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = payment.proofFileName ?? 'comprovativo';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      this.detailError.set(e instanceof Error ? e.message : 'Erro ao descarregar comprovativo.');
    }
  }

  protected openCreate() {
    this.showCreate.set(true);
    this.createError.set('');
    this.createdTemporaryPassword.set('');
    this.createdPartnerName.set('');
    this.copyMessage.set('');
    this.newPartner.reset();
    this.newPartner.patchValue({ partnerType: 'Professional' });
    this.updateFees();
  }

  protected closeCreate() {
    this.showCreate.set(false);
    this.createError.set('');
    this.createdTemporaryPassword.set('');
    this.createdPartnerName.set('');
    this.copyMessage.set('');
  }

  protected updateFees() {
    const isStudent = this.newPartner.controls.partnerType.value === 'Student';
    this.quotaValue.set(isStudent ? 20 : 50);
    this.totalAmount.set(30 + this.quotaValue());
  }

  protected buildCreateRequest(): CreatePartnerRequest {
    const raw = this.newPartner.getRawValue();
    return {
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      partnerType: raw.partnerType,
      taxId: raw.taxId || undefined,
      profession: raw.profession || undefined,
      companyName: raw.companyName || undefined,
      city: raw.city || undefined,
      observations: raw.observations || undefined,
      joinedAt: new Date(raw.joinedAt).toISOString(),
      membershipExpiresAt: raw.membershipExpiresAt ? new Date(raw.membershipExpiresAt).toISOString() : undefined,
      initiationFee: 30,
      quotaValue: this.quotaValue(),
      totalAmount: this.totalAmount()
    };
  }

  protected async createPartner() {
    if (this.newPartner.invalid) {
      this.newPartner.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.createError.set('');
    try {
      const response = await this.partnersService.createPartner(this.buildCreateRequest());
      this.createdTemporaryPassword.set(response.temporaryPassword);
      this.createdPartnerName.set(response.partner.fullName);
      await this.load();
    } catch (e) {
      this.createError.set(e instanceof Error ? e.message : 'Erro ao criar sócio.');
    } finally {
      this.creating.set(false);
    }
  }

  protected async copyPassword() {
    try {
      await navigator.clipboard.writeText(this.createdTemporaryPassword());
      this.copyMessage.set('Copiado!');
    } catch {
      this.copyMessage.set('');
    }
  }
}
