import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { QueryFilter, PagedResponse } from './paging';

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
  getAll(filter?: QueryFilter): Promise<PagedResponse<DocumentDto>> {
    let params = new HttpParams();
    if (filter?.pageNumber) params = params.set('PageNumber', filter.pageNumber.toString());
    if (filter?.pageSize) params = params.set('PageSize', filter.pageSize.toString());
    if (filter?.search) params = params.set('Search', filter.search);
    if (filter?.sortBy) params = params.set('SortBy', filter.sortBy);
    return this.get('/api/documents', params);
  }
}
