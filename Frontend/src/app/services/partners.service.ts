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

@Injectable({ providedIn: 'root' })
export class PartnersService extends ApiService {
  register(data: RegisterPartnerRequest): Promise<PartnerProfileDto> {
    return this.post('/api/partners/register', data);
  }

  getMyProfile(): Promise<PartnerProfileDto> {
    return this.get('/api/partners/my-profile');
  }

  uploadProof(file: File): Promise<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/api/partners/upload-proof', formData);
  }
}
