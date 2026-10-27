export interface ApiColumnMetadata {
  name: string;
  dtype: string;
  is_text: boolean;
  is_numeric: boolean;
  is_date: boolean;
  unique_values: string[];
  min_value: string;
  max_value: string;
}

export interface ApiPaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface ApiUploadData {
  id: string;
  filename: string;
  total_rows: number;
  columns: ApiColumnMetadata[];
}

export interface ApiUploadResponse {
  success: boolean;
  data: ApiUploadData;
  message: string;
  meta: ApiPaginationMeta;
}
