import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { QueryFilter, PagedResponse } from './paging';

export interface EventDto {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  ceCredits: number | null;
  isMembersOnly: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  ceCredits: number | null;
  isMembersOnly: boolean;
}

export interface UpdateEventRequest {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  ceCredits: number | null;
  isMembersOnly: boolean;
}

export interface PartnerRegistrationDto {
  id: number;
  eventId: number;
  registeredAt: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
}

@Injectable({ providedIn: 'root' })
export class EventsService extends ApiService {
  getAll(filter?: QueryFilter): Promise<PagedResponse<EventDto>> {
    let params = new HttpParams();
    if (filter?.pageNumber) params = params.set('PageNumber', filter.pageNumber.toString());
    if (filter?.pageSize) params = params.set('PageSize', filter.pageSize.toString());
    if (filter?.search) params = params.set('Search', filter.search);
    if (filter?.sortBy) params = params.set('SortBy', filter.sortBy);
    return this.get('/api/events', params);
  }

  getById(id: number): Promise<EventDto> {
    return this.get(`/api/events/${id}`);
  }

  create(request: CreateEventRequest): Promise<EventDto> {
    return this.post('/api/events', request);
  }

  update(id: number, request: UpdateEventRequest): Promise<EventDto> {
    return this.put(`/api/events/${id}`, request);
  }

  delete(id: number): Promise<void> {
    return this.del(`/api/events/${id}`);
  }

  registerForEvent(eventId: number): Promise<PartnerRegistrationDto> {
    return this.post(`/api/events/${eventId}/registrations`, null);
  }

  getMyRegistrations(): Promise<PartnerRegistrationDto[]> {
    return this.get('/api/partners/me/registrations');
  }

  cancelRegistration(eventId: number): Promise<void> {
    return this.del(`/api/events/${eventId}/registrations`);
  }
}
