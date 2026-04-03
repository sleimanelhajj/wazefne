import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job, JobBid } from '../models/job.model';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/api/jobs`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all open jobs, optionally filtered by category and location
   */
  getJobs(category?: string, location?: string): Observable<{ success: boolean; jobs: Job[] }> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    if (location && location !== 'all') {
      params = params.set('location', location);
    }

    return this.http.get<{ success: boolean; jobs: Job[] }>(this.apiUrl, { params });
  }

  /**
   * Fetch jobs posted by the current user with offers counters
   */
  getMyPostedJobs(): Observable<{ success: boolean; jobs: Job[] }> {
    return this.http.get<{ success: boolean; jobs: Job[] }>(`${this.apiUrl}/my-posts`);
  }

  /**
   * Fetch a single job by its ID
   */
  getJobById(jobId: number): Observable<{ success: boolean; job: Job }> {
    return this.http.get<{ success: boolean; job: Job }>(`${this.apiUrl}/${jobId}`);
  }

  /**
   * Create a new job post as a client
   */
  createJob(jobData: {
    title: string;
    description: string;
    category: string;
    location: string;
    budget?: number;
  }): Observable<{ success: boolean; job: Job }> {
    return this.http.post<{ success: boolean; job: Job }>(this.apiUrl, jobData);
  }

  /**
   * Fetch all bids for a specific job (Client-only)
   */
  getJobBids(jobId: number): Observable<{ success: boolean; bids: JobBid[] }> {
    return this.http.get<{ success: boolean; bids: JobBid[] }>(`${this.apiUrl}/${jobId}/bids`);
  }

  /**
   * Submit a new bid for a job (Freelancer)
   */
  createBid(
    jobId: number,
    bidData: { proposal: string; proposed_rate: number },
  ): Observable<{ success: boolean; bid: JobBid }> {
    return this.http.post<{ success: boolean; bid: JobBid }>(
      `${this.apiUrl}/${jobId}/bids`,
      bidData,
    );
  }

  updateBidStatus(
    jobId: number,
    bidId: number,
    status: 'accepted' | 'rejected',
  ): Observable<{ success: boolean; status: string; conversationId?: number | null }> {
    return this.http.patch<{ success: boolean; status: string; conversationId?: number | null }>(
      `${this.apiUrl}/${jobId}/bids/${bidId}/status`,
      { status },
    );
  }
}
