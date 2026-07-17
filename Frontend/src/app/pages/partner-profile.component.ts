import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PageIntroComponent } from '../shared.components';
import { PartnerProfileDto, PartnersService } from '../services/partners.service';

@Component({
  selector: 'app-partner-profile',
  standalone: true,
  imports: [RouterLink, PageIntroComponent, DatePipe],
  template: `
    <app-page-intro eyebrow="Sócios" title="O meu perfil" text="Consulte os seus dados de sócio e o estado da sua subscrição.">
      @if (loading) { <p class="empty-state">A carregar perfil…</p> }
      @if (error) { <div class="form-error-banner">{{ error }} <a routerLink="/login" class="button button-secondary">Iniciar sessão</a></div> }
      @if (profile) {
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
        </div>
        <a routerLink="/" class="button button-secondary">Voltar ao início</a>
      }
    </app-page-intro>
  `
})
export class PartnerProfileComponent {
  private readonly partnersService = inject(PartnersService);
  private readonly router = inject(Router);

  protected profile: PartnerProfileDto | null = null;
  protected loading = true;
  protected error = '';

  async ngOnInit() {
    try {
      this.profile = await this.partnersService.getMyProfile();
    } catch (e) {
      this.error = 'Não foi possível carregar o perfil. ';
      if (e instanceof Error) {
        if (e.message.includes('401') || e.message.includes('Unauthorized'))
          this.error += 'Sessão expirada. Faça login novamente.';
        else
          this.error += e.message;
      }
    } finally {
      this.loading = false;
    }
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
