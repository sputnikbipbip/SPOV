import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormFieldComponent, FormNotesComponent } from '../form.components';
import { PageIntroComponent } from '../shared.components';
import { PartnersService } from '../services/partners.service';

@Component({
  selector: 'app-partner-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageIntroComponent, FormFieldComponent, FormNotesComponent],
  template: `
    <app-page-intro eyebrow="Sócios" title="Aderir à SPOV" text="Será com prazer que o receberemos como sócio da SPOV. Preencha o formulário e proceda ao pagamento da jóia e respetiva quota.">
      @if (error) { <div class="form-error-banner">{{ error }}</div> }
      @if (success) {
        <div class="success-banner">
          <strong>Registo submetido com sucesso!</strong>
          <p>Bem-vindo à SPOV. Pode agora <a routerLink="/socios/perfil">consultar o seu perfil</a> ou <a routerLink="/">voltar ao início</a>.</p>
        </div>
      }
      @if (!success) {
        <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <app-form-notes />

          <div class="form-section">
            <h3>Tipo de Sócio</h3>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" formControlName="partnerType" value="Professional" (change)="updatePrices()">
                <span>Profissional — <strong>€50,00</strong></span>
              </label>
              <label class="radio-label">
                <input type="radio" formControlName="partnerType" value="Student" (change)="updatePrices()">
                <span>Estudante — <strong>€20,00</strong></span>
              </label>
            </div>
          </div>

          <div class="form-section">
            <h3>Dados Pessoais</h3>
            <div class="field-grid">
              <app-form-field label="Nome Completo*" name="fullName" [control]="form.controls.fullName" placeholder="Nome completo" />
              <app-form-field label="E-Mail*" name="email" type="email" [control]="form.controls.email" placeholder="nome@exemplo.pt" error="Indique um email válido." />
              <app-form-field label="Palavra-passe*" name="password" type="password" [control]="form.controls.password" placeholder="Mínimo 6 caracteres" error="A palavra-passe deve ter pelo menos 6 caracteres." />
              <app-form-field label="Confirmar Palavra-passe*" name="confirmPassword" type="password" [control]="form.controls.confirmPassword" placeholder="Repita a palavra-passe" error="As palavras-passe não coincidem." />
              <app-form-field label="Telefone*" name="phone" type="tel" [control]="form.controls.phone" placeholder="+351 900 000 000" />
              <app-form-field label="NIF" name="taxId" [control]="form.controls.taxId" placeholder="Número de Identificação Fiscal" />
            </div>
          </div>

          <div class="form-section">
            <h3>Morada</h3>
            <div class="field-grid">
              <div class="field-full">
                <app-form-field label="Morada" name="address" [control]="form.controls.address" placeholder="Rua, número, andar" />
              </div>
              <app-form-field label="Cidade" name="city" [control]="form.controls.city" placeholder="Cidade" />
              <app-form-field label="Código Postal" name="zipCode" [control]="form.controls.zipCode" placeholder="0000-000" />
              <label class="form-field">
                <span>País</span>
                <select [formControl]="form.controls.country">
                  <option value="">Selecionar país</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Espanha">Espanha</option>
                  <option value="França">França</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>
            </div>
          </div>

          <div class="form-section">
            <h3>Dados Profissionais</h3>
            <div class="field-grid">
              <app-form-field label="Data de Nascimento" name="birthDate" type="date" [control]="form.controls.birthDate" />
              <app-form-field label="Habilitações Literárias" name="academicQualifications" [control]="form.controls.academicQualifications" placeholder="Ex: Licenciatura em Medicina Veterinária" />
              <app-form-field label="Cédula / Carteira Profissional" name="professionalCardNumber" [control]="form.controls.professionalCardNumber" placeholder="Número de cédula profissional" />
              <app-form-field label="Profissão" name="profession" [control]="form.controls.profession" placeholder="Ex: Médico Veterinário" />
              <app-form-field label="Empresa / Instituição de Ensino" name="companyName" [control]="form.controls.companyName" placeholder="Nome da empresa ou instituição" />
              <app-form-field label="Telefone da Empresa" name="companyPhone" type="tel" [control]="form.controls.companyPhone" placeholder="Telefone do local de trabalho" />
            </div>
          </div>

          <div class="form-section">
            <h3>Valores a Pagar</h3>
            <div class="pricing-table">
              <div class="pricing-row">
                <span>Jóia</span>
                <span class="pricing-value">€30,00</span>
              </div>
              <div class="pricing-row">
                <span>Quota {{ form.controls.partnerType.value === 'Student' ? 'Estudante' : 'Profissional' }}</span>
                <span class="pricing-value">€{{ quotaValue.toFixed(2) }}</span>
              </div>
              <div class="pricing-row pricing-total">
                <span>Total</span>
                <span class="pricing-value">€{{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>
            <p class="form-privacy-note">Transferência bancária para o IBAN <strong>PT50 0036 0073 99100068938 88</strong>. Envie o comprovativo após o registo.</p>
          </div>

          <div class="form-section">
            <h3>Observações</h3>
            <label class="form-field">
              <span>Observações (opcional)</span>
              <textarea [formControl]="form.controls.observations" rows="4" placeholder="Informação adicional que considere relevante"></textarea>
            </label>
          </div>

          <button type="submit" class="button button-primary" [disabled]="loading">{{ loading ? 'A registar…' : 'Submeter inscrição' }}</button>
        </form>
      }
    </app-page-intro>
  `
})
export class PartnerRegistrationComponent {
  private readonly partnersService = inject(PartnersService);
  private readonly router = inject(Router);

  protected loading = false;
  protected error = '';
  protected success = false;
  protected quotaValue = 50;
  protected totalAmount = 80;

  protected readonly form = new FormGroup({
    partnerType: new FormControl('Professional', { nonNullable: true, validators: Validators.required }),
    fullName: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', { nonNullable: true, validators: Validators.required }),
    taxId: new FormControl('', { nonNullable: true }),
    birthDate: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    zipCode: new FormControl('', { nonNullable: true }),
    country: new FormControl('', { nonNullable: true }),
    academicQualifications: new FormControl('', { nonNullable: true }),
    professionalCardNumber: new FormControl('', { nonNullable: true }),
    profession: new FormControl('', { nonNullable: true }),
    companyName: new FormControl('', { nonNullable: true }),
    companyPhone: new FormControl('', { nonNullable: true }),
    observations: new FormControl('', { nonNullable: true })
  });

  protected updatePrices() {
    this.quotaValue = this.form.controls.partnerType.value === 'Student' ? 20 : 50;
    this.totalAmount = 30 + this.quotaValue;
  }

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.password !== raw.confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ mismatch: true });
      this.error = 'As palavras-passe não coincidem.';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      await this.partnersService.register({
        fullName: raw.fullName,
        email: raw.email,
        password: raw.password,
        phone: raw.phone,
        partnerType: raw.partnerType,
        taxId: raw.taxId || undefined,
        birthDate: raw.birthDate || undefined,
        address: raw.address || undefined,
        city: raw.city || undefined,
        zipCode: raw.zipCode || undefined,
        country: raw.country || undefined,
        academicQualifications: raw.academicQualifications || undefined,
        professionalCardNumber: raw.professionalCardNumber || undefined,
        profession: raw.profession || undefined,
        companyName: raw.companyName || undefined,
        companyPhone: raw.companyPhone || undefined,
        observations: raw.observations || undefined,
        initiationFee: 30,
        quotaValue: this.quotaValue,
        totalAmount: this.totalAmount
      });
      this.success = true;
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Ocorreu um erro ao registar. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
