export interface ApiResponse<T> {
  results?: T;
  status: boolean;
  message?: string;
  metaData?: MetaData;
  statusCode: number;
}

export interface MetaData {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  showing?: string;
}

export interface PaginationRequest {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}