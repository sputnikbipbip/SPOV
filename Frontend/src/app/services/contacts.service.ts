import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface CreateContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageDto {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService extends ApiService {
  send(data: CreateContactRequest): Promise<ContactMessageDto> {
    return this.post('/api/contacts', data);
  }
}
