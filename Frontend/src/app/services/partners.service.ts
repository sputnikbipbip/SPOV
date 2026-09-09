import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { QueryFilter, PagedResponse } from './paging';

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
  proofFileName: string | null;
  proofContentType: string | null;
  proofUploadedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
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

export interface CreatePartnerRequest {
  fullName: string;
  email: string;
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
  joinedAt: string;
  membershipExpiresAt?: string;
  membershipTierId?: number;
  initiationFee: number;
  quotaValue: number;
  totalAmount: number;
}

export interface CreatePartnerResponse {
  partner: PartnerProfileDto;
  temporaryPassword: string;
}

@Injectable({ providedIn: 'root' })
export class PartnersService extends ApiService {
  register(data: RegisterPartnerRequest): Promise<PartnerProfileDto> {
    return this.post('/api/partners/register', data);
  }

  createPartner(data: CreatePartnerRequest): Promise<CreatePartnerResponse> {
    return this.post('/api/partners', data);
  }

  getAll(filter?: QueryFilter): Promise<PagedResponse<PartnerDto>> {
    let params = new HttpParams();
    if (filter?.pageNumber) params = params.set('PageNumber', filter.pageNumber.toString());
    if (filter?.pageSize) params = params.set('PageSize', filter.pageSize.toString());
    if (filter?.search) params = params.set('Search', filter.search);
    if (filter?.sortBy) params = params.set('SortBy', filter.sortBy);
    if (filter?.membershipStatus) params = params.set('MembershipStatus', filter.membershipStatus);
    return this.get('/api/partners', params);
  }

  getById(id: number): Promise<PartnerProfileDto> {
    return this.get(`/api/partners/${id}/profile`);
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

  uploadProof(file: File): Promise<PaymentDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/api/partners/me/payment-proof', formData);
  }

  downloadPaymentProof(partnerId: number, paymentId: number): Promise<Blob> {
    return this.getBlob(`/api/partners/${partnerId}/payments/${paymentId}/proof`);
  }

  verifyPayment(partnerId: number, paymentId: number): Promise<void> {
    return this.post(`/api/partners/${partnerId}/payments/${paymentId}/verify`, null);
  }

  rejectPayment(partnerId: number, paymentId: number, note?: string): Promise<void> {
    return this.post(`/api/partners/${partnerId}/payments/${paymentId}/reject`, { note });
  }

  forgotPassword(email: string): Promise<void> {
    return this.post('/api/auth/forgotPassword', { email });
  }

  resetPassword(email: string, resetCode: string, newPassword: string): Promise<void> {
    return this.post('/api/auth/resetPassword', { email, resetCode, newPassword });
  }
}
