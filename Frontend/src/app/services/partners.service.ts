import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface RegisterPartnerRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  partnerType: string;
  taxId?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  academicQualifications?: string;
  professionalCardNumber?: string;
  profession?: string;
  companyName?: string;
  companyPhone?: string;
  observations?: string;
  initiationFee: number;
  quotaValue: number;
  totalAmount: number;
}

export interface PaymentDto {
  id: number;
  partnerId: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerTransactionId: string | null;
  createdAt: string;
}

export interface PartnerDto {
  id: number;
  userId: string;
  fullName: string;
  clinicName: string | null;
  specialization: string | null;
  country: string | null;
  membershipStatus: string;
  membershipTierId: number | null;
  membershipTierName: string | null;
  joinedAt: string;
  membershipExpiresAt: string | null;
}

export interface PartnerProfileDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  taxId: string | null;
  birthDate: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
  academicQualifications: string | null;
  professionalCardNumber: string | null;
  profession: string | null;
  companyName: string | null;
  companyPhone: string | null;
  observations: string | null;
  paymentProofUrl: string | null;
  initiationFee: number;
  quotaValue: number;
  totalAmount: number;
  partnerType: string;
  membershipStatus: string;
  membershipTierId: number | null;
  membershipTierName: string | null;
  joinedAt: string;
  membershipExpiresAt: string | null;
  payments: PaymentDto[];
}

export interface UpdatePartnerProfileRequest {
  fullName: string;
  phone: string;
  taxId?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  academicQualifications?: string;
  professionalCardNumber?: string;
  profession?: string;
  companyName?: string;
  companyPhone?: string;
  observations?: string;
}

@Injectable({ providedIn: 'root' })
export class PartnersService extends ApiService {
  register(data: RegisterPartnerRequest): Promise<PartnerProfileDto> {
    return this.post('/api/partners/register', data);
  }

  getAll(): Promise<PartnerDto[]> {
    return this.get('/api/partners');
  }

  approve(id: number): Promise<PartnerDto> {
    return this.post(`/api/partners/${id}/approve`, null);
  }

  getMyProfile(): Promise<PartnerProfileDto> {
    return this.get('/api/partners/my-profile');
  }

  updateProfile(data: UpdatePartnerProfileRequest): Promise<PartnerProfileDto> {
    return this.put('/api/partners/me', data);
  }

  uploadProof(file: File): Promise<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/api/partners/upload-proof', formData);
  }

  forgotPassword(email: string): Promise<void> {
    return this.post('/api/auth/forgotPassword', { email });
  }

  resetPassword(email: string, resetCode: string, newPassword: string): Promise<void> {
    return this.post('/api/auth/resetPassword', { email, resetCode, newPassword });
  }
}
