import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUploadResponse } from '../models/api.models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class FileApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  uploadFile(file: File): Observable<ApiUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // El backend espera el param file con un archivo válido. 
    // Los interceptores se encargan del auth.
    return this.http.post<ApiUploadResponse>(`${this.apiUrl}/files/upload`, formData);
  }

  generateReport(fileId: string, payload: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/files/${fileId}/report`, payload, {
      responseType: 'blob'
    });
  }
}
