export type FileUploadVariant = 'dropzone' | 'compact' | 'image' | 'button';

export type FileUploadCategory = 'all' | 'documents' | 'images';

export type FileUploadColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error';

export type FileUploadShape = 'rectangle' | 'circle';

export interface UploadedFileItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  isImage: boolean;
  previewUrl?: string;
  icon: string;
  color: string;
}
