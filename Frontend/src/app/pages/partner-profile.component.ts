import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PageIntroComponent } from '../shared.components';

import { PartnerProfileDto, PartnersService, PaymentDto, UpdatePartnerProfileRequest } from '../services/partners.service';
import { EventsService, PartnerRegistrationDto } from '../services/events.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageIntroComponent, DatePipe, CurrencyPipe],
  styles: [`
    .profile-page { padding-top: 2.75rem; }
    .profile-dashboard { width: min(100%, 960px); margin-inline: auto; }
    .profile-overview, .profile-panel, .profile-detail-card {
      background: var(--spov-white);
      border: 1px solid var(--spov-line);
      border-radius: 18px;
      box-shadow: var(--shadow-soft);
    }
    .profile-overview { padding: clamp(1.25rem, 3vw, 2rem); }
    .profile-overview__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
    .profile-identity { display: flex; align-items: center; gap: 1rem; min-width: 0; }
    .profile-avatar {
      display: grid; place-items: center; flex: 0 0 3.5rem; width: 3.5rem; height: 3.5rem;
      border-radius: 50%; background: var(--spov-teal); color: var(--spov-white); font-weight: 700; font-size: 1.1rem;
    }
    .profile-identity h2 { margin: 0.15rem 0; font-size: clamp(1.35rem, 3vw, 1.8rem); overflow-wrap: anywhere; }
    .profile-identity p { margin: 0; color: var(--spov-muted); overflow-wrap: anywhere; }
    .profile-kicker, .profile-summary-label { color: var(--spov-muted); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .profile-status { flex: 0 0 auto; border-radius: 999px; padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 700; }
    .profile-status--active { background: rgba(15, 143, 151, 0.12); color: #087980; }
    .profile-status--pending { background: #fff3cf; color: #775500; }
    .profile-status--other { background: #eef1f1; color: var(--spov-ink); }
    .profile-summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; margin-top: 1.5rem; }
    .profile-summary-item { display: grid; gap: 0.35rem; min-width: 0; padding: 0.9rem 1rem; border-radius: 12px; background: var(--spov-soft-gray); }
    .profile-summary-item strong { overflow-wrap: anywhere; }
    .profile-overview__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.25rem; }
    .profile-dashboard-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
    .profile-detail-card, .profile-panel { padding: 1.35rem; min-width: 0; }
    .profile-detail-card h3, .profile-panel h3 { margin: 0; font-size: 1.05rem; }
    .profile-panel-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    .profile-panel-heading p { margin: 0.35rem 0 0; color: var(--spov-muted); font-size: 0.9rem; }
    .profile-detail-list { display: grid; gap: 0.8rem; margin: 1rem 0 0; }
    .profile-detail-list > div { display: grid; grid-template-columns: minmax(7rem, 0.7fr) minmax(0, 1.3fr); gap: 0.75rem; }
    .profile-detail-list dt { color: var(--spov-muted); font-size: 0.88rem; }
    .profile-detail-list dd { margin: 0; font-size: 0.94rem; overflow-wrap: anywhere; }
    .profile-panel--wide { margin-top: 1rem; }
    .profile-record-list { display: grid; gap: 0.65rem; margin: 0; padding: 0; list-style: none; }
    .profile-record-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; border: 1px solid var(--spov-line); border-radius: 12px; }
    .profile-record-main { display: grid; gap: 0.4rem; min-width: 0; }
    .profile-record-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.65rem; color: var(--spov-muted); font-size: 0.86rem; }
    .profile-record-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 0.55rem; flex: 0 0 auto; }
    .profile-review-note { margin: 0.2rem 0 0; color: #8a3b28; font-size: 0.88rem; }
    .profile-upload-control { display: grid; gap: 0.45rem; margin: 0.75rem 0; color: var(--spov-muted); font-size: 0.9rem; }
    .profile-file-name { margin: 0 0 0.75rem; color: var(--spov-ink); overflow-wrap: anywhere; }
    .profile-account-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .profile-account-actions .button { border: 0; background: transparent; color: var(--spov-muted); }
    .profile-account-actions .button:hover { color: #b42318; }

    @media (max-width: 720px) {
      .profile-page { padding-top: 1.5rem; }
      .profile-summary-grid { grid-template-columns: 1fr; }
      .profile-dashboard-grid { grid-template-columns: 1fr; }
      .profile-overview__top { align-items: flex-start; }
      .profile-avatar { flex-basis: 2.8rem; width: 2.8rem; height: 2.8rem; }
      .profile-record-card { align-items: stretch; flex-direction: column; }
      .profile-record-actions { justify-content: flex-start; }
      .profile-detail-list > div { grid-template-columns: minmax(6rem, 0.7fr) minmax(0, 1.3fr); }
      .profile-account-actions { justify-content: flex-start; }
    }
  `],
  template: `
    <app-page-intro eyebrow="Sócios" title="O meu perfil" text="Consulte os seus dados de sócio e o estado da sua subscrição." />
    <section class="section profile-page">
      <div class="container">
        @if (loading()) { <p class="empty-state">A carregar perfil…</p> }
        @if (error()) {
          <div class="form-error-banner">
            {{ error() }}
            <a routerLink="/partners/login" class="button button-secondary" style="margin-top:0.5rem;">Iniciar sessão</a>
          </div>
        }
        @if (profile() && !editing()) {
          <div class="profile-dashboard">
            @if (proofError()) { <div class="form-error-banner" role="alert">{{ proofError() }}</div> }

            <section class="profile-overview" aria-label="Resumo de sócio">
              <div class="profile-overview__top">
                <div class="profile-identity">
                  <span class="profile-avatar" aria-hidden="true">{{ initials() }}</span>
                  <div>
                    <span class="profile-kicker">Área do sócio</span>
                    <h2>{{ profile()!.fullName }}</h2>
                    <p>{{ profile()!.email }}</p>
                  </div>
                </div>
                <span class="profile-status"
                  [class.profile-status--active]="profile()!.membershipStatus === 'Active'"
                  [class.profile-status--pending]="profile()!.membershipStatus === 'Pending'"
                  [class.profile-status--other]="profile()!.membershipStatus !== 'Active' && profile()!.membershipStatus !== 'Pending'">
                  {{ statusLabel() }}
                </span>
              </div>

              <div class="profile-summary-grid" aria-label="Resumo da subscrição">
                <div class="profile-summary-item">
                  <span class="profile-summary-label">Plano</span>
                  <strong>{{ profile()!.membershipTierName || (profile()!.partnerType === 'Student' ? 'Estudante' : 'Profissional') }}</strong>
                </div>
                <div class="profile-summary-item">
                  <span class="profile-summary-label">Membro desde</span>
                  <strong>{{ profile()!.joinedAt | date:'dd/MM/yyyy' }}</strong>
                </div>
                <div class="profile-summary-item">
                  <span class="profile-summary-label">Válido até</span>
                  <strong>{{ profile()!.membershipExpiresAt ? (profile()!.membershipExpiresAt | date:'dd/MM/yyyy') : 'Por confirmar' }}</strong>
                </div>
              </div>

              <div class="profile-overview__actions">
                <button type="button" class="button button-primary" (click)="toggleEdit()">Editar Perfil</button>
                <a routerLink="/documents" class="button button-secondary">Documentos</a>
                @if (needsPaymentProof()) {
                  <a href="#profile-payment-proof" class="button button-secondary">Enviar comprovativo</a>
                }
              </div>
            </section>

            <div class="profile-dashboard-grid">
              <section class="profile-detail-card" aria-labelledby="profile-personal-heading">
                <h3 id="profile-personal-heading">Informação pessoal</h3>
                <dl class="profile-detail-list">
                  <div><dt>Telefone</dt><dd>{{ profile()!.phone }}</dd></div>
                  @if (profile()!.taxId) { <div><dt>NIF</dt><dd>{{ profile()!.taxId }}</dd></div> }
                  @if (profile()!.birthDate) { <div><dt>Nascimento</dt><dd>{{ profile()!.birthDate | date:'dd/MM/yyyy' }}</dd></div> }
                  @if (profile()!.address || profile()!.city || profile()!.zipCode) {
                    <div><dt>Morada</dt><dd>{{ profile()!.address }}{{ profile()!.city ? ', ' + profile()!.city : '' }}{{ profile()!.zipCode ? ' · ' + profile()!.zipCode : '' }}</dd></div>
                  }
                  @if (profile()!.country) { <div><dt>País</dt><dd>{{ profile()!.country }}</dd></div> }
                </dl>
              </section>

              <section class="profile-detail-card" aria-labelledby="profile-professional-heading">
                <h3 id="profile-professional-heading">Informação profissional</h3>
                <dl class="profile-detail-list">
                  <div><dt>Tipo de sócio</dt><dd>{{ profile()!.partnerType === 'Student' ? 'Estudante' : 'Profissional' }}</dd></div>
                  @if (profile()!.profession) { <div><dt>Profissão</dt><dd>{{ profile()!.profession }}</dd></div> }
                  @if (profile()!.companyName) { <div><dt>Empresa</dt><dd>{{ profile()!.companyName }}</dd></div> }
                  @if (profile()!.companyPhone) { <div><dt>Telefone da empresa</dt><dd>{{ profile()!.companyPhone }}</dd></div> }
                  @if (profile()!.professionalCardNumber) { <div><dt>Cédula</dt><dd>{{ profile()!.professionalCardNumber }}</dd></div> }
                  @if (profile()!.academicQualifications) { <div><dt>Habilitações</dt><dd>{{ profile()!.academicQualifications }}</dd></div> }
                </dl>
              </section>
            </div>

            <section class="profile-panel profile-panel--wide" aria-labelledby="profile-payments-heading">
              <div class="profile-panel-heading">
                <div>
                  <h3 id="profile-payments-heading">Pagamentos</h3>
                  <p>Consulte o estado dos seus pagamentos e respetivos comprovativos.</p>
                </div>
              </div>
              @if (profile()!.payments.length > 0) {
                <ul class="profile-record-list">
                  @for (p of profile()!.payments; track p.id) {
                    <li class="profile-record-card">
                      <div class="profile-record-main">
                        <strong>{{ p.amount | currency:'EUR':'symbol':'1.2-2' }}</strong>
                        <div class="profile-record-meta">
                          <span>Registado a {{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                          <span class="badge" [class.badge-yellow]="p.status === 'Pending' || p.status === 'Submitted'" [class.badge-dark]="p.status === 'Verified' || p.status === 'Completed'" [class.badge-outline]="p.status === 'Rejected'">{{ paymentStatusLabel(p.status) }}</span>
                        </div>
                        @if (p.reviewNote) { <p class="profile-review-note">{{ p.reviewNote }}</p> }
                      </div>
                      @if (p.proofFileName) {
                        <div class="profile-record-actions">
                          <button type="button" class="button button-secondary" [disabled]="proofDownloadingId() === p.id" (click)="downloadProof(p)">{{ proofDownloadingId() === p.id ? 'A descarregar…' : 'Ver comprovativo' }}</button>
                        </div>
                      }
                    </li>
                  }
                </ul>
              } @else {
                <p class="empty-state">Ainda não existem pagamentos registados.</p>
              }
            </section>

            @if (needsPaymentProof()) {
              <section id="profile-payment-proof" class="profile-panel profile-panel--wide" aria-labelledby="profile-proof-heading">
                <div class="profile-panel-heading">
                  <div>
                    <h3 id="profile-proof-heading">Enviar comprovativo</h3>
                    <p>Aceitamos PDF, JPEG ou PNG até 10 MB.</p>
                  </div>
                </div>
                @if (proofSuccess()) { <div class="success-banner" role="status">Comprovativo enviado. A aguardar validação.</div> }
                <label class="profile-upload-control">Selecionar ficheiro
                  <input type="file" accept="application/pdf,image/jpeg,image/png" (change)="selectProof($event)">
                </label>
                @if (selectedProof()) { <p class="profile-file-name">{{ selectedProof()!.name }}</p> }
                <button type="button" class="button button-primary" [disabled]="!selectedProof() || proofUploading()" (click)="uploadProof()">{{ proofUploading() ? 'A enviar…' : 'Enviar comprovativo' }}</button>
              </section>
            }

            <section class="profile-panel profile-panel--wide" aria-labelledby="profile-events-heading">
              <div class="profile-panel-heading">
                <div>
                  <h3 id="profile-events-heading">Inscrições em eventos</h3>
                  <p>Os eventos em que já tem lugar reservado.</p>
                </div>
                <a routerLink="/events" class="button button-secondary">Ver eventos</a>
              </div>
              @if (registrations().length > 0) {
                <ul class="profile-record-list">
                  @for (r of registrations(); track r.id) {
                    <li class="profile-record-card profile-registration-card">
                      <div class="profile-record-main">
                        <strong>{{ r.eventTitle }}</strong>
                        <div class="profile-record-meta">
                          <span>Evento a {{ r.eventStartDate | date:'dd/MM/yyyy' }}</span>
                          <span>Inscrito a {{ r.registeredAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                      </div>
                      <div class="profile-record-actions">
                        <a [routerLink]="'/events/' + r.eventId" class="button button-secondary">Ver evento</a>
                        <button type="button" class="button button-danger" [disabled]="cancellingId() === r.eventId" (click)="cancelRegistration(r.eventId)">{{ cancellingId() === r.eventId ? 'A cancelar…' : 'Cancelar' }}</button>
                      </div>
                    </li>
                  }
                </ul>
              } @else {
                <p class="empty-state">Ainda não tem inscrições em eventos.</p>
              }
              @if (cancelError()) { <div class="form-error-banner" role="alert">{{ cancelError() }}</div> }
            </section>

            @if (profile()!.observations) {
              <section class="profile-panel profile-panel--wide" aria-labelledby="profile-notes-heading">
                <h3 id="profile-notes-heading">Observações</h3>
                <p>{{ profile()!.observations }}</p>
              </section>
            }

            <div class="profile-account-actions">
              <button type="button" class="button" (click)="logout()">Terminar sessão</button>
            </div>
          </div>
        }
        @if (profile() && editing()) {
          <div class="profile-card">
            <h2>Editar Perfil</h2>
            @if (saveError()) { <div class="form-error-banner">{{ saveError() }}</div> }
            @if (saveSuccess()) { <div class="success-banner"><strong>Perfil atualizado com sucesso.</strong></div> }
            <form [formGroup]="editForm" (ngSubmit)="saveProfile()" novalidate>
              <div class="field-grid">
                <label class="field-full">Nome completo <input formControlName="fullName" placeholder="Nome completo"></label>
                <label class="field-full">Telefone <input formControlName="phone" placeholder="+351900000000"></label>
                <label>NIF <input formControlName="taxId" placeholder="123456789"></label>
                <label>Data de Nascimento <input type="date" formControlName="birthDate"></label>
                <label class="field-full">Morada <input formControlName="address" placeholder="Rua, nº, porta"></label>
                <label>Cidade <input formControlName="city" placeholder="Lisboa"></label>
                <label>Código Postal <input formControlName="zipCode" placeholder="1000-001"></label>
                <label>País <input formControlName="country" placeholder="Portugal"></label>
                <label class="field-full">Profissão <input formControlName="profession" placeholder="Médico Veterinário"></label>
                <label class="field-full">Empresa <input formControlName="companyName" placeholder="Clínica XYZ"></label>
                <label class="field-full">Telefone Empresa <input formControlName="companyPhone" placeholder="+351210000000"></label>
                <label class="field-full">Cédula Profissional <input formControlName="professionalCardNumber" placeholder="Nº cédula"></label>
                <label class="field-full">Habilitações <input formControlName="academicQualifications" placeholder="Mestrado Integrado em Medicina Veterinária"></label>
                <label class="field-full">Observações <textarea formControlName="observations" rows="3" placeholder="Informação adicional"></textarea></label>
              </div>
              <div class="form-actions">
                <button type="submit" class="button button-primary" [disabled]="saving()">{{ saving() ? 'A guardar…' : 'Guardar Alterações' }}</button>
                <button type="button" class="button button-secondary" (click)="toggleEdit()">Cancelar</button>
              </div>
            </form>
          </div>
        }
      </div>
    </section>
  `
})
export class PartnerProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly partnersService = inject(PartnersService);
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);

  protected profile = signal<PartnerProfileDto | null>(null);
  protected readonly initials = computed(() =>
    (this.profile()?.fullName ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toLocaleUpperCase())
      .join('') || 'SP');
  protected registrations = signal<PartnerRegistrationDto[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected editing = signal(false);
  protected saving = signal(false);
  protected saveError = signal('');
  protected saveSuccess = signal(false);
  protected cancellingId = signal<number | null>(null);
  protected cancelError = signal('');
  protected selectedProof = signal<File | null>(null);
  protected proofUploading = signal(false);
  protected proofDownloadingId = signal<number | null>(null);
  protected proofError = signal('');
  protected proofSuccess = signal(false);
  protected readonly editForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    taxId: new FormControl(''),
    birthDate: new FormControl(''),
    address: new FormControl(''),
    city: new FormControl(''),
    zipCode: new FormControl(''),
    country: new FormControl(''),
    profession: new FormControl(''),
    companyName: new FormControl(''),
    companyPhone: new FormControl(''),
    professionalCardNumber: new FormControl(''),
    academicQualifications: new FormControl(''),
    observations: new FormControl(''),
  });
  protected readonly statusLabel = computed(() => {
    const p = this.profile();
    if (!p) return '';
    switch (p.membershipStatus) {
      case 'Active': return 'Ativo';
      case 'Pending': return 'Pendente';
      case 'Expired': return 'Expirado';
      case 'Suspended': return 'Suspenso';
      default: return p.membershipStatus;
    }
  });
  protected readonly needsPaymentProof = computed(() =>
    this.profile()?.payments.some(payment => payment.status !== 'Verified') ?? false);

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

  async ngOnInit() {
    try {
      this.profile.set(await this.partnersService.getMyProfile());
      this.registrations.set(await this.eventsService.getMyRegistrations());
    } catch (e) {
      this.error.set('Não foi possível carregar o perfil. ');
      if (e instanceof Error) {
        if (e.message.includes('401') || e.message.includes('Unauthorized')) {
          this.error.set(this.error() + 'Sessão expirada. Faça login novamente.');
          this.authService.logout();
        } else {
          this.error.set(this.error() + e.message);
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleEdit() {
    this.editing.set(!this.editing());
    this.saveError.set('');
    this.saveSuccess.set(false);
    const profile = this.profile();
    if (this.editing() && profile) {
      const birthDate = profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '';
      this.editForm.setValue({
        fullName: profile.fullName,
        phone: profile.phone,
        taxId: profile.taxId ?? '',
        birthDate,
        address: profile.address ?? '',
        city: profile.city ?? '',
        zipCode: profile.zipCode ?? '',
        country: profile.country ?? '',
        profession: profile.profession ?? '',
        companyName: profile.companyName ?? '',
        companyPhone: profile.companyPhone ?? '',
        professionalCardNumber: profile.professionalCardNumber ?? '',
        academicQualifications: profile.academicQualifications ?? '',
        observations: profile.observations ?? '',
      });
    }
  }

  protected async saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);
    try {
      const raw = this.editForm.getRawValue();
      const nullable = (v: string | null) => v || undefined;
      const request: UpdatePartnerProfileRequest = {
        fullName: raw.fullName,
        phone: raw.phone,
        taxId: nullable(raw.taxId),
        birthDate: nullable(raw.birthDate),
        address: nullable(raw.address),
        city: nullable(raw.city),
        zipCode: nullable(raw.zipCode),
        country: nullable(raw.country),
        profession: nullable(raw.profession),
        companyName: nullable(raw.companyName),
        companyPhone: nullable(raw.companyPhone),
        professionalCardNumber: nullable(raw.professionalCardNumber),
        academicQualifications: nullable(raw.academicQualifications),
        observations: nullable(raw.observations),
      };
      this.profile.set(await this.partnersService.updateProfile(request));
      this.saveSuccess.set(true);
      setTimeout(() => this.editing.set(false), 1500);
    } catch (e) {
      this.saveError.set(e instanceof Error ? e.message : 'Erro ao guardar perfil.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async cancelRegistration(eventId: number) {
    this.cancellingId.set(eventId);
    this.cancelError.set('');
    try {
      await this.eventsService.cancelRegistration(eventId);
      this.registrations.set(this.registrations().filter(r => r.eventId !== eventId));
    } catch (e) {
      this.cancelError.set(e instanceof Error ? e.message : 'Erro ao cancelar inscrição.');
    } finally {
      this.cancellingId.set(null);
    }
  }

  protected selectProof(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedProof.set(input.files?.[0] ?? null);
    this.proofError.set('');
    this.proofSuccess.set(false);
  }

  protected async uploadProof() {
    const profile = this.profile();
    const file = this.selectedProof();
    if (!profile || !file) return;

    this.proofUploading.set(true);
    this.proofError.set('');
    this.proofSuccess.set(false);
    try {
      const payment = await this.partnersService.uploadProof(file);
      const currentProfile = this.profile();
      if (currentProfile) {
        const payments = currentProfile.payments.some(current => current.id === payment.id)
          ? currentProfile.payments.map(current => current.id === payment.id ? payment : current)
          : [payment, ...currentProfile.payments];
        this.profile.set({ ...currentProfile, payments });
      }
      this.selectedProof.set(null);
      this.proofSuccess.set(true);
    } catch (e) {
      this.proofError.set(e instanceof Error ? e.message : 'Erro ao enviar comprovativo.');
    } finally {
      this.proofUploading.set(false);
    }
  }

  protected async downloadProof(payment: PaymentDto) {
    const profile = this.profile();
    if (!profile) return;

    this.proofDownloadingId.set(payment.id);
    this.proofError.set('');
    try {
      const blob = await this.partnersService.downloadPaymentProof(profile.id, payment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = payment.proofFileName ?? 'comprovativo';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      this.proofError.set(e instanceof Error ? e.message : 'Erro ao descarregar comprovativo.');
    } finally {
      this.proofDownloadingId.set(null);
    }
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/partners/login']);
  }
}
