import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PageIntroComponent } from '../shared.components';

import { PartnerProfileDto, PartnersService, PaymentDto, UpdatePartnerProfileRequest } from '../services/partners.service';
import { EventsService, PartnerRegistrationDto } from '../services/events.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageIntroComponent, DatePipe],
  template: `
    <app-page-intro eyebrow="Sócios" title="O meu perfil" text="Consulte os seus dados de sócio e o estado da sua subscrição." />
    <section class="section">
      <div class="container">
        @if (loading()) { <p class="empty-state">A carregar perfil…</p> }
        @if (error()) {
          <div class="form-error-banner">
            {{ error() }}
            <a routerLink="/partners/login" class="button button-secondary" style="margin-top:0.5rem;">Iniciar sessão</a>
          </div>
        }
        @if (profile() && !editing()) {
          <div class="profile-card">
            <div class="profile-header">
              <h2>{{ profile()!.fullName }}</h2>
              <span class="badge" [class.badge-yellow]="profile()!.membershipStatus === 'Pending'" [class.badge-dark]="profile()!.membershipStatus === 'Active'">{{ statusLabel() }}</span>
            </div>
            @if (proofError()) { <div class="form-error-banner">{{ proofError() }}</div> }

            <div class="profile-section">
              <h3>Informação Pessoal</h3>
              <dl class="profile-dl">
                <dt>Email</dt>
                <dd>{{ profile()!.email }}</dd>
                <dt>Telefone</dt>
                <dd>{{ profile()!.phone }}</dd>
                @if (profile()!.taxId) { <dt>NIF</dt><dd>{{ profile()!.taxId }}</dd> }
                @if (profile()!.birthDate) { <dt>Data de Nascimento</dt><dd>{{ profile()!.birthDate | date:'dd/MM/yyyy' }}</dd> }
                @if (profile()!.address) { <dt>Morada</dt><dd>{{ profile()!.address }}{{ profile()!.city ? ', ' + profile()!.city : '' }}{{ profile()!.zipCode ? ' - ' + profile()!.zipCode : '' }}</dd> }
              </dl>
            </div>

            <div class="profile-section">
              <h3>Informação Profissional</h3>
              <dl class="profile-dl">
                <dt>Tipo de Sócio</dt>
                <dd>{{ profile()!.partnerType === 'Student' ? 'Estudante' : 'Profissional' }}</dd>
                @if (profile()!.profession) { <dt>Profissão</dt><dd>{{ profile()!.profession }}</dd> }
                @if (profile()!.companyName) { <dt>Empresa</dt><dd>{{ profile()!.companyName }}</dd> }
                @if (profile()!.professionalCardNumber) { <dt>Cédula Profissional</dt><dd>{{ profile()!.professionalCardNumber }}</dd> }
                @if (profile()!.academicQualifications) { <dt>Habilitações</dt><dd>{{ profile()!.academicQualifications }}</dd> }
              </dl>
            </div>

            <div class="profile-section">
              <h3>Subscrição</h3>
              <dl class="profile-dl">
                <dt>Estado</dt>
                <dd>{{ statusLabel() }}</dd>
                <dt>Membro desde</dt>
                <dd>{{ profile()!.joinedAt | date:'dd/MM/yyyy' }}</dd>
                @if (profile()!.membershipExpiresAt) {
                  <dt>Válido até</dt>
                  <dd>{{ profile()!.membershipExpiresAt | date:'dd/MM/yyyy' }}</dd>
                }
                @if (profile()!.membershipTierName) {
                  <dt>Plano</dt>
                  <dd>{{ profile()!.membershipTierName }}</dd>
                }
              </dl>

              @if (profile()!.payments.length > 0) {
                <h4>Histórico de Pagamentos</h4>
                <div class="payment-list">
                  @for (p of profile()!.payments; track p.id) {
                    <div class="payment-row">
                      <span class="payment-date">{{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                      <span class="payment-amount">€{{ p.amount.toFixed(2) }}</span>
                      <span class="badge" [class.badge-yellow]="p.status === 'Pending' || p.status === 'Submitted'" [class.badge-dark]="p.status === 'Verified' || p.status === 'Completed'" [class.badge-outline]="p.status === 'Rejected'">{{ paymentStatusLabel(p.status) }}</span>
                      @if (p.proofFileName) {
                        <button type="button" class="button button-secondary" style="font-size:0.8rem;padding:0.25rem 0.5rem;" [disabled]="proofDownloadingId() === p.id" (click)="downloadProof(p)">{{ proofDownloadingId() === p.id ? 'A descarregar…' : 'Ver comprovativo' }}</button>
                      }
                      @if (p.reviewNote) { <small class="form-privacy-note">{{ p.reviewNote }}</small> }
                    </div>
                  }
                </div>
              }
            </div>

            @if (needsPaymentProof()) {
              <div class="profile-section">
                <h3>Enviar comprovativo</h3>
                <p class="form-privacy-note">Aceitamos PDF, JPEG ou PNG até 10 MB.</p>
                @if (proofSuccess()) { <div class="success-banner">Comprovativo enviado. A aguardar validação.</div> }
                <input type="file" accept="application/pdf,image/jpeg,image/png" (change)="selectProof($event)">
                @if (selectedProof()) { <p>{{ selectedProof()!.name }}</p> }
                <button type="button" class="button button-primary" [disabled]="!selectedProof() || proofUploading()" (click)="uploadProof()">{{ proofUploading() ? 'A enviar…' : 'Enviar comprovativo' }}</button>
              </div>
            }

            @if (registrations().length > 0) {
              <div class="profile-section">
                <h3>Inscrições em Eventos</h3>
                <div class="payment-list">
                  @for (r of registrations(); track r.id) {
                    <div class="payment-row">
                      <span class="payment-date">{{ r.registeredAt | date:'dd/MM/yyyy' }}</span>
                      <span class="payment-amount">{{ r.eventTitle }}</span>
                      <a [routerLink]="'/events/' + r.eventId" class="badge badge-dark" style="text-decoration:none;">Ver evento</a>
                      <button type="button" class="button button-danger" style="font-size:0.8rem;padding:0.25rem 0.5rem;" [disabled]="cancellingId() === r.eventId" (click)="cancelRegistration(r.eventId)">{{ cancellingId() === r.eventId ? 'A cancelar…' : 'Cancelar' }}</button>
                    </div>
                  }
                </div>
                @if (cancelError()) { <div class="form-error-banner" style="margin-top:0.5rem;">{{ cancelError() }}</div> }
              </div>
            }
          </div>
          <div class="profile-actions">
            <a routerLink="/" class="button button-secondary">Voltar ao início</a>
            <button type="button" class="button button-secondary" (click)="toggleEdit()">Editar Perfil</button>
            <a routerLink="/documents" class="button button-secondary">Documentos</a>
            <button type="button" class="button button-danger" (click)="logout()">Terminar Sessão</button>
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
