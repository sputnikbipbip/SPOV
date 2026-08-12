export interface QueryFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  membershipStatus?: string;
}

export interface PagedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}