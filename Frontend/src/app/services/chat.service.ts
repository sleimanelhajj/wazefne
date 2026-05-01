import { Injectable, inject, NgZone } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);
  private readonly apiUrl = `${environment.apiUrl}/api/messages`;

  private activeChannel: RealtimeChannel | null = null;
  private inboxChannel: RealtimeChannel | null = null;
  private inboxConversationIds: number[] = [];
  private activeConversationId: number | null = null;

  // Pending offers cache: offer_id → offer data (arrives before the linked message)
  private pendingOffers = new Map<number, ChatMessage['offer']>();

  // Observables — same public API as before
  private newMessageSubject = new Subject<ChatMessage>();
  onNewMessage$ = this.newMessageSubject.asObservable();

  private offerUpdatedSubject = new Subject<{ offerId: number; status: string; conversationId: number }>();
  onOfferUpdated$ = this.offerUpdatedSubject.asObservable();

  // Called once on component init — no-op now, kept for API compatibility
  connect(): void {}

  subscribeToInbox(conversationIds: number[]): void {
    this.inboxConversationIds = Array.from(
      new Set(conversationIds.filter((id) => Number.isFinite(id))),
    );
    this.refreshInboxChannel();
  }

  // Subscribe to real-time events for a specific conversation.
  // Call this whenever the active conversation changes.
  subscribeToConversation(conversationId: number): void {
    // Remove previous subscription first
    this.unsubscribeActiveConversation();
    this.activeConversationId = conversationId;

    this.activeChannel = this.supabase.client
      .channel(`conv:${conversationId}`)
      // New messages
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          this.emitMessage(payload.new as any, true);
        },
      )
      // New offers (cache them to attach to the linked message)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const o = payload.new as any;
          this.ngZone.run(() => {
            this.pendingOffers.set(o.id, {
              id: o.id,
              title: o.title,
              hourly_rate: Number(o.hourly_rate),
              status: o.status,
              sender_id: o.sender_id,
              recipient_id: o.recipient_id,
            });
          });
        },
      )
      // Offer status updates
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'offers', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const o = payload.new as any;
          this.ngZone.run(() =>
            this.offerUpdatedSubject.next({
              offerId: o.id,
              status: o.status,
              conversationId: o.conversation_id,
            }),
          );
        },
      )
      .subscribe();
    this.refreshInboxChannel();
  }

  clearActiveConversation(): void {
    this.unsubscribeActiveConversation();
    this.activeConversationId = null;
    this.refreshInboxChannel();
  }

  unsubscribeAll(): void {
    this.unsubscribeActiveConversation();
    this.unsubscribeInbox();
    this.activeConversationId = null;
    this.inboxConversationIds = [];
  }

  private unsubscribeActiveConversation(): void {
    if (this.activeChannel) {
      this.supabase.client.removeChannel(this.activeChannel);
      this.activeChannel = null;
    }
    this.pendingOffers.clear();
  }

  private unsubscribeInbox(): void {
    if (this.inboxChannel) {
      this.supabase.client.removeChannel(this.inboxChannel);
      this.inboxChannel = null;
    }
  }

  private refreshInboxChannel(): void {
    this.unsubscribeInbox();

    const conversationIds = this.inboxConversationIds.filter(
      (id) => id !== this.activeConversationId,
    );
    if (conversationIds.length === 0) return;

    let channel = this.supabase.client.channel(`messages-inbox:${Date.now()}`);
    conversationIds.forEach((conversationId) => {
      channel = channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          this.emitMessage(payload.new as any);
        },
      );
    });

    this.inboxChannel = channel.subscribe();
  }

  private emitMessage(row: any, attachPendingOffer = false): void {
    const msg: ChatMessage = {
      id: row.id,
      conversation_id: row.conversation_id,
      sender_id: row.sender_id,
      content: row.content,
      created_at: row.created_at,
      offer_id: row.offer_id ?? null,
    };

    if (attachPendingOffer && row.offer_id) {
      const offer = this.pendingOffers.get(row.offer_id);
      if (offer) {
        msg.offer = offer;
        this.pendingOffers.delete(row.offer_id);
      }
    }

    this.ngZone.run(() => this.newMessageSubject.next(msg));
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
