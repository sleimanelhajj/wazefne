import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Conversation, ChatMessage } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService);
  private readonly apiUrl = `${environment.apiUrl}/api/messages`;

  private channel: RealtimeChannel | null = null;

  // Pending offers cache: offer_id → offer data (arrives before the linked message)
  private pendingOffers = new Map<number, ChatMessage['offer']>();

  // Observables — same public API as before
  private newMessageSubject = new Subject<ChatMessage>();
  onNewMessage$ = this.newMessageSubject.asObservable();

  private typingSubject = new Subject<{ conversationId: number; userId: string }>();
  onTyping$ = this.typingSubject.asObservable();

  private offerUpdatedSubject = new Subject<{ offerId: number; status: string; conversationId: number }>();
  onOfferUpdated$ = this.offerUpdatedSubject.asObservable();

  // Called once on component init — no-op now, kept for API compatibility
  connect(): void {}

  // Subscribe to real-time events for a specific conversation.
  // Call this whenever the active conversation changes.
  subscribeToConversation(conversationId: number): void {
    // Remove previous subscription first
    this.unsubscribeAll();

    this.channel = this.supabase.client
      .channel(`conv:${conversationId}`)
      // New messages
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new as any;
          const msg: ChatMessage = {
            id: row.id,
            conversation_id: row.conversation_id,
            sender_id: row.sender_id,
            content: row.content,
            created_at: row.created_at,
            offer_id: row.offer_id ?? null,
          };

          if (row.offer_id) {
            // Offer data should already be in cache (offer INSERT fires before message INSERT)
            const offer = this.pendingOffers.get(row.offer_id);
            if (offer) {
              msg.offer = offer;
              this.pendingOffers.delete(row.offer_id);
            }
          }

          this.newMessageSubject.next(msg);
        },
      )
      // New offers (cache them to attach to the linked message)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const o = payload.new as any;
          this.pendingOffers.set(o.id, {
            id: o.id,
            title: o.title,
            hourly_rate: Number(o.hourly_rate),
            status: o.status,
            sender_id: o.sender_id,
            recipient_id: o.recipient_id,
          });
        },
      )
      // Offer status updates
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const o = payload.new as any;
          this.offerUpdatedSubject.next({
            offerId: o.id,
            status: o.status,
            conversationId: o.conversation_id,
          });
        },
      )
      // Typing indicators (broadcast — no DB write)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const data = payload['payload'] as { conversationId: number; userId: string };
        this.typingSubject.next({
          conversationId: data.conversationId,
          userId: data.userId,
        });
      })
      .subscribe();
  }

  unsubscribeAll(): void {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.pendingOffers.clear();
  }

  disconnect(): void {
    this.unsubscribeAll();
  }

  // Send a message via HTTP POST (Supabase Realtime broadcasts the INSERT to both users)
  sendMessage(conversationId: number, content: string): Observable<{ success: boolean; message: ChatMessage }> {
    return this.http.post<{ success: boolean; message: ChatMessage }>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { content },
    );
  }

  // Typing indicator via Supabase broadcast (no DB write needed)
  emitTyping(conversationId: number, userId: string): void {
    this.channel?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { conversationId, userId },
    });
  }

  getConversations(): Observable<{ success: boolean; conversations: Conversation[] }> {
    return this.http.get<{ success: boolean; conversations: Conversation[] }>(
      `${this.apiUrl}/conversations`,
    );
  }

  getMessages(conversationId: number): Observable<{ success: boolean; messages: ChatMessage[] }> {
    return this.http.get<{ success: boolean; messages: ChatMessage[] }>(
      `${this.apiUrl}/conversations/${conversationId}`,
    );
  }

  createConversation(otherUserId: string): Observable<{ success: boolean; conversation: Conversation }> {
    return this.http.post<{ success: boolean; conversation: Conversation }>(
      `${this.apiUrl}/conversations`,
      { otherUserId },
    );
  }
}
