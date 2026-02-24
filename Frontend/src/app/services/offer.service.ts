import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/offers';

  createOffer(data: {
    conversationId: number;
    title: string;
    hourlyRate: number;
  }): Observable<{ success: boolean; offer: Offer }> {
    return this.http.post<{ success: boolean; offer: Offer }>(this.apiUrl, data);
  }

  getOffersByConversation(
    conversationId: number,
  ): Observable<{ success: boolean; offers: Offer[] }> {
    return this.http.get<{ success: boolean; offers: Offer[] }>(
      `${this.apiUrl}/conversation/${conversationId}`,
    );
  }

  updateOfferStatus(
    offerId: number,
    status: 'accepted' | 'declined',
  ): Observable<{ success: boolean; status: string }> {
    return this.http.patch<{ success: boolean; status: string }>(
      `${this.apiUrl}/${offerId}/status`,
      { status },
    );
  }
}
