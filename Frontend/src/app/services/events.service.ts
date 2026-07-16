import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface EventDto {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  ceCredits: number | null;
  isMembersOnly: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventsService extends ApiService {
  getAll(): Promise<EventDto[]> {
    return this.get('/api/events');
  }

  getById(id: number): Promise<EventDto> {
    return this.get(`/api/events/${id}`);
  }
}
