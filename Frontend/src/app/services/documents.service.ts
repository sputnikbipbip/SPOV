import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface DocumentDto {
  id: number;
  fileName: string;
  filePath: string;
  category: string | null;
  uploadDate: string;
  ownerId: string | null;
}

@Injectable({ providedIn: 'root' })
export class DocumentsService extends ApiService {
  getAll(): Promise<DocumentDto[]> {
    return this.get('/api/documents');
  }
}
