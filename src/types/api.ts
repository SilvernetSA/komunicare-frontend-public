export type { Language } from './language';
export type { Location } from './location';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  totalCount?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
