import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CvAnalyzeResponse,
  CvHistoryResponse,
} from '../models/cv-analysis.model';

@Injectable({
  providedIn: 'root',
})
export class CvAnalyzerService {
  private readonly apiUrl = `${environment.apiUrl}/api/cv`;

  constructor(private http: HttpClient) {}

  analyzeCv(
    file: File,
    targetRole?: string,
    jobDescription?: string,
  ): Observable<CvAnalyzeResponse> {
    const formData = new FormData();
    formData.append('cv', file);

    if (targetRole?.trim()) {
      formData.append('targetRole', targetRole.trim());
    }

    if (jobDescription?.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    return this.http.post<CvAnalyzeResponse>(`${this.apiUrl}/analyze`, formData);
  }

  getMyAnalyses(limit = 10): Observable<CvHistoryResponse> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<CvHistoryResponse>(`${this.apiUrl}/my-analyses`, { params });
  }
}
