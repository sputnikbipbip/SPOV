import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PageIntroComponent } from '../shared.components';

import { PartnerProfileDto, PartnersService, UpdatePartnerProfileRequest } from '../services/partners.service';
import { EventsService, PartnerRegistrationDto } from '../services/events.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageIntroComponent, DatePipe],
  template: `
    <app-page-intro eyebrow="Sócios" title="O meu perfil" text="Consulte os seus dados de sócio e o estado da sua subscrição." />
    <section class="section">
      <div class="container">
        @if (loading) { <p class="empty-state">A carregar perfil…</p> }
        @if (error) {
          <div class="form-error-banner">
            {{ error }}
            <a routerLink="/partners/login" class="button button-secondary" style="margin-top:0.5rem;">Iniciar sessão</a>
          </div>
        }
        @if (profile && !editing) {
          <div class="profile-card">
            <div class="profile-header">
              <h2>{{ profile.fullName }}</h2>
              <span class="badge" [class.badge-yellow]="profile.membershipStatus === 'Pending'" [class.badge-dark]="profile.membershipStatus === 'Active'">{{ statusLabel }}</span>
            </div>

            <div class="profile-section">
              <h3>Informação Pessoal</h3>
              <dl class="profile-dl">
                <dt>Email</dt>
                <dd>{{ profile.email }}</dd>
                <dt>Telefone</dt>
                <dd>{{ profile.phone }}</dd>
                @if (profile.taxId) { <dt>NIF</dt><dd>{{ profile.taxId }}</dd> }
                @if (profile.birthDate) { <dt>Data de Nascimento</dt><dd>{{ profile.birthDate | date:'dd/MM/yyyy' }}</dd> }
                @if (profile.address) { <dt>Morada</dt><dd>{{ profile.address }}{{ profile.city ? ', ' + profile.city : '' }}{{ profile.zipCode ? ' - ' + profile.zipCode : '' }}</dd> }
              </dl>
            </div>

            <div class="profile-section">
              <h3>Informação Profissional</h3>
              <dl class="profile-dl">
                <dt>Tipo de Sócio</dt>
                <dd>{{ profile.partnerType === 'Student' ? 'Estudante' : 'Profissional' }}</dd>
                @if (profile.profession) { <dt>Profissão</dt><dd>{{ profile.profession }}</dd> }
                @if (profile.companyName) { <dt>Empresa</dt><dd>{{ profile.companyName }}</dd> }
                @if (profile.professionalCardNumber) { <dt>Cédula Profissional</dt><dd>{{ profile.professionalCardNumber }}</dd> }
                @if (profile.academicQualifications) { <dt>Habilitações</dt><dd>{{ profile.academicQualifications }}</dd> }
              </dl>
            </div>

            <div class="profile-section">
              <h3>Subscrição</h3>
              <dl class="profile-dl">
                <dt>Estado</dt>
                <dd>{{ statusLabel }}</dd>
                <dt>Membro desde</dt>
                <dd>{{ profile.joinedAt | date:'dd/MM/yyyy' }}</dd>
                @if (profile.membershipExpiresAt) {
                  <dt>Válido até</dt>
                  <dd>{{ profile.membershipExpiresAt | date:'dd/MM/yyyy' }}</dd>
                }
                @if (profile.membershipTierName) {
                  <dt>Plano</dt>
                  <dd>{{ profile.membershipTierName }}</dd>
                }
              </dl>

              @if (profile.payments.length > 0) {
                <h4>Histórico de Pagamentos</h4>
                <div class="payment-list">
                  @for (p of profile.payments; track p.id) {
                    <div class="payment-row">
                      <span class="payment-date">{{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                      <span class="payment-amount">€{{ p.amount.toFixed(2) }}</span>
                      <span class="badge" [class.badge-yellow]="p.status === 'Pending'" [class.badge-dark]="p.status === 'Completed'">{{ p.status }}</span>
                    </div>
                  }
                </div>
              }
            </div>

            @if (profile.paymentProofUrl) {
              <div class="profile-section">
                <h3>Comprovativo</h3>
                <p>Comprovativo enviado: <a [href]="profile.paymentProofUrl" target="_blank">Ver ficheiro</a></p>
              </div>
            }

            @if (registrations.length > 0) {
              <div class="profile-section">
                <h3>Inscrições em Eventos</h3>
                <div class="payment-list">
                  @for (r of registrations; track r.id) {
                    <div class="payment-row">
                      <span class="payment-date">{{ r.registeredAt | date:'dd/MM/yyyy' }}</span>
                      <span class="payment-amount">{{ r.eventTitle }}</span>
                      <a [routerLink]="'/events/' + r.eventId" class="badge badge-dark" style="text-decoration:none;">Ver evento</a>
                      <button type="button" class="button button-danger" style="font-size:0.8rem;padding:0.25rem 0.5rem;" [disabled]="cancellingId === r.eventId" (click)="cancelRegistration(r.eventId)">{{ cancellingId === r.eventId ? 'A cancelar…' : 'Cancelar' }}</button>
                    </div>
                  }
                </div>
                @if (cancelError) { <div class="form-error-banner" style="margin-top:0.5rem;">{{ cancelError }}</div> }
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
        @if (profile && editing) {
          <div class="profile-card">
            <h2>Editar Perfil</h2>
            @if (saveError) { <div class="form-error-banner">{{ saveError }}</div> }
            @if (saveSuccess) { <div class="success-banner"><strong>Perfil atualizado com sucesso.</strong></div> }
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
                <button type="submit" class="button button-primary" [disabled]="saving">{{ saving ? 'A guardar…' : 'Guardar Alterações' }}</button>
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

  protected profile: PartnerProfileDto | null = null;
  protected registrations: PartnerRegistrationDto[] = [];
  protected loading = true;
  protected error = '';
  protected editing = false;
  protected saving = false;
  protected saveError = '';
  protected saveSuccess = false;
  protected cancellingId: number | null = null;
  protected cancelError = '';
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

  async ngOnInit() {
    try {
      this.profile = await this.partnersService.getMyProfile();
      this.registrations = await this.eventsService.getMyRegistrations();
    } catch (e) {
      this.error = 'Não foi possível carregar o perfil. ';
      if (e instanceof Error) {
        if (e.message.includes('401') || e.message.includes('Unauthorized')) {
          this.error += 'Sessão expirada. Faça login novamente.';
          this.authService.logout();
        } else {
          this.error += e.message;
        }
      }
    } finally {
      this.loading = false;
    }
  }

  protected toggleEdit() {
    this.editing = !this.editing;
    this.saveError = '';
    this.saveSuccess = false;
    if (this.editing && this.profile) {
      const p = this.profile;
      const birthDate = p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : '';
      this.editForm.setValue({
        fullName: p.fullName,
        phone: p.phone,
        taxId: p.taxId ?? '',
        birthDate,
        address: p.address ?? '',
        city: p.city ?? '',
        zipCode: p.zipCode ?? '',
        country: p.country ?? '',
        profession: p.profession ?? '',
        companyName: p.companyName ?? '',
        companyPhone: p.companyPhone ?? '',
        professionalCardNumber: p.professionalCardNumber ?? '',
        academicQualifications: p.academicQualifications ?? '',
        observations: p.observations ?? '',
      });
    }
  }

  protected async saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;
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
      this.profile = await this.partnersService.updateProfile(request);
      this.saveSuccess = true;
      setTimeout(() => this.editing = false, 1500);
    } catch (e) {
      this.saveError = e instanceof Error ? e.message : 'Erro ao guardar perfil.';
    } finally {
      this.saving = false;
    }
  }

  protected async cancelRegistration(eventId: number) {
    this.cancellingId = eventId;
    this.cancelError = '';
    try {
      await this.eventsService.cancelRegistration(eventId);
      this.registrations = this.registrations.filter(r => r.eventId !== eventId);
    } catch (e) {
      this.cancelError = e instanceof Error ? e.message : 'Erro ao cancelar inscrição.';
    } finally {
      this.cancellingId = null;
    }
  }

  protected logout() {
    this.authService.logout();
    this.router.navigate(['/partners/login']);
  }

  protected get statusLabel(): string {
    if (!this.profile) return '';
    switch (this.profile.membershipStatus) {
      case 'Active': return 'Ativo';
      case 'Pending': return 'Pendente';
      case 'Expired': return 'Expirado';
      case 'Suspended': return 'Suspenso';
      default: return this.profile.membershipStatus;
    }
  }
}
